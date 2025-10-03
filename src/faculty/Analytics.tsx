import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text,  
    ScrollView, 
    ActivityIndicator, 
    Alert,
    Dimensions,
    // Add StyleProp and ViewStyle for clearer typing later if needed
    StyleSheet, ViewStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// --- Interfaces for Data Structure ---
interface AssignmentMetric {
    subject: string;
    section: string;
    rate: number;
    attended: number;
    total: number;
}

interface AnalyticsData {
    facultyName: string;
    totalAssignments: number;
    weeklyHours: number;
    overallAttendanceRate: number;
    conductedClasses: number;
    scheduledClasses: number;
    busiestDay: string;
    assignmentMetrics: AssignmentMetric[];
}

// Mock API URL (Replace with your actual deployed endpoint)
const API_BASE_URL = 'http://10.182.66.80:5000';
const FACULTY_ID = 'F001'; 

// --- Mock Data Placeholder (Matches the desired display fields) ---
const mockAnalyticsData: AnalyticsData = {
    facultyName: 'Dr. V. Jagadeesh',
    totalAssignments: 5,
    weeklyHours: 15,
    overallAttendanceRate: 88.5,
    conductedClasses: 55,
    scheduledClasses: 62,
    busiestDay: 'Wednesday',
    assignmentMetrics: [
        { subject: 'CN2025 (Theory)', section: 'A', rate: 92.5, attended: 185, total: 200 },
        { subject: 'OSLAB (Lab)', section: 'D', rate: 85.0, attended: 170, total: 200 },
        { subject: 'SE2025 (Theory)', section: 'E', rate: 78.2, attended: 156, total: 200 },
        { subject: 'CNLAB (Lab)', section: 'C', rate: 95.8, attended: 191, total: 200 },
    ],
};

// --- Styling ---
// 💥 FIX: Combined the two kpiCard definitions into one object (styles)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    contentContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#600202',
    },
    loadingText: {
        color: '#FFF',
        marginTop: 10,
    },
    // --- Header ---
    headerContainer: {
        backgroundColor: '#600202',
        padding: 20,
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    facultyNameText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFF',
    },
    // --- KPI Grid ---
    kpiGrid: {
        paddingHorizontal: 15,
        marginTop: -30, // Pulls the main KPI up into the header curve
        marginBottom: 10,
    },
    secondaryKpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    kpiCard: {
        borderRadius: 15,
        padding: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Base styles for all KPI cards (large or small)
        flexDirection: 'column', 
        alignItems: 'flex-start',
        minHeight: 100,
        margin: 5, // For secondary cards
    },
    kpiIcon: {
        marginBottom: 10, // Adjusted margin for column layout
        marginRight: 0,
    },
    kpiContent: {
        flex: 1,
    },
    kpiTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    kpiValue: {
        fontWeight: '900',
    },
    kpiSubtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
    // --- Data Card (General Container) ---
    dataCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginHorizontal: 10,
        marginBottom: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#600202',
        marginBottom: 10,
    },
    // --- Assignment Rows ---
    assignmentRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    assignmentSubject: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    assignmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    assignmentSection: {
        fontSize: 13,
        color: '#6c757d',
    },
    assignmentDetailText: {
        fontSize: 13,
        color: '#6c757d',
    },
    rateTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
    },
    rateTagText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // --- Progress Bar ---
    progressBarContainer: {
        height: 6,
        backgroundColor: '#e9ecef',
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    // --- Placeholder/Empty State ---
    chartPlaceholder: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 10,
        marginTop: 5,
    },
    placeholderText: {
        marginTop: 10,
        color: '#AAA',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        flex: 1,
        minHeight: 300,
    },
    emptyText: {
        color: '#600202',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubText: {
        color: '#868e96',
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
});

// --- Reusable Component: KPI Card ---
interface KPICardProps {
    title: string;
    value: string | number;
    subtitle: string;
    iconName: string;
    color: string;
    small?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, iconName, color, small = false }) => (
    // Use the combined kpiCard style, and apply conditional width/color overrides
    <View style={[
        styles.kpiCard, 
        { 
            backgroundColor: color, 
            width: small ? width / 3 - 15 : width - 30, // Conditional width
            padding: small ? 10 : 15,
            flexDirection: small ? 'column' : 'row',
            alignItems: small ? 'flex-start' : 'center',
        }
    ]}>
        <Icon 
            name={iconName} 
            size={small ? 24 : 30} 
            color={small ? '#600202' : '#FFF'} 
            style={[styles.kpiIcon, { marginRight: small ? 0 : 15 }]} 
        />
        <View style={styles.kpiContent}>
            <Text style={[styles.kpiTitle, { color: small ? '#333' : '#FFF' }]}>{title}</Text>
            <Text style={[styles.kpiValue, { fontSize: small ? 28 : 40, color: small ? '#600202' : '#FFF' }]}>
                {value}
            </Text>
            <Text style={[styles.kpiSubtitle, { color: small ? '#6c757d' : 'rgba(255, 255, 255, 0.7)' }]}>
                {subtitle}
            </Text>
        </View>
    </View>
);

// --- Main Component ---
const FacultyAnalytics: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

    // --- Data Fetching Logic (Replace with actual fetch) ---
    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            // Placeholder: Replace with actual fetch call to the Flask backend
            // const response = await fetch(`${API_BASE_URL}/api/faculty/analytics/${FACULTY_ID}`);
            // const data = await response.json();
            // setAnalyticsData(data);
            
            // Using mock data for immediate display
            setTimeout(() => { 
                setAnalyticsData(mockAnalyticsData);
                setIsLoading(false);
            }, 1500);

        } catch (error) {
            Alert.alert("Error", "Failed to load analytics data.");
            console.error("Analytics fetch error:", error);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);


    // --- Render Logic ---
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.loadingText}>Loading Faculty Dashboard...</Text>
            </View>
        );
    }

    if (!analyticsData) {
        return (
             <View style={styles.emptyContainer}>
                <Icon name="analytics" size={60} color="#600202" />
                <Text style={styles.emptyText}>No Analytics Data Available</Text>
                <Text style={styles.emptySubText}>
                    The faculty member has no current assignments or no attendance records yet.
                </Text>
            </View>
        );
    }
    
    // --- Render Individual Assignment Card Row ---
    const renderAssignmentRow = (item: AssignmentMetric, index: number) => {
        const isHigh = item.rate >= 90;
        const progressBarWidth = `${item.rate}%`;

        return (
            <View key={index} style={styles.assignmentRow}>
                <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentSubject}>{item.subject}</Text>
                    <View style={[styles.rateTag, { backgroundColor: isHigh ? '#28a745' : '#ffc107' }]}>
                        <Text style={styles.rateTagText}>{item.rate.toFixed(1)}%</Text>
                    </View>
                </View>
                
                <View style={styles.assignmentDetails}>
                    <Text style={styles.assignmentSection}>Section: {item.section}</Text>
                    <Text style={styles.assignmentDetailText}>({item.attended}/{item.total} sessions attended)</Text>
                </View>

                {/* Progress Bar for Visual Rate */}
                <View style={styles.progressBarContainer}>
                    <View style={[
                        styles.progressBarFill, 
                        // 💥 FIX: Type casting the object to ViewStyle to satisfy TypeScript
                        { width: progressBarWidth, backgroundColor: isHigh ? '#28a745' : '#ffc107' } as ViewStyle
                    ]} />
                </View>
            </View>
        );
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            {/* Header Area */}
            <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Welcome Back,</Text>
                <Text style={styles.facultyNameText}>{analyticsData.facultyName}</Text>
            </View>

            {/* Main KPI Grid (Overall Attendance and Weekly Hours) */}
            <View style={styles.kpiGrid}>
                <KPICard
                    title="Overall Attendance Rate"
                    value={`${analyticsData.overallAttendanceRate.toFixed(1)}%`}
                    subtitle={`Based on ${analyticsData.conductedClasses} classes conducted`}
                    iconName="group-add"
                    color="#600202"
                />
            </View>

            {/* Secondary KPIs */}
            <View style={styles.secondaryKpiGrid}>
                <KPICard
                    title="Weekly Load"
                    value={analyticsData.weeklyHours}
                    subtitle="Scheduled Hours"
                    iconName="schedule"
                    color="#FFF"
                    small
                />
                <KPICard
                    title="Total Assignments"
                    value={analyticsData.totalAssignments}
                    subtitle="Unique Subjects/Sections"
                    iconName="assignment"
                    color="#FFF"
                    small
                />
                <KPICard
                    title="Busiest Day"
                    value={analyticsData.busiestDay}
                    subtitle="Most Classes Scheduled"
                    iconName="calendar-today"
                    color="#FFF"
                    small
                />
            </View>

            {/* Trend Analysis Card (Chart Placeholder) */}
            <View style={styles.dataCard}>
                <Text style={styles.cardHeaderTitle}>Attendance Trend Analysis</Text>
                <View style={styles.chartPlaceholder}>
                    <Icon name="bar-chart" size={50} color="#CCC" />
                    <Text style={styles.placeholderText}>Weekly Attendance Trend Placeholder</Text>
                </View>
            </View>

            {/* Assignment Performance List */}
            <View style={styles.dataCard}>
                <Text style={styles.cardHeaderTitle}>Assignment Performance Breakdown</Text>
                <View>
                    {analyticsData.assignmentMetrics.map(renderAssignmentRow)}
                </View>
            </View>

        </ScrollView>
    );
};


export default FacultyAnalytics;
