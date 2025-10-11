// student/navigation/StudentNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, Image } from 'react-native';
import { Text } from '../../components';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { spacing, FONT_SIZES, SPACING } from '../../utils/responsive';

// Student Screens
import HomeScreen from "../screens/HomeScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OtpScreen from "../screens/OtpScreen";
import BiometricScreen from "../screens/BiometricScreen";
import BlockedScreen from "../screens/BlockedScreen";
import Profile from "../../admin/Profile";

export type StackParamList = {
  Tabs: undefined;
  Otp: { 
    scheduleId: string;
    classEndTime: number; 
    userEmail: string;
    otpExpiryTime?: number;  // OTP expiry timestamp from backend (45s validity)
  };
  Biometric: { 
    classEndTime: number;
    scheduleId: string;
    userEmail: string;
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

// Header Logo Component
const HeaderLogo: React.FC = () => {
  return (
    <View style={styles.headerLogoContainer}>
      <Image 
        source={require('../../../assets/images/rgukt_w.png')} // Adjust path as needed
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.headerLogoText}>AMS-RKV</Text>
    </View>
  );
};

const Tabs: React.FC<StudentNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => {
  return (
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
      headerStyle: {
        backgroundColor: '#900a02', 
      },
      headerTintColor: '#f5f5f5',
      tabBarStyle: {
        backgroundColor: '#1E1E1E',
        borderTopWidth: 0,
        elevation: 0,
        height: spacing(70),
        paddingBottom: SPACING.sm,
        paddingTop: SPACING.sm,
      },
      tabBarActiveTintColor: '#FFF',
      tabBarInactiveTintColor: '#888',
      tabBarLabelStyle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
      },
      headerShown: true,
    })}
  >
    <Tab.Screen 
      name="Home" 
      options={{
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
  );
};

const StudentNavigator: React.FC<StudentNavigatorProps> = ({ user, setIsLoggedIn, setUser }) => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    <Stack.Screen name="Tabs">
      {() => <Tabs user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}
    </Stack.Screen>
    <Stack.Screen 
      name="Otp" 
      component={OtpScreen}
      options={{
        headerShown: false,
        headerTitle: () => <HeaderLogo />,
        headerStyle: {
          backgroundColor: '#900a02', 
        },
        headerTintColor: '#f5f5f5',
      }}
    />
    <Stack.Screen 
      name="Biometric" 
      component={BiometricScreen}
      options={{
        headerShown: false,
        headerTitle: () => <HeaderLogo />,
        headerStyle: {
          backgroundColor: '#900a02', 
        },
        headerTintColor: '#f5f5f5',
      }}
    />
    <Stack.Screen 
      name="Blocked" 
      component={BlockedScreen}
      options={{
        headerShown: true,
        headerTitle: () => <HeaderLogo />,
        headerStyle: {
          backgroundColor: '#900a02', 
        },
        headerTintColor: '#f5f5f5',
      }}
    />
  </Stack.Navigator>
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

export default StudentNavigator;