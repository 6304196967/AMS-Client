import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Switch,
} from 'react-native';
import { pick, types } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, fontSize, FONT_SIZES } from '../utils/responsive';

// --- Type Definitions & Constants ---
type SelectedFile = { uri: string; name: string | null; type: string | null; } | null;
const yearOptions = ['E1', 'E2', 'E3', 'E4'];
const branchOptions = ['CSE', 'ECE', 'EEE', 'CIVIL', 'ME', 'MME', 'CHEM'];

const ScheduleManagement = () => {
    // --- State Management ---
    const [subjectsFile, setSubjectsFile] = useState<SelectedFile>(null);
    const [schedulesFile, setSchedulesFile] = useState<SelectedFile>(null);
    const [replaceSubjects, setReplaceSubjects] = useState(false);
    const [replaceSchedules, setReplaceSchedules] = useState(false);
    const [isUploadingSubjects, setIsUploadingSubjects] = useState(false);
    const [isUploadingSchedules, setIsUploadingSchedules] = useState(false);
    const [selectedScheduleYear, setSelectedScheduleYear] = useState('E1');
    const [selectedScheduleBranch, setSelectedScheduleBranch] = useState('CSE');

    // --- API Configuration ---
    const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

    // --- Handlers ---
    const handleSelectFile = async (fileType: 'subjects' | 'schedules') => {
        try {
            const [pickerResult] = await pick({ type: [types.xls, types.xlsx] });
            if (fileType === 'subjects') {
                setSubjectsFile(pickerResult);
            } else {
                setSchedulesFile(pickerResult);
            }
        } catch (error) {
            Alert.alert('File Selection Error', 'Could not select file. Please try again.');
        }
    };

    const handleUpload = async (fileType: 'subjects' | 'schedules') => {
        const file = fileType === 'subjects' ? subjectsFile : schedulesFile;
        const replace = fileType === 'subjects' ? replaceSubjects : replaceSchedules;
        const setLoading = fileType === 'subjects' ? setIsUploadingSubjects : setIsUploadingSchedules;
        const endpoint = fileType === 'subjects' ? '/subjects/upload' : '/defacultschedules/upload';
        const fileTypeName = fileType === 'subjects' ? 'Subjects' : 'Schedules';

        if (!file) {
            Alert.alert("No File", `Please select a ${fileTypeName} file first.`);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            });
            formData.append('replace', String(replace));

            // Add year and department if uploading schedules
            if (fileType === 'schedules') {
                formData.append('year', selectedScheduleYear);
                formData.append('department', selectedScheduleBranch);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            const responseJson = await response.json();
            if (!response.ok) {
                throw new Error(responseJson.message || `Failed to upload ${fileTypeName}.`);
            }

            Alert.alert("Success", responseJson.message);

            if (fileType === 'subjects') {
                setSubjectsFile(null);
            } else {
                setSchedulesFile(null);
            }
        } catch (error: any) {
            Alert.alert(`${fileTypeName} Upload Failed`, error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Schedule Management</Text>
                
                {/* Subjects Upload Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="library-books" size={fontSize(24)} color="#600202" />
                        <Text style={styles.cardTitle}>Manage Subjects</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                        Upload an Excel file to add new subjects. Use the toggle to replace all existing subjects with the new list.
                    </Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => handleSelectFile('subjects')}>
                        <Icon name="attach-file" size={fontSize(20)} color="#600202" />
                        <Text style={styles.selectButtonText}>Select Subjects File</Text>
                    </TouchableOpacity>
                    {subjectsFile && <Text style={styles.fileName}>{subjectsFile.name}</Text>}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Replace All Existing Subjects</Text>
                        <Switch
                            trackColor={{ false: "#ccc", true: "#b33939" }}
                            thumbColor={replaceSubjects ? "#600202" : "#f4f3f4"}
                            onValueChange={setReplaceSubjects}
                            value={replaceSubjects}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.uploadButton, !subjectsFile && styles.buttonDisabled]}
                        onPress={() => handleUpload('subjects')}
                        disabled={!subjectsFile || isUploadingSubjects}
                    >
                        {isUploadingSubjects ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Subjects</Text>}
                    </TouchableOpacity>
                </View>

                {/* Schedules Upload Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="schedule" size={fontSize(24)} color="#600202" />
                        <Text style={styles.cardTitle}>Manage Default Schedules</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                        Select a class, then upload its default weekly timetable. Use the toggle to replace only the schedule for that specific class.
                    </Text>

                    <Text style={styles.pickerLabel}>Select Year:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedScheduleYear}
                            onValueChange={(itemValue) => setSelectedScheduleYear(itemValue)}
                            style={styles.picker}
                        >
                            {yearOptions.map(year => <Picker.Item key={year} label={year} value={year} />)}
                        </Picker>
                    </View>

                    <Text style={styles.pickerLabel}>Select Branch:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedScheduleBranch}
                            onValueChange={(itemValue) => setSelectedScheduleBranch(itemValue)}
                            style={styles.picker}
                        >
                            {branchOptions.map(branch => <Picker.Item key={branch} label={branch} value={branch} />)}
                        </Picker>
                    </View>
                    
                    <TouchableOpacity style={styles.selectButton} onPress={() => handleSelectFile('schedules')}>
                        <Icon name="attach-file" size={fontSize(20)} color="#600202" />
                        <Text style={styles.selectButtonText}>Select Schedules File</Text>
                    </TouchableOpacity>
                    {schedulesFile && <Text style={styles.fileName}>{schedulesFile.name}</Text>}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Replace This Class's Schedule</Text>
                        <Switch
                            trackColor={{ false: "#ccc", true: "#b33939" }}
                            thumbColor={replaceSchedules ? "#600202" : "#f4f3f4"}
                            onValueChange={setReplaceSchedules}
                            value={replaceSchedules}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.uploadButton, !schedulesFile && styles.buttonDisabled]}
                        onPress={() => handleUpload('schedules')}
                        disabled={!schedulesFile || isUploadingSchedules}
                    >
                        {isUploadingSchedules ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Schedules</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    scrollContent: { padding: spacing(20), paddingBottom: spacing(40) },
    headerTitle: {
        fontSize: FONT_SIZES.title,
        fontWeight: 'bold',
        color: '#600202',
        marginBottom: spacing(20),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: spacing(20),
        marginBottom: spacing(20),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing(10),
    },
    cardTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '600',
        color: '#333',
        marginLeft: spacing(10),
    },
    cardDescription: {
        fontSize: FONT_SIZES.md,
        color: '#666',
        marginBottom: spacing(20),
        lineHeight: fontSize(20),
    },
    selectButton: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        paddingVertical: spacing(12),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectButtonText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '500',
        color: '#600202',
        marginLeft: spacing(10),
    },
    fileName: {
        marginTop: spacing(15),
        fontStyle: 'italic',
        color: '#555',
        textAlign: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing(20),
        paddingVertical: spacing(10),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    toggleLabel: {
        fontSize: FONT_SIZES.lg,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        marginRight: spacing(10),
    },
    uploadButton: {
        backgroundColor: '#600202',
        paddingVertical: spacing(15),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing(20),
    },
    uploadButtonText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: '#FFF',
    },
    buttonDisabled: {
        backgroundColor: '#aaa',
    },
    pickerLabel: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '500',
        color: '#333',
        marginBottom: spacing(5),
        marginTop: spacing(15),
    },
    pickerContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: spacing(20),
    },
    picker: {
        color: '#333',
    },
});

export default ScheduleManagement;