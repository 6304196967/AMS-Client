import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Profile Page (Coming Soon)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3a0ca3", justifyContent: "center", alignItems: "center" },
  text: { color: "#FFF", fontSize: 20 },
});

export default ProfileScreen;