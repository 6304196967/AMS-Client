// student/screens/BiometricScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

type Props = NativeStackScreenProps<StackParamList, "Biometric">;

const BiometricScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classEndTime, scheduleId, userEmail } = route.params; // Add userEmail here

  const markAttendanceOnServer = async (studentEmail: string, sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: studentEmail,
          session_id: scheduleId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    const authenticateAndMarkAttendance = async () => {
      const rnBiometrics = new ReactNativeBiometrics();

      try {
        const result = await rnBiometrics.simplePrompt({ 
          promptMessage: "Confirm fingerprint to mark attendance" 
        });

        if (result.success) {
          Alert.alert("Success", "Fingerprint verified! Marking attendance...");

          // Call backend to mark attendance
          const attendanceResult = await markAttendanceOnServer(userEmail, scheduleId);
          
          if (attendanceResult.success) {
            Alert.alert(
              "Attendance Marked!", 
              "You have successfully marked attendance.",
              [{ text: "OK", onPress: () => {
                // Navigate back to Tabs (Home screen)
                navigation.navigate('Tabs' as never);
              }}]
            );
          } else {
            Alert.alert(
              "Error", 
              `Failed to mark attendance: ${attendanceResult.error}`,
              [{ text: "OK", onPress: () => {
                // Navigate back to Tabs (Home screen)
                navigation.navigate('Tabs' as never);
              }}]
            );
          }
        } else {
          Alert.alert("Failed", "Fingerprint not recognized");
          navigation.replace("Blocked", { classEndTime });
        }
      } catch (error) {
        Alert.alert("Error", "Biometric authentication failed");
        navigation.replace("Blocked", { classEndTime });
      }
    };

    authenticateAndMarkAttendance();
  }, [classEndTime, scheduleId, userEmail]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fingerprint Verification</Text>
      <Text style={styles.subtitle}>Please verify your fingerprint to confirm attendance</Text>
      <ActivityIndicator size="large" color="#FFF" style={{ marginTop: spacing(20) }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", justifyContent: "center", alignItems: "center", padding: SPACING.xl },
  title: { fontSize: FONT_SIZES.heading, fontWeight: "bold", color: "#FFF", marginBottom: spacing(10), textAlign: "center" },
  subtitle: { fontSize: FONT_SIZES.lg, color: "#FFF", textAlign: "center" },
});

export default BiometricScreen;