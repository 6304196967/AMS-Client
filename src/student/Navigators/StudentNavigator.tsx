// student/navigation/StudentNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import HomeScreen from "../screens/HomeScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OtpScreen from "../screens/OtpScreen";
import BiometricScreen from "../screens/BiometricScreen";
import BlockedScreen from "../screens/BlockedScreen";

export type StackParamList = {
  Tabs: undefined;
  Otp: { generatedOTP: string; classEndTime: number };
  Biometric: { classEndTime: number };
  Blocked: { classEndTime: number };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<StackParamList>();

type Props = {
  user: { name: string; email: string };
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const Tabs: React.FC<Props> = ({ user, setIsLoggedIn, setUser }) => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false,
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
    }}
  >
    <Tab.Screen 
      name="Home" 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home-variant" size={size} color={color} />
        ),
      }}
    >
      {({ navigation }) => <HomeScreen user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} navigation={navigation} />}
    </Tab.Screen>
    
    <Tab.Screen 
      name="Analytics"
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-bar" size={size} color={color} />
        ),
      }}
    > 
      {() => <AnalyticsScreen user={user}/>} 
    </Tab.Screen>
    
    <Tab.Screen 
      name="History" 
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="history" size={size} color={color} />
        ),
      }}
    />
    
    <Tab.Screen 
      name="Profile"
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="account-circle" size={size} color={color} />
        ),
      }}
    >
      {() => <ProfileScreen user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const StudentNavigator: React.FC<Props> = ({ user, setIsLoggedIn, setUser }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs">
      {() => <Tabs user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
    </Stack.Screen>
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Biometric" component={BiometricScreen} />
    <Stack.Screen name="Blocked" component={BlockedScreen} />
  </Stack.Navigator>
);

export default StudentNavigator;