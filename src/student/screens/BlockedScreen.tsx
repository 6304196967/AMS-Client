// student/screens/BlockedScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type BlockedScreenProps = {
  navigation: any;
  route: { params: { classEndTime: number } };
};

const BlockedScreen: React.FC<BlockedScreenProps> = ({ navigation, route }) => {
  const { classEndTime } = route.params;
  const [remaining, setRemaining] = useState(classEndTime - Date.now());

  // Prevent hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, []);

  // Save classEndTime persistently (so even if app restarts, it still knows when to unblock)
  useEffect(() => {
    AsyncStorage.setItem("classEndTime", classEndTime.toString());
  }, [classEndTime]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(async () => {
      const timeLeft = classEndTime - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        await AsyncStorage.removeItem("classEndTime"); // clear block state
        navigation.replace("Home"); // unlock app
      } else {
        setRemaining(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [classEndTime]);

  // Format time as mm:ss
  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Locked</Text>
      <Text style={styles.subtitle}>
        You cannot access the app until the class ends.
      </Text>
      <Text style={styles.timer}>{formatTime(remaining)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#600202",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  timer: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default BlockedScreen;
