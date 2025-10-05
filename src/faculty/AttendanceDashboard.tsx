// src/faculty/screens/AttendanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ClassAssignment } from 'src/services/Interfaces';

type RootStackParamList = {
  ClassDetails: { classData: any };
  AttendanceReport: { classData: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'http://10.182.66.80:5000';

// Define props interface for the component
interface AttendanceDashboardProps {
  userEmail: string;
  user: {
    name: string;
    email: string;
  } | null;
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ 
  userEmail, 
  user, 
  setIsLoggedIn, 
  setUser 
})  => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassAssignment[]>([]);


  console.log(userEmail,user)
  const facultyId = "F005";
  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`${API_BASE_URL}/faculty/dashboard/${facultyId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming the API returns an array of classes
      setClasses(data.classes || data || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Show error message to user
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      
      // Fallback to sample data if API fails
      const sampleClasses: ClassAssignment[] = [
        {
          id: '1',
          subjectCode: 'OS2025',
          subjectName: 'Operating Systems',
          section: 'D',
          totalClasses: 20,
          attendancePercentage: 80,
          lastClass: '18/09/2025',
          department: 'CSE',
          year: 'E3'
        },
        {
          id: '2',
          subjectCode: 'OSLAB2025',
          subjectName: 'Operating Systems Lab',
          section: 'D',
          totalClasses: 20,
          attendancePercentage: 85,
          lastClass: '20/09/2025',
          department: 'CSE',
          year: 'E3'
        },
      ];
      setClasses(sampleClasses);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Pull to refresh function
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);


  const renderClassCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => navigation.navigate('ClassDetails', { classData: item })}
    >
      <View style={styles.classHeader}>
        <View>
          <Text style={styles.section}>{item.year} {item.department} (Section - {item.section})</Text>
          <Text style={styles.subjectCode}>{item.subjectCode} - {item.subjectName}</Text>
        </View>
        <View style={[
          styles.attendanceBadge,
          { backgroundColor: item.attendancePercentage >= 75 ? '#28a745' : '#ffc107' }
        ]}>
          <Text style={styles.attendancePercent}>{item.attendancePercentage}%</Text>
        </View>
      </View>
      
      <View style={styles.classStats}>
        <View style={styles.statItem}>
          <Icon name="class" size={16} color="#600202" />
          <Text style={styles.statText}>Total: {item.totalClasses}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="calendar-today" size={16} color="#600202" />
          <Text style={styles.statText}>Last: {item.lastClass}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AttendanceReport', { classData: item })}
        >
          <Icon name="bar-chart" size={18} color="#600202" />
          <Text style={styles.actionButtonText}>Report</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item }: { item: any }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityClass}>{item.class}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      <Text style={styles.activityTopic}>Topic: {item.topic}</Text>
      <View style={styles.activityStats}>
        <Icon name="people" size={14} color="#600202" />
        <Text style={styles.attendedText}>Students Attended: {item.attended}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#600202" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Attendance Management System</Text>
      </View>
      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Icon name="class" size={24} color="#600202" />
          <Text style={styles.statNumber}>{classes.length}</Text>
          <Text style={styles.statLabel}>Active Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="people" size={24} color="#600202" />
          <Text style={styles.statNumber}>67</Text>
          <Text style={styles.statLabel}>Avg. Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="trending-up" size={24} color="#600202" />
          <Text style={styles.statNumber}>80%</Text>
          <Text style={styles.statLabel}>Overall Avg.</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Classes Section */}
        <Text style={styles.sectionTitle}>Your Classes</Text>
        <FlatList
          data={classes}
          renderItem={renderClassCard}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#600202',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -30,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#600202',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 12,
    marginTop: 8,
  },
  classCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
  },
  subjectCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  subjectName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  attendancePercent: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  classStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#600202',
    marginLeft: 4,
    fontWeight: '500',
  },
  activityItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityClass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityTopic: {
    fontSize: 13,
    color: '#333',
    marginBottom: 8,
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendedText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#600202',
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default AttendanceDashboard;