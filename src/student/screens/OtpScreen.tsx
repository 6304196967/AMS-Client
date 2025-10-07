// student/screens/OtpScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, Alert, BackHandler, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";

type Props = NativeStackScreenProps<StackParamList, "Otp">;

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scheduleId, classEndTime, userEmail } = route.params; // Add userEmail here
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const verifyOtpWithBackend = async (enteredOTP: string) => {
  try {
    setIsVerifying(true);
    
    const response = await fetch(`${API_BASE_URL}/api/attendance/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduleId: scheduleId,
        otp: enteredOTP
      }),
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert(
        "OTP Verified!",
        "You can proceed to biometric verification in 15 seconds."
      );

      // ✅ Set 15-minute (900 seconds) delay before navigating
      setTimeout(() => {
        navigation.replace("Biometric", { 
          classEndTime,
          scheduleId,
          userEmail
        });
      }, 15 * 1000); // 15 seconds in milliseconds

    } else {
      Alert.alert("Error", data.message || "Invalid OTP");
      resetOtpFields();
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    Alert.alert("Error", "Failed to verify OTP. Please check your connection and try again.");
    resetOtpFields();
  } finally {
    setIsVerifying(false);
  }
};


  const resetOtpFields = () => {
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    if (/^[a-zA-Z0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (index < 5 && text) {
        inputsRef.current[index + 1]?.focus();
      }

      // Auto-focus previous input on backspace
      if (text === "" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      // Verify when all fields are filled
      if (index === 5 && newOtp.every(d => d !== "")) {
        const enteredOTP = newOtp.join("");
        verifyOtpWithBackend(enteredOTP);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace for empty fields
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
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
              inputsRef.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              isVerifying && styles.disabledInput
            ]}
            value={digit}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
            onChangeText={text => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!isVerifying}
            selectTextOnFocus={!isVerifying}
          />
        ))}
      </View>

      {isVerifying && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Verifying OTP...</Text>
        </View>
      )}
      
      <Text style={styles.timer}>Time left: {timer}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#600202", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#FFF", 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#FFF", 
    marginBottom: 30, 
    textAlign: "center" 
  },
  otpContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginBottom: 20 
  },
  otpInput: { 
    width: 45, 
    height: 55, 
    marginHorizontal: 5, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: "#FFF", 
    textAlign: "center", 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#FFF", 
    backgroundColor: "rgba(255,255,255,0.1)" 
  },
  disabledInput: {
    opacity: 0.6
  },
  timer: { 
    color: "#FFF", 
    fontSize: 16, 
    marginTop: 15 
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16
  }
});

export default OtpScreen;