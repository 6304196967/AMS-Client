// src/faculty/screens/AttendanceReportScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  AttendanceReport: { classData: any };
};

type AttendanceReportRouteProp = RouteProp<RootStackParamList, 'AttendanceReport'>;

const AttendanceReportScreen = () => {
  const route = useRoute<AttendanceReportRouteProp>();
  const { classData } = route.params;

  const reportData = {
    totalClasses: 20,
    present: 16,
    absent: 4,
    percentage: 80,
    trend: 'improving',
    students: [
      { id: 'R210001', name: 'John Doe', present: 18, percentage: 90 },
      { id: 'R210002', name: 'Jane Smith', present: 17, percentage: 85 },
      { id: 'R210003', name: 'Mike Johnson', present: 15, percentage: 75 },
      { id: 'R210004', name: 'Sarah Wilson', present: 19, percentage: 95 },
      { id: 'R210005', name: 'David Brown', present: 14, percentage: 70 },
    ]
  };

  const renderStudentRow = (student: any) => (
    <View key={student.id} style={styles.studentRow}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentId}>{student.id}</Text>
        <Text style={styles.studentName}>{student.name}</Text>
      </View>
      <View style={styles.attendanceInfo}>
        <Text style={styles.attendanceCount}>{student.present}/{reportData.totalClasses}</Text>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{student.percentage}%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subjectCode}>{classData.subjectCode}</Text>
          <Text style={styles.section}>{classData.section}</Text>
          <Text style={styles.reportTitle}>Attendance Report</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Icon name="class" size={24} color="#600202" />
            <Text style={styles.summaryNumber}>{reportData.totalClasses}</Text>
            <Text style={styles.summaryLabel}>Total Classes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="check-circle" size={24} color="#28a745" />
            <Text style={styles.summaryNumber}>{reportData.present}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="cancel" size={24} color="#dc3545" />
            <Text style={styles.summaryNumber}>{reportData.absent}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
        </View>

        {/* Overall Attendance */}
        <View style={styles.overallSection}>
          <Text style={styles.sectionTitle}>Overall Attendance</Text>
          <View style={styles.overallCard}>
            <Text style={styles.overallPercentage}>{reportData.percentage}%</Text>
            <View style={styles.trendIndicator}>
              <Icon 
                name={reportData.trend === 'improving' ? 'trending-up' : 'trending-down'} 
                size={20} 
                color={reportData.trend === 'improving' ? '#28a745' : '#dc3545'} 
              />
              <Text style={[
                styles.trendText,
                { color: reportData.trend === 'improving' ? '#28a745' : '#dc3545' }
              ]}>
                {reportData.trend === 'improving' ? 'Improving' : 'Declining'}
              </Text>
            </View>
          </View>
        </View>

        {/* Student-wise Breakdown */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Student-wise Breakdown</Text>
          <View style={styles.studentsList}>
            {reportData.students.map(renderStudentRow)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.exportButton}>
            <Icon name="download" size={20} color="#FFF" />
            <Text style={styles.exportButtonText}>Export as PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share" size={20} color="#600202" />
            <Text style={styles.shareButtonText}>Share Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#600202',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  subjectCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 4,
  },
  reportTitle: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 8,
    opacity: 0.9,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  overallSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 12,
  },
  overallCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  overallPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: 8,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  studentsSection: {
    marginBottom: 20,
  },
  studentsList: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  attendanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  percentageBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#600202',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#600202',
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#600202',
  },
  exportButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButtonText: {
    color: '#600202',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AttendanceReportScreen;