import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [overall, setOverall] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your real backend endpoint
        const response = await fetch("https://your-backend.com/api/student/attendance");
        const data = await response.json();

        setAttendanceData(data.subjects || []);
        setOverall(data.overall || 0);

        // Calculate total classes & attended classes
        let total = 0;
        let attended = 0;
        (data.subjects || []).forEach((subj) => {
          total += subj.total;
          attended += subj.attended;
        });

        setTotalClasses(total);
        setAttendedClasses(attended);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#900a02", "#600202"]} style={styles.container}>
        <ActivityIndicator size="large" color="#FFF" />
      </LinearGradient>
    );
  }

  // ✅ Pie Chart data (Presents vs Absents)
  const absents = totalClasses - attendedClasses;
  const chartData = [
    {
      name: "Presents",
      population: attendedClasses,
      color: "#00FF00", // Green
      legendFontColor: "#000",
      legendFontSize: 14,
    },
    {
      name: "Absents",
      population: absents,
      color: "#FF0000", // Red
      legendFontColor: "#000",
      legendFontSize: 14,
    },
  ];

  // Function to choose color based on percentage
  const getAttendanceColor = (percent) => {
    if (percent >= 75) return "#00FF00"; // Green
    if (percent >= 60) return "#FFD93D"; // Yellow
    return "#FF0000"; // Red
  };

  return (
    <LinearGradient
      colors={["#900a02", "#600202"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Attendance Stats</Text>

        {/* Overall Attendance */}
        <View style={styles.card}>
          <Text style={styles.tsubject}>
            Total Attendance -{" "}
            <Text style={{ ...styles.tvalue, color: getAttendanceColor(overall) }}>
              {overall}%
            </Text>
          </Text>
        </View>

        

        {/* Subject-wise Attendance */}
        <Text style={styles.subhead}>Subject-wise Attendance</Text>

        {attendanceData.map((subj, i) => {
          const percent = subj.total > 0 ? Math.round((subj.attended / subj.total) * 100) : 0;
          return (
            <View key={i} style={styles.card}>
              <Text style={styles.subject}>{subj.subject}</Text>
              <Text style={styles.detail}>
                Classes Attended: {subj.attended}/{subj.total}
              </Text>
              <Text style={{ ...styles.value, color: getAttendanceColor(percent) }}>
                {percent}%
              </Text>
            </View>
          );
        })}
        
        {/* ✅ Pie Chart (Overall) */}
        <View style={styles.chartWrapper}>
          <PieChart
            data={chartData}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black text
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  subhead: { textAlign: "center", fontSize: 25, color: "#FFF", fontWeight: "800", padding: 10, paddingBottom: 15 },
  container: { flex: 1, padding: 10, paddingBottom: 100 },
  title: { color: "#FFF", fontSize: 33, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: { backgroundColor: "rgba(255,255,255,0.1)", padding: 15, borderRadius: 15, marginBottom: 15 },
  tsubject: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  subject: { color: "#FFF", fontSize: 23, fontWeight: "bold" },
  detail: { color: "#FFF", fontSize: 14, marginTop: 5 },
  tvalue: { fontSize: 28, fontWeight: "bold", marginTop: 5 },
  value: { fontSize: 22, fontWeight: "bold", marginTop: 5 },
  chartWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
});

export default AnalyticsScreen;
