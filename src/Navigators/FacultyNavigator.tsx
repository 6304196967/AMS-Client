import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { FONT_SIZES, SPACING } from '../utils/responsive';

// Admin Screens
import HomeScreen from "../faculty/HomeScreen";
import Profile from "../admin/Profile";
import AttendanceStackNavigator from "./AttendanceStackNavigator";

const Tab = createBottomTabNavigator();

type FacultyNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

// Header Logo Component for Faculty
const HeaderLogo: React.FC = () => {
  return (
    <View style={styles.headerLogoContainer}>
      <Image 
        source={require('../../assets/images/rgukt_w.png')} // Adjust path as needed
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.headerLogoText}>AMS-RKV</Text>
    </View>
  );
};

const FacultyNavigator: React.FC<FacultyNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitle: () => <HeaderLogo />,
      headerRight: () => (
        <Profile 
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      ),
      tabBarStyle: {
        backgroundColor: '#600202', 
      },
      headerStyle: {
        backgroundColor: '#600202', 
      },
      headerTintColor: '#f5f5f5',
      tabBarIcon: ({ color, size }) => {
        let iconName: string = "home";
        if (route.name === "Schedule") iconName = "schedule";
        if (route.name === "Analytics") iconName = "analytics";
        if (route.name === "Attendance") iconName = "check-circle";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#f5f5f5",
      tabBarInactiveTintColor: "gray",
      headerShown: true,
    })}
  >
    <Tab.Screen 
      name="Schedule"
      options={{
        tabBarLabel: 'Schedule'
      }}
    >
      {() => (
        <HomeScreen 
          userEmail={user.email}
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      )}
    </Tab.Screen>
    
    <Tab.Screen 
      name="Analytics" 
      options={{
        tabBarLabel: 'Analytics'
      }}
    >
      {() => (
        <AttendanceStackNavigator 
          userEmail={user.email}
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: SPACING.sm,
  },
  headerLogoText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default FacultyNavigator;