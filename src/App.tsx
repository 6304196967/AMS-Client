import React, { use, useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import HomeScreen from "./student/HomeScreen";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a type for the user info
type UserInfo = {
  name: string;
  email: string;
};

GoogleSignin.configure({
  webClientId: '188805815138-jua9enfk6oslbtol9cm49lrb4c83c8h8.apps.googleusercontent.com',
  offlineAccess: true,
});

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true); // to check AsyncStorage first

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedLoggedIn = await AsyncStorage.getItem("isLoggedIn");

        if (storedUser && storedLoggedIn === "true") {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return null; // or a splash/loading screen
  }

  return isLoggedIn && user ? (
    <HomeScreen user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
  ) : (
    <LandingPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
  );
};

export default App;