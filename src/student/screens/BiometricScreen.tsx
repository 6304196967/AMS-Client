// student/screens/BiometricScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";

type Props = NativeStackScreenProps<StackParamList, "Biometric">;

const BiometricScreen: React.FC<Props> = ({ navigation, route }) => {
  const { classEndTime } = route.params;

  useEffect(() => {
    const rnBiometrics = new ReactNativeBiometrics();

    rnBiometrics
      .simplePrompt({ promptMessage: "Confirm fingerprint to mark attendance" })
      .then(result => {
        if (result.success) {
          Alert.alert("Success", "Fingerprint verified! Attendance will be marked shortly.");

          setTimeout(() => {
            // Simulate backend call
            Alert.alert("Attendance Marked!", "You have successfully marked attendance.");
            navigation.popToTop();
          }, 15000);
        } else {
          Alert.alert("Failed", "Fingerprint not recognized");
          navigation.replace("Blocked", { classEndTime });
        }
      })
      .catch(() => {
        Alert.alert("Error", "Biometric authentication failed");
        navigation.replace("Blocked", { classEndTime });
      });
  }, [classEndTime]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fingerprint Verification</Text>
      <Text style={styles.subtitle}>Please verify your fingerprint to confirm attendance</Text>
      <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFF", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#FFF", textAlign: "center" },
});

export default BiometricScreen;
