import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";

const amsLogo = require("assets/images/rgukt_w.png");

// Type for schedule
type ScheduleItem = {
  id: string;
  subject: string;
  time: string;
  location: string;
  color: string;
};

// Props for HomeScreen
type HomeScreenProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
  navigation: NativeStackNavigationProp<StackParamList>;
};

// Card Component
const ClassScheduleCard = ({
  item,
  onDelete,
  isCR,
  onMarkAttendance,
}: {
  item: ScheduleItem;
  onDelete?: (id: string) => void;
  isCR: boolean;
  onMarkAttendance: (classEndTime: number) => void;
}) => (
  <View style={styles.card}>
    <View style={[styles.subjectCircle, { backgroundColor: item.color }]}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.classText}>(Class)</Text>
    </View>

    <View style={styles.cardDetails}>
      <Text style={styles.detailText}>
        <Icon name="clock" size={14} color="#FFF" /> {item.time}{"   "}{"\n"}
        <Icon name="map-marker" size={14} color="#FFF" /> {item.location}
      </Text>
    </View>

    {isCR && (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert("Delete Class", "Are you sure you want to delete this class?", [
            { text: "Cancel", style: "cancel" },
            { text: "OK", style: "destructive", onPress: () => onDelete && onDelete(item.id) },
          ])
        }
      >
        <Icon name="delete" size={22} color="#FFF" />
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={styles.attendanceButton}
      onPress={() => {
        const classEndTime = Date.now() + 60 * 60 * 1000;
        onMarkAttendance(classEndTime);
      }}
    >
      <Text style={styles.buttonText}>Mark{'\n'}Attendance</Text>
    </TouchableOpacity>
  </View>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ user, setIsLoggedIn, setUser, navigation }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newColor, setNewColor] = useState('#FF9800');
  const [crEmails, setCrEmails] = useState<string[]>([]);
  const [crLoading, setCrLoading] = useState(true);

  // 🔥 Logout Modal State
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutInput, setLogoutInput] = useState("");

  const fetchCREmails = async () => {
    try {
      setCrLoading(true);
      const response = await fetch("https://yourapi.com/cr-emails");
      const data = await response.json();
      setCrEmails(data);
    } catch (error) {
      console.error("Failed to fetch CR emails:", error);
      setCrEmails([]);
    } finally {
      setCrLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const storedSchedule = await AsyncStorage.getItem(`schedule_${user.email}`);
      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      } else {
        setSchedule([]);
      }
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    await AsyncStorage.setItem(`schedule_${user.email}`, JSON.stringify(newSchedule));
  };

  const addClass = () => {
    if (!newSubject || !newTime || !newLocation) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const newClass: ScheduleItem = {
      id: String(uuid.v4()),
      subject: newSubject,
      time: newTime,
      location: newLocation,
      color: newColor,
    };

    const updated = [...schedule, newClass];
    saveSchedule(updated);

    setModalVisible(false);
    setNewSubject('');
    setNewTime('');
    setNewLocation('');
    setNewColor('#FF9800');
  };

  const deleteClass = (id: string) => {
    const updated = schedule.filter(item => item.id !== id);
    saveSchedule(updated);
  };

  const handleMarkAttendance = (classEndTime: number) => {
    const generatedOTP = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigation.navigate("Otp", { generatedOTP, classEndTime });
  };

  const handleLogout = async () => {
    if (logoutInput.trim() === "I want to logout") {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      setLogoutModalVisible(false);
      setLogoutInput("");
    } else {
      Alert.alert("Error", "You must type exactly: I want to logout");
    }
  };

  useEffect(() => {
    fetchCREmails();
    fetchSchedule();
  }, []);

  const isCR = crEmails.includes(user.email);

  if (crLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={{ color: "#FFF", marginTop: 10 }}>Loading today's schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={amsLogo} style={styles.logo} />
          <Text style={styles.amsTitle}>AMS</Text>
        </View>

        <View style={styles.headerIcons}>
          <FontAwesomeIcon
            name="question-circle-o"
            size={28}
            color="#FFF"
            style={{ marginRight: 20 }}
          />
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)}>
            <Text style={{ color: "#FFF", fontSize: 16 }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.hr} />
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingHello}>Hello,</Text>
        <Text style={styles.greetingName}>{user.name}!</Text>
      </View>

      {/* Schedule Title */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.scheduleTitle}>Today's Schedule</Text>

        {isCR && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginRight: 15 }} onPress={() => setModalVisible(true)}>
              <Icon name="plus-circle" size={32} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="bell" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Schedule List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
      ) : schedule.length === 0 ? (
        <Text style={{ color: '#FFF', marginTop: 20 }}>No classes scheduled.</Text>
      ) : (
        <FlatList
          data={schedule}
          renderItem={({ item }) => (
            <ClassScheduleCard
              item={item}
              onDelete={deleteClass}
              isCR={isCR}
              onMarkAttendance={handleMarkAttendance}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal for Adding Class */}
      {isCR && (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Class</Text>
              <TextInput placeholder="Subject" value={newSubject} onChangeText={setNewSubject} style={styles.input} />
              <TextInput placeholder="Time" value={newTime} onChangeText={setNewTime} style={styles.input} />
              <TextInput placeholder="Location" value={newLocation} onChangeText={setNewLocation} style={styles.input} />
              <TextInput placeholder="Color (Hex)" value={newColor} onChangeText={setNewColor} style={styles.input} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                <TouchableOpacity style={styles.modalButton} onPress={addClass}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: 'red' }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={{ marginBottom: 10 }}>
              Please type <Text style={{ fontWeight: "bold" }}>"I want to logout"</Text> to confirm.
            </Text>
            <TextInput
              placeholder='Type here...'
              value={logoutInput}
              onChangeText={setLogoutInput}
              style={styles.input}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'red' }]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  setLogoutInput("");
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#600202", paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 },
  logo: { width: 60, height: 60, resizeMode: "contain" },
  amsTitle: { color: "#FFF", fontSize: 30, fontWeight: "bold", marginLeft: 0 },
  headerIcons: { flexDirection: "row" },
  greetingContainer: { marginTop: 20 },
  greetingHello: { color: "#FFF", fontSize: 28 },
  greetingName: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  scheduleTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginTop: 25, marginBottom: 15, textDecorationLine: "underline" },
  listContainer: { paddingBottom: 20 },
  card: { flexDirection: "row", alignItems: "center", marginBottom: 12, padding: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 15 },
  subjectCircle: { width: 90, height: 75, borderRadius: 35, justifyContent: "center", alignItems: "center", marginRight: 10 },
  subjectText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  classText: { color: "#FFF", fontSize: 12 },
  cardDetails: { flex: 1 },
  detailText: { color: "#FFF", fontSize: 14 },
  attendanceButton: { backgroundColor: "#28a745", paddingVertical: 4, paddingHorizontal: 6, borderRadius: 12, justifyContent: "center", alignItems: "center", minHeight: 35, marginLeft: 5 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 12, textAlign: "center" },
  deleteButton: { backgroundColor: "red", padding: 6, borderRadius: 8, marginRight: 3 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#FFF", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  hr: {
    height: 1,
    backgroundColor: "#CCC", // you can change to "#600202" for your theme
    marginTop: 1,
  },
  
  input: { borderWidth: 1, borderColor: "#CCC", borderRadius: 8, padding: 10, marginBottom: 10 },
  modalButton: { backgroundColor: "#28a745", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default HomeScreen;
