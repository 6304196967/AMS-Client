import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const staticSchedule = [
  { id: '1', subject: 'Math', time: '9:00 AM', location: 'Room 101', color: '#FF9800' },
  { id: '2', subject: 'Physics', time: '10:30 AM', location: 'Room 102', color: '#4CAF50' },
  { id: '3', subject: 'Chemistry', time: '1:00 PM', location: 'Room 103', color: '#2196F3' },
];

const HomeScreenStatic = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.greeting}>Hello, John!</Text>
      <Text style={styles.title}>Today's Schedule</Text>

      <FlatList
        data={staticSchedule}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.circle, { backgroundColor: item.color }]}>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.text}>
                <Icon name="clock" size={14} /> {item.time}   <Icon name="map-marker" size={14} /> {item.location}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.attendanceButton}
              onPress={() => navigation.navigate('Otp')}
            >
              <Text style={styles.buttonText}>Mark Attendance</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#600202', padding: 20 },
  greeting: { color: '#FFF', fontSize: 28, marginBottom: 10 },
  title: { color: '#FFF', fontSize: 24, marginBottom: 15, textDecorationLine: 'underline' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12, marginBottom: 12 },
  circle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  subject: { color: '#FFF', fontWeight: 'bold' },
  details: { flex: 1 },
  text: { color: '#FFF', fontSize: 14 },
  attendanceButton: { backgroundColor: '#28a745', padding: 6, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
});

export default HomeScreenStatic;
