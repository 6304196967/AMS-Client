// student/navigation/StudentNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";

// Student Screens
import HomeScreen from "../screens/HomeScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Profile from "../../admin/Profile";
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
    userEmail:string;      // FIXED: Added scheduleId
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

const StudentNavigator: React.FC<StudentNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs">
      {() => (
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
              if (route.name === "Analytics") iconName = "analytics";
              if (route.name === "History") iconName = "history";
              if (route.name === "Profile") iconName = "person";
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#f5f5f5",
            tabBarInactiveTintColor: "gray",
            headerShown: true,
          })}
        >
          <Tab.Screen 
            name="Home" 
            options={{
              title: 'Today\'s Schedule'
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
            component={AnalyticsScreen}
            options={{
              title: 'Analytics Dashboard'
            }}
          />
          
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{
              title: 'Attendance History'
            }}
          />
          
          <Tab.Screen 
            name="Profile"
            options={{
              title: 'Student Profile'
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
      )}
    </Stack.Screen>
    
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Biometric" component={BiometricScreen} />
    <Stack.Screen name="Blocked" component={BlockedScreen} />
  </Stack.Navigator>
);

export default StudentNavigator;