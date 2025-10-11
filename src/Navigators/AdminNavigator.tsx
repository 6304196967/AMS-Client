import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Image, StyleSheet } from 'react-native';
import { Text } from '../components';
import Icon from "react-native-vector-icons/MaterialIcons";
import { FONT_SIZES, SPACING } from '../utils/responsive';

// Admin Screens
import HomeScreen from "../admin/HomeScreen";
import FacultyManagement from "../admin/FacultyManagement";
import CrManagement from "../admin/CrManagement";
import ScheduleManagement from "../admin/ScheduleManagement";
import StudentManagement from "../admin/StudentManagement";
import Profile from "../admin/Profile";

const Tab = createBottomTabNavigator();

type AdminNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

// Header Logo Component for Admin
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

const AdminNavigator: React.FC<AdminNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
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
        if (route.name === "Home") iconName = "dashboard";
        if (route.name === "Student") iconName = "group";
        if (route.name === "Faculty") iconName = "school";
        if (route.name === "CR") iconName = "person-outline";
        if (route.name === "Schedule") iconName = "schedule";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#f5f5f5",
      tabBarInactiveTintColor: "gray",
      headerShown: true,
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
    />
    <Tab.Screen 
      name="Student" 
      component={StudentManagement} 
      options={{
        tabBarLabel: 'Student'
      }}
    />
    <Tab.Screen 
      name="Faculty" 
      component={FacultyManagement} 
      options={{
        tabBarLabel: 'Faculty'
      }}
    />
    <Tab.Screen 
      name="CR" 
      component={CrManagement} 
      options={{
        tabBarLabel: 'CR\'s'
      }}
    />
    <Tab.Screen 
      name="Schedule" 
      component={ScheduleManagement} 
      options={{
        tabBarLabel: 'Schedule'
      }}
    />
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

export default AdminNavigator;