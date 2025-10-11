import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { Text } from './components'; // Custom Text with font scaling disabled
import LinearGradient from "react-native-linear-gradient";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerFCMToken, requestNotificationPermission } from './utils/notificationService';
import { validateDeviceBinding } from './utils/deviceBindingService';
import { wp, hp, fontSize, spacing, FONT_SIZES, SPACING } from './utils/responsive';

const amsLogo = require("../assets/images/rgukt_w.png");
const googleLogo = require("../assets/images/google.png");

type LandingPageProps = {
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ setIsLoggedIn, setUser }) => {

  /**
   * ROBUST LOGIN FLOW WITH BACKEND DEVICE BINDING
   * 
   * Step 1: Sign out first to force account selection
   * Step 2: User clicks login → Google account picker appears
   * Step 3: Check if email ends with @rguktrkv.ac.in
   * Step 4: Validate device binding with backend
   *         - Generates hardware-based device fingerprint
   *         - Checks backend: Is this device bound to any email?
   *         - If YES: Only allow that email to login
   *         - If NO: Bind device to current email in backend
   * Step 5: Save user data and login
   * Step 6: Register FCM token for notifications (optional, non-blocking)
   * 
   * Security: Device binding is stored in backend database
   *          - Cannot be bypassed by clearing app storage
   *          - Cannot be bypassed by uninstalling app
   *          - Uses hardware identifiers (persistent)
   */
  const handleGoogleLogin = async () => {
    try {
      // Check if Google Play Services available
      await GoogleSignin.hasPlayServices();
      
      // IMPORTANT: Sign out first to force account selection
      await GoogleSignin.signOut();
      
      // Show Google Sign-In (user can choose account)
      const userInfo = await GoogleSignin.signIn();
      
      // Get user email and name
      const userEmail = userInfo?.data?.user?.email || "";
      const userName = userInfo?.data?.user?.familyName || "";

      // Check college email domain
      if (!userEmail.endsWith("@rguktrkv.ac.in")) {
        Alert.alert(
          "Access Denied",
          "Please use your RGUKT RK Valley College email (@rguktrkv.ac.in)"
        );
        await GoogleSignin.signOut();
        return;
      }

      // Validate device binding with backend
      const bindingResult = await validateDeviceBinding(userEmail);
      
      if (!bindingResult.allowed) {
        // Device is bound to a different email
        Alert.alert(
          "Device Already Registered",
          bindingResult.message || "This device is registered to another account.",
          [{ text: "OK" }]
        );
        await GoogleSignin.signOut();
        return;
      }
      
      if (bindingResult.message) {
        // Warning message (e.g., network error but allowed)
        console.warn('⚠️', bindingResult.message);
      }


      // Save user data
      setIsLoggedIn(true);
      setUser({ name: userName, email: userEmail });
      await AsyncStorage.setItem("user", JSON.stringify({ name: userName, email: userEmail }));
      await AsyncStorage.setItem("isLoggedIn", "true");



      // Register FCM token for push notifications (optional)
      try {
        const permissionGranted = await requestNotificationPermission();
        
        if (permissionGranted) {
          await registerFCMToken(userEmail);
        } else {
          await registerFCMToken(userEmail); // Store for retry
        }
      } catch (fcmError) {
        console.error('⚠️ FCM setup failed (non-critical):', fcmError);
        // Login still succeeds
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.error('User cancelled login');
      }
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
