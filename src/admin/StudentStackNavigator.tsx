import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the screens for this stack
import StudentManagement from './StudentManagement'; // Adjust path if needed
import DepartmentDetailScreen from './DepartmentDetailScreen'; // Adjust path if needed

// 1. Define the Param List for all screens in this stack
export type StudentStackParamList = {
  StudentManagementBase: undefined; // This screen takes no parameters
  DepartmentDetail: { departmentName: string }; // This screen expects a 'departmentName' string
};

// 2. Create the stack navigator, passing the Param List as a generic
const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentStackNavigator = () => {
  return (
    <Stack.Navigator
      // Hide the stack's own header to use the one from the Tab Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="StudentManagementBase"
        component={StudentManagement}
      />
      <Stack.Screen
        name="DepartmentDetail"
        component={DepartmentDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default StudentStackNavigator;