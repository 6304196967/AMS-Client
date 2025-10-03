import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";

// Admin Screens
import HomeScreen from "../faculty/HomeScreen";
import FacultyAnalytics from "../faculty/Analytics";
import Schedule from "../faculty/Schedule";
import Profile from "../admin/Profile";
import AttendanceStackNavigator from "./AttendanceStackNavigator";

const Tab = createBottomTabNavigator();

type FacultyNavigatorProps = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const FacultyNavigator: React.FC<FacultyNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
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
        if (route.name === "Schedule") iconName = "schedule";
        if (route.name === "Analytics") iconName = "analytics";
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#f5f5f5",
      tabBarInactiveTintColor: "gray",
      headerShown: true,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Schedule" component={Schedule} options={{title: 'Schedule Management', tabBarLabel: 'Schedule'}}/>
    <Tab.Screen name="Analytics" component={AttendanceStackNavigator} options={{title: 'Dashboard', tabBarLabel: 'Analytics'}} />
  </Tab.Navigator>
);

export default FacultyNavigator;