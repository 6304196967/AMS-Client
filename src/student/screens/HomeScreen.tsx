import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";
import LinearGradient from "react-native-linear-gradient";
import SendNotificationModal from './SendNotificationModal';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

// Type for schedule
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
  attendance_marked?: boolean;
  attendance_status?: boolean;
  start_time?: string;
  end_time?: string;
  date?: string;
};

// Props for HomeScreen
type HomeScreenProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
  navigation: NativeStackNavigationProp<StackParamList>;
};

// Subject type
type Subject = {
  subject_code: string;
  subject_name: string;
  subject_type: string;
};

// Card Component
// Card Component
// Card Component
const ClassScheduleCard = ({
  item,
  onDelete,
  onEdit,
  isCR,
  onMarkAttendance,
}: {
  item: ScheduleItem;
  onDelete?: (id: string) => void;
  onEdit?: (item: ScheduleItem) => void;
  isCR: boolean;
  onMarkAttendance: (classEndTime: number, item: ScheduleItem) => void;
}) => {
  // Get subject color based on subject name
  const getSubjectColor = (subject: string) => {
    const colors = {
      // CS/IT subjects - Blue tones
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
      
      // Programming subjects - Purple/Violet tones
      'Java': { bg: '#6A1B9A', text: '#FFF' },
      'Python': { bg: '#7B1FA2', text: '#FFF' },
      'C': { bg: '#4A148C', text: '#FFF' },
      'C++': { bg: '#6200EA', text: '#FFF' },
      'Web Development': { bg: '#5E35B1', text: '#FFF' },
      
      // Mathematics subjects - Teal/Cyan
      'Mathematics': { bg: '#00796B', text: '#FFF' },
      'Maths': { bg: '#00796B', text: '#FFF' },
      'Discrete Mathematics': { bg: '#00897B', text: '#FFF' },
      'Linear Algebra': { bg: '#00695C', text: '#FFF' },
      'Probability': { bg: '#009688', text: '#FFF' },
      
      // Core Engineering - Orange/Amber
      'Digital Logic': { bg: '#E65100', text: '#FFF' },
      'COA': { bg: '#EF6C00', text: '#FFF' },
      'Computer Organization': { bg: '#EF6C00', text: '#FFF' },
      'Microprocessors': { bg: '#F57C00', text: '#FFF' },
      
      // Theory subjects - Deep Purple
      'Theory of Computation': { bg: '#512DA8', text: '#FFF' },
      'TOC': { bg: '#512DA8', text: '#FFF' },
      'Compiler Design': { bg: '#4527A0', text: '#FFF' },
      
      // AI/ML - Pink/Rose
      'Machine Learning': { bg: '#C2185B', text: '#FFF' },
      'ML': { bg: '#C2185B', text: '#FFF' },
      'AI': { bg: '#AD1457', text: '#FFF' },
      'Artificial Intelligence': { bg: '#AD1457', text: '#FFF' },
      'Data Mining': { bg: '#880E4F', text: '#FFF' },
      
      // Electronics - Green
      'Electronics': { bg: '#388E3C', text: '#FFF' },
      'Digital Electronics': { bg: '#2E7D32', text: '#FFF' },
      'Signals': { bg: '#43A047', text: '#FFF' },
      
      // Management/Soft skills - Indigo
      'Management': { bg: '#303F9F', text: '#FFF' },
      'Economics': { bg: '#3949AB', text: '#FFF' },
      'Communication': { bg: '#3F51B5', text: '#FFF' },
      
      // Default color - Gray
      'default': { bg: '#546E7A', text: '#FFF' }
    };

    // Check if subject contains any keyword
    for (const [key, color] of Object.entries(colors)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return colors.default;
  };

  const subjectColor = getSubjectColor(item.subject);
  
  // Check if current time is between start time and end time + 30 minutes
  const isWaitingForOTP = () => {
    if (!item.date || !item.start_time || !item.end_time) return false;
    
    try {
      const classStartDateTime = new Date(item.date + 'T' + item.start_time);
      const classEndDateTime = new Date(item.date + 'T' + item.end_time);
      const currentDateTime = new Date();
      
      // Add 30 minutes buffer to end time
      const bufferMs = 30 * 60 * 1000;
      const classEndWithBuffer = new Date(classEndDateTime.getTime() + bufferMs);
      
      return (
        currentDateTime.getTime() >= classStartDateTime.getTime() && 
        currentDateTime.getTime() <= classEndWithBuffer.getTime()
      );
    } catch (error) {
      console.error('Error checking OTP waiting period:', error);
      return false;
    }
  };

  // Only show Mark Attendance button when:
  // - Class is completed (status = true) AND OTP is available AND attendance is NOT marked
  const canMarkAttendance = item.status && item.otp && !item.attendance_marked;
  
  // Calculate if class time has passed
  const isClassTimePassed = () => {
    if (!item.date || !item.end_time) return false;
    
    try {
      const classEndDateTime = new Date(item.date + 'T' + item.end_time);
      const currentDateTime = new Date();
      
      // Add buffer of 5 minutes to account for potential time sync issues
      const bufferMs = 5 * 60 * 1000;
      
      return classEndDateTime.getTime() + bufferMs < currentDateTime.getTime();
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  };

  const waitingForOTP = isWaitingForOTP();
  const isExpired = !item.status && isClassTimePassed() && !waitingForOTP;
  const isCompleted = item.status;
  const isUpcoming = !item.status && !isExpired && !waitingForOTP;

  const getStatusText = () => {
    if (isCompleted) return { text: 'Completed', color: '#4ECDC4' };
    if (waitingForOTP) return { text: 'Waiting for OTP', color: '#FF9F43' };
    if (isExpired) return { text: 'Expired', color: '#FF6B6B' };
    if (isUpcoming) return { text: 'Upcoming', color: '#FECA57' };
    return { text: '', color: '' };
  };

  const status = getStatusText();

  return (
    <View style={styles.card}>
      {/* Status badge - top right corner */}
      {status.text && (
        <View style={styles.statusBadgeTopRight}>
          <Text style={styles.statusBadgeText}>
            {status.text}
          </Text>
        </View>
      )}
      
      {/* Subject Header with colored badge */}
      <View style={styles.subjectCircle}>
        {/* Circular/Rounded subject badge */}
        <View style={[styles.subjectBadge, { backgroundColor: subjectColor.bg }]}>
          <Text style={[styles.subjectInitial, { color: subjectColor.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {item.subject_mnemonic}
          </Text>
        </View>
        
        <View style={{ flex: 1, marginLeft: spacing(14), paddingRight: isCR && isUpcoming ? 0 : 90 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Text style={[styles.subjectText, { flex: 1, paddingRight: isCR && isUpcoming ? 8 : 0 }]} numberOfLines={2}>
              {item.subject}
            </Text>
            
            {/* Edit/Delete buttons next to subject name for CR users with upcoming classes */}
            {isCR && isUpcoming && (
              <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0, marginTop: spacing(15) }}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEdit && onEdit(item)}
                >
                  <Icon name="pencil-outline" size={fontSize(16)} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => onDelete && onDelete(item.id) },
                    ])
                  }
                >
                  <Icon name="delete-outline" size={fontSize(16)} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Class Details */}
      <View style={styles.cardDetails}>
        {/* Timing and Venue side-by-side with proper spacing */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, gap: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Icon name="clock-outline" size={fontSize(20)} color="#1976D2" style={{ flexShrink: 0 }} />
            <Text 
              style={[styles.detailText, { marginLeft: SPACING.sm, fontSize: FONT_SIZES.lg, fontWeight: '600', flex: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.time}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Icon name="map-marker" size={fontSize(20)} color="#E65100" style={{ flexShrink: 0 }} />
            <Text 
              style={[styles.detailText, { marginLeft: SPACING.sm, fontSize: FONT_SIZES.lg, fontWeight: '600', flex: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.location}
            </Text>
          </View>
        </View>
        
        {/* Contextual Status Messages */}
        {isUpcoming && !item.attendance_marked && (
          <View style={styles.infoContainer}>
            <Icon name="calendar-clock" size={fontSize(16)} color="#1976D2" />
            <Text style={styles.infoText}>
              Class is scheduled - Not started yet
            </Text>
          </View>
        )}
        
        {/* Show waiting for OTP message */}
        {waitingForOTP && !item.otp && (
          <View style={styles.waitingOTPContainer}>
            <Icon name="clock-alert-outline" size={fontSize(16)} color="#F57C00" />
            <Text style={styles.waitingOTPText}>
              Class in progress - Waiting for faculty to generate OTP
            </Text>
          </View>
        )}
        
        {/* Show attendance status */}
        {item.attendance_marked ? (
          <View style={styles.attendanceStatusContainer}>
            <Icon name="check-circle" size={fontSize(16)} color="#00796B" />
            <Text style={styles.attendanceMarkedText}>
              ✓ Attendance marked successfully
            </Text>
          </View>
        ) : isCompleted && item.otp ? (
          <View style={{ backgroundColor: '#FFF8E1', padding: spacing(10), borderRadius: 8, marginTop: SPACING.sm, flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="alert-circle-outline" size={fontSize(16)} color="#F57F17" />
            <Text style={[styles.pendingAttendanceText, { marginTop: spacing(0), marginLeft: SPACING.sm, fontSize: fontSize(13) }]}>
              Class completed - Attendance available to mark
            </Text>
          </View>
        ) : isCompleted && !item.otp && !item.attendance_marked ? (
          <View style={{ backgroundColor: '#FFF3E0', padding: spacing(10), borderRadius: 8, marginTop: SPACING.sm, flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="information-outline" size={fontSize(16)} color="#F57C00" />
            <Text style={[styles.pendingAttendanceText, { marginTop: spacing(0), marginLeft: SPACING.sm, fontSize: fontSize(13) }]}>
              Class completed - Waiting for faculty to generate OTP
            </Text>
          </View>
        ) : isExpired && !item.attendance_marked ? (
          <View style={styles.expiredContainer}>
            <Icon name="close-circle-outline" size={fontSize(16)} color="#D32F2F" />
            <Text style={[styles.expiredText, { marginTop: spacing(0), marginLeft: SPACING.sm }]}>
              Class time passed - Attendance not marked
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons Section - Always show to maintain consistent card height */}
      <View style={styles.actionButtons}>
        {/* Show Mark Attendance button when class is completed AND has OTP AND attendance is NOT marked */}
        {canMarkAttendance && (
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => {
              const classEndTime = Date.now() + 60 * 60 * 1000;
              onMarkAttendance(classEndTime, item);
            }}
          >
            <Icon name="check-circle-outline" size={fontSize(20)} color="#FFF" />
            <Text style={[styles.buttonText, { marginLeft: SPACING.sm }]}>Mark Attendance</Text>
          </TouchableOpacity>
        )}

        {/* Show waiting status when class is in OTP waiting period */}
        {waitingForOTP && !item.otp && !isCR && !canMarkAttendance && !item.attendance_marked && (
          <TouchableOpacity style={styles.waitingButton} disabled>
            <Icon name="clock-outline" size={fontSize(18)} color="#FFF" />
            <Text style={styles.waitingButtonText}>Waiting for OTP</Text>
          </TouchableOpacity>
        )}

        {/* If attendance is already marked, show a disabled state */}
        {item.attendance_marked && !isCR && (
          <TouchableOpacity style={styles.attendanceButtonDisabled} disabled>
            <Icon name="check-all" size={fontSize(18)} color="#757575" />
            <Text style={[styles.buttonTextDisabled, { marginLeft: spacing(6) }]}>Already Marked</Text>
          </TouchableOpacity>
        )}

        {/* Show placeholder for upcoming classes (non-CR students) */}
        {!isCR && isUpcoming && !canMarkAttendance && !item.attendance_marked && (
          <View style={styles.upcomingPlaceholder}>
            <Icon name="calendar-clock" size={fontSize(16)} color="#9E9E9E" />
            <Text style={styles.upcomingPlaceholderText}>
              Class scheduled
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
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
  
  // Dropdown visibility states
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);

  // Get all time slots (for scheduleClass function)
  const getAllTimeSlots = () => {
    return [
      // 1-hour slots (7 slots)
      { label: '8:30 - 9:30', start: '08:30', end: '09:30', type: '1-hour' },
      { label: '9:30 - 10:30', start: '09:30', end: '10:30', type: '1-hour' },
      { label: '10:30 - 11:30', start: '10:30', end: '11:30', type: '1-hour' },
      { label: '11:30 - 12:30', start: '11:30', end: '12:30', type: '1-hour' },
      { label: '1:40 - 2:40', start: '13:40', end: '14:40', type: '1-hour' },
      { label: '2:40 - 3:40', start: '14:40', end: '15:40', type: '1-hour' },
      { label: '3:40 - 4:40', start: '15:40', end: '16:40', type: '1-hour' },
      
      // 3-hour slots (3 slots)
      { label: '8:30 - 11:30', start: '08:30', end: '11:30', type: '3-hour' },
      { label: '9:30 - 12:30', start: '09:30', end: '12:30', type: '3-hour' },
      { label: '1:40 - 4:40', start: '13:40', end: '16:40', type: '3-hour' },
    ];
  };

  // Filtered time slots based on subject type
  const getFilteredTimeSlots = (subjectType: string) => {
    const allSlots = getAllTimeSlots();

    // Filter slots based on subject type
    if (subjectType.toLowerCase().includes('lab')) {
      // Show only 3-hour slots for labs
      return allSlots.filter(slot => slot.type === '3-hour');
    } else {
      // Show only 1-hour slots for regular subjects
      return allSlots.filter(slot => slot.type === '1-hour');
    }
  };

  // Reset time slot when subject changes
  useEffect(() => {
    setSelectedTimeSlot('');
  }, [selectedSubject]);

  // Rest of your functions remain the same...
  const checkIfCR = async () => {
    try {
      setCrLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/student/check-cr?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error('Failed to check CR status');
      }
      const data = await response.json();
      setIsCR(data.is_cr);
      
      if (data.is_cr) {
        await Promise.all([fetchCRInfo(), fetchSubjects()]);
      }
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
      const response = await fetch(`${API_BASE_URL}/api/student/schedule?email=${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      
      const data = await response.json();
      
      const transformedTodaySchedule = data.today_schedule?.map((item: any) => ({
        id: item.id,
        subject: item.subject,
        time: item.time,
        location: item.location,
        status: item.status,
        subject_mnemonic: item.subject_mnemonic,
        otp: item.otp,
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
        attendance_marked: item.attendance_marked,
        attendance_status: item.attendance_status,
        color: generateColorForSubject(item.subject_code || item.subject),
        start_time: item.start_time,
        end_time: item.end_time,
        date: item.date,
      })) || [];
      
      setSchedule(transformedTodaySchedule);
      setTomorrowSchedule(transformedTomorrowSchedule);
      
      await AsyncStorage.setItem(`schedule_${user.email}`, JSON.stringify({
        today: transformedTodaySchedule,
        tomorrow: transformedTomorrowSchedule
      }));
      
    } catch (error) {
      console.error("Failed to fetch schedule from API:", error);
      try {
        const storedSchedule = await AsyncStorage.getItem(`schedule_${user.email}`);
        if (storedSchedule) {
          const parsed = JSON.parse(storedSchedule);
          setSchedule(parsed.today || []);
          setTomorrowSchedule(parsed.tomorrow || []);
        } else {
          setSchedule([]);
          setTomorrowSchedule([]);
        }
      } catch (storageError) {
        console.error("Failed to fetch schedule from storage:", storageError);
        setSchedule([]);
        setTomorrowSchedule([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateColorForSubject = (subjectCode: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24'
    ];
    
    let hash = 0;
    for (let i = 0; i < subjectCode.length; i++) {
      hash = subjectCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
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
  navigation.navigate("Otp", { 
    scheduleId: item.id,
    classEndTime,
    userEmail: user.email  // Add this line to pass the email
  });
};
  const getCurrentSchedule = () => {
    return selectedDate === 'today' ? schedule : tomorrowSchedule;
  };

  const getScheduleTitle = () => {
    return selectedDate === 'today' ? "Today's Schedule" : "Tomorrow's Schedule";
  };

  useEffect(() => {
    checkIfCR();
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      const date = getSchedulingDate();
      setSchedulingDate(date);
    }
  }, [selectedDate, modalVisible]);

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
            <Text style={styles.refreshText}>Pull down to refresh</Text>
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
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFF"]}
              tintColor="#FFF"
              title="Refreshing..."
              titleColor="#FFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {isCR && (
        <Modal 
          visible={modalVisible} 
          animationType="slide" 
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              {/* Title Header */}
              <View>
                <Text style={styles.modalTitle}>Schedule New Class</Text>
              </View>
              
              {/* Scrollable Content */}
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xl }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {/* CR Info */}
                {crInfo && (
                  <View style={styles.crInfoContainer}>
                    <Text style={styles.crInfoText}>Class: E{crInfo.year} {crInfo.department} - {crInfo.section}</Text>
                    <Text style={styles.crInfoText}>Date: {schedulingDate}</Text>
                  </View>
                )}

                {/* Subjects Dropdown */}
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

                {/* Time Slots Dropdown - Filtered based on subject type */}
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

                {/* Venue Input */}
                <Text style={styles.label}>Venue *</Text>
                <TextInput
                  placeholder="Enter venue (e.g., GF1-CSE)"
                  placeholderTextColor="#999"
                  value={venue}
                  onChangeText={setVenue}
                  style={styles.input}
                />
              </ScrollView>

              {/* Buttons remain outside ScrollView */}
              <View style={styles.modalFooter}>
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
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#757575' }]} 
                  onPress={() => {
                    setModalVisible(false);
                    resetModal();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Cancel</Text>
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
              {/* Title Header */}
              <Text style={styles.modalTitle}>Edit Class Venue</Text>
              
              {/* Scrollable Content */}
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
                    onChangeText={setEditVenue}
                    style={styles.input}
                  />
                </View>
              </ScrollView>

              {/* Buttons outside ScrollView */}
              <View style={styles.modalFooter}>
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
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: '#757575' }]} 
                  onPress={() => {
                    setEditModalVisible(false);
                    resetEditModal();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Cancel</Text>
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


// Styles remain the same...
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
  slotInfo: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    marginBottom: spacing(10),
    textAlign: 'center',
    fontStyle: 'italic',
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
  dropdownContainer: {
  maxHeight: 180,
  borderWidth: 1,
  borderColor: "#CCC",
  borderRadius: 8,
  marginBottom: spacing(10),
},
expiredButton: {
  backgroundColor: '#E0E0E0',
  paddingVertical: spacing(10),
  paddingHorizontal: SPACING.xl,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
},
expiredText: {
  color: '#D32F2F',
  fontSize: fontSize(13),
  fontWeight: '500',
  flex: 1,
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
  subjectType: {
    fontSize: fontSize(11),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing(3),
  },
  subjectText: { 
    color: "#212121", 
    fontWeight: "700", 
    fontSize: fontSize(17),
  },
  subjectMeta: {
    color: "#757575",
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
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
  waitingOTPContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: spacing(10),
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  waitingOTPText: {
    color: '#E65100',
    fontSize: fontSize(13),
    marginLeft: SPACING.sm,
    fontWeight: '500',
    flex: 1,
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
  attendanceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    padding: spacing(10),
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  attendanceMarkedText: {
    color: '#00796B',
    fontSize: fontSize(13),
    marginLeft: SPACING.sm,
    fontWeight: '600',
    flex: 1,
  },
  pendingAttendanceText: {
    color: '#F57F17',
    fontSize: fontSize(13),
    fontWeight: '500',
    flex: 1,
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
  classText: { 
    color: "rgba(255, 255, 255, 0.85)", 
    fontSize: fontSize(11),
    fontWeight: '600',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginLeft: SPACING.sm,
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
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: spacing(10),
    borderRadius: 8,
    marginTop: SPACING.sm,
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
  
    
  // CR Info Styles
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
  
  // Form Styles
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
  
  // Dropdown Styles
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
  disabledText: {
    color: '#999',
    marginTop: spacing(10),
    marginLeft: spacing(10),
    fontSize: fontSize(15),
    fontStyle: 'italic',
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
  

  // The footer stays fixed at the bottom of the modal
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
  
  // Dropdown styles - make them scrollable
  
  
  // Ensure proper spacing for modal title
  modalTitle: { 
    fontSize: FONT_SIZES.xxl, 
    fontWeight: "700", 
    textAlign: "center",
    paddingVertical: spacing(18),
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#600202',
    color: '#FFF',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
dropdownScrollView: {
  maxHeight: 120, // Limits height of each dropdown
  marginBottom: spacing(10),
},
dropdown: {
  maxHeight: 120,
  borderWidth: 1,
  borderColor: "#CCC",
  borderRadius: 8,
  zIndex: 1, // Ensure dropdown appears above other content
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