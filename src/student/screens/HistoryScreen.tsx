import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Platform, ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const HistoryScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://your-backend-url/api/history")
      .then((res) => res.json())
      .then((data) => {
        setAttendanceHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const selectedDate = formatDate(date);
  const dataForDate = attendanceHistory[selectedDate] || [];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Picker */}
      <View style={styles.datePickerWrapper}>
        <Button title="Select Date" onPress={() => setShowPicker(true)} />
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={(event, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {/* Classes */}
      <Text style={styles.heading}>Attendance on {selectedDate}</Text>
      {dataForDate.length > 0 ? (
        <FlatList
          data={dataForDate}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.classCard,
                { backgroundColor: item.status === "Present" ? "#e8fbe8" : "#fde8e8" },
              ]}
            >
              <Text style={styles.subject}>{item.subject}</Text>
              <Text
                style={[
                  styles.status,
                  { color: item.status === "Present" ? "green" : "red" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text>No attendance records for this date</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 18, fontWeight: "bold", marginVertical: 12 },
  datePickerWrapper: { marginBottom: 16 },
  classCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subject: { fontSize: 16, fontWeight: "500" },
  status: { fontSize: 16, fontWeight: "bold" },
});

export default HistoryScreen;
