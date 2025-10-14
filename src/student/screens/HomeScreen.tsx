import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StatusBar, StyleSheet, Modal, Alert, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Text, TextInput } from '../../components';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";
import LinearGradient from "react-native-linear-gradient";
import SendNotificationModal from './SendNotificationModal';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

// Types
type ScheduleItem = {
  id: string;
  subject: string;
  subject_mnemonic?: string;
  subject_type?: string;
  time: string;
  location: string;
  color: string;
  status?: boolean;
  otp?: string;
  otp_created_at?: string;
  attendance_marked?: boolean;
  attendance_status?: boolean;
  start_time?: string;
  end_time?: string;
  date?: string;
};

type HomeScreenProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
  navigation: NativeStackNavigationProp<StackParamList>;
};

type Subject = {
  subject_code: string;
  subject_name: string;
  subject_type: string;
};

type ClassStatus = {
  status: string;
  badge: { text: string; color: string; bgColor: string };
  message: string;
  showMarkAttendance: boolean;
  showWaitingForOTP: boolean;
};

// Shared Utility Functions
const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    if (!dateStr || !timeStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes, 0);
    return isNaN(localDate.getTime()) ? new Date() : localDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

const isUpcoming = (item: ScheduleItem): boolean => {
  if (!item.date || !item.start_time) return false;
  const classStartDateTime = parseDateTime(item.date, item.start_time);
  const currentDateTime = new Date();
  return currentDateTime < classStartDateTime;
};

const isOngoing = (item: ScheduleItem): boolean => {
  if (!item.date || !item.start_time || !item.end_time) return false;
  const classStartDateTime = parseDateTime(item.date, item.start_time);
  const classEndDateTime = parseDateTime(item.date, item.end_time);
  const currentDateTime = new Date();
  const bufferMs = 30 * 60 * 1000;
  const classEndWithBuffer = new Date(classEndDateTime.getTime() + bufferMs);
  return currentDateTime >= classStartDateTime && currentDateTime <= classEndWithBuffer;
};

const isExpired = (item: ScheduleItem): boolean => {
  if (!item.date || !item.end_time) return false;
  const classEndDateTime = parseDateTime(item.date, item.end_time);
  const currentDateTime = new Date();
  const bufferMs = 30 * 60 * 1000;
  const classEndWithBuffer = new Date(classEndDateTime.getTime() + bufferMs);
  return currentDateTime > classEndWithBuffer;
};

const isAttendanceMarked = (item: ScheduleItem): boolean => {
  if (item.attendance_status !== undefined) return item.attendance_status === true;
  if (item.attendance_marked !== undefined) return item.attendance_marked === true;
  return false;
};

const getClassStatus = (item: ScheduleItem, violatedSchedules: Set<string>, markedAbsentByTimer: boolean = false, canMarkButton: boolean = false): ClassStatus => {
  const attendanceMarked = isAttendanceMarked(item);
  const isScheduleViolated = violatedSchedules.has(item.id.toString());

  if (isScheduleViolated) {
    return {
      status: 'security_violation',
      badge: { text: 'Absent', color: '#ffffff', bgColor: '#e35656ff' },
      message: 'Absent due to security violation',
      showMarkAttendance: false,
      showWaitingForOTP: false
    };
  }

  if (attendanceMarked) {
    return {
      status: 'attendance_marked',
      badge: { text: 'Attendance Marked', color: '#4ECDC4', bgColor: '#E8F5E9' },
      message: '✓ Attendance marked successfully',
      showMarkAttendance: false,
      showWaitingForOTP: false
    };
  }

  if (markedAbsentByTimer) {
    return {
      status: 'absent_time_expired',
      badge: { text: 'Absent', color: '#ffffff', bgColor: '#e35656ff' },
      message: 'You are marked absent (time expired)',
      showMarkAttendance: false,
      showWaitingForOTP: false
    };
  }

  if (isOngoing(item) && item.otp) {
    return {
      status: 'ongoing_with_otp',
      badge: { text: 'Ongoing', color: '#FF9F43', bgColor: '#FFF3E0' },
      message: canMarkButton 
        ? 'Class in progress - Mark attendance within time' 
        : 'Class in progress - Time expired',
      showMarkAttendance: canMarkButton,
      showWaitingForOTP: false
    };
  }

  if (isOngoing(item) && !item.otp) {
    return {
      status: 'ongoing_waiting_otp',
      badge: { text: 'Ongoing', color: '#FF9F43', bgColor: '#FFF3E0' },
      message: 'Class in progress - Waiting for OTP',
      showMarkAttendance: false,
      showWaitingForOTP: true
    };
  }

  if (isUpcoming(item)) {
    return {
      status: 'upcoming',
      badge: { text: 'Upcoming', color: '#15d2f8ff', bgColor: '#e1fffeff' },
      message: 'Class is scheduled - Not started yet',
      showMarkAttendance: false,
      showWaitingForOTP: false
    };
  }

  if (isExpired(item)) {
    if (!item.status) {
      return {
        status: 'cancelled',
        badge: { text: 'Cancelled', color: '#FF6B6B', bgColor: '#FFEBEE' },
        message: 'Class was cancelled',
        showMarkAttendance: false,
        showWaitingForOTP: false
      };
    }
    
    if (!attendanceMarked) {
      return {
        status: 'absent',
        badge: { text: 'Absent', color: '#ffffff', bgColor: '#e35656ff' },
        message: 'You are marked absent',
        showMarkAttendance: false,
        showWaitingForOTP: false
      };
    }
  }

  return {
    status: 'unknown',
    badge: { text: 'Scheduled', color: '#9E9E9E', bgColor: '#F5F5F5' },
    message: 'Class is scheduled',
    showMarkAttendance: false,
    showWaitingForOTP: false
  };
};

const getPriorityFromStatus = (status: string): number => {
  const priorityMap: { [key: string]: number } = {
    'ongoing_with_otp': 1,
    'ongoing_waiting_otp': 2,
    'upcoming': 3,
    'attendance_marked': 4,
    'cancelled': 5,
    'absent': 6,
    'absent_time_expired': 7,
    'security_violation': 8,
    'unknown': 9
  };
  return priorityMap[status] || 9;
};

// Update the sortSchedules function
const sortSchedules = async (schedules: ScheduleItem[], violatedSchedules: Set<string>): Promise<ScheduleItem[]> => {
  // Pre-load all absent statuses
  const absentStatuses = new Map<string, boolean>();
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const absentKeys = allKeys.filter(key => key.startsWith('absent_'));
    
    for (const key of absentKeys) {
      const scheduleId = key.replace('absent_', '');
      const value = await AsyncStorage.getItem(key);
      absentStatuses.set(scheduleId, value === 'true');
    }
  } catch (error) {
    console.error('Error loading absent statuses for sorting:', error);
  }
  
  return [...schedules].sort((a, b) => {
    const markedAbsentA = absentStatuses.get(a.id) || false;
    const markedAbsentB = absentStatuses.get(b.id) || false;
    
    const statusA = getClassStatus(a, violatedSchedules, markedAbsentA, false);
    const statusB = getClassStatus(b, violatedSchedules, markedAbsentB, false);
    const priorityA = getPriorityFromStatus(statusA.status);
    const priorityB = getPriorityFromStatus(statusB.status);

    console.log(`Comparing "${a.subject}" (status: ${statusA.status}, priority: ${priorityA}) with "${b.subject}" (status: ${statusB.status}, priority: ${priorityB})`);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    try {
      const timeA = parseDateTime(a.date || '', a.start_time || '');
      const timeB = parseDateTime(b.date || '', b.start_time || '');
      return timeA.getTime() - timeB.getTime();
    } catch (error) {
      console.error('Error parsing time for sorting:', error);
      return 0;
    }
  });
};

// ClassScheduleCard Component with Fixed AsyncStorage Sync
const ClassScheduleCard = ({
  item,
  onDelete,
  onEdit,
  isCR,
  onMarkAttendance,
  violatedSchedules,
  onAutoRefresh,
  userEmail,
  onMarkAbsent,
}: {
  item: ScheduleItem;
  onDelete?: (id: string) => void;
  onEdit?: (item: ScheduleItem) => void;
  isCR: boolean;
  onMarkAttendance: (classEndTime: number, item: ScheduleItem) => void;
  violatedSchedules: Set<string>;
  onAutoRefresh: () => void;
  userEmail: string;
  onMarkAbsent: (scheduleId: string) => void;
}) => {
  const [canMarkButton, setCanMarkButton] = useState(true);
  const [markedAbsentByTimer, setMarkedAbsentByTimer] = useState(false);
  
  // Save to AsyncStorage whenever markedAbsentByTimer changes
  useEffect(() => {
    const saveMarkedAbsent = async () => {
      try {
        console.log(`Saving absent status for schedule ID ${item.id}: ${markedAbsentByTimer}`);
        await AsyncStorage.setItem(`absent_${item.id}`, markedAbsentByTimer.toString());
      } catch (error) {
        console.error('Error saving absent status:', error);
      }
    };
    
    saveMarkedAbsent();
  }, [markedAbsentByTimer, item.id]);

  // Load from AsyncStorage on component mount
  useEffect(() => {
    const loadMarkedAbsent = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(`absent_${item.id}`);
        console.log(`Loaded absent status for schedule ID ${item.id}: ${storedValue}`);
        if (storedValue === 'true') {
          setMarkedAbsentByTimer(true);
          setCanMarkButton(false);
        } else {
          setMarkedAbsentByTimer(false);
        }
      } catch (error) {
        console.error('Error loading absent status:', error);
        setMarkedAbsentByTimer(false);
      }
    };
    
    loadMarkedAbsent();
  }, [item.id]);

  // Optional: Add cleanup to ensure data is saved on unmount
  useEffect(() => {
    return () => {
      // This ensures the latest state is saved when component unmounts
      AsyncStorage.setItem(`absent_${item.id}`, markedAbsentByTimer.toString())
        .catch(error => console.error('Error in cleanup save:', error));
    };
  }, [item.id, markedAbsentByTimer]);

  // OTP expiration logic
  useEffect(() => {
    if (markedAbsentByTimer) {
      setCanMarkButton(false);
      return;
    }
    
    if (!item.otp) {
      setCanMarkButton(false);
      return;
    }
    
    if (!item.otp_created_at || isAttendanceMarked(item)) {
      setCanMarkButton(false);
      return;
    }
    
    const otpCreated = new Date(item.otp_created_at).getTime();
    const now = Date.now();
    const timeSinceOtp = now - otpCreated;
    
    if (timeSinceOtp >= 20000) {
      console.log(`OTP expired for schedule ${item.id}, marking absent`);
      setCanMarkButton(false);
      setMarkedAbsentByTimer(true);
      onMarkAbsent(item.id);
      return;
    }
    
    setCanMarkButton(true);
    const timeout = setTimeout(() => {
      console.log(`OTP timeout reached for schedule ${item.id}, marking absent`);
      setCanMarkButton(false);
      setMarkedAbsentByTimer(true);
      onMarkAbsent(item.id);
    }, 20000 - timeSinceOtp);
    
    return () => clearTimeout(timeout);
  }, [item.otp_created_at, item.otp, item.id, onMarkAbsent, markedAbsentByTimer]);

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'Data Structures': { bg: '#1976D2', text: '#FFF' },
      'Algorithms': { bg: '#1565C0', text: '#FFF' },
      'Database': { bg: '#0277BD', text: '#FFF' },
      'DBMS': { bg: '#0277BD', text: '#FFF' },
      'OS': { bg: '#01579B', text: '#FFF' },
      'Operating System': { bg: '#01579B', text: '#FFF' },
      'Networks': { bg: '#0288D1', text: '#FFF' },
      'Computer Networks': { bg: '#0288D1', text: '#FFF' },
      'Software Engineering': { bg: '#0097A7', text: '#FFF' },
      'SE': { bg: '#0097A7', text: '#FFF' },
      'Java': { bg: '#6A1B9A', text: '#FFF' },
      'Python': { bg: '#7B1FA2', text: '#FFF' },
      'default': { bg: '#546E7A', text: '#FFF' }
    };

    for (const [key, color] of Object.entries(colors)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return colors.default;
  };

  const classStatus = getClassStatus(item, violatedSchedules, markedAbsentByTimer, canMarkButton);
  console.log(`Class "${item.subject}" status: ${classStatus.status}, markedAbsentByTimer: ${markedAbsentByTimer}, canMarkButton: ${canMarkButton}`);
  console.log(item.time);
  const subjectColor = getSubjectColor(item.subject);
  const upcoming = isUpcoming(item);
  const isScheduleViolated = violatedSchedules.has(item.id.toString());
  const canMark = classStatus.showMarkAttendance;

  return (
    <View style={styles.card}>
      {classStatus.badge.text && (
        <View style={[styles.statusBadgeTopRight, { backgroundColor: classStatus.badge.bgColor }]}>
          <Text style={[styles.statusBadgeText, { color: classStatus.badge.color }]}>
            {classStatus.badge.text}
          </Text>
        </View>
      )}
      
      <View style={styles.subjectCircle}>
        <View style={[styles.subjectBadge, { backgroundColor: subjectColor.bg }]}>
          <Text style={[styles.subjectInitial, { color: subjectColor.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {item.subject_mnemonic || item.subject.charAt(0)}
          </Text>
        </View>
        
        <View style={{ flex: 1, marginLeft: spacing(14), paddingRight: isCR && upcoming ? 0 : 90 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Text style={[styles.subjectText, { flex: 1, paddingRight: isCR && upcoming ? 8 : 0 }]} numberOfLines={2}>
              {item.subject}
            </Text>
            
            {isCR && upcoming && (
              <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0, marginTop: spacing(15) }}>
                <TouchableOpacity style={styles.editButton} onPress={() => onEdit && onEdit(item)}>
                  <Icon name="pencil-outline" size={fontSize(16)} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() =>
                  Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => onDelete && onDelete(item.id) },
                  ])
                }>
                  <Icon name="delete-outline" size={fontSize(16)} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Icon name="clock-outline" size={fontSize(20)} color="#1976D2" style={{ marginRight: SPACING.sm }} />
            <Text style={[styles.detailText, { fontSize: FONT_SIZES.lg, fontWeight: '600' }]} numberOfLines={1} ellipsizeMode="tail">
              {item.time}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="map-marker" size={fontSize(20)} color="#E65100" style={{ marginRight: SPACING.sm }} />
            <Text style={[styles.detailText, { fontSize: FONT_SIZES.lg, fontWeight: '600', flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
              {item.location || "Venue not specified"}
            </Text>
          </View>
        </View>
        
        {classStatus.message && (
          <View style={[styles.infoContainer, { backgroundColor: classStatus.badge.bgColor }]}>
            <Icon 
              name={
                classStatus.status === 'attendance_marked' ? "check-circle" :
                classStatus.status === 'ongoing_with_otp' ? "play-circle-outline" :
                classStatus.status === 'ongoing_waiting_otp' ? "clock-alert-outline" :
                classStatus.status === 'cancelled' ? "close-circle-outline" :
                "calendar-clock"
              } 
              size={fontSize(16)} 
              color={classStatus.badge.color}
            />
            <Text style={[styles.infoText, { color: classStatus.badge.color }]}>
              {classStatus.message}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {isScheduleViolated && !isAttendanceMarked(item) && (
          <TouchableOpacity style={[styles.attendanceButtonDisabled, { backgroundColor: '#FFEBEE' }]} disabled>
            <Icon name="shield-alert-outline" size={fontSize(18)} color="#D32F2F" />
            <Text style={[styles.buttonTextDisabled, { marginLeft: spacing(6), color: '#D32F2F' }]}>Security Violation</Text>
          </TouchableOpacity>
        )}

        {!isScheduleViolated && canMark && (
          <TouchableOpacity style={styles.attendanceButton} onPress={() => {
            const classEndTime = Date.now() + 60 * 60 * 1000;
            onMarkAttendance(classEndTime, item);
          }}>
            <Icon name="check-circle-outline" size={fontSize(20)} color="#FFF" />
            <Text style={[styles.buttonText, { marginLeft: SPACING.sm }]}>Mark Attendance</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// HomeScreen Component
const HomeScreen: React.FC<HomeScreenProps> = ({ user, setIsLoggedIn, setUser, navigation }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isCR, setIsCR] = useState(false);
  const [crLoading, setCrLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [violatedSchedules, setViolatedSchedules] = useState<Set<string>>(new Set());
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [venue, setVenue] = useState('');
  const [schedulingDate, setSchedulingDate] = useState('');
  const [crInfo, setCrInfo] = useState<any>(null);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editVenue, setEditVenue] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);

  const getAllTimeSlots = () => {
    return [
      { label: '8:30 - 9:30', start: '08:30', end: '09:30', type: '1-hour' },
      { label: '9:30 - 10:30', start: '09:30', end: '10:30', type: '1-hour' },
      { label: '10:30 - 11:30', start: '10:30', end: '11:30', type: '1-hour' },
      { label: '11:30 - 12:30', start: '11:30', end: '12:30', type: '1-hour' },
      { label: '1:40 - 2:40', start: '13:40', end: '14:40', type: '1-hour' },
      { label: '2:40 - 3:40', start: '14:40', end: '15:40', type: '1-hour' },
      { label: '3:40 - 4:40', start: '15:40', end: '16:40', type: '1-hour' },
      { label: '8:30 - 11:30', start: '08:30', end: '11:30', type: '3-hour' },
      { label: '9:30 - 12:30', start: '09:30', end: '12:30', type: '3-hour' },
      { label: '1:40 - 4:40', start: '13:40', end: '16:40', type: '3-hour' },
    ];
  };

  const getFilteredTimeSlots = (subjectType: string) => {
    const allSlots = getAllTimeSlots();
    if (subjectType.toLowerCase().includes('lab')) {
      return allSlots.filter(slot => slot.type === '3-hour');
    } else {
      return allSlots.filter(slot => slot.type === '1-hour');
    }
  };

  const generateColorForSubject = (subjectCode: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24'];
    let hash = 0;
    for (let i = 0; i < subjectCode.length; i++) {
      hash = subjectCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const checkIfCR = async () => {
    try {
      setCrLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/student/check-cr?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to check CR status');
      const data = await response.json();
      setIsCR(data.is_cr);
      if (data.is_cr) await Promise.all([fetchCRInfo(), fetchSubjects()]);
    } catch (error) {
      console.error("Failed to check CR status:", error);
      setIsCR(false);
    } finally {
      setCrLoading(false);
    }
  };

  const fetchCRInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/cr-info?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setCrInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch CR info:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cr/subjects?email=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch subjects:", errorData.error);
        setSubjects([]);
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const response = await fetch(`${API_BASE_URL}/api/student/schedule?email=${encodeURIComponent(user.email)}&date=${todayStr}`);

      if (!response.ok) throw new Error('Failed to fetch schedule');
      
      const data = await response.json();
      
      const transformedTodaySchedule = data.today_schedule?.map((item: any) => ({
        id: item.id,
        subject: item.subject,
        time: item.time,
        location: item.location,
        status: item.status,
        subject_mnemonic: item.subject_mnemonic,
        otp: item.otp,
        otp_created_at: item.otp_created_at,
        attendance_marked: item.attendance_marked,
        attendance_status: item.attendance_status,
        color: generateColorForSubject(item.subject_code || item.subject),
        start_time: item.start_time,
        end_time: item.end_time,
        date: item.date,
      })) || [];
      
      const transformedTomorrowSchedule = data.tomorrow_schedule?.map((item: any) => ({
        id: item.id,
        subject: item.subject,
        time: item.time,
        location: item.location,
        status: item.status,
        otp: item.otp,
        subject_mnemonic: item.subject_mnemonic,
        attendance_marked: item.attendance_marked,
        attendance_status: item.attendance_status,
        color: generateColorForSubject(item.subject_code || item.subject),
        start_time: item.start_time,
        end_time: item.end_time,
        date: item.date,
      })) || [];
      
      // Use async sorting and await the results
      const [sortedTodaySchedule, sortedTomorrowSchedule] = await Promise.all([
        sortSchedules(transformedTodaySchedule, violatedSchedules),
        sortSchedules(transformedTomorrowSchedule, violatedSchedules)
      ]);
      
      setSchedule(sortedTodaySchedule);
      setTomorrowSchedule(sortedTomorrowSchedule);
      
    } catch (error) {
      console.error("Failed to fetch schedule from API:", error);
      // Simply set empty arrays on error - no fallback to AsyncStorage
      setSchedule([]);
      setTomorrowSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const getSchedulingDate = () => {
    const today = new Date();
    if (selectedDate === 'today') {
      return today.toISOString().split('T')[0];
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  };

  const handleMarkAbsent = useCallback((scheduleId: string) => {
    setSchedule(prevSchedule => 
      prevSchedule.map(item => 
        item.id === scheduleId 
          ? { ...item, attendance_status: false, attendance_marked: true }
          : item
      )
    );
    setTomorrowSchedule(prevSchedule => 
      prevSchedule.map(item => 
        item.id === scheduleId 
          ? { ...item, attendance_status: false, attendance_marked: true }
          : item
      )
    );
  }, []);

  const scheduleClass = async () => {
    if (!selectedSubject || !selectedTimeSlot || !venue) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setSchedulingLoading(true);
      
      const allSlots = getAllTimeSlots();
      const selectedSlot = allSlots.find(slot => slot.label === selectedTimeSlot);
      
      if (!selectedSlot) {
        Alert.alert("Error", "Invalid time slot selected");
        return;
      }

      const scheduleData = {
        subject_code: selectedSubject,
        date: schedulingDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        venue: venue,
        student_email: user.email
      };

      const response = await fetch(`${API_BASE_URL}/api/cr/schedule-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        setModalVisible(false);
        resetModal();
        fetchSchedule();
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Failed to schedule class:", error);
      Alert.alert("Error", "Failed to schedule class");
    } finally {
      setSchedulingLoading(false);
    }
  };

  const updateClass = async () => {
    if (!editingSchedule || !editVenue) {
      Alert.alert("Error", "Please enter venue");
      return;
    }

    try {
      setEditLoading(true);

      const updateData = {
        schedule_id: editingSchedule.id,
        venue: editVenue,
        student_email: user.email
      };

      const response = await fetch(`${API_BASE_URL}/update-venue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert("Success", data.message);
        setEditModalVisible(false);
        resetEditModal();
        fetchSchedule();
      } else {
        Alert.alert("Error", data.error || "Failed to update class");
      }
    } catch (error) {
      console.error("Failed to update class:", error);
      Alert.alert("Error", "Failed to update class");
    } finally {
      setEditLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedSubject('');
    setSelectedTimeSlot('');
    setVenue('');
  };

  const resetEditModal = () => {
    setEditingSchedule(null);
    setEditVenue('');
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setEditVenue(item.location);
    setEditModalVisible(true);
  };

  const openSchedulingModal = () => {
    const date = getSchedulingDate();
    setSchedulingDate(date);
    setModalVisible(true);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchSchedule(),
        checkIfCR()
      ]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        fetchSchedule();
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
      Alert.alert("Error", "Failed to delete class");
    }
  };

  const handleMarkAttendance = (classEndTime: number, item: ScheduleItem) => {
    let otpExpiryTime: number;
    
    if (item.otp_created_at) {
      const otpCreatedTimestamp = new Date(item.otp_created_at).getTime();
      otpExpiryTime = otpCreatedTimestamp + 40000;
      
      const now = Date.now();
      const remainingTime = Math.floor((otpExpiryTime - now) / 1000);
      
      if (remainingTime <= 0) {
        Alert.alert(
          'OTP Expired', 
          'The OTP has already expired. Please wait for faculty to regenerate it.',
          [{ text: 'OK' }]
        );
        return;
      }
    } else {
      otpExpiryTime = Date.now() + 40000;
      console.warn('OTP creation timestamp not provided by backend, using fallback');
    }
    
    navigation.navigate("Otp", { 
      scheduleId: item.id,
      classEndTime,
      userEmail: user.email,
      otpExpiryTime: otpExpiryTime
    });
  };
  
  const getCurrentSchedule = () => {
    const current = selectedDate === 'today' ? schedule : tomorrowSchedule;
    // For real-time display, we'll use the already sorted schedules from state
    return current;
  };

  const getScheduleTitle = () => {
    return selectedDate === 'today' ? "Today's Schedule" : "Tomorrow's Schedule";
  };

  const checkViolatedSchedules = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const violatedKeys = allKeys.filter(key => key.startsWith('violated_'));
      const violatedIds = violatedKeys.map(key => key.replace('violated_', ''));
      setViolatedSchedules(new Set(violatedIds));
    } catch (error) {
      console.error('Error checking violated schedules:', error);
    }
  };

  useEffect(() => {
    checkIfCR();
    fetchSchedule();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
      checkViolatedSchedules();
    }, [selectedDate])
  );

  useEffect(() => {
    if (modalVisible) {
      const date = getSchedulingDate();
      setSchedulingDate(date);
    }
  }, [selectedDate, modalVisible]);

  useEffect(() => {
    setSelectedTimeSlot('');
  }, [selectedSubject]);

  if (crLoading) {
    return (
      <LinearGradient colors={["#900a02", "#600202"]} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: "#FFF", marginTop: spacing(10) }}>Loading today's schedule...</Text>
      </LinearGradient>
    );
  }

  const currentSchedule = getCurrentSchedule();

  return (
    <LinearGradient
      colors={["#900a02", "#600202"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingHello}>Hello,</Text>
        <Text style={styles.greetingName}>{user.name}!</Text>
      </View>

      <View style={styles.calendarNav}>
        <TouchableOpacity 
          style={[
            styles.dateButton, 
            selectedDate === 'today' && styles.dateButtonActive
          ]}
          onPress={() => setSelectedDate('today')}
        >
          <Text style={[
            styles.dateButtonText,
            selectedDate === 'today' && styles.dateButtonTextActive
          ]}>
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.dateButton, 
            selectedDate === 'tomorrow' && styles.dateButtonActive
          ]}
          onPress={() => setSelectedDate('tomorrow')}
        >
          <Text style={[
            styles.dateButtonText,
            selectedDate === 'tomorrow' && styles.dateButtonTextActive
          ]}>
            Tomorrow
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing(14) }}>
        <Text style={styles.scheduleTitle}>{getScheduleTitle()}</Text>

        {isCR && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginRight: spacing(15) }} onPress={openSchedulingModal}>
              <Icon name="plus-circle" size={fontSize(32)} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNotificationModalVisible(true)}>
              <Icon name="bell" size={fontSize(32)} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: SPACING.xl }} />
      ) : currentSchedule.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes scheduled.</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={fontSize(20)} color="#600202" />
            <Text style={styles.refreshText}>Click to refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentSchedule}
          renderItem={({ item }) => (
            <ClassScheduleCard
              item={item}
              onDelete={deleteClass}
              onEdit={openEditModal}
              isCR={isCR}
              onMarkAttendance={handleMarkAttendance}
              violatedSchedules={violatedSchedules}
              onAutoRefresh={onRefresh}
              userEmail={user.email}
              onMarkAbsent={handleMarkAbsent}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#600202", "#900a02", "#ff6b6b"]}
              tintColor="#600202"
              title="Refreshing..."
              titleColor="#FFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* CR Modals */}
      {isCR && (
        <Modal 
          visible={modalVisible} 
          animationType="slide" 
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              <View>
                <Text style={styles.modalTitle}>Schedule New Class</Text>
              </View>
              
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xl }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {crInfo && (
                  <View style={styles.crInfoContainer}>
                    <Text style={styles.crInfoText}>Class: E{crInfo.year} {crInfo.department} - {crInfo.section}</Text>
                    <Text style={styles.crInfoText}>Date: {schedulingDate}</Text>
                  </View>
                )}

                <Text style={styles.label}>Select Subject *</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                >
                  <Text style={selectedSubject ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder}>
                    {selectedSubject 
                      ? `${subjects.find(s => s.subject_code === selectedSubject)?.subject_name} (${subjects.find(s => s.subject_code === selectedSubject)?.subject_type})`
                      : 'Select a subject'}
                  </Text>
                  <Icon name={showSubjectDropdown ? "chevron-up" : "chevron-down"} size={fontSize(20)} color="#757575" />
                </TouchableOpacity>
                
                {showSubjectDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView 
                      style={{ maxHeight: 200 }}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {subjects.map((subject) => (
                        <TouchableOpacity
                          key={subject.subject_code}
                          style={[
                            styles.dropdownItem,
                            selectedSubject === subject.subject_code && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedSubject(subject.subject_code);
                            setShowSubjectDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedSubject === subject.subject_code && styles.dropdownItemTextSelected
                          ]}>
                            {subject.subject_name} ({subject.subject_type})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.label}>Time Slot *</Text>
                <TouchableOpacity 
                  style={[styles.dropdownButton, !selectedSubject && styles.dropdownButtonDisabled]}
                  onPress={() => selectedSubject && setShowTimeSlotDropdown(!showTimeSlotDropdown)}
                  disabled={!selectedSubject}
                >
                  <Text style={selectedTimeSlot ? styles.dropdownButtonTextSelected : styles.dropdownButtonTextPlaceholder}>
                    {selectedTimeSlot || 'Select a time slot'}
                  </Text>
                  <Icon name={showTimeSlotDropdown ? "chevron-up" : "chevron-down"} size={fontSize(20)} color="#757575" />
                </TouchableOpacity>
                
                {showTimeSlotDropdown && selectedSubject && (
                  <View style={styles.dropdownList}>
                    <ScrollView 
                      style={{ maxHeight: 200 }}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {getFilteredTimeSlots(
                        subjects.find(sub => sub.subject_code === selectedSubject)?.subject_type || ''
                      ).map((slot, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dropdownItem,
                            selectedTimeSlot === slot.label && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedTimeSlot(slot.label);
                            setShowTimeSlotDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedTimeSlot === slot.label && styles.dropdownItemTextSelected
                          ]}>
                            {slot.label} ({slot.type})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Text style={styles.label}>Venue *</Text>
                <TextInput
                  placeholder="Enter venue (e.g., GF1-CSE)"
                  placeholderTextColor="#999"
                  value={venue} 
                  onChangeText={setVenue}
                  style={styles.input}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#757575' }]} 
                  onPress={() => {
                    setModalVisible(false);
                    resetModal();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, schedulingLoading && styles.disabledButton]} 
                  onPress={scheduleClass}
                  disabled={schedulingLoading}
                >
                  {schedulingLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: fontSize(15) }}>Schedule Class</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Modal */}
      {isCR && (
        <Modal 
          visible={editModalVisible} 
          animationType="slide" 
          transparent={true}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Class Venue</Text>
              
              <ScrollView 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <View style={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xl }}>
                  {editingSchedule && (
                    <View style={styles.crInfoContainer}>
                      <Text style={styles.crInfoText}>
                        Subject: {editingSchedule.subject}
                      </Text>
                      <Text style={styles.crInfoText}>
                        Date: {editingSchedule.date}
                      </Text>
                      <Text style={styles.crInfoText}>
                        Time: {editingSchedule.time}
                      </Text>
                      <Text style={styles.crInfoText}>
                        Current Venue: {editingSchedule.location}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.label}>New Venue *</Text>
                  <TextInput
                    placeholder="Enter new venue (e.g., Room 101, Lab 201)"
                    placeholderTextColor="#999"
                    value={editVenue}
                    onChangeText={setEditVenue}
                    style={styles.input}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#757575' }]} 
                  onPress={() => {
                    setEditModalVisible(false);
                    resetEditModal();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, editLoading && styles.disabledButton]} 
                  onPress={updateClass}
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontWeight: '600', fontSize: fontSize(15) }}>Update Venue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Send Notification Modal for CR */}
      <SendNotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        crEmail={user.email}
        crInfo={crInfo}
      />
    </LinearGradient>
  );
};

// Styles remain exactly the same as in your original code
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#600202", 
    paddingHorizontal: SPACING.lg, 
    paddingTop: spacing(6) 
  },
  greetingContainer: { 
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  greetingHello: { 
    color: "rgba(255, 255, 255, 0.85)", 
    fontSize: fontSize(15),
    fontWeight: '500',
  },
  greetingName: { 
    color: "#FFF", 
    fontSize: FONT_SIZES.xxxl, 
    fontWeight: "700",
    marginTop: spacing(2),
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: 10,
  },
  dateButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateButtonActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dateButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSize(15),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateButtonTextActive: {
    color: '#900a02',
    fontWeight: '700',
  },
  scheduleTitle: { 
    color: "#FFF", 
    fontSize: FONT_SIZES.xl, 
    fontWeight: "700", 
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  listContainer: { 
    paddingBottom: SPACING.xl 
  },
  card: { 
    marginBottom: SPACING.md, 
    backgroundColor: "#FFF", 
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
    minHeight: 180,
  },
  subjectCircle: { 
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing(14),
    paddingHorizontal: spacing(14),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subjectBadge: {
    width: 95,
    height: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  subjectInitial: {
    fontSize: fontSize(22),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subjectText: { 
    color: "#212121", 
    fontWeight: "700", 
    fontSize: fontSize(17),
  },
  statusBadgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 10,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing(10),
    paddingVertical: spacing(5),
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    zIndex: 10,
  },
  statusBadgeText: {
    color: '#2E7D32',
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  waitingButton: {
    backgroundColor: '#FF9800',
    paddingVertical: spacing(10),
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    flex: 1,
    justifyContent: 'center',
  },
  waitingButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: fontSize(13),
    marginLeft: SPACING.sm,
  },
  attendanceButtonDisabled: {
    backgroundColor: '#E0E0E0',
    paddingVertical: spacing(10),
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  buttonTextDisabled: {
    color: '#757575',
    fontWeight: "600",
    fontSize: fontSize(13),
  },
  cardDetails: { 
    padding: SPACING.md,
  },
  detailText: { 
    color: "#424242", 
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: spacing(10),
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  infoText: {
    color: '#1565C0',
    fontSize: fontSize(13),
    marginLeft: SPACING.sm,
    fontWeight: '500',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  editButton: { 
    backgroundColor: "#4CAF50", 
    padding: spacing(6),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    elevation: 2,
  },
  deleteButton: { 
    backgroundColor: "#F44336", 
    padding: spacing(6),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    elevation: 2,
  },
  attendanceButton: { 
    backgroundColor: "#2196F3", 
    paddingVertical: spacing(10),
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "600", 
    fontSize: FONT_SIZES.md,
  },
  crInfoContainer: {
    backgroundColor: '#F5F5F5',
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#600202',
  },
  crInfoText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: '#424242',
    marginBottom: spacing(6),
  },
  label: {
    fontSize: fontSize(15),
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    color: '#424242',
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    color: '#424242',
    borderRadius: 10,
    padding: spacing(14),
    marginBottom: SPACING.lg,
    fontSize: fontSize(15),
    backgroundColor: '#FAFAFA',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: spacing(14),
    marginBottom: SPACING.md,
    backgroundColor: '#FAFAFA',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  dropdownButtonTextSelected: {
    fontSize: fontSize(15),
    color: '#424242',
    fontWeight: '500',
  },
  dropdownButtonTextPlaceholder: {
    fontSize: fontSize(15),
    color: '#999',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginBottom: SPACING.lg,
    backgroundColor: '#FFF',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemSelected: {
    backgroundColor: '#600202',
  },
  dropdownItemText: {
    fontSize: FONT_SIZES.lg,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#FFF',
  },
  modalButton: {
    backgroundColor: "#600202",
    paddingVertical: spacing(14),
    paddingHorizontal: SPACING.xxxl,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    marginTop: spacing(100),
    paddingHorizontal: spacing(40),
  },
  emptyText: { 
    color: 'rgba(255, 255, 255, 0.9)', 
    fontSize: FONT_SIZES.lg,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: spacing(14),
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshText: {
    color: '#900a02',
    marginLeft: SPACING.sm,
    fontWeight: '700',
    fontSize: fontSize(15),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  modalTitle: { 
    fontSize: FONT_SIZES.xxl, 
    fontWeight: "700", 
    textAlign: "center",
    paddingVertical: spacing(18),
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#600202',
    color: '#FFF',
  },
  upcomingPlaceholder: {
    backgroundColor: '#F5F5F5',
    paddingVertical: spacing(10),
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  upcomingPlaceholderText: {
    color: '#9E9E9E',
    fontSize: fontSize(13),
    fontWeight: '500',
    marginLeft: SPACING.sm,
  },
});

export default HomeScreen;