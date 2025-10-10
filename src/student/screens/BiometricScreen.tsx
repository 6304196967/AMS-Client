// student/screens/BiometricScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, BackHandler } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

const API_BASE_URL = 'http://10.182.66.80:5000';

type Props = NativeStackScreenProps<StackParamList, "Biometric">;

type AuthMethod = 'fingerprint' | 'device_credentials' | 'none';

const BiometricScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classEndTime, scheduleId, userEmail } = route.params;
  const [statusMessage, setStatusMessage] = useState<string>("Verifying...");
  const authCompletedRef = useRef<boolean>(false);
  const authAttemptedRef = useRef<boolean>(false);

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

  const handleSuccessfulAuth = async () => {
    authCompletedRef.current = true;
    setStatusMessage("Authentication successful! Marking attendance...");
    
    const attendanceResult = await markAttendanceOnServer(userEmail, scheduleId);
    
    if (attendanceResult.success) {
      // Small delay to ensure backend updates
      setTimeout(() => {
        Alert.alert(
          "Attendance Marked!", 
          "You have successfully marked attendance.",
          [{ text: "OK", onPress: () => {
            navigation.navigate('Tabs' as never);
          }}]
        );
      }, 500);
    } else {
      Alert.alert(
        "Error", 
        `Failed to mark attendance: ${attendanceResult.error}`,
        [{ text: "OK", onPress: () => {
          navigation.navigate('Tabs' as never);
        }}]
      );
    }
  };

  const handleAuthenticationCancelled = () => {
    // Mark as cancelled/incomplete - user didn't complete authentication
    authCompletedRef.current = true;
    Alert.alert(
      "Authentication Cancelled", 
      "You cancelled the authentication. Your attendance was not marked.",
      [{ text: "OK", onPress: () => {
        navigation.navigate('Tabs' as never);
      }}]
    );
  };

  const performBiometricAuth = async () => {
    if (authCompletedRef.current || authAttemptedRef.current) return;
    
    authAttemptedRef.current = true;

    const showPINAuthentication = async () => {
      try {
        const rnBiometricsWithPIN = new ReactNativeBiometrics({
          allowDeviceCredentials: true
        });

        setStatusMessage("Enter your PIN/Password/Pattern...");

        const pinResult = await rnBiometricsWithPIN.simplePrompt({
          promptMessage: "Enter your device PIN/Password/Pattern to mark attendance",
          fallbackPromptMessage: "Use PIN/Password"
        });

        if (pinResult.success) {
          // PIN entered correctly
          await handleSuccessfulAuth();
        } else {
          // User cancelled PIN - return to home
          authCompletedRef.current = true;
          navigation.navigate('Tabs' as never);
        }
      } catch (error: any) {
        // Error occurred - return to home
        authCompletedRef.current = true;
        navigation.navigate('Tabs' as never);
      }
    };

    try {
      // STEP 1: Try fingerprint ONLY (no PIN button)
      const rnBiometrics = new ReactNativeBiometrics();
      
      // Check if biometrics is available
      const { available } = await rnBiometrics.isSensorAvailable();
      
      if (!available) {
        // No fingerprint sensor - go directly to PIN
        await showPINAuthentication();
        return;
      }

      setStatusMessage("Verifying your identity...");
      
      // Try fingerprint authentication
      const fingerprintResult = await rnBiometrics.simplePrompt({
        promptMessage: "Confirm your identity to mark attendance",
        cancelButtonText: "Cancel"
      });

      if (fingerprintResult.success) {
        // Fingerprint successful
        await handleSuccessfulAuth();
        return;
      } else {
        // User cancelled - show confirmation alert
        Alert.alert(
          "Cancel Authentication?",
          "Do you want to cancel biometric authentication?",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => {
                // User chose to continue - retry fingerprint (not PIN)
                // Reset the attempted flag so it can retry
                authAttemptedRef.current = false;
                performBiometricAuth();
              }
            },
            {
              text: "Yes",
              style: "destructive",
              onPress: () => {
                // User confirmed cancel - return to home
                authCompletedRef.current = true;
                navigation.navigate('Tabs' as never);
              }
            }
          ]
        );
        return;
      }

    } catch (error: any) {
      // Check if it's "too many attempts" error
      if (error.message && (
          error.message.includes('Too many attempts') || 
          error.message.includes('too many') ||
          error.message.includes('lockout')
        )) {
        // Biometric sensor locked - show PIN option
        await showPINAuthentication();
      } else {
        // Other error - show PIN as fallback
        await showPINAuthentication();
      }
    }
  };

  // Handle back button and navigation away
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent going back without completing authentication
      if (!authCompletedRef.current) {
        Alert.alert(
          "Cancel Authentication?",
          "Are you sure you want to cancel? Your attendance will not be marked.",
          [
            { text: "Continue", style: "cancel" },
            { 
              text: "Cancel Authentication", 
              style: "destructive",
              onPress: handleAuthenticationCancelled
            }
          ]
        );
      }
      return true; // Prevent default back behavior
    });

    // Listen for navigation events (when user navigates away)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (authCompletedRef.current) {
        // Authentication completed, allow navigation
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      Alert.alert(
        "Cancel Authentication?",
        "Are you sure you want to leave? Your attendance will not be marked.",
        [
          { text: "Stay", style: "cancel" },
          { 
            text: "Leave", 
            style: "destructive",
            onPress: () => {
              authCompletedRef.current = true;
              navigation.dispatch(e.data.action);
            }
          }
        ]
      );
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  // Single useEffect to trigger authentication on mount
  useEffect(() => {
    performBiometricAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Identity</Text>
      <Text style={styles.subtitle}>{statusMessage}</Text>
      <ActivityIndicator size="large" color="#FFF" style={{ marginTop: spacing(20) }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", justifyContent: "center", alignItems: "center", padding: SPACING.xl },
  title: { fontSize: FONT_SIZES.heading, fontWeight: "bold", color: "#FFF", marginBottom: spacing(10), textAlign: "center" },
  subtitle: { fontSize: FONT_SIZES.lg, color: "#FFF", textAlign: "center" },
  attemptText: { fontSize: FONT_SIZES.md, color: "#FFD700", marginTop: spacing(10), textAlign: "center", fontWeight: "600" },
  fingerprintTimerText: { fontSize: FONT_SIZES.xl, color: "#00FF00", marginTop: spacing(15), textAlign: "center", fontWeight: "bold" },
  infoText: { fontSize: FONT_SIZES.sm, color: "#FFD700", marginTop: spacing(15), textAlign: "center", fontWeight: "400", paddingHorizontal: spacing(20) },
  timerText: { fontSize: FONT_SIZES.md, color: "#FFA500", marginTop: spacing(20), textAlign: "center", fontWeight: "600" },
});

export default BiometricScreen;