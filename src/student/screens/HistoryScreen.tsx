import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from "react-native-linear-gradient";

// Configuration
const API_BASE_URL = 'http://10.182.66.80:5000';

// Type definitions
interface AttendanceItem {
  subject: string;
  status: true | false;
  time: string;
}

interface AttendanceHistory {
  [date: string]: AttendanceItem[];
}

// Custom Hook for date-specific attendance data
const useAttendanceHistory = (userEmail: string, selectedDate: string) => {
  const [data, setData] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(false);
      
      const response = await fetch(`${API_BASE_URL}/student/history/${userEmail.replace('@rguktrkv.ac.in','').toUpperCase()}?date=${selectedDate}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (!result.success) {
        Alert.alert("Error", result.message || "Failed to fetch data");
        setError(true);
        return;
      }

      const dateData = result.history || [];

      setData(dateData);

    } catch (err) {
      console.error("Backend fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [userEmail, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, initialLoading, error, refetch: fetchData };
};

// Sub-components
const LoadingView = () => (
  <LinearGradient
    colors={["#900a02", "#600202"]}
    style={styles.loadingContainer}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <ActivityIndicator size="large" color="#ffffff" />
    <Text style={styles.loadingText}>Loading attendance data...</Text>
  </LinearGradient>
);

interface ErrorViewProps {
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ onRetry }) => (
  <LinearGradient
    colors={["#900a02", "#600202"]}
    style={styles.errorContainer}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Icon name="warning-outline" size={48} color="#ffffff" />
    <Text style={styles.errorText}>
      Unable to fetch attendance data
    </Text>
    <Text style={styles.errorSubText}>
      Please check your connection and try again
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </LinearGradient>
);

// Props interface
interface HistoryScreenProps {
  user: { name: string; email: string };
}

// Format date to display
const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatAPIDate = (date: Date) => date.toISOString().split("T")[0];

const HistoryScreen: React.FC<HistoryScreenProps> = ({ user }) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const selectedDate = formatAPIDate(date);
  const displayDate = formatDisplayDate(date);
  
  const { data: dataForDate, loading, initialLoading, error, refetch } = useAttendanceHistory(user.email, selectedDate);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(true); // Pass true to indicate this is a refresh
    setRefreshing(false);
  }, [refetch]);

  // Handle date change and refetch data
  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  // Stats calculation
  const presentCount = dataForDate.filter(item => item.status).length;
  const absentCount = dataForDate.filter(item => !item.status).length;
  const totalClasses = dataForDate.length;

  const getStatusColor = (status: boolean) => {
    switch (status) {
      case true: return "#10b981";
      case false: return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status: boolean) => {
    switch (status) {
      case true: return "check-circle";
      case false: return "close-circle";
      default: return "check-circle";
    }
  };

  // Only show full-screen loader on initial load
  if (initialLoading) return <LoadingView />;
  if (error) return <ErrorView onRetry={refetch} />;

  return (
    <LinearGradient
      colors={["#900a02", "#600202"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name} 👋</Text>
          <Text style={styles.subtitle}>Your Attendance History</Text>
        </View>
      </View>

      {/* Date Selector */}
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowPicker(true)}
      >
        <Icon name="calendar-outline" size={20} color="#6366f1" />
        <Text style={styles.dateSelectorText}>{displayDate}</Text>
        <Icon name="chevron-down" size={16} color="#9ca3af" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          themeVariant="light"
          onChange={handleDateChange}
        />
      )}

      {/* Stats Cards */}
      {!loading && dataForDate.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#f0f9ff' }]}>
            <Icon name="book-outline" size={20} color="#0369a1" />
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#0369a1' }]}>{totalClasses}</Text>
              <Text style={[styles.statLabel, { color: '#0369a1' }]}>Total</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <Icon name="check-circle-outline" size={20} color="#15803d" />
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#15803d' }]}>{presentCount}</Text>
              <Text style={[styles.statLabel, { color: '#15803d' }]}>Present</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
            <Icon name="close-circle-outline" size={20} color="#dc2626" />
            <View style={styles.statContent}>
              <Text style={[styles.statNumber, { color: '#dc2626' }]}>{absentCount}</Text>
              <Text style={[styles.statLabel, { color: '#dc2626' }]}>Absent</Text>
            </View>
          </View>
        </View>
      )}

      {/* Date Loading Indicator */}
      {loading && (
        <View style={styles.dateLoadingContainer}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.dateLoadingText}>Loading attendance for {displayDate.split(',')[0]}...</Text>
        </View>
      )}

      {/* Attendance List */}
      <View style={styles.listContainer}>
        {!loading && (
          <Text style={styles.sectionTitle}>
            {dataForDate.length > 0 ? `Classes on ${displayDate.split(',')[0]}` : 'No Classes'}
          </Text>
        )}

        {!loading && dataForDate.length > 0 ? (
          <FlatList
            data={dataForDate}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.subject}-${index}`}
            renderItem={({ item }: { item: AttendanceItem }) => (
              <View style={styles.classCard}>
                <View style={styles.classInfo}>
                  <View style={styles.subjectRow}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={styles.subject}>{item.subject}</Text>
                  </View>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                    <Icon 
                      name={getStatusIcon(item.status)} 
                      size={16} 
                      color={getStatusColor(item.status)} 
                    />
                    <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                      {item.status ? 'Present' : 'Absent'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#900a02"
                colors={["#900a02"]}
              />
            }
          />
        ) : !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="calendar-check-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyStateTitle}>No classes scheduled</Text>
            <Text style={styles.emptyStateText}>
              There are no attendance records for this date.{'\n'}Try selecting a different date.
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statContent: {
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  classCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  classInfo: {
    flex: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  subject: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  time: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#999b9fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#999b9fff',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  dateLoadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default HistoryScreen;