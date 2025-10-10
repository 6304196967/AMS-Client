// App.tsx

import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import LandingPage from "./LandingPage";
import AdminNavigator from "./Navigators/AdminNavigator";
import StudentNavigator from "./student/Navigators/StudentNavigator";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import FacultyNavigator from "./Navigators/FacultyNavigator";
import { setupForegroundNotificationHandler, setupNotificationOpenedHandler, setupPermissionMonitoring } from './utils/notificationService';
import { NotifierWrapper } from 'react-native-notifier';

// Type
type UserInfo = { name: string; email: string };

// Configure Google
GoogleSignin.configure({
  webClientId: '188805815138-jua9enfk6oslbtol9cm49lrb4c83c8h8.apps.googleusercontent.com',
  offlineAccess: true,
});

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (storedUser && storedLoggedIn === "true") {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Setup notification handlers when app loads
  useEffect(() => {
    // Handle foreground notifications with beautiful in-app banner
    const unsubscribeForeground = setupForegroundNotificationHandler();

    // Handle notification when app is opened from notification
    const unsubscribeOpened = setupNotificationOpenedHandler((notification) => {
      console.log('🔔 App opened from notification:', notification);
      
      // Navigate to home screen based on user type
      if (navigationRef.current && user) {
        const email = user.email;
        
        // Determine the home route based on user type
        let homeRoute = 'Home';
        
        if (email === "r210016@rguktrkv.a.in") {
          // Admin Navigator - has "Home" tab
          homeRoute = 'Home';
        } else if (email === "r210387@rguktrkv.ac.in") {
          // Faculty Navigator - has "Schedule" tab as home
          homeRoute = 'Schedule';
        } else if (email.endsWith("rguktrkv.ac.in")) {
          // Student Navigator - has "Home" tab
          homeRoute = 'Home';
        }
        
        // Navigate to home screen
        // Note: This navigates to the first tab in each navigator
        try {
          navigationRef.current.navigate(homeRoute);
          console.log(`✅ Navigated to ${homeRoute} screen`);
        } catch (error) {
          console.error('❌ Navigation error:', error);
          // Fallback: Just open the app, let user see their current screen
          console.log('ℹ️ App opened, showing current screen');
        }
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [user]);  // Setup permission monitoring for logged-in users
  useEffect(() => {
    if (user?.email) {
      const cleanup = setupPermissionMonitoring(user.email);
      
      return () => {
        cleanup();
      };
    }
  }, [user?.email]);

  if (loading) return null;

  const renderPortal = () => {
    if (!user) {
      return (
        <LandingPage
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      );
    }

    const email = user.email;

    if (email === "r210016@rguktrkv.ac.in") {
      return (
        <AdminNavigator
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      );
    }

    if (email === "r210387@rguktrkv.ac.in") {
      return (
        <FacultyNavigator
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      );
    }
    
    const isStudentEmail = /^r(20|21|22|23|24|25)\d+@rguktrkv\.ac\.in$/.test(email);
    
    if (isStudentEmail) {
      return (
        <StudentNavigator
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
        />
      );
    }
    
    

    return (
      <LandingPage
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
      />
    );
  };

  return (
    <NotifierWrapper>
      <NavigationContainer ref={navigationRef}>
        {isLoggedIn ? renderPortal() : (
          <LandingPage
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
          />
        )}
      </NavigationContainer>
    </NotifierWrapper>
  );
};

export default App;