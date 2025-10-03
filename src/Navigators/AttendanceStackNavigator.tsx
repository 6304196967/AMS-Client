// src/navigation/AttendanceStackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Animated, Easing } from 'react-native';
import { StackCardInterpolationProps } from '@react-navigation/stack';

// Attendance Screens
import AttendanceDashboard from '../faculty/AttendanceDashboard';
import ClassDetailsScreen from '../faculty/ClassDetailsScreen';
import AttendanceReportScreen from '../faculty/AttendanceReportScreen';

export type AttendanceStackParamList = {
  AttendanceDashboard: undefined;
  ClassDetails: { classData: any };
  AttendanceReport: { classData: any };
};

// Define custom transition first
const customSlideFromRight = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.9],
                })
              : 1,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.07],
        }),
      },
    };
  },
};

const Stack = createStackNavigator<AttendanceStackParamList>();

const AttendanceStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...customSlideFromRight,
      }}
    >
      <Stack.Screen 
        name="AttendanceDashboard" 
        component={AttendanceDashboard} 
      />
      <Stack.Screen 
        name="ClassDetails" 
        component={ClassDetailsScreen} 
      />
      <Stack.Screen 
        name="AttendanceReport" 
        component={AttendanceReportScreen} 
      />
    </Stack.Navigator>
  );
};

export default AttendanceStackNavigator;