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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AttendanceData, AttendanceSession, StudentAttendance } from 'src/services/Interfaces';

type RootStackParamList = {
  ClassDetails: { classData: any };
  AttendanceReport: { classData: any };
};

type ClassDetailsRouteProp = RouteProp<RootStackParamList, 'ClassDetails'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'http://10.182.66.80:5000';

const ClassDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ClassDetailsRouteProp>();
  const { classData } = route.params;
  
  const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingStudent, setEditingStudent] = useState<{id: string, currentStatus: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState<Set<number>>(new Set());

    // Derived data
  const currentDatePeriods = selectedDate ? attendanceData[selectedDate] || [] : [];
  const currentPeriod = currentDatePeriods[selectedPeriod];

    // Dummy data
const dummyAttendanceData: AttendanceData = {
  '18/09/2025': [
    {
      session_id: 1,
      date: '18/09/2025',
      start_time: '08:30',
      end_time: '09:30',
      topic: 'Introduction to Operating Systems',
      venue: 'Lab-101',
      status: true,
      present_count: 45,
      absent_count: 5,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: true },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: true },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: true },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: true },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: false },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: false },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: false },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: false },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: false },
      ]
    },
    {
      session_id: 2,
      date: '18/09/2025',
      start_time: '10:00',
      end_time: '11:00',
      topic: 'Process Management and Scheduling',
      venue: 'Lab-101',
      status: true,
      present_count: 48,
      absent_count: 2,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: true },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: true },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: true },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: true },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: true },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: true },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: true },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: false },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: false },
      ]
    }
  ],
  '16/09/2025': [
    {
      session_id: 3,
      date: '16/09/2025',
      start_time: '09:00',
      end_time: '10:00',
      topic: 'Memory Management Techniques',
      venue: 'Lab-102',
      status: true,
      present_count: 47,
      absent_count: 3,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: true },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: true },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: true },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: true },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: false },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: false },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: false },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: true },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: true },
      ]
    }
  ],
  '14/09/2025': [
    {
      session_id: 4,
      date: '14/09/2025',
      start_time: '08:30',
      end_time: '09:30',
      topic: 'File Systems and I/O Management',
      venue: 'Lab-101',
      status: true,
      present_count: 46,
      absent_count: 4,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: true },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: true },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: true },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: true },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: false },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: false },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: false },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: false },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: true },
      ]
    },
    {
      session_id: 5,
      date: '14/09/2025',
      start_time: '11:30',
      end_time: '12:30',
      topic: 'Virtual Memory and Paging',
      venue: 'Lab-102',
      status: true,
      present_count: 44,
      absent_count: 6,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: false },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: false },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: false },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: false },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: false },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: false },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: true },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: true },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: true },
      ]
    }
  ],
  '11/09/2025': [
    {
      session_id: 6,
      date: '11/09/2025',
      start_time: '10:00',
      end_time: '11:00',
      topic: 'Deadlock Detection and Prevention',
      venue: 'Lab-101',
      status: true,
      present_count: 49,
      absent_count: 1,
      total_students: 50,
      students: [
        { student_id: 'R210001', student_name: 'Aarav Sharma', status: true },
        { student_id: 'R210002', student_name: 'Aditi Patel', status: true },
        { student_id: 'R210003', student_name: 'Amit Kumar', status: true },
        { student_id: 'R210004', student_name: 'Ananya Singh', status: true },
        { student_id: 'R210005', student_name: 'Arjun Reddy', status: true },
        { student_id: 'R210006', student_name: 'Bhavya Gupta', status: true },
        { student_id: 'R210007', student_name: 'Chetan Mehta', status: true },
        { student_id: 'R210008', student_name: 'Deepika Joshi', status: true },
        { student_id: 'R210009', student_name: 'Divya Nair', status: true },
        { student_id: 'R210010', student_name: 'Gaurav Malhotra', status: true },
        { student_id: 'R210011', student_name: 'Ishita Chatterjee', status: true },
        { student_id: 'R210012', student_name: 'Karan Singh', status: true },
        { student_id: 'R210013', student_name: 'Kriti Sharma', status: true },
        { student_id: 'R210014', student_name: 'Manish Kumar', status: true },
        { student_id: 'R210015', student_name: 'Neha Verma', status: true },
        { student_id: 'R210016', student_name: 'Nikhil Agarwal', status: true },
        { student_id: 'R210017', student_name: 'Pooja Reddy', status: true },
        { student_id: 'R210018', student_name: 'Priya Singh', status: true },
        { student_id: 'R210019', student_name: 'Rahul Mehta', status: true },
        { student_id: 'R210020', student_name: 'Riya Patel', status: true },
        { student_id: 'R210021', student_name: 'Rohan Kumar', status: true },
        { student_id: 'R210022', student_name: 'Sanya Gupta', status: true },
        { student_id: 'R210023', student_name: 'Shreya Nair', status: true },
        { student_id: 'R210024', student_name: 'Siddharth Joshi', status: true },
        { student_id: 'R210025', student_name: 'Simran Kaur', status: true },
        { student_id: 'R210026', student_name: 'Sneha Sharma', status: true },
        { student_id: 'R210027', student_name: 'Sohan Malhotra', status: true },
        { student_id: 'R210028', student_name: 'Tanvi Reddy', status: true },
        { student_id: 'R210029', student_name: 'Uday Singh', status: true },
        { student_id: 'R210030', student_name: 'Varun Kumar', status: true },
        { student_id: 'R210031', student_name: 'Vikas Agarwal', status: true },
        { student_id: 'R210032', student_name: 'Vishal Mehta', status: true },
        { student_id: 'R210033', student_name: 'Yash Patel', status: true },
        { student_id: 'R210034', student_name: 'Yuvika Singh', status: true },
        { student_id: 'R210035', student_name: 'Zoya Khan', status: true },
        { student_id: 'R210036', student_name: 'Abhishek Sharma', status: true },
        { student_id: 'R210037', student_name: 'Anjali Gupta', status: true },
        { student_id: 'R210038', student_name: 'Bhaskar Nair', status: true },
        { student_id: 'R210039', student_name: 'Chandan Kumar', status: true },
        { student_id: 'R210040', student_name: 'Dipika Joshi', status: true },
        { student_id: 'R210041', student_name: 'Esha Reddy', status: true },
        { student_id: 'R210042', student_name: 'Farhan Khan', status: true },
        { student_id: 'R210043', student_name: 'Gauri Singh', status: true },
        { student_id: 'R210044', student_name: 'Harsh Mehta', status: true },
        { student_id: 'R210045', student_name: 'Ishan Patel', status: true },
        { student_id: 'R210046', student_name: 'Jhanvi Sharma', status: true },
        { student_id: 'R210047', student_name: 'Kavya Gupta', status: true },
        { student_id: 'R210048', student_name: 'Lakshya Nair', status: true },
        { student_id: 'R210049', student_name: 'Mohan Kumar', status: true },
        { student_id: 'R210050', student_name: 'Nandini Joshi', status: false },
      ]
    }
  ]
};
  
  const filteredStudents = currentPeriod?.students?.filter(student => 
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Main fetch function
  const fetchAttendanceSummary = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/class-attendance/${classData.id}?page=${page}&limit=10&include_students=false`
      );

      const data = await response.json();
      
      if (data.success) {
        if (page === 1 || isRefresh) {
          setAttendanceData(data.attendanceData);
        } else {
          setAttendanceData(prev => ({
            ...prev,
            ...data.attendanceData
          }));
        }
        
        setHasMore(data.pagination.has_more);
        setCurrentPage(page);
        
        const dates = Object.keys(data.attendanceData);
        if ((page === 1 || isRefresh) && dates.length > 0) {
          setSelectedDate(dates[0]);
          setSelectedPeriod(0);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Only pull-to-refresh handler
  const onRefresh = () => {
    if (!isRefreshing) {
      fetchAttendanceSummary(1, true);
    }
  };

  // Load student details
  const loadStudentDetails = async (sessionId: number) => {
    if (loadingStudents.has(sessionId)) return;
    
    setLoadingStudents(prev => new Set(prev).add(sessionId));
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance/session/${sessionId}/students`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(date => {
            updated[date] = updated[date].map(session => 
              session.session_id === sessionId 
                ? { ...session, students: data.students }
                : session
            );
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error loading student details:', error);
    } finally {
      setLoadingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  // Load more sessions
  const loadMoreSessions = () => {
    if (hasMore && !isLoading && !isRefreshing) {
      fetchAttendanceSummary(currentPage + 1, false);
    }
  };

  // Auto-load student details when period is selected
  useEffect(() => {
    if (currentPeriod && (!currentPeriod.students || currentPeriod.students.length === 0)) {
      loadStudentDetails(currentPeriod.session_id);
    }
  }, [currentPeriod]);

  // Initial load
  useEffect(() => {
    fetchAttendanceSummary(1, false);
  }, [classData.id]);

  // Update student attendance status
  const updateStudentAttendance = async (sessionId: number, studentId: string, newStatus: boolean) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/faculty/update-attendance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            student_id: studentId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setAttendanceData(prev => {
          const updatedData = { ...prev };
          Object.keys(updatedData).forEach(date => {
            updatedData[date] = updatedData[date].map(session => {
              if (session.session_id === sessionId) {
                const updatedStudents = session.students.map(student => 
                  student.student_id === studentId 
                    ? { ...student, status: newStatus }
                    : student
                );
                
                const present_count = updatedStudents.filter(s => s.status).length;
                const absent_count = updatedStudents.filter(s => !s.status).length;
                
                return {
                  ...session,
                  students: updatedStudents,
                  present_count,
                  absent_count
                };
              }
              return session;
            });
          });
          return updatedData;
        });
        
        Alert.alert('Success', 'Attendance status updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update attendance');
      }
      
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance. Please try again.');
    }
  };

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
      const dateString = formatDate(date);
      const hasAttendance = attendanceData[dateString];
      
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
      const dateString = formatDate(date);
      const hasAttendance = attendanceData[dateString];
      
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

  // Format date to match backend format (DD/MM/YYYY)
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calendarDates = generateCalendarDates();

  // Toggle student attendance status
  const toggleStudentStatus = (studentId: string, currentStatus: boolean) => {
    if (!currentPeriod) return;
    
    const newStatus = !currentStatus;
    updateStudentAttendance(currentPeriod.session_id, studentId, newStatus);
    setEditingStudent(null);
  };

  const renderStudentItem = ({ item }: { item: StudentAttendance }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentId}>{item.student_id}</Text>
        <Text style={styles.studentName}>{item.student_name}</Text>
      </View>
      
      <View style={styles.studentActions}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status ? '#28a745' : '#dc3545' }
        ]}>
          <Icon 
            name={item.status ? 'check' : 'close'} 
            size={14} 
            color="#FFF" 
          />
          <Text style={styles.statusText}>
            {item.status ? 'Present' : 'Absent'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setEditingStudent({ id: item.student_id, currentStatus: item.status })}
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
          setSelectedPeriod(0);
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

  const renderPeriodItem = ({ item, index }: { item: AttendanceSession, index: number }) => (
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
        <Text style={styles.periodTime}>{item.start_time} - {item.end_time}</Text>
        <Text style={styles.periodTopic}>{item.topic || 'No topic specified'}</Text>
        <Text style={styles.periodVenue}>Venue: {item.venue || 'Not specified'}</Text>
      </View>
      <View style={styles.periodStats}>
        <Text style={styles.periodAttendance}>{item.present_count}/{item.total_students}</Text>
        <Text style={styles.periodPercentage}>
          {Math.round((item.present_count / item.total_students) * 100)}%
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#600202" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Class Header */}
      <View style={styles.classHeader}>
        <View>
          <Text style={styles.subjectCode}>{classData.subjectCode}</Text>
          <Text style={styles.section}>{classData.year} {classData.department} - {classData.section}</Text>
          <Text style={styles.subjectName}>{classData.subjectName}</Text>
        </View>
        <View style={styles.attendanceOverview}>
          <Text style={styles.attendancePercent}>{classData.attendancePercentage}%</Text>
          <Text style={styles.attendanceLabel}>Overall Attendance</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#600202']}
            tintColor={'#600202'}
          />
        }
      >
        {/* Date and Period Picker */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.datePicker}
            onPress={() => setIsCalendarModalVisible(true)}
          >
            <Icon name="calendar-today" size={20} color="#600202" />
            <Text style={styles.dateText}>
              {selectedDate || 'Select Date'}
            </Text>
            <Icon name="arrow-drop-down" size={20} color="#600202" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.periodPicker}
            onPress={() => currentDatePeriods.length > 0 && setIsPeriodModalVisible(true)}
            disabled={currentDatePeriods.length === 0}
          >
            <Icon name="access-time" size={20} color="#600202" />
            <Text style={styles.periodText}>
              {currentPeriod ? `${currentPeriod.start_time} - ${currentPeriod.end_time}` : 'No Sessions'}
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

        {selectedDate && currentPeriod ? (
          <>
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
            <View style={styles.periodDetails}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodDetailTitle}>{currentPeriod.start_time} - {currentPeriod.end_time}</Text>
              </View>
              <Text style={styles.topicLabel}>Topic Discussed</Text>
              <Text style={styles.topicText}>{currentPeriod.topic || 'No topic specified'}</Text>
              <Text style={styles.venueLabel}>Venue</Text>
              <Text style={styles.venueText}>{currentPeriod.venue || 'Not specified'}</Text>
            </View>

            {/* Attendance Stats */}
            <View style={styles.attendanceStats}>
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#28a745' }]}>
                  <Icon name="check" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.present_count}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#dc3545' }]}>
                  <Icon name="close" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.absent_count}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: '#600202' }]}>
                  <Icon name="people" size={16} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{currentPeriod.total_students}</Text>
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
                keyExtractor={item => item.student_id}
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
              {Object.keys(attendanceData).length === 0 
                ? 'No attendance records found for this class'
                : 'Select a date to view attendance sessions'
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
                style={editingStudent?.currentStatus ? styles.confirmEditButtonAbsent : styles.confirmEditButtonPresent}
                onPress={() => editingStudent && toggleStudentStatus(editingStudent.id, editingStudent.currentStatus)}
              >
                <Icon 
                  name={editingStudent?.currentStatus ? 'close' : 'check'} 
                  size={16} 
                  color="#FFF" 
                />
                <Text style={styles.confirmEditButtonText}>
                  {editingStudent?.currentStatus ? 'Mark Absent' : 'Mark Present'}
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
              <Text style={styles.modalTitle}>Select Session - {selectedDate}</Text>
              <TouchableOpacity onPress={() => setIsPeriodModalVisible(false)}>
                <Icon name="close" size={24} color="#600202" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {currentDatePeriods.length} session(s) available
            </Text>

            <FlatList
              data={currentDatePeriods}
              renderItem={renderPeriodItem}
              keyExtractor={(item) => item.session_id.toString()}
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

// Add these new styles to your existing styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#600202',
  },
  venueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
    marginTop: 12,
    marginBottom: 4,
  },
  venueText: {
    fontSize: 16,
    color: '#333',
  },
  // ... keep all your existing styles from the previous code
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
  periodVenue: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
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