// src/faculty/screens/AttendanceReportScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../utils/responsive';

type RootStackParamList = {
  AttendanceReport: { classData: any };
};

type AttendanceReportRouteProp = RouteProp<RootStackParamList, 'AttendanceReport'>;

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

// Interface for report data
interface StudentReport {
  student_id: string;
  student_name: string;
  present_count: number;
  absent_count: number;
  total_sessions: number;
  attendance_percentage: number;
}

interface ReportData {
  class_summary: {
    total_sessions: number;
    overall_percentage: number;
    trend: 'improving' | 'stable' | 'declining';
    avg_students_present: number;
    avg_students_absent: number;
  };
  students: StudentReport[];
}

const AttendanceReportScreen = () => {
  const route = useRoute<AttendanceReportRouteProp>();
  const { classData } = route.params;

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<StudentReport[]>([]);

  // Fetch report data from backend
  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/faculty/attendance-report/${classData.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reportData);
        setFilteredStudents(data.reportData.students);
      } else {
        throw new Error(data.message || 'Failed to fetch report data');
      }
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      Alert.alert('Error', 'Failed to load attendance report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students based on search query
  useEffect(() => {
    if (reportData && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const filtered = reportData.students.filter(student =>
        student.student_id.toLowerCase().includes(query) ||
        student.student_name.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    } else if (reportData) {
      setFilteredStudents(reportData.students);
    }
  }, [searchQuery, reportData]);

  // Generate CSV content for Excel export
  const generateCSVContent = (): string => {
    if (!reportData) return '';

    const headers = [
      'Student ID',
      'Student Name',
      'Present Classes',
      'Absent Classes',
      'Total Classes',
      'Attendance Percentage'
    ].join(',');

    const studentRows = reportData.students.map(student => 
      [
        student.student_id,
        `"${student.student_name.replace(/"/g, '""')}"`,
        student.present_count.toString(),
        student.absent_count.toString(),
        student.total_sessions.toString(),
        `${student.attendance_percentage}%`
      ].join(',')
    );

    // Add summary section
    const summaryRows = [
      '',
      'SUMMARY',
      `"Total Classes",${reportData.class_summary.total_sessions}`,
      `"Average Present",${reportData.class_summary.avg_students_present}`,
      `"Average Absent",${reportData.class_summary.avg_students_absent}`,
      `"Overall Attendance",${reportData.class_summary.overall_percentage}%`,
      `"Trend",${reportData.class_summary.trend}`,
      `"Subject Code",${classData.subjectCode}`,
      `"Section",${classData.section}`,
      `"Year",${classData.year}`,
      `"Department",${classData.department}`,
      `"Report Generated",${new Date().toLocaleDateString()}`,
    ];

    return [headers, ...studentRows, ...summaryRows].join('\n');
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);

      if (!reportData) {
        Alert.alert('Error', 'No data available to export');
        return;
      }

      const csvContent = generateCSVContent();
      const fileName = `Attendance_Report_${classData.subjectCode}_${classData.section}.csv`;

      // 👇 File path for Android Downloads folder
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Write CSV content to file
      await RNFS.writeFile(path, csvContent, 'utf8');

      Alert.alert(
        'Export Successful',
        `File has been saved to Downloads folder.\n\n${fileName}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Export Failed', 'Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Share report summary via native share
  const shareReport = async () => {
    try {
      if (!reportData) {
        Alert.alert('Error', 'No data available to share');
        return;
      }

      // Find top performers
      const topPerformers = reportData.students
        .filter(s => s.attendance_percentage >= 90)
        .slice(0, 3)
        .map(s => `• ${s.student_name} - ${s.attendance_percentage}%`)
        .join('\n');

      // Find students with low attendance
      const lowAttendance = reportData.students
        .filter(s => s.attendance_percentage < 75)
        .slice(0, 3)
        .map(s => `• ${s.student_name} - ${s.attendance_percentage}%`)
        .join('\n');

      const shareMessage = `
📊 Attendance Report - ${classData.subjectCode} (${classData.section})

📅 Total Classes: ${reportData.class_summary.total_sessions}
✅ Average Present: ${reportData.class_summary.avg_students_present}
❌ Average Absent: ${reportData.class_summary.avg_students_absent}
📈 Overall Attendance: ${reportData.class_summary.overall_percentage}%
📊 Trend: ${reportData.class_summary.trend}

${topPerformers ? `🏆 Top Performers:\n${topPerformers}` : ''}

${lowAttendance ? `📉 Needs Improvement:\n${lowAttendance}` : ''}

📝 Total Students: ${reportData.students.length}
📋 Generated on ${new Date().toLocaleDateString()}
      `.trim();

      await Share.share({
        message: shareMessage,
        title: `Attendance Report - ${classData.subjectCode}`,
      });

    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Share Failed', 'Failed to share report. Please try again.');
    }
  };

  // Determine trend icon and color
  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'improving':
        return { icon: 'trending-up', color: '#28a745' };
      case 'declining':
        return { icon: 'trending-down', color: '#dc3545' };
      default:
        return { icon: 'remove', color: '#6c757d' };
    }
  };

  // Render student row
  const renderStudentRow = (student: StudentReport) => {
    const percentageColor = student.attendance_percentage >= 75 ? '#28a745' : 
                           student.attendance_percentage >= 60 ? '#ffc107' : '#dc3545';

    return (
      <View key={student.student_id} style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentId}>{student.student_id}</Text>
          <Text style={styles.studentName}>{student.student_name}</Text>
        </View>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceCount}>
            {student.present_count}/{student.total_sessions}
          </Text>
          <View style={[styles.percentageBadge, { backgroundColor: `${percentageColor}15` }]}>
            <Text style={[styles.percentageText, { color: percentageColor }]}>
              {student.attendance_percentage}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReportData();
  }, [classData.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#600202" />
        <Text style={styles.loadingText}>Generating Attendance Report...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={fontSize(48)} color="#dc3545" />
        <Text style={styles.errorText}>Failed to load report data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReportData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trendInfo = getTrendInfo(reportData.class_summary.trend);

  return (
    <View style={styles.container}>
      {/* Action Buttons at the Top */}
      <View style={styles.topActionButtons}>
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={exportToExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="description" size={fontSize(20)} color="#FFF" />
              <Text style={styles.exportButtonText}>
                Export as CSV
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={shareReport}
        >
          <Icon name="share" size={fontSize(20)} color="#600202" />
          <Text style={styles.shareButtonText}>Share Summary</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subjectCode}>{classData.subjectCode}</Text>
          <Text style={styles.section}>
            {classData.year} {classData.department} - {classData.section}
          </Text>
          <Text style={styles.reportTitle}>Attendance Report</Text>
          <Text style={styles.generatedDate}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Icon name="class" size={fontSize(24)} color="#600202" />
            <Text style={styles.summaryNumber}>{reportData.class_summary.total_sessions}</Text>
            <Text style={styles.summaryLabel}>Total Classes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="check-circle" size={fontSize(24)} color="#28a745" />
            <Text style={styles.summaryNumber}>{reportData.class_summary.avg_students_present}</Text>
            <Text style={styles.summaryLabel}>Avg Present</Text>
          </View>
          <View style={styles.summaryCard}>
            <Icon name="cancel" size={fontSize(24)} color="#dc3545" />
            <Text style={styles.summaryNumber}>{reportData.class_summary.avg_students_absent}</Text>
            <Text style={styles.summaryLabel}>Avg Absent</Text>
          </View>
        </View>

        {/* Overall Attendance */}
        <View style={styles.overallSection}>
          <Text style={styles.sectionTitle}>Overall Attendance</Text>
          <View style={styles.overallCard}>
            <Text style={styles.overallPercentage}>
              {reportData.class_summary.overall_percentage}%
            </Text>
            <View style={styles.trendIndicator}>
              <Icon 
                name={trendInfo.icon} 
                size={fontSize(20)} 
                color={trendInfo.color} 
              />
              <Text style={[styles.trendText, { color: trendInfo.color }]}>
                {reportData.class_summary.trend.charAt(0).toUpperCase() + 
                 reportData.class_summary.trend.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Student-wise Breakdown */}
        <View style={styles.studentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Student-wise Breakdown</Text>
            <Text style={styles.studentCount}>
              {filteredStudents.length} Students
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={fontSize(20)} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Student ID or Name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Icon name="close" size={fontSize(18)} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results Info */}
          {searchQuery.trim() !== '' && (
            <View style={styles.searchResultsInfo}>
              <Text style={styles.searchResultsText}>
                Showing {filteredStudents.length} of {reportData.students.length} students
              </Text>
              {filteredStudents.length === 0 && (
                <Text style={styles.noResultsText}>
                  No students found for "{searchQuery}"
                </Text>
              )}
            </View>
          )}

          <View style={styles.studentsList}>
            {filteredStudents.map(renderStudentRow)}
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoText}>
            📊 Report includes all attendance sessions up to {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.infoText}>
            ⚡ Data is synced with the latest attendance records
          </Text>
          <Text style={styles.infoText}>
            💾 Use "Export as Excel" to download CSV data that can be opened in Excel
          </Text>
          <Text style={styles.infoText}>
            📱 Use "Share Summary" to share key insights via messaging apps
          </Text>
          <Text style={styles.infoText}>
            🔍 Use the search bar to find specific students by ID or name
          </Text>
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
    padding: SPACING.lg,
  },
  // Top Action Buttons
  topActionButtons: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#600202',
    padding: SPACING.md,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: 8,
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: '#600202',
  },
  exportButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  shareButtonText: {
    color: '#600202',
    fontWeight: '600',
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: '#600202',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: '#dc3545',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: spacing(10),
    backgroundColor: '#600202',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#600202',
    padding: SPACING.xl,
    borderRadius: 12,
    marginBottom: SPACING.xl,
  },
  subjectCode: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    fontSize: FONT_SIZES.lg,
    color: '#FFF',
    marginTop: SPACING.xs,
  },
  reportTitle: {
    fontSize: FONT_SIZES.xl,
    color: '#FFF',
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
  generatedDate: {
    fontSize: FONT_SIZES.sm,
    color: '#FFF',
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#600202',
    marginTop: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginTop: SPACING.xs,
  },
  overallSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: SPACING.md,
  },
  overallCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  overallPercentage: {
    fontSize: fontSize(48),
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: SPACING.sm,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  studentsSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentCount: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    fontWeight: '600',
  },
  // Search Bar Styles
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#333',
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  searchResultsInfo: {
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  searchResultsText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontStyle: 'italic',
  },
  noResultsText: {
    fontSize: FONT_SIZES.sm,
    color: '#dc3545',
    fontStyle: 'italic',
    marginTop: spacing(2),
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentInfo: {
    flex: 1,
  },
  studentId: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#600202',
  },
  studentName: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginTop: spacing(2),
  },
  attendanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceCount: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    marginRight: SPACING.md,
  },
  percentageBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  infoFooter: {
    backgroundColor: '#e9ecef',
    padding: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.xl,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginBottom: SPACING.xs,
  },
});

export default AttendanceReportScreen;