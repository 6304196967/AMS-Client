import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const HistoryScreen = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Backend error state

  // Format date as YYYY-MM-DD
  const formatDate = (d) => d.toISOString().split("T")[0];
  const selectedDate = formatDate(date);

  // ------------------------------
  // Safe handling for backend data
  // ------------------------------
  const safeAttendanceHistory =
    attendanceHistory && typeof attendanceHistory === "object"
      ? attendanceHistory
      : {};

  const dataForDate = Array.isArray(safeAttendanceHistory[selectedDate])
    ? safeAttendanceHistory[selectedDate]
    : [];
  // ------------------------------

  // ------------------------------
  // Backend fetch
  // ------------------------------
  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch("http://your-backend-url/api/history") // <-- Replace with your backend URL
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setAttendanceHistory(data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend fetch error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);
  // ------------------------------

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Unable to fetch attendance data. Please check your backend connection.
        </Text>
        <Button title="Retry" onPress={() => {
          setLoading(true);
          setError(false);
          fetch("http://your-backend-url/api/history")
            .then(res => res.json())
            .then(data => {
              if (data && typeof data === "object") {
                setAttendanceHistory(data);
              } else {
                setError(true);
              }
              setLoading(false);
            })
            .catch(err => {
              console.error("Backend fetch error:", err);
              setError(true);
              setLoading(false);
            });
        }} />
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

      {/* Attendance List */}
      <Text style={styles.heading}>Attendance on {selectedDate}</Text>
      {dataForDate.length > 0 ? (
        <FlatList
          data={dataForDate}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.classCard,
                {
                  backgroundColor:
                    item.status === "Present" ? "#e8fbe8" : "#fde8e8",
                },
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
