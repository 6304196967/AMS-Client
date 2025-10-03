// student/navigation/StudentNavigator.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
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
  <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <CustomTabBar {...props} />}>
    <Tab.Screen name="Home">{({ navigation }) => <HomeScreen user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} navigation={navigation} />}</Tab.Screen>
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const StudentNavigator: React.FC<Props> = ({ user, setIsLoggedIn, setUser }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs">{() => <Tabs user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />}</Stack.Screen>
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="Biometric" component={BiometricScreen} />
    <Stack.Screen name="Blocked" component={BlockedScreen} />
  </Stack.Navigator>
);

type CustomTabBarProps = { state: any; navigation: any };

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, navigation }) => {
  const icons = ["home-variant", "chart-bar", "history", "account-circle"];
  return (
    <View style={styles.navBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity key={route.key} style={isFocused ? styles.navItemActive : styles.navItem} onPress={() => navigation.navigate(route.name)}>
            <Icon name={icons[index]} size={30} color={isFocused ? "#FFF" : "#888"} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#1E1E1E", paddingVertical: 10, borderRadius: 25, marginHorizontal: 10, marginBottom: 10, position: "absolute", bottom: 10, left: 10, right: 10, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  navItem: { padding: 10 },
  navItemActive: { backgroundColor: "#555", borderRadius: 50, padding: 15 },
});

export default StudentNavigator;
