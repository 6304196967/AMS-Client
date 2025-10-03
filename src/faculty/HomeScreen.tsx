import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenProps = {
    userEmail: string;
    user: {
        name: string;
        email: string;
    } | null;
    setIsLoggedIn: (value: boolean) => void;
    setUser: (user: { name: string; email: string } | null) => void;
};

type ScheduleItem = {
    id: number;
    subject_name: string;
    year: string;
    department: string;
    section: string;
    venue: string;
    start_time: string;
    end_time: string;
    status: boolean;
};

type ScheduleData = {
    faculty_name: string;
    schedules: ScheduleItem[];
};

type TimeSlot = {
    start_time: string;
    end_time: string;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ userEmail, user, setIsLoggedIn, setUser }) => {
    const [actualFacultyId, setActualFacultyId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
    
    // Filter options
    const yearOptions = ['E1', 'E2', 'E3', 'E4'];
    const departmentOptions = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
    const sectionOptions = ['A', 'B', 'C', 'D', 'E'];
    
    const [newSchedule, setNewSchedule] = useState({
        year: '',
        department: '',
        section: '',
        venue: '',
        start_time: '',
        end_time: ''
    });

    const API_BASE_URL = 'http://10.173.174.102:5000';

    useEffect(() => {
        // Set faculty ID from user email when component mounts
        if (user?.email) {
            // setActualFacultyId(user.email.split('@')[0]|| "F002");
            setActualFacultyId("F002");
        }
    }, [user]);

    useEffect(() => {
        if (actualFacultyId) {
            fetchScheduleForDate(selectedDate);
        }
    }, [selectedDate, actualFacultyId]);

    const fetchScheduleForDate = async (date: Date) => {
        if (!actualFacultyId) {
            console.log('Faculty ID not available yet');
            return;
        }

        try {
            setLoading(true);
            const dateStr = date.toISOString().split('T')[0];
            console.log('Fetching schedule for:', dateStr);
            
            const response = await fetch(
                `${API_BASE_URL}/faculty/${actualFacultyId}/schedule?date=${dateStr}`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch schedule');
            }
            
            const data: ScheduleData = await response.json();
            console.log('Schedule data:', data);
            setScheduleData(data);
        } catch (err) {
            console.error('Fetch schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const getDateDisplayText = (): string => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (selectedDate.toDateString() === today.toDateString()) {
            return "Today's Schedule";
        } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow's Schedule";
        } else if (selectedDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday's Schedule";
        } else {
            return selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const handleCancelSchedule = (schedule: ScheduleItem) => {
        Alert.alert(
            'Cancel Class',
            `Are you sure you want to cancel ${schedule.subject_name} class?`,
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes', 
                    style: 'destructive',
                    onPress: () => cancelSchedule(schedule.id)
                }
            ]
        );
    };

    const cancelSchedule = async (scheduleId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel schedule');
            }
            
            Alert.alert('Success', 'Class cancelled successfully');
            fetchScheduleForDate(selectedDate);
        } catch (err) {
            console.error('Cancel schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        }
    };

    const handleCreateSchedule = () => {
        setShowCreateModal(true);
        setAvailableSlots([]);
    };

    const fetchAvailableSlots = async () => {
        if (!newSchedule.year || !newSchedule.department || !newSchedule.section) {
            Alert.alert('Error', 'Please select Year, Department and Section first');
            return;
        }

        try {
            setFetchingSlots(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            console.log('Fetching slots for:', {
                date: dateStr,
                year: newSchedule.year,
                department: newSchedule.department,
                section: newSchedule.section
            });

            const response = await fetch(
                `${API_BASE_URL}/faculty/${actualFacultyId}/available-slots?date=${dateStr}&year=${newSchedule.year}&department=${newSchedule.department}&section=${newSchedule.section}`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch available slots');
            }
            
            const data = await response.json();
            console.log('Available slots:', data);
            
            if (data.success) {
                setAvailableSlots(data.available_slots || []);
                if (data.available_slots.length === 0) {
                    Alert.alert('Info', 'No available time slots found for the selected criteria.');
                }
            } else {
                throw new Error(data.error || 'Failed to fetch available slots');
            }
        } catch (err) {
            console.error('Fetch slots error:', err);
            Alert.alert('Error', (err as Error).message);
            setAvailableSlots([]);
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleCreateSubmit = async () => {
        if (!newSchedule.year || !newSchedule.department || !newSchedule.section || 
            !newSchedule.start_time || !newSchedule.end_time) {
            Alert.alert('Error', 'Please fill all required fields including time slot');
            return;
        }

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const payload = {
                faculty_id: actualFacultyId,
                date: dateStr,
                year: newSchedule.year,
                department: newSchedule.department,
                section: newSchedule.section,
                start_time: newSchedule.start_time,
                end_time: newSchedule.end_time,
                venue: newSchedule.venue || ''
            };

            console.log('Creating schedule with:', payload);

            const response = await fetch(`${API_BASE_URL}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create schedule');
            }
            
            Alert.alert('Success', 'Schedule created successfully');
            setShowCreateModal(false);
            resetNewSchedule();
            fetchScheduleForDate(selectedDate);
        } catch (err) {
            console.error('Create schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        }
    };

    const resetNewSchedule = () => {
        setNewSchedule({
            year: '',
            department: '',
            section: '',
            venue: '',
            start_time: '',
            end_time: ''
        });
        setAvailableSlots([]);
    };

    const renderFilterButtons = (options: string[], selectedValue: string, setValue: (value: string) => void, title: string) => (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{title}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterButtonsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.filterButton,
                                selectedValue === option && styles.filterButtonSelected
                            ]}
                            onPress={() => {
                                setValue(option);
                                if (availableSlots.length > 0) {
                                    setAvailableSlots([]);
                                }
                            }}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedValue === option && styles.filterButtonTextSelected
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderScheduleCard = ({ item }: { item: ScheduleItem }) => (
        <View style={styles.scheduleCard}>
            <View style={styles.scheduleInfo}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.subjectName}>{item.subject_name}</Text>
                    <View style={styles.scheduleBadge}>
                        <Text style={styles.scheduleBadgeText}>CLASS</Text>
                    </View>
                </View>
                <View style={styles.scheduleDetailsContainer}>
                    <View style={styles.detailRow}>
                        <Icon name="school" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            {item.year} {item.department} - {item.section}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="access-time" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="location-on" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            {item.venue || 'Venue not specified'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="info" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            Status: {item.status ? 'Completed' : 'Scheduled'}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelSchedule(item)}
                >
                    <Icon name="close" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Show loading if faculty ID is not available yet
    if (!actualFacultyId && user?.email) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f5f5f5" />
                    <Text style={styles.loadingText}>Loading Faculty Data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    {getGreeting()}, {user?.name || scheduleData?.faculty_name || 'Faculty'}!
                </Text>
                
                {/* Calendar Navigation */}
                <View style={styles.calendarNav}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigateDate(-1)}
                    >
                        <Icon name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.dateDisplay}>
                        <Text style={styles.dateTitle}>{getDateDisplayText()}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigateDate(1)}
                    >
                        <Icon name="chevron-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                    {scheduleData?.schedules?.length || 0} class{scheduleData?.schedules?.length !== 1 ? 'es' : ''} scheduled
                </Text>
            </View>

            {/* Schedule List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f5f5f5" />
                    <Text style={styles.loadingText}>Loading Schedule...</Text>
                </View>
            ) : (
                <FlatList
                    data={scheduleData?.schedules || []}
                    renderItem={renderScheduleCard}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="event-busy" size={60} color="#f5f5f5" />
                            <Text style={styles.emptyText}>No Classes Scheduled</Text>
                            <Text style={styles.emptySubText}>
                                No classes scheduled for {getDateDisplayText().toLowerCase()}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.footerContainer}>
                            <TouchableOpacity 
                                style={styles.createScheduleButton}
                                onPress={handleCreateSchedule}
                            >
                                <Icon name="add" size={20} color="#FFF" />
                                <Text style={styles.createScheduleButtonText}>
                                    Schedule New Class
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Create Schedule Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowCreateModal(false);
                    resetNewSchedule();
                }}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule New Class</Text>
                            <TouchableOpacity onPress={() => {
                                setShowCreateModal(false);
                                resetNewSchedule();
                            }}>
                                <Icon name="close" size={24} color="#600202" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.formContainer}>
                            {/* Filter Sections */}
                            {renderFilterButtons(yearOptions, newSchedule.year, 
                                (value) => setNewSchedule({...newSchedule, year: value}), 'Academic Year')}
                            
                            {renderFilterButtons(departmentOptions, newSchedule.department, 
                                (value) => setNewSchedule({...newSchedule, department: value}), 'Department')}
                            
                            {renderFilterButtons(sectionOptions, newSchedule.section, 
                                (value) => setNewSchedule({...newSchedule, section: value}), 'Section')}

                            {/* Fetch Time Slots Button */}
                            {newSchedule.year && newSchedule.department && newSchedule.section && (
                                <TouchableOpacity 
                                    style={[styles.fetchSlotsButton, fetchingSlots && styles.buttonDisabled]}
                                    onPress={fetchAvailableSlots}
                                    disabled={fetchingSlots}
                                >
                                    {fetchingSlots ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Icon name="search" size={20} color="#FFF" />
                                            <Text style={styles.fetchSlotsButtonText}>
                                                Fetch Available Time Slots
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {/* Available Time Slots */}
                            {availableSlots.length > 0 && (
                                <View style={styles.slotsSection}>
                                    <Text style={styles.slotsTitle}>Available Time Slots:</Text>
                                    {availableSlots.map((slot, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.slotItem,
                                                newSchedule.start_time === slot.start_time && styles.slotItemSelected
                                            ]}
                                            onPress={() => setNewSchedule({
                                                ...newSchedule,
                                                start_time: slot.start_time,
                                                end_time: slot.end_time
                                            })}
                                        >
                                            <Text style={styles.slotText}>
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Venue Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Venue (Optional)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter venue"
                                    value={newSchedule.venue}
                                    onChangeText={(text) => setNewSchedule({...newSchedule, venue: text})}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Selected Time Display */}
                            {newSchedule.start_time && (
                                <View style={styles.selectedTimeContainer}>
                                    <Text style={styles.selectedTime}>
                                        Selected: {formatTime(newSchedule.start_time)} - {formatTime(newSchedule.end_time)}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.modalCancelButton, styles.modalButton]}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    resetNewSchedule();
                                }}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalSubmitButton, styles.modalButton, (!newSchedule.start_time) && styles.modalSubmitButtonDisabled]}
                                onPress={handleCreateSubmit}
                                disabled={!newSchedule.start_time}
                            >
                                <Text style={styles.modalSubmitButtonText}>Schedule Class</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#600202',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    calendarNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 10,
        marginHorizontal: 10,
    },
    navButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    dateDisplay: {
        flex: 1,
        alignItems: 'center',
    },
    dateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    statsText: {
        color: '#f5f5f5',
        fontSize: 12,
        opacity: 0.9,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#f5f5f5',
        marginTop: 10,
    },
    listContainer: {
        padding: 10,
        paddingBottom: 20,
    },
    scheduleCard: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        marginHorizontal: 10,
        alignItems: 'center',
        borderLeftWidth: 6,
        borderLeftColor: '#dd5e5eff',
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectName: {
        color: '#600202',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    scheduleBadge: {
        backgroundColor: '#600202',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    scheduleBadgeText: {
        color: '#f5f5f5',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scheduleDetailsContainer: {},
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    scheduleDetails: {
        color: '#600202',
        fontSize: 12,
        marginLeft: 6,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyText: {
        color: '#f5f5f5',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubText: {
        color: 'rgba(245, 245, 245, 0.7)',
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
    footerContainer: {
        padding: 20,
        alignItems: 'center',
    },
    createScheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
    },
    createScheduleButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 15,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#600202',
    },
    formContainer: {
        padding: 20,
    },
    // Filter Styles
    filterSection: {
        marginBottom: 25,
    },
    filterLabel: {
        color: '#600202',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        minWidth: 60,
        alignItems: 'center',
    },
    filterButtonSelected: {
        backgroundColor: '#600202',
        borderColor: '#600202',
    },
    filterButtonText: {
        color: '#495057',
        fontWeight: '500',
        fontSize: 14,
    },
    filterButtonTextSelected: {
        color: '#f5f5f5',
        fontWeight: '600',
    },
    fetchSlotsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        gap: 8,
    },
    fetchSlotsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    slotsSection: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },
    slotsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#600202',
        marginBottom: 10,
    },
    slotItem: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    slotItemSelected: {
        backgroundColor: '#D4EDDA',
        borderColor: '#28A745',
    },
    slotText: {
        fontSize: 14,
        color: '#28A745',
        fontWeight: '500',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
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
    selectedTimeContainer: {
        backgroundColor: '#FFF3CD',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    selectedTime: {
        fontSize: 15,
        color: '#600202',
        fontWeight: '600',
        textAlign: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    modalCancelButton: {
        backgroundColor: '#6c757d',
    },
    modalSubmitButton: {
        backgroundColor: '#28a745',
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    modalCancelButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalSubmitButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default HomeScreen;