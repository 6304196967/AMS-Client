import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert 
} from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { pick, types} from '@react-native-documents/picker';

// Import the Param List type you created in your navigator file
import { StudentStackParamList } from './StudentStackNavigator'; // Adjust the import path if needed

const API_BASE_URL = 'http://10.182.66.80:5000';

// Define the type for this screen's props using the Param List and screen name
type Props = NativeStackScreenProps<StudentStackParamList, 'DepartmentDetail'>;

const DepartmentDetailScreen: React.FC<Props> = ({ route }) => {
  // TypeScript now knows that `route.params.departmentName` is a string
  const { departmentName } = route.params;
  const [activeYear, setActiveYear] = useState(1);
  const years = [
    { label: "E1", value: 1 },
    { label: "E2", value: 2 },
    { label: "E3", value: 3 },
    { label: "E4", value: 4 },
  ];

  const handleUploadPress = async () => {
    try {
      const pickerResult = await pick({
        type: [types.xls, types.xlsx],
      });

      // UPDATED: This is the new, correct way to check for cancellation.
      if (!pickerResult) {
        console.log('User cancelled the picker.');
        return; // Exit the function if the user cancels
      }
      
      // Since pick returns an array, we take the first element.
      const file = pickerResult[0];

      // Create FormData (this part remains the same)
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      console.log('File selected:', file);
      formData.append('departmentName', departmentName);
      formData.append('year', activeYear);

      // Send the request to your backend
      const response = await fetch(`${API_BASE_URL}/upload_students`, {
        method: 'POST',
        body: formData,
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert('Success', responseJson.message);
      } else {
        throw new Error(responseJson.message || 'Something went wrong');
      }

    } catch (error) {
      // The catch block now only handles genuine errors (e.g., permissions, network issues)
      console.error('An unexpected error occurred:', error);
      Alert.alert('Error', 'An unexpected error occurred during the upload.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{departmentName}</Text>

      {/* Year Tabs */}
      <View style={styles.yearSelector}>
        {years.map((year) => (
          <TouchableOpacity
            key={year.label}
            onPress={() => setActiveYear(year.value)}
            style={styles.yearTab}
          >
            <Text
              style={[
                styles.yearText,
                activeYear === year.value && styles.activeYearText,
              ]}
            >
              {year.label}
            </Text>
            {/* The orange underline for the active tab */}
            {activeYear === year.value && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Upload Button */}
        <TouchableOpacity style={styles.actionButton} onPress={handleUploadPress}>
          <View style={styles.iconContainer}>
            <Text style={[styles.iconText, { fontWeight: 'bold' }]}>↑</Text>
          </View>
          <Text style={styles.actionText}>Upload</Text>
        </TouchableOpacity>

        {/* Edit Button */}
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✎</Text>
          </View>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {/* Download Button */}
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.iconContainer, { borderColor: '#34A853' }]}>
            <Text style={[styles.iconText, { color: '#34A853', fontWeight: 'bold' }]}>↓</Text>
          </View>
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#600202",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  header: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#ffffffff", // Orange color for "CSE"
    marginBottom: 40,
  },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
    marginHorizontal: 10,
  },
  yearTab: {
    alignItems: "center",
    paddingVertical: 10,
  },
  yearText: {
    fontSize: 22,
    color: "#A9A9A9", // Greyed out for inactive tabs
    fontWeight: "600",
  },
  activeYearText: {
    color: "#FFFFFF", // White for the active tab
  },
  activeUnderline: {
    height: 3,
    width: 30,
    backgroundColor: "#ffffffff", // Orange underline
    marginTop: 5,
    borderRadius: 2,
  },
  actionsContainer: {
    alignItems: "flex-start",
    marginLeft: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.15)'
  },
  iconText: {
    fontSize: 65,
    color: '#FFF',
  },
  actionText: {
    fontSize: 34,
    color: "#FFFFFF",
    fontWeight: "500",
    paddingLeft: 10,
  },
});

export default DepartmentDetailScreen;