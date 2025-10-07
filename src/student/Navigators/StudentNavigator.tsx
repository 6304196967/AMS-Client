// student/navigation/StudentNavigator.tsx
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, TouchableOpacity, StyleSheet, Modal, Text, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

// Student Screens
import HomeScreen from "../screens/HomeScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OtpScreen from "../screens/OtpScreen";
import BiometricScreen from "../screens/BiometricScreen";
import BlockedScreen from "../screens/BlockedScreen";

export type StackParamList = {
  Tabs: undefined;
  Otp: { 
    scheduleId: string;      // FIXED: Changed from generatedOTP to scheduleId
    classEndTime: number; 
    userEmail: string;      // FIXED: Added userEmail
  };
  Biometric: { 
    classEndTime: number;
    scheduleId: string;
    userEmail: string;      // FIXED: Added scheduleId
  };
  Blocked: { classEndTime: number };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<StackParamList>();

type StudentNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

// Student Header Profile Component
const StudentHeaderProfile: React.FC<{
  user: { name: string; email: string };
  onLogoutPress: () => void;
}> = ({ user, onLogoutPress }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginRight: 10 }}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.profileButton}
      >
        <MaterialIcon name="person" size={28} color="#f5f5f5" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.userInfo}>
              <MaterialIcon name="person" size={20} color="#600202" />
              <Text style={styles.usernameDropdown}>
                {user?.name || 'User'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={() => {
                setOpen(false);
                onLogoutPress();
              }}
            >
              <MaterialIcon name="logout" size={20} color="red" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const Tabs: React.FC<StudentNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutInput, setLogoutInput] = useState("");

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
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

  return (
  <>
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      headerRight: () => (
        <StudentHeaderProfile 
          user={user}
          onLogoutPress={handleLogoutPress}
        />
      ),
      headerStyle: {
        backgroundColor: '#900a02', 
      },
      headerTintColor: '#f5f5f5',
      tabBarStyle: {
        backgroundColor: '#1E1E1E',
        borderTopWidth: 0,
        elevation: 0,
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#FFF',
      tabBarInactiveTintColor: '#888',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerShown: true,
    })}
  >
    <Tab.Screen 
      name="Home" 
      options={{
        title: 'Today\'s Schedule',
        tabBarIcon: ({ color, size }) => (
          <Icon name="home-variant" size={size} color={color} />
        ),
      }}
    >
      {({ navigation }) => (
        <HomeScreen 
          user={user} 
          setIsLoggedIn={setIsLoggedIn} 
          setUser={setUser} 
          navigation={navigation} 
        />
      )}
    </Tab.Screen>
    
    <Tab.Screen 
      name="Analytics" 
      options={{
        title: 'Analytics Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-bar" size={size} color={color} />
        ),
      }}
    > 
      {() => <AnalyticsScreen user={user}/>} 
    </Tab.Screen>
    
    <Tab.Screen 
      name="History" 
      options={{
        title: 'Attendance History',
        tabBarIcon: ({ color, size }) => (
          <Icon name="history" size={size} color={color} />
        ),
      }}
    > 
      {() => <HistoryScreen user={user}/>} 
    </Tab.Screen>
    
    <Tab.Screen 
      name="Profile"
      options={{
        title: 'Student Profile',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon name="account-circle" size={size} color={color} />
        ),
      }}
    >
      {() => (
        <ProfileScreen
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      )}
    </Tab.Screen>
  </Tab.Navigator>
  
  {/* Global Logout Modal */}
  <Modal
    transparent
    visible={logoutModalVisible}
    animationType="slide"
    onRequestClose={() => setLogoutModalVisible(false)}
  >
    <View style={styles.logoutModalOverlay}>
      <View style={styles.logoutModalContent}>
        <Text style={styles.logoutModalTitle}>Confirm Logout</Text>
        <Text style={{ marginBottom: 10 }}>
          Please type <Text style={{ fontWeight: "bold" }}>"I want to logout"</Text> to confirm.
        </Text>
        <TextInput
          placeholder="Type here..."
          value={logoutInput}
          onChangeText={setLogoutInput}
          style={styles.logoutModalInput}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.logoutModalButton, { backgroundColor: "red" }]}
            onPress={() => {
              setLogoutModalVisible(false);
              setLogoutInput("");
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutModalButton} onPress={handleLogout}>
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  </>
  );
};

const StudentNavigator: React.FC<StudentNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs">
      {() => <Tabs user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
    </Stack.Screen>
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Biometric" component={BiometricScreen} />
    <Stack.Screen name="Blocked" component={BlockedScreen} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdown: {
    marginTop: 60,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 180,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  usernameDropdown: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    maxWidth: 150,
    flexWrap: 'wrap',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    color: "red",
    fontWeight: "500",
  },
  // Logout Modal Styles (matching ProfileScreen)
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutModalContent: { 
    width: "85%", 
    backgroundColor: "#FFF", 
    borderRadius: 12, 
    padding: 20 
  },
  logoutModalTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 15, 
    textAlign: "center" 
  },
  logoutModalInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  logoutModalButton: { 
    backgroundColor: "#28a745", 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
});

export default StudentNavigator;