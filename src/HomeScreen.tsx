import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";

const amsLogo = require("../assets/images/rgukt_w.png"); // your college logo

// Define the type for a single schedule item
type ScheduleItem = {
  id: string;
  subject: string;
  color: string;
  time: string;
  location: string;
};

// Data for the schedule list
const scheduleData: ScheduleItem[] = [
  {
    id: '1',
    subject: 'DBMS',
    color: '#00BCD4',
    time: '09:30 to 10:30',
    location: 'Small Seminar Hall',
  },
  {
    id: '2',
    subject: 'OS',
    color: '#FFC107',
    time: '09:30 to 10:30',
    location: 'Small Seminar Hall',
  },
  {
    id: '3',
    subject: 'CN',
    color: '#9E9E9E',
    time: '09:30 to 10:30',
    location: 'Small Seminar Hall',
  },
  {
    id: '4',
    subject: 'COA',
    color: '#E91E63',
    time: '09:30 to 10:30',
    location: 'Small Seminar Hall',
  },
];

// Define props for the ClassScheduleCard component
type ClassScheduleCardProps = {
  item: ScheduleItem;
};

// Define props for the UserInfo
type HomeScreenProps = {
  user: {
    name: string;
    email: string;
  };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

// A dedicated component for rendering each class card
const ClassScheduleCard: React.FC<ClassScheduleCardProps> = ({ item }) => (
  <View style={styles.card}>
    <View style={[styles.subjectCircle, { backgroundColor: item.color }]}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.classText}>(Class)</Text>
    </View>
    <View style={styles.cardDetails}>
      <Text style={styles.detailText}>Timing: {item.time}</Text>
      <View style={styles.locationContainer}>
        <Icon name="map-marker" size={16} color="#FFF" />
        <Text style={[styles.detailText, { marginLeft: 5 }]}>{item.location}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.attendanceButton}>
      <Text style={styles.buttonText}>Mark</Text>
      <Text style={styles.buttonText}>Attendance</Text>
      <Icon name="account-arrow-right" size={24} color="#FFF" style={{ marginTop: 4 }} />
    </TouchableOpacity>
  </View>
);



const HomeScreen: React.FC<HomeScreenProps> = ({ user, setIsLoggedIn, setUser }) => {

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      setUser(null); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        {/* You should replace this with your actual logo asset */}
        <Image
          source={amsLogo} // Placeholder
          style={styles.logo}
        />
        <View style={styles.headerIcons}>
          <FontAwesomeIcon name="question-circle-o" size={30} color="#FFF" style={{ marginRight: 20 }} />
                  
        <TouchableOpacity
          onPress={async () => {
            await handleLogout();
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
        </View>
      </View>
      
      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingHello}>Hello,</Text>
        <Text style={styles.greetingName}>{user.name}!</Text>
      </View>
      
      {/* Schedule Title */}
      <Text style={styles.scheduleTitle}>Today's Schedule</Text>
      
      {/* Schedule List */}
      <FlatList
        data={scheduleData}
        renderItem={({ item }) => <ClassScheduleCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItemActive}>
          <Icon name="home-variant" size={30} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chart-bar" size={30} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="history" size={30} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-circle" size={30} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a0ca3', // Dark background color from the image
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    // In the UI the logo is white, so you might need a tint color
    // tintColor: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  greetingContainer: {
    marginTop: 20,
  },
  greetingHello: {
    color: '#FFF',
    fontSize: 28,
  },
  greetingName: {
    color: '#FFF', // Keeping it white for better contrast
    fontSize: 32,
    fontWeight: 'bold',
  },
  scheduleTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    textDecorationLine: 'underline',
  },
  listContainer: {
    paddingBottom: 20,
  },
  // Class Card Styles
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight transparent background
    borderRadius: 20,
  },
  subjectCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  subjectText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  classText: {
    color: '#FFF',
    fontSize: 12,
  },
  cardDetails: {
    flex: 1,
  },
  detailText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Bottom Nav Bar Styles
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  navItem: {
    padding: 10,
  },
  navItemActive: {
    backgroundColor: '#555',
    borderRadius: 50,
    padding: 15,
  },
});

export default HomeScreen;