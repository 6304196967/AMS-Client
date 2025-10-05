import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Dimensions } from 'react-native';
import { getUniqueId, getManufacturer } from 'react-native-device-info';

const amsLogo = require("../assets/images/rgukt_w.png");
const googleLogo = require("../assets/images/google.png");

type LandingPageProps = {
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ setIsLoggedIn, setUser }) => {

  const generateDeviceFingerprint = async (email: string): Promise<string> => {
    try {
      // Get device-specific information
      const deviceId = await getUniqueId();
      const manufacturer = await getManufacturer();
      
      const deviceInfo = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        deviceId: deviceId,
        manufacturer: manufacturer,
        screenSize: Dimensions.get('screen'),
        model: Platform.OS === 'ios' ? 'iOS' : 'Android', // You can get more specific if needed
        email: email.toLowerCase().trim()
      };

      // Create a hash of the device info
      const deviceString = JSON.stringify(deviceInfo);
      
      // Simple hash function (you might want to use a more secure one)
      let hash = 0;
      for (let i = 0; i < deviceString.length; i++) {
        const char = deviceString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return `bind_${Math.abs(hash).toString(16)}_${Date.now()}`;
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      // Fallback to a simpler fingerprint
      return `bind_fallback_${Platform.OS}_${email.toLowerCase().trim()}_${Date.now()}`;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // Extract user email(If userInfo, data and user are not null)
      const userEmail = userInfo?.data?.user?.email || "";

      // ✅ Restrict domain
      if (!userEmail.endsWith("@rguktrkv.ac.in")) {
        Alert.alert(
          "Access Denied",
          "Please use your College email"
        );
        await GoogleSignin.signOut();
        setIsLoggedIn(false);
        setUser(null);
        AsyncStorage.removeItem("user");
        AsyncStorage.removeItem("isLoggedIn");
        return;
      }

      // Login successful → notify App
      setIsLoggedIn(true);
      setUser({ name: userInfo?.data?.user?.familyName || "", email: userEmail });
      await AsyncStorage.setItem("user", JSON.stringify({ name: userInfo?.data?.user?.familyName || "", email: userEmail }));
      await AsyncStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={["#600202", "#353535"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Image source={amsLogo} style={styles.logoImage} />
      <Text style={styles.welcomeText}>Welcome to AMS</Text>
      <Text style={{ fontSize: 22, color: "#FFF", textAlign: "center", fontFamily: "QuicksandMedium", marginTop: -155 }}>
        RGUKT RK-VALLEY
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleGoogleLogin}>
        <Image source={googleLogo} style={styles.googleLogo} />
        <Text style={styles.loginButtonText}>LogIn with Google</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-around", padding: 20 },
  logoImage: { width: 150, height: 150, resizeMode: "contain", tintColor: "#FFF",marginTop:80 },
  welcomeText: { fontSize: 42, color: "#FFF", textAlign: "center", fontFamily: "QuicksandBold",marginTop:-100 },
  loginButton: { flexDirection: "row", backgroundColor: "#FFF", padding: 12, paddingLeft: 25, paddingRight: 25, borderRadius: 30, alignItems: "center", justifyContent: "center",marginBottom:40 },
  googleLogo: { width: 28, height: 28, marginRight: 15,marginTop:5 },
  loginButtonText: { fontSize: 25, color: "#600202", fontFamily: "QuicksandBold" },
});

export default LandingPage;
