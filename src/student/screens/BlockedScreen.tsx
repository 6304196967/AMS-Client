// student/screens/BlockedScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, BackHandler } from "react-native";

type BlockedScreenProps = {
  navigation: any;
  route: { params: { classEndTime: number } };
};

const BlockedScreen: React.FC<BlockedScreenProps> = ({ navigation, route }) => {
  const { classEndTime } = route.params;
  const [remaining, setRemaining] = useState(classEndTime - Date.now());

  // Block hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => backHandler.remove();
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = classEndTime - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        navigation.replace("Home"); // unlock app after class end
      } else {
        setRemaining(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [classEndTime]);

  // Format time in mm:ss
  const formatTime = (ms: number) => {
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
  title: { fontSize: 28, fontWeight: "bold", color: "#FFF", marginBottom: 15, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#FFF", marginBottom: 20, textAlign: "center" },
  timer: { fontSize: 24, color: "#FFF", fontWeight: "bold" },
});

export default BlockedScreen;
