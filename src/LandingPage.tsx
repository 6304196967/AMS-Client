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
import { registerFCMToken } from './utils/notificationService';
import { wp, hp, fontSize, spacing, FONT_SIZES, SPACING } from './utils/responsive';

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

      // Register FCM token for push notifications
      try {
        await registerFCMToken(userEmail);
        console.log('✅ FCM token registration initiated');
      } catch (error) {
        console.error('⚠️ Failed to register FCM token:', error);
        // Don't block login if FCM registration fails
      }
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
      <Text style={styles.subtitle}>
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
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "space-around", 
    padding: spacing(20) 
  },
  logoImage: { 
    width: wp(35), 
    height: wp(35), 
    resizeMode: "contain", 
    tintColor: "#FFF",
    marginTop: hp(8) 
  },
  welcomeText: { 
    fontSize: FONT_SIZES.display, 
    color: "#FFF", 
    textAlign: "center", 
    fontFamily: "QuicksandBold",
    marginTop: hp(-10) 
  },
  subtitle: {
    fontSize: fontSize(22),
    color: "#FFF",
    textAlign: "center",
    fontFamily: "QuicksandMedium",
    marginTop: hp(-15.5)
  },
  loginButton: { 
    flexDirection: "row", 
    backgroundColor: "#FFF", 
    padding: spacing(12), 
    paddingLeft: spacing(25), 
    paddingRight: spacing(25), 
    borderRadius: 30, 
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: hp(4) 
  },
  googleLogo: { 
    width: wp(7), 
    height: wp(7), 
    marginRight: spacing(15),
    marginTop: spacing(5) 
  },
  loginButtonText: { 
    fontSize: fontSize(25), 
    color: "#600202", 
    fontFamily: "QuicksandBold" 
  },
});

export default LandingPage;
