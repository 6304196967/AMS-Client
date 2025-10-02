import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Interfaces for Data Structure ---
interface AssignmentMetric {
    subject: string;
    section: string;
    rate: number;
}

interface AnalyticsData {
    totalAssignments: number;
    weeklyHours: number;
    overallAttendanceRate: number;
    busiestDay: string;
    assignmentMetrics: AssignmentMetric[];
}

// Mock API URL (Replace with your actual deployed endpoint)
const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

// Mock Faculty ID (Replace with ID passed via navigation or auth context)
const FACULTY_ID = 'F001';

const FacultyAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

    // --- Mock Data Placeholder ---
    const mockAnalyticsData: AnalyticsData = {
        totalAssignments: 5,
        weeklyHours: 15,
        overallAttendanceRate: 88.5,
        busiestDay: 'Wednesday (4 hours)',
        assignmentMetrics: [
            { subject: 'CN2025', section: 'A', rate: 92 },
            { subject: 'OS2025', section: 'B', rate: 85 },
            { subject: 'SE2025', section: 'C', rate: 78 },
        ],
    };

    // --- Data Fetching Logic (Replace with actual fetch) ---
    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            // Replace this block with your actual fetch call to the Flask backend:
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


    // --- Helper Renderer: Individual Assignment Cards ---
    const renderAssignmentMetrics = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Assignment Performance</Text>
            {analyticsData!.assignmentMetrics.map((metric, index) => (
                <View key={index} style={styles.metricRow}>
                    <Icon name="book" size={20} color="#600202" style={styles.metricIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.metricLabel}>{metric.subject} - Sec {metric.section}</Text>
                        <Text style={styles.metricValue}>{metric.rate.toFixed(1)}% Attendance</Text>
                    </View>
                    <View style={[styles.rateBadge, { backgroundColor: metric.rate > 85 ? '#28a745' : '#ffc107' }]}>
                        <Text style={styles.rateText}>{metric.rate > 85 ? 'High' : 'Avg'}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    // --- Main Render Logic ---
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.loadingText}>Loading Analytics...</Text>
            </View>
        );
    }

    if (!analyticsData) {
        return <View style={styles.emptyContainer}><Text style={styles.emptyText}>No data available.</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Faculty Dashboard</Text>
            <View style={styles.summaryGrid}>
                
                {/* 1. Overall Attendance Rate (KPI) */}
                <View style={[styles.kpiCard, styles.kpiPrimary]}>
                    <Text style={styles.kpiTitle}>Overall Attendance</Text>
                    <Text style={styles.kpiValue}>
                        {analyticsData.overallAttendanceRate.toFixed(1)}%
                    </Text>
                    <Text style={styles.kpiSubtitle}>Across all classes</Text>
                </View>

                {/* 2. Total Assignments */}
                <View style={[styles.kpiCard, styles.kpiSecondary]}>
                    <Text style={styles.kpiTitle}>Total Assignments</Text>
                    <Text style={styles.kpiValueSmall}>{analyticsData.totalAssignments}</Text>
                    <Text style={styles.kpiSubtitle}>Sections/Subjects</Text>
                </View>

                {/* 3. Weekly Hours */}
                <View style={[styles.kpiCard, styles.kpiSecondary]}>
                    <Text style={styles.kpiTitle}>Weekly Hours</Text>
                    <Text style={styles.kpiValueSmall}>{analyticsData.weeklyHours}</Text>
                    <Text style={styles.kpiSubtitle}>In Default Schedule</Text>
                </View>

            </View>

            {/* Busiest Day Card */}
            <View style={styles.insightCard}>
                <Icon name="today" size={24} color="#600202" />
                <Text style={styles.insightText}>
                    Busiest Day: <Text style={styles.insightValue}>{analyticsData.busiestDay}</Text>
                </Text>
            </View>

            {/* Assignment Performance List */}
            {renderAssignmentMetrics()}

            {/* Placeholder for future Charts */}
            <View style={[styles.card, styles.chartPlaceholder]}>
                 <Icon name="bar-chart" size={40} color="#CCC" />
                 <Text style={styles.placeholderText}>Attendance Trend Chart Placeholder</Text>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        color: '#600202',
        marginVertical: 10,
        paddingHorizontal: 10,
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
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        marginBottom: 15,
    },
    // --- KPI Cards ---
    kpiCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kpiPrimary: {
        backgroundColor: '#600202',
        width: '98%', // Full width for the main KPI
    },
    kpiSecondary: {
        backgroundColor: '#FFF',
        width: '48%',
    },
    kpiTitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
        marginBottom: 5,
    },
    kpiValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
    },
    kpiValueSmall: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#600202',
    },
    kpiSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    // --- Card List ---
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 10,
        marginBottom: 15,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    metricIcon: {
        marginRight: 10,
    },
    metricLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    metricValue: {
        fontSize: 14,
        color: '#6c757d',
    },
    rateBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
    },
    rateText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // --- Insight Card ---
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 10,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
        elevation: 2,
    },
    insightText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    insightValue: {
        fontWeight: 'bold',
        color: '#600202',
    },
    // --- Placeholder ---
    chartPlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    placeholderText: {
        marginTop: 10,
        color: '#AAA',
    },
     emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
        backgroundColor: '#FFF', // Use white background for visibility
        borderRadius: 12,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    emptyText: {
        color: '#600202', // Primary color for the main text
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    emptySubText: {
        color: '#868e96', // Secondary color for descriptive text
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
});

export default FacultyAnalytics;