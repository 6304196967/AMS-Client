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

const API_BASE_URL = 'http://10.173.174.102:5000';

// Type for schedule
type ScheduleItem = {
  id: string;
  subject: string;
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
      <View style={[styles.subjectCircle, { backgroundColor: item.color }]}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Text style={styles.classText}>(Class)</Text>
        {status.text && (
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        )}
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>
          <Icon name="clock" size={14} color="#FFF" /> {item.time}{"   "}{"\n"}
          <Icon name="map-marker" size={14} color="#FFF" /> {item.location}
        </Text>
        
        {/* Show waiting for OTP message */}
        {waitingForOTP && !item.otp && (
          <View style={styles.waitingOTPContainer}>
            <Icon name="clock-alert" size={16} color="#FF9F43" />
            <Text style={styles.waitingOTPText}>
              Waiting for faculty to generate OTP
            </Text>
          </View>
        )}
        
        {/* Show attendance status */}
        {item.attendance_marked ? (
          <View style={styles.attendanceStatusContainer}>
            <Icon name="check-circle" size={16} color="#4ECDC4" />
            <Text style={styles.attendanceMarkedText}>
              ✓ Attendance Marked
            </Text>
          </View>
        ) : isCompleted && item.otp ? (
          <Text style={styles.pendingAttendanceText}>
            • Attendance Available
          </Text>
        ) : isExpired ? (
          <Text style={styles.expiredText}>
            • Class Time Passed
          </Text>
        ) : null}
      </View>

      <View style={styles.actionButtons}>
        {isCR && isUpcoming && (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit && onEdit(item)}
            >
              <Icon name="pencil" size={18} color="#FFF" />
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
              <Icon name="delete" size={18} color="#FFF" />
            </TouchableOpacity>
          </>
        )}

        {/* Show Mark Attendance button ONLY when:
            - Class is completed AND has OTP AND attendance is NOT marked */}
        {canMarkAttendance && (
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={() => {
              const classEndTime = Date.now() + 60 * 60 * 1000;
              onMarkAttendance(classEndTime, item);
            }}
          >
            <Text style={styles.buttonText}>Mark{'\n'}Attendance</Text>
          </TouchableOpacity>
        )}

        {/* Show waiting status when class is in OTP waiting period */}
        {waitingForOTP && !item.otp && (
          <View style={styles.waitingButton}>
            <Icon name="clock" size={16} color="#FFF" />
            <Text style={styles.waitingButtonText}>Waiting{'\n'}for OTP</Text>
          </View>
        )}

        {/* If attendance is already marked, show a disabled state */}
        {item.attendance_marked && (
          <View style={styles.attendanceButtonDisabled}>
            <Text style={styles.buttonTextDisabled}>Already{'\n'}Marked</Text>
          </View>
        )}

        {/* Show expired state for CR users */}
        {isCR && isExpired && (
          <View style={styles.expiredButton}>
            <Text style={styles.buttonTextDisabled}>Expired</Text>
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
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: "#FFF", marginTop: 10 }}>Loading today's schedule...</Text>
      </View>
    );
  }

  const currentSchedule = getCurrentSchedule();

  return (
    <View style={styles.container}>
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

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <Text style={styles.scheduleTitle}>{getScheduleTitle()}</Text>

        {isCR && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginRight: 15 }} onPress={openSchedulingModal}>
              <Icon name="plus-circle" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="bell" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
      ) : currentSchedule.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes scheduled.</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#600202" />
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
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Schedule New Class</Text>
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {/* CR Info */}
                {crInfo && (
                  <View style={styles.crInfoContainer}>
                    <Text style={styles.crInfoText}>Class: E{crInfo.year} {crInfo.department} - {crInfo.section}</Text>
                    <Text style={styles.crInfoText}>Date: {schedulingDate}</Text>
                  </View>
                )}

                {/* Subjects List */}
                <Text style={styles.label}>Select Subject *</Text>
                <View style={styles.dropdownContainer}>
                  <ScrollView 
                    style={styles.dropdownScrollView}
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
                        onPress={() => setSelectedSubject(subject.subject_code)}
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

                {/* Time Slots List - Filtered based on subject type */}
                <Text style={styles.label}>Time Slot *</Text>
                <View style={styles.dropdownContainer}>
                  <ScrollView 
                    style={styles.dropdownScrollView}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {selectedSubject ? (
                      getFilteredTimeSlots(
                        subjects.find(sub => sub.subject_code === selectedSubject)?.subject_type || ''
                      ).map((slot, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dropdownItem,
                            selectedTimeSlot === slot.label && styles.dropdownItemSelected
                          ]}
                          onPress={() => setSelectedTimeSlot(slot.label)}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedTimeSlot === slot.label && styles.dropdownItemTextSelected
                          ]}>
                            {slot.label} ({slot.type})
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.disabledText}>Please select a subject first</Text>
                    )}
                  </ScrollView>
                </View>

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
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Schedule Class</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: 'red' }]} 
                  onPress={() => {
                    setModalVisible(false);
                    resetModal();
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Modal remains the same */}
      {isCR && (
        <Modal visible={editModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Text style={styles.modalTitle}>Edit Class Venue</Text>
                
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

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                  <TouchableOpacity 
                    style={[styles.modalButton, editLoading && styles.disabledButton]} 
                    onPress={updateClass}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Update Venue</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: 'red' }]} 
                    onPress={() => {
                      setEditModalVisible(false);
                      resetEditModal();
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};


// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", paddingHorizontal: 20, paddingTop: 20 },
  greetingContainer: { marginTop: 20 },
  greetingHello: { color: "#FFF", fontSize: 28 },
  greetingName: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 5,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  dateButtonActive: {
    backgroundColor: '#FFF',
  },
  slotInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButtonTextActive: {
    color: '#600202',
  },
  
  scheduleTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 15, textDecorationLine: "underline" },
  listContainer: { paddingBottom: 20 },
  card: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12, 
    padding: 10, 
    backgroundColor: "rgba(255,255,255,0.1)", 
    borderRadius: 15 
  },
  dropdownContainer: {
  maxHeight: 180,
  borderWidth: 1,
  borderColor: "#CCC",
  borderRadius: 8,
  marginBottom: 10,
},
expiredText: {
  color: '#FF6B6B',
  fontSize: 12,
  marginTop: 5,
  fontStyle: 'italic',
},
expiredButton: {
  backgroundColor: '#6c757d',
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  minHeight: 35,
  marginLeft: 5,
  opacity: 0.7,
},
  subjectCircle: { 
    width: 90, 
    height: 75, 
    borderRadius: 35, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10 
  },
  waitingOTPContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  waitingOTPText: {
    color: '#FF9F43',
    fontSize: 12,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  waitingButton: {
    backgroundColor: '#FF9F43',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 35,
    marginLeft: 5,
    flexDirection: 'row',
  },
  waitingButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    marginLeft: 4,
  },
  attendanceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  attendanceMarkedText: {
    color: '#4ECDC4',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  pendingAttendanceText: {
    color: '#FECA57',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  attendanceButtonDisabled: {
    backgroundColor: '#6c757d',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 35,
    marginLeft: 5,
    opacity: 0.7,
  },
  buttonTextDisabled: {
    color: '#CCC',
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  subjectText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16,
    marginLeft: 8,
    textAlign: 'center'
  },
  classText: { color: "#FFF", fontSize: 12 },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardDetails: { flex: 1 },
  detailText: { color: "#FFF", fontSize: 14 },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: { 
    backgroundColor: "#FFA500", 
    padding: 6, 
    borderRadius: 8, 
    marginRight: 5 
  },
  deleteButton: { 
    backgroundColor: "red", 
    padding: 6, 
    borderRadius: 8, 
    marginRight: 5 
  },
  attendanceButton: { 
    backgroundColor: "#28a745", 
    paddingVertical: 4, 
    paddingHorizontal: 6, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    minHeight: 35, 
    marginLeft: 5 
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  
    
  // CR Info Styles
  crInfoContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  crInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#600202',
    marginBottom: 2,
  },
  
  // Form Styles
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    color: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    

  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dropdownItemSelected: {
    backgroundColor: '#600202',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#FFF',
  },
  disabledText: {
    color: '#999',
    marginTop: 10,
    marginLeft:10,
    fontSize:15,
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  
  
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { 
    color: '#FFF', 
    fontSize: 16,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshText: {
    color: '#600202',
    marginLeft: 8,
    fontWeight: 'bold',
  },
   modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    height: "80%", // Fixed height instead of maxHeight
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: 'hidden', // Important to prevent content overflow
  },
  

  // The footer stays fixed at the bottom of the modal
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#FFF', // Ensure background color
  },
  
  // Dropdown styles - make them scrollable
  
  
  // Ensure proper spacing for modal title
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 15, 
    textAlign: "center",
    paddingTop: 15,
  },
  modalScrollView: {
  flex: 1,
},
modalScrollContent: {
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 20,
},
dropdownScrollView: {
  maxHeight: 120, // Limits height of each dropdown
  marginBottom: 10,
},
dropdown: {
  maxHeight: 120,
  borderWidth: 1,
  borderColor: "#CCC",
  borderRadius: 8,
  zIndex: 1, // Ensure dropdown appears above other content
}
});

export default HomeScreen;