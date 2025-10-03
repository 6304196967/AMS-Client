// src/faculty/screens/ClassDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ClassDetails: { classData: any };
  AttendanceReport: { classData: any };
};

type ClassDetailsRouteProp = RouteProp<RootStackParamList, 'ClassDetails'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

// Enhanced sample data with multiple periods for the same date
const initialAttendanceData = {
  '18/09/2025': [
    {
      period: 1,
      time: '8:30 - 9:30 AM',
      topic: 'Kernel Discussion',
      present: 67,
      absent: 3,
      total: 70,
      students: [
        { id: 'R210001', name: 'John Doe', status: 'present' },
        { id: 'R210002', name: 'Jane Smith', status: 'present' },
        { id: 'R210003', name: 'Mike Johnson', status: 'absent' },
        { id: 'R210004', name: 'Sarah Wilson', status: 'present' },
        { id: 'R210005', name: 'David Brown', status: 'absent' },
        { id: 'R210006', name: 'Emily Davis', status: 'present' },
        { id: 'R210007', name: 'Michael Wilson', status: 'present' },
      ]
    },
    {
      period: 2,
      time: '10:00 - 11:00 AM',
      topic: 'Process Scheduling',
      present: 65,
      absent: 5,
      total: 70,
      students: [
        { id: 'R210001', name: 'John Doe', status: 'present' },
        { id: 'R210002', name: 'Jane Smith', status: 'absent' },
        { id: 'R210003', name: 'Mike Johnson', status: 'present' },
        { id: 'R210004', name: 'Sarah Wilson', status: 'present' },
        { id: 'R210005', name: 'David Brown', status: 'absent' },
        { id: 'R210006', name: 'Emily Davis', status: 'present' },
        { id: 'R210007', name: 'Michael Wilson', status: 'present' },
      ]
    }
  ],
  '16/09/2025': [
    {
      period: 1,
      time: '9:00 - 10:00 AM',
      topic: 'Process Management',
      present: 68,
      absent: 2,
      total: 70,
      students: [
        { id: 'R210001', name: 'John Doe', status: 'present' },
        { id: 'R210002', name: 'Jane Smith', status: 'present' },
        { id: 'R210003', name: 'Mike Johnson', status: 'present' },
        { id: 'R210004', name: 'Sarah Wilson', status: 'present' },
        { id: 'R210005', name: 'David Brown', status: 'absent' },
        { id: 'R210006', name: 'Emily Davis', status: 'present' },
        { id: 'R210007', name: 'Michael Wilson', status: 'present' },
      ]
    }
  ],
  '14/09/2025': [
    {
      period: 1,
      time: '8:30 - 9:30 AM',
      topic: 'Memory Management',
      present: 66,
      absent: 4,
      total: 70,
      students: [
        { id: 'R210001', name: 'John Doe', status: 'present' },
        { id: 'R210002', name: 'Jane Smith', status: 'present' },
        { id: 'R210003', name: 'Mike Johnson', status: 'present' },
        { id: 'R210004', name: 'Sarah Wilson', status: 'present' },
        { id: 'R210005', name: 'David Brown', status: 'absent' },
        { id: 'R210006', name: 'Emily Davis', status: 'present' },
        { id: 'R210007', name: 'Michael Wilson', status: 'present' },
      ]
    },
    {
      period: 3,
      time: '11:30 - 12:30 PM',
      topic: 'Virtual Memory',
      present: 64,
      absent: 6,
      total: 70,
      students: [
        { id: 'R210001', name: 'John Doe', status: 'present' },
        { id: 'R210002', name: 'Jane Smith', status: 'absent' },
        { id: 'R210003', name: 'Mike Johnson', status: 'present' },
        { id: 'R210004', name: 'Sarah Wilson', status: 'present' },
        { id: 'R210005', name: 'David Brown', status: 'absent' },
        { id: 'R210006', name: 'Emily Davis', status: 'present' },
        { id: 'R210007', name: 'Michael Wilson', status: 'present' },
      ]
    }
  ],
};

const ClassDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClassDetailsRouteProp>();
  const { classData } = route.params;
  
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('18/09/2025');
  const [selectedPeriod, setSelectedPeriod] = useState(0); // Index of selected period
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingStudent, setEditingStudent] = useState<{id: string, currentStatus: string} | null>(null);

  // Get current date's attendance periods
  const currentDatePeriods = attendanceData[selectedDate as keyof typeof attendanceData] || [];
  
  // Get selected period data
  const currentPeriod = currentDatePeriods[selectedPeriod];
  
  // Filter students based on search query
  const filteredStudents = currentPeriod?.students?.filter(student => 
    student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Generate dates for the calendar for current month
  const generateCalendarDates = () => {
    const dates = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    
    // Add padding for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -i);
      const dateString = date.toLocaleDateString('en-GB');
      const hasAttendance = attendanceData[dateString as keyof typeof attendanceData];
      
      dates.unshift({
        date: dateString,
        hasAttendance: !!hasAttendance,
        day: date.getDate(),
        month: date.toLocaleDateString('en', { month: 'short' }),
        isSelected: dateString === selectedDate,
        isCurrentMonth: false
      });
    }
    
    // Add all days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = date.toLocaleDateString('en-GB');
      const hasAttendance = attendanceData[dateString as keyof typeof attendanceData];
      
      dates.push({
        date: dateString,
        hasAttendance: !!hasAttendance,
        day: day,
        month: date.toLocaleDateString('en', { month: 'short' }),
        isSelected: dateString === selectedDate,
        isCurrentMonth: true
      });
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Toggle student attendance status
  const toggleStudentStatus = (studentId: string) => {
    if (!currentPeriod) return;

    const updatedStudents = currentPeriod.students.map(student => {
      if (student.id === studentId) {
        const newStatus = student.status === 'present' ? 'absent' : 'present';
        return { ...student, status: newStatus };
      }
      return student;
    });

    // Calculate new counts
    const presentCount = updatedStudents.filter(s => s.status === 'present').length;
    const absentCount = updatedStudents.filter(s => s.status === 'absent').length;

    // Update attendance data
    setAttendanceData(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate as keyof typeof attendanceData].map((period, index) => 
        index === selectedPeriod 
          ? { ...period, students: updatedStudents, present: presentCount, absent: absentCount }
          : period
      )
    }));

    setEditingStudent(null);
    Alert.alert('Success', 'Attendance status updated successfully!');
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentId}>{item.id}</Text>
        <Text style={styles.studentName}>{item.name}</Text>
      </View>
      
      <View style={styles.studentActions}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'present' ? '#28a745' : '#dc3545' }
        ]}>
          <Icon 
            name={item.status === 'present' ? 'check' : 'close'} 
            size={14} 
            color="#FFF" 
          />
          <Text style={styles.statusText}>
            {item.status === 'present' ? 'Present' : 'Absent'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setEditingStudent({ id: item.id, currentStatus: item.status })}
        >
          <Icon name="edit" size={16} color="#600202" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCalendarDate = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.calendarDate,
        item.isSelected && styles.calendarDateSelected,
        !item.hasAttendance && styles.calendarDateNoData,
        !item.isCurrentMonth && styles.calendarDateOtherMonth
      ]}
      onPress={() => {
        if (item.hasAttendance && item.isCurrentMonth) {
          setSelectedDate(item.date);
          setSelectedPeriod(0); // Reset to first period when date changes
          setIsCalendarModalVisible(false);
        }
      }}
      disabled={!item.hasAttendance || !item.isCurrentMonth}
    >
      <Text style={[
        styles.calendarDateText,
        item.isSelected && styles.calendarDateTextSelected,
        (!item.hasAttendance || !item.isCurrentMonth) && styles.calendarDateTextNoData
      ]}>
        {item.day}
      </Text>
      {item.isCurrentMonth && item.hasAttendance && (
        <View style={styles.attendanceDot} />
      )}
    </TouchableOpacity>
  );

  const renderPeriodItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={[
        styles.periodItem,
        selectedPeriod === index && styles.periodItemSelected
      ]}
      onPress={() => {
        setSelectedPeriod(index);
        setIsPeriodModalVisible(false);
      }}
    >
      <View style={styles.periodInfo}>
        <Text style={styles.periodTitle}>Period {item.period}</Text>
        <Text style={styles.periodTime}>{item.time}</Text>
        <Text style={styles.periodTopic}>{item.topic}</Text>
      </View>
      <View style={styles.periodStats}>
        <Text style={styles.periodAttendance}>{item.present}/{item.total}</Text>
        <Text style={styles.periodPercentage}>
          {Math.round((item.present / item.total) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Navigation between months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <View style={styles.container}>
      {/* Class Header */}
      <View style={styles.classHeader}>
        <View>
          <Text style={styles.subjectCode}>{classData.subjectCode}</Text>
          <Text style={styles.section}>{classData.section}</Text>
          <Text style={styles.subjectName}>{classData.subjectName}</Text>
        </View>
        <View style={styles.attendanceOverview}>
          <Text style={styles.attendancePercent}>{classData.attendancePercentage}%</Text>
          <Text style={styles.attendanceLabel}>Overall Attendance</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Period Picker */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.datePicker}
            onPress={() => setIsCalendarModalVisible(true)}
          >
            <Icon name="calendar-today" size={20} color="#600202" />
            <Text style={styles.dateText}>{selectedDate}</Text>
            <Icon name="arrow-drop-down" size={20} color="#600202" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.periodPicker}
            onPress={() => currentDatePeriods.length > 0 && setIsPeriodModalVisible(true)}
            disabled={currentDatePeriods.length === 0}
          >
            <Icon name="access-time" size={20} color="#600202" />
            <Text style={styles.periodText}>
              {currentPeriod ? `Period ${currentPeriod.period}` : 'No Periods'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#600202" />
          </TouchableOpacity>
        </View>

        {/* Report Button */}
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => navigation.navigate('AttendanceReport', { classData })}
        >
          <Icon name="bar-chart" size={20} color="#FFF" />
          <Text style={styles.reportButtonText}>Generate Report</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#600202" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#600202" />
            </TouchableOpacity>
          )}
        </View>

        {/* Period Details */}
        {currentPeriod ? (
          <>
            <View style={styles.periodDetails}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodDetailTitle}>Period {currentPeriod.period}</Text>
                <Text style={styles.periodDetailTime}>{currentPeriod.time}</Text>
              </View>
              <Text style={styles.topicLabel}>Topic Discussed</Text>
              <Text style={styles.topicText}>{currentPeriod.topic}</Text>
            </View>

            {/* Attendance Stats */}
            <View style={styles.attendanceStats}>
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#28a745' }]}>
                  <Icon name="check" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.present}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#dc3545' }]}>
                  <Icon name="close" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.absent}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#600202' }]}>
                  <Icon name="people" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            {/* Students List */}
            <Text style={styles.sectionTitle}>
              Students Attendance ({filteredStudents.length})
              {searchQuery && (
                <Text style={styles.searchResultText}> • Search results</Text>
              )}
            </Text>
            
            {filteredStudents.length > 0 ? (
              <FlatList
                data={filteredStudents}
                renderItem={renderStudentItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                style={styles.studentsList}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="search-off" size={48} color="#ccc" />
                <Text style={styles.noDataText}>
                  {searchQuery ? 'No students found' : 'No students data available'}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="event-busy" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No attendance data available</Text>
            <Text style={styles.noDataSubText}>
              {currentDatePeriods.length === 0 
                ? `No periods found for ${selectedDate}`
                : 'Select a period to view attendance'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Attendance Modal */}
      <Modal
        visible={!!editingStudent}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Attendance</Text>
              <TouchableOpacity onPress={() => setEditingStudent(null)}>
                <Icon name="close" size={24} color="#600202" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.editModalText}>
              Change attendance status for student?
            </Text>
            
            <View style={styles.editModalActions}>
              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={() => setEditingStudent(null)}
              >
                <Text style={styles.cancelEditButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={editingStudent?.currentStatus === 'present' ? styles.confirmEditButtonAbsent : styles.confirmEditButtonPresent}
                onPress={() => editingStudent && toggleStudentStatus(editingStudent.id)}
              >
                <Icon 
                  name={editingStudent?.currentStatus === 'present' ? 'close' : 'check'} 
                  size={16} 
                  color="#FFF" 
                />
                <Text style={styles.confirmEditButtonText}>
                  {editingStudent?.currentStatus === 'present' ? 'Absent' : 'Present'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsCalendarModalVisible(false)}>
                <Icon name="close" size={24} color="#600202" />
              </TouchableOpacity>
            </View>
            
            {/* Month Navigation */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => navigateMonth('prev')}
              >
                <Icon name="chevron-left" size={24} color="#600202" />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => navigateMonth('next')}
              >
                <Icon name="chevron-right" size={24} color="#600202" />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.dayHeaderText}>{day}</Text>
              ))}
            </View>

            <FlatList
              data={calendarDates}
              renderItem={renderCalendarDate}
              keyExtractor={item => item.date}
              numColumns={7}
              contentContainerStyle={styles.calendarGrid}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Attendance taken</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ccc' }]} />
                <Text style={styles.legendText}>No data</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsCalendarModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Period Selection Modal */}
      <Modal
        visible={isPeriodModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Period - {selectedDate}</Text>
              <TouchableOpacity onPress={() => setIsPeriodModalVisible(false)}>
                <Icon name="close" size={24} color="#600202" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {currentDatePeriods.length} period(s) available
            </Text>

            <FlatList
              data={currentDatePeriods}
              renderItem={renderPeriodItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.periodsList}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsPeriodModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  classHeader: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#600202',
  },
  section: {
    fontSize: 16,
    color: '#600202',
    marginTop: 4,
  },
  subjectName: {
    fontSize: 14,
    color: '#600202',
    opacity: 0.9,
    marginTop: 2,
  },
  attendanceOverview: {
    alignItems: 'center',
  },
  attendancePercent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#600202',
  },
  attendanceLabel: {
    fontSize: 12,
    color: '#600202',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  periodPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#600202',
    marginHorizontal: 8,
    flex: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#600202',
    marginHorizontal: 8,
    flex: 1,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#600202',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reportButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#600202',
  },
  periodDetails: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
  },
  periodDetailTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  topicLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 16,
    color: '#333',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 12,
  },
  searchResultText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'normal',
  },
  studentsList: {
    marginBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
  },
  studentName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  studentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#600202',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  editModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  editModalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelEditButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  confirmEditButtonPresent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#28a745',
    gap: 8,
  },
  confirmEditButtonAbsent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    gap: 8,
  },
  cancelEditButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  confirmEditButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#600202',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    padding: 8,
  },
  calendarDate: {
    alignItems: 'center',
    padding: 8,
    margin: 2,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    width: 40,
    height: 50,
    justifyContent: 'center',
  },
  calendarDateSelected: {
    backgroundColor: '#600202',
  },
  calendarDateNoData: {
    backgroundColor: '#f0f0f0',
  },
  calendarDateOtherMonth: {
    backgroundColor: '#f8f8f8',
    opacity: 0.5,
  },
  calendarDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
  },
  calendarDateTextSelected: {
    color: '#FFF',
  },
  calendarDateTextNoData: {
    color: '#999',
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#28a745',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  modalFooter: {
    marginTop: 20,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  // New styles for period selection
  periodsList: {
    maxHeight: 400,
  },
  periodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodItemSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#28a745',
  },
  periodInfo: {
    flex: 1,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 4,
  },
  periodTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  periodTopic: {
    fontSize: 12,
    color: '#999',
  },
  periodStats: {
    alignItems: 'flex-end',
  },
  periodAttendance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 2,
  },
  periodPercentage: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default ClassDetailsScreen;