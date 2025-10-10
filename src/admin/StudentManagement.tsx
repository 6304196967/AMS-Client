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

const StudentManagement = () => {
    // --- State Management ---
    const [selectedFile, setSelectedFile] = useState<SelectedFile>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [replaceStudents, setReplaceStudents] = useState(false);
    const [selectedYear, setSelectedYear] = useState('E3');
    const [selectedBranch, setSelectedBranch] = useState('CSE');

    const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

    // --- Handlers ---
    const handleSelectFile = async () => {
        try {
            const pickerResult = await pick({ type: [types.xls, types.xlsx] });
            if (!pickerResult) {
                Alert.alert('File Selection Error', 'Could not select file. Please try again.');
                return;
            }
            setSelectedFile(pickerResult[0]); // Store the selected file object in state
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred while selecting the file.');
            console.error(error);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            Alert.alert('No File Selected', 'Please select a file before uploading.');
            return;
        }

        setIsUploading(true);
        try {
            // Create FormData right before the upload
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.type,
            });
            formData.append('year', selectedYear);
            formData.append('department', selectedBranch);
            
            formData.append('replace', String(replaceStudents));

            const response = await fetch(`${API_BASE_URL}/students/upload`, {
                method: 'POST',
                body: formData,
            });

            const responseJson = await response.json();
            if (!response.ok) {
                throw new Error(responseJson.message || 'Something went wrong on the server.');
            }

            Alert.alert('Success', responseJson.message);
            setSelectedFile(null); // Clear the file from state after a successful upload

        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setIsUploading(false); // This will run whether the upload succeeds or fails
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Student Management</Text>
                
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Icon name="people" size={fontSize(24)} color="#600202" />
                        <Text style={styles.cardTitle}>Manage Students by Class</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                        Select a class, then upload an Excel file of students. Use the toggle to replace all students for that specific class.
                    </Text>

                    <Text style={styles.pickerLabel}>Select Year:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedYear}
                            onValueChange={(itemValue) => setSelectedYear(itemValue)}
                            style={styles.picker}
                        >
                            {yearOptions.map(year => <Picker.Item key={year} label={year} value={year} />)}
                        </Picker>
                    </View>

                    <Text style={styles.pickerLabel}>Select Branch:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedBranch}
                            onValueChange={(itemValue) => setSelectedBranch(itemValue)}
                            style={styles.picker}
                        >
                            {branchOptions.map(branch => <Picker.Item key={branch} label={branch} value={branch} />)}
                        </Picker>
                    </View>

                    <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
                        <Icon name="attach-file" size={fontSize(20)} color="#600202" />
                        <Text style={styles.selectButtonText}>Select Students File</Text>
                    </TouchableOpacity>
                    
                    {selectedFile && <Text style={styles.fileName}>{selectedFile.name}</Text>}
                    
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleLabel}>Replace Students for This Class</Text>
                        <Switch
                            trackColor={{ false: "#ccc", true: "#b33939" }}
                            thumbColor={replaceStudents ? "#600202" : "#f4f3f4"}
                            onValueChange={setReplaceStudents}
                            value={replaceStudents}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.uploadButton, !selectedFile && styles.buttonDisabled]}
                        onPress={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Students</Text>}
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

export default StudentManagement;   