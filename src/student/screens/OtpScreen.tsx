// student/screens/OtpScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Alert, BackHandler } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";

type Props = NativeStackScreenProps<StackParamList, "Otp">;

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { generatedOTP, classEndTime } = route.params;
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  // Block hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("Blocked", "You cannot go back. Attendance must be completed.");
      return true;
    });
    return () => backHandler.remove();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) {
      Alert.alert("Time Out", "OTP expired!");
      navigation.replace("Blocked", { classEndTime });
      return;
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (/^[a-zA-Z0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (index < 5 && text) inputsRef.current[index + 1]?.focus();

      if (index === 5 && newOtp.every(d => d !== "")) {
        const enteredOTP = newOtp.join("");
        if (enteredOTP === generatedOTP) {
          Alert.alert("OTP Verified!", "Proceeding to fingerprint verification...");
          navigation.replace("Biometric", { classEndTime });
        } else {
          Alert.alert("Invalid OTP", "Try again");
          setOtp(["", "", "", "", "", ""]);
          inputsRef.current[0]?.focus();
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-character OTP (letters + numbers)</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputsRef.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
            onChangeText={text => handleChange(text, index)}
          />
        ))}
      </View>

      <Text style={styles.timer}>Time left: {timer}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FFF", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#FFF", marginBottom: 30, textAlign: "center" },
  otpContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  otpInput: { width: 45, height: 55, marginHorizontal: 5, borderRadius: 10, borderWidth: 1, borderColor: "#FFF", textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#FFF", backgroundColor: "rgba(255,255,255,0.1)" },
  timer: { color: "#FFF", fontSize: 16, marginTop: 15 },
});

export default OtpScreen;
