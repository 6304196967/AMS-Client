import React, { useEffect, useState } from "react";
import { View, StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl } from 'react-native';
import { Text } from '../../components';
import LinearGradient from "react-native-linear-gradient";
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

type Subject = {
  subject: string;
  total: number;
  attended: number;
};

type AnalyticsScreenProps = {
  user: { name: string; email: string };
};

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Subject[]>([]);
  const [overall, setOverall] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/attendance/${user.email.replace('@rguktrkv.ac.in','').toUpperCase()}`);
      const data = await response.json();

      setAttendanceData(data.subjects || []);
      setOverall(data.overall || 0);

      let total = 0;
      let attended = 0;
      (data.subjects || []).forEach((subj: Subject) => {
        total += subj.total;
        attended += subj.attended;
      });

      setTotalClasses(total);
      setAttendedClasses(attended);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#900a02", "#600202"]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </LinearGradient>
    );
  }

  const getAttendanceColor = (percent: number) => {
    if (percent >= 75) return "#4CAF50";
    if (percent >= 60) return "#FFC107";
    return "#F44336";
  };

  const getAttendanceStatus = (percent: number) => {
    if (percent >= 75) return "Excellent";
    if (percent >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <LinearGradient
      colors={["#900a02", "#600202"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8b0000ff"]}
            tintColor="#FFFFFF"
            title="Pull to refresh"
            titleColor="#FFFFFF"
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Analytics</Text>
          <Text style={styles.subtitle}>Your academic performance overview</Text>
        </View>

        {/* Overall Stats Card */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallTitle}>Overall Performance</Text>
            <View style={[styles.statusBadge, { backgroundColor: getAttendanceColor(overall) + '20' }]}>
              <Text style={[styles.statusText, { color: getAttendanceColor(overall) }]}>
                {getAttendanceStatus(overall)}
              </Text>
            </View>
          </View>
          
          <View style={styles.overallStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{overall}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendedClasses}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalClasses}</Text>
              <Text style={styles.statLabel}>Total Classes</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Card */}
        <View style={styles.quickStatsCard}>
          <Text style={styles.quickStatsTitle}>Quick Stats</Text>
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{attendedClasses}</Text>
              <Text style={styles.quickStatLabel}>Classes Attended</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatNumber}>{totalClasses - attendedClasses}</Text>
              <Text style={styles.quickStatLabel}>Classes Missed</Text>
            </View>
          </View>
        </View>

        {/* Subject-wise Attendance */}
        <View style={styles.subjectsSection}>
          <Text style={styles.sectionTitle}>Subject-wise Breakdown</Text>
          {attendanceData.map((subj: Subject, index) => {
            const percent = subj.total > 0 ? Math.round((subj.attended / subj.total) * 100) : 0;
            return (
              <View key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subj.subject}</Text>
                  <Text style={[styles.subjectPercent, { color: getAttendanceColor(percent) }]}>
                    {percent}%
                  </Text>
                </View>
                <Text style={styles.subjectDetail}>
                  {subj.attended} of {subj.total} classes attended
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${percent}%`,
                        backgroundColor: getAttendanceColor(percent)
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    marginTop: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: spacing(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing(30),
    marginTop: spacing(10),
  },
  title: {
    color: '#FFF',
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    opacity: 0.8,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  overallCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  overallTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#600202',
  },
  quickStatsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#6f0000ff',
    marginBottom: spacing(15),
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: spacing(6),
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#810101ff',
  },
  quickStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing(30),
    marginBottom: spacing(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: spacing(15),
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: fontSize(22),
    fontWeight: 'bold',
    color: '#600202',
    marginBottom: SPACING.xs,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#810101ff',
  },
  subjectsSection: {
    marginBottom: SPACING.xl,
  },
  subjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: spacing(18),
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subjectName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#600202',
    flex: 1,
  },
  subjectPercent: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  subjectDetail: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AnalyticsScreen;