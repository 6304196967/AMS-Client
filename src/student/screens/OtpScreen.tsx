// student/screens/OtpScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, BackHandler, ActivityIndicator, AppState, AppStateStatus, Platform, Modal, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParamList } from "../Navigators/StudentNavigator";
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioCheckModule from '../../modules/AudioCheckModule';

type Props = NativeStackScreenProps<StackParamList, "Otp">;

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scheduleId, classEndTime, userEmail, otpExpiryTime } = route.params;
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(35);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);
  
  // New state for waiting phase after OTP entry
  const [isWaitingForExpiry, setIsWaitingForExpiry] = useState(false);
  const [waitingTimer, setWaitingTimer] = useState(0);
  
  // Enhanced security state management
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [hasLeftScreen, setHasLeftScreen] = useState(false);
  const [securityViolation, setSecurityViolation] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const otpExpiryTimeRef = useRef<number>(otpExpiryTime || Date.now() + 35000); // Fixed 35s expiry
  const backgroundTimeRef = useRef<number | null>(null);
  const leftScreenCount = useRef(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const biometricNavigationTimerRef = useRef<any>(null); // Track biometric navigation timer

  // ===== HELPER: Mark schedule as violated =====
  const markScheduleAsViolated = async () => {
    try {
      await AsyncStorage.setItem(`violated_${scheduleId}`, Date.now().toString());
    } catch (error) {
      console.error('Error marking schedule as violated:', error);
    }
  };

  // ===== HELPER: Safe navigation back to HomeScreen =====
  const navigateBackToHome = () => {
    // Cancel any pending biometric navigation
    if (biometricNavigationTimerRef.current) {
      clearTimeout(biometricNavigationTimerRef.current);
      biometricNavigationTimerRef.current = null;
    }
    
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // If can't go back, navigate to Tabs (which contains Home)
        navigation.navigate('Tabs' as never);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try to navigate to Tabs
      navigation.navigate('Tabs' as never);
    }
  };

  // ===== COMPREHENSIVE SECURITY CHECK ON MOUNT =====
  useEffect(() => {
    const performSecurityChecks = async () => {
      try {
        const initialState = AppState.currentState;
        
        // Check if app is not active
        if (initialState !== 'active') {
          setSecurityViolation('Cannot enter OTP verification while on a call or with app in background');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          
          markScheduleAsViolated();
          
          setTimeout(() => {
            navigateBackToHome();
          }, 3000);
          return;
        }

        // Run all security checks
        const [
          isCallActive,
          isMicInUse,
          isScreenMirroring,
          hasOverlay,
          isRooted,
          hasAccessibility
        ] = await Promise.all([
          AudioCheckModule.isCallActive(),
          AudioCheckModule.isMicrophoneInUse(),
          AudioCheckModule.isScreenMirroring(),
          AudioCheckModule.hasOverlayPermission(),
          AudioCheckModule.isDeviceRooted(),
          AudioCheckModule.isAccessibilityServiceEnabled()
        ]);
        
        
        // Check for active call or microphone usage
        if (isCallActive || isMicInUse) {
          setSecurityViolation('Cannot enter OTP verification while on an active call');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          markScheduleAsViolated();
          setTimeout(() => navigateBackToHome(), 3000);
          return;
        }

        // Check for screen mirroring
        if (isScreenMirroring) {
          setSecurityViolation('Screen mirroring detected - Please disconnect and try again');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          markScheduleAsViolated();
          setTimeout(() => navigateBackToHome(), 3000);
          return;
        }

        // Check for rooted device
        if (isRooted) {
          setSecurityViolation('Rooted device detected - Cannot proceed with OTP verification');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          markScheduleAsViolated();
          setTimeout(() => navigateBackToHome(), 3000);
          return;
        }

        // Warn about overlay permission (don't block, just log)
        if (hasOverlay) {
          console.warn('⚠️ Overlay permission detected - potential security risk');
        }

        // Warn about accessibility services (don't block, just log)
        if (hasAccessibility) {
          console.warn('⚠️ Accessibility services enabled - potential security risk');
        }
        
      } catch (error) {
        console.error('Error during security checks:', error);
        // If native module fails, fall back to AppState check only
        const initialState = AppState.currentState;
        if (initialState !== 'active') {
          setSecurityViolation('Cannot enter OTP verification while on a call or with app in background');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          
          markScheduleAsViolated();
          
          setTimeout(() => {
            navigateBackToHome();
          }, 3000);
        }
      }
    };

    performSecurityChecks();
  }, [navigation]);

  // ===== ULTRA STRICT SECURITY: Monitor App State =====
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {

      // Detect ANY movement away from active state
      if (appState.current === 'active' && nextAppState !== 'active') {
        leftScreenCount.current += 1;
        backgroundTimeRef.current = Date.now();
        
        const violationType = nextAppState === 'background' 
          ? 'You minimized the app or switched to another app'
          : 'You received a call, notification, or left the screen';
        
        setSecurityViolation(violationType);
        setHasLeftScreen(true);
        setShowViolationModal(true);
        
        markScheduleAsViolated();
        
        // Exit OTP screen after 2 seconds
        setTimeout(() => {
          navigateBackToHome();
        }, 2000);
      }
      
      // If they return after leaving, still exit
      if (appState.current !== 'active' && nextAppState === 'active' && hasLeftScreen) {
        setTimeout(() => {
          navigateBackToHome();
        }, 1000);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [navigation, hasLeftScreen]);

  // Block hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Show professional modal instead of alert
      setSecurityViolation('Back navigation is blocked during OTP verification');
      setShowViolationModal(true);
      setTimeout(() => setShowViolationModal(false), 2000);
      return true; // Prevent back navigation
    });
    return () => backHandler.remove();
  }, []);

  // ===== PERIODIC SECURITY MONITORING =====
  useEffect(() => {
    if (hasLeftScreen) {
      return;
    }

    const securityCheckInterval = setInterval(async () => {
      try {
        const [isCallActive, isMicInUse, isScreenMirroring] = await Promise.all([
          AudioCheckModule.isCallActive(),
          AudioCheckModule.isMicrophoneInUse(),
          AudioCheckModule.isScreenMirroring()
        ]);
        
        if (isCallActive || isMicInUse) {
          
          setSecurityViolation('Call detected - You cannot be on a call during OTP verification');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          
          markScheduleAsViolated();
          
          setTimeout(() => {
            navigateBackToHome();
          }, 2500);
          
          clearInterval(securityCheckInterval);
          return;
        }

        if (isScreenMirroring) {
          
          setSecurityViolation('Screen mirroring detected - Please disconnect immediately');
          setHasLeftScreen(true);
          setShowViolationModal(true);
          
          markScheduleAsViolated();
          
          setTimeout(() => {
            navigateBackToHome();
          }, 2500);
          
          clearInterval(securityCheckInterval);
        }
      } catch (error) {
        console.error('Error during security monitoring:', error);
      }
    }, 1000); // Check every second

    return () => clearInterval(securityCheckInterval);
  }, [hasLeftScreen]);

  // ===== ENHANCED TIMER: 35-second countdown with backend expiry =====
  useEffect(() => {
    if (hasLeftScreen || isWaitingForExpiry) {
      return;
    }

    // Calculate remaining time from backend OTP expiry
    const now = Date.now();
    const remainingMs = otpExpiryTimeRef.current - now;
    const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
    

    if (remainingSec <= 0) {
      setSecurityViolation('OTP has already expired - Please request a new OTP');
      setHasLeftScreen(true);
      setShowViolationModal(true);
      
      markScheduleAsViolated();
      
      setTimeout(() => {
        navigateBackToHome();
      }, 2500);
      return;
    }

    // Set initial timer to minimum of 35 seconds or actual remaining time
    const initialTimer = Math.min(35, remainingSec);
    setTimer(initialTimer);
    startTimeRef.current = now;
    
    // Update the expiry time reference if we're giving them 35 seconds
    if (initialTimer === 35 && remainingSec > 35) {
      otpExpiryTimeRef.current = now + 35000;
    }

    const interval = setInterval(() => {
      const currentNow = Date.now();
      const currentRemaining = Math.max(0, Math.floor((otpExpiryTimeRef.current - currentNow) / 1000));
      
      if (currentRemaining <= 0) {
        setTimer(0);
        setSecurityViolation('Time expired - OTP is no longer valid');
        setHasLeftScreen(true);
        setShowViolationModal(true);
        
        markScheduleAsViolated();
        
        setTimeout(() => {
          navigateBackToHome();
        }, 2500);
        
        clearInterval(interval); // Stop the interval
      } else {
        setTimer(currentRemaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasLeftScreen, isWaitingForExpiry, navigation]);

  // ===== WARNING DISPLAY =====
  useEffect(() => {
    if (timer <= 10 && !hasLeftScreen && !isWaitingForExpiry) {
      setShowWarning(true);
    }
  }, [timer, hasLeftScreen, isWaitingForExpiry]);

  // ===== WAITING PHASE TIMER: After OTP entry, wait until backend expiry =====
  useEffect(() => {
    if (!isWaitingForExpiry || hasLeftScreen) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = otpExpiryTimeRef.current - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      
      setWaitingTimer(remainingSec);
      
      if (remainingSec <= 0) {
        clearInterval(interval);
        
        // OTP has expired on backend, now navigate to biometric
        
        // Double-check no violation occurred during wait
        if (!hasLeftScreen) {
          navigation.replace("Biometric", { 
            classEndTime,
            scheduleId,
            userEmail
          });
        } else {
          navigateBackToHome();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isWaitingForExpiry, hasLeftScreen, navigation]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      // Cancel pending biometric navigation when component unmounts
      if (biometricNavigationTimerRef.current) {
        clearTimeout(biometricNavigationTimerRef.current);
        biometricNavigationTimerRef.current = null;
      }
    };
  }, []);

  const verifyOtpWithBackend = async (enteredOTP: string) => {
    try {
      setIsVerifying(true);
      
      // Check if already violated (shouldn't happen, but safety check)
      if (hasLeftScreen) {
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/attendance/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduleId: scheduleId,
          otp: enteredOTP
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear violation flag on successful verification
        await AsyncStorage.removeItem(`violated_${scheduleId}`);
                
        // Calculate remaining time until backend OTP expires
        const now = Date.now();
        const remainingMs = otpExpiryTimeRef.current - now;
        const remainingSec = Math.ceil(remainingMs / 1000);
                
        // Switch to waiting mode - student must wait until OTP expires on backend
        setIsWaitingForExpiry(true);
        setWaitingTimer(remainingSec);
        
        // The waiting phase timer effect will handle navigation to biometric
        // when the backend OTP actually expires
      } else {
        resetOtpFields();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      resetOtpFields();
    } finally {
      setIsVerifying(false);
    }
  };

  const resetOtpFields = () => {
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    if (hasLeftScreen) return;
    
    if (/^[a-zA-Z0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (index < 5 && text) {
        inputsRef.current[index + 1]?.focus();
      }

      if (text === "" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

      if (index === 5 && newOtp.every(d => d !== "")) {
        const enteredOTP = newOtp.join("");
        verifyOtpWithBackend(enteredOTP);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-character OTP from teacher's screen</Text>

      {/* Warning Messages */}
      {showWarning && !hasLeftScreen && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ HURRY! Only {timer} seconds left!</Text>
        </View>
      )}

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              (isVerifying || hasLeftScreen) && styles.disabledInput,
              timer <= 5 && !hasLeftScreen && styles.urgentInput
            ]}
            value={digit}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
            onChangeText={text => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!isVerifying && !hasLeftScreen}
            selectTextOnFocus={!isVerifying && !hasLeftScreen}
          />
        ))}
      </View>

      {isVerifying && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Verifying OTP...</Text>
        </View>
      )}
      
      {/* Waiting Phase Display */}
      {isWaitingForExpiry && !hasLeftScreen && (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingTitle}>✅ OTP Verified Successfully!</Text>
          <Text style={styles.waitingMessage}>
            Please wait for OTP to expire on server...
          </Text>
          <View style={styles.waitingTimerBox}>
            <Text style={styles.waitingTimerLabel}>Time until biometric:</Text>
            <Text style={styles.waitingTimer}>{waitingTimer}s</Text>
          </View>
          <Text style={styles.waitingSubtext}>
            Security measure - Even fast entry requires full OTP lifetime
          </Text>
        </View>
      )}
      
      {/* Timer Display - Only show during OTP entry phase */}
      {!isWaitingForExpiry && (
        <View style={styles.timerContainer}>
          <Text style={[
            styles.timer,
            timer <= 10 && styles.timerUrgent,
            timer <= 5 && styles.timerCritical
          ]}>
            {hasLeftScreen ? 'FAILED' : `Time: ${timer}s`}
          </Text>
          {!hasLeftScreen && (
            <Text style={styles.timerSubtext}>
              Enter OTP within this time limit
            </Text>
          )}
        </View>
      )}

      {/* Professional Violation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showViolationModal}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>🚨</Text>
            </View>
            <Text style={styles.modalTitle}>Security Violation</Text>
            <Text style={styles.modalMessage}>{securityViolation}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalSubtext}>
              Attendance verification failed
            </Text>
            <Text style={styles.modalFooter}>
              Returning to previous screen...
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#600202", 
    paddingTop: spacing(100),
    paddingHorizontal: SPACING.lg,
    paddingBottom: spacing(180) // Space for instructions at bottom
  },
  securityBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: spacing(15),
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5
  },
  securityBannerText: {
    color: '#2E7D32',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: spacing(4)
  },
  securitySubtext: {
    color: '#424242',
    fontSize: FONT_SIZES.xs,
    opacity: 0.8
  },
  title: { 
    fontSize: FONT_SIZES.heading, 
    fontWeight: "bold", 
    color: "#FFF", 
    marginBottom: spacing(8),
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: FONT_SIZES.md, 
    color: "#FFF", 
    marginBottom: spacing(25), 
    textAlign: "center",
    opacity: 0.9,
    paddingHorizontal: spacing(10)
  },
  warningContainer: {
    backgroundColor: '#FFFFFF',
    padding: spacing(15),
    borderRadius: 12,
    marginBottom: spacing(15),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    marginHorizontal: spacing(10),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  warningText: {
    color: '#E65100',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  otpContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginBottom: spacing(20),
    marginTop: spacing(10)
  },
  otpInput: { 
    width: 45, 
    height: 55, 
    marginHorizontal: spacing(5), 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: "#FFF", 
    textAlign: "center", 
    fontSize: FONT_SIZES.xxl, 
    fontWeight: "bold", 
    color: "#FFF", 
    backgroundColor: "rgba(255,255,255,0.1)" 
  },
  disabledInput: {
    opacity: 0.4,
    borderColor: '#666'
  },
  urgentInput: {
    borderColor: '#FF4500',
    borderWidth: 3,
    backgroundColor: "rgba(255,69,0,0.2)"
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: spacing(20),
    marginBottom: spacing(30)
  },
  timer: { 
    color: "#FFF", 
    fontSize: FONT_SIZES.xxl, 
    fontWeight: 'bold',
    marginBottom: spacing(8)
  },
  timerUrgent: {
    color: '#FFA500'
  },
  timerCritical: {
    color: '#FF0000',
    fontSize: FONT_SIZES.xxxl || FONT_SIZES.xxl * 1.2
  },
  timerSubtext: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: spacing(20)
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing(15)
  },
  loadingText: {
    color: '#FFF',
    marginTop: spacing(10),
    fontSize: FONT_SIZES.md
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: spacing(15),
    left: spacing(15),
    right: spacing(15),
    backgroundColor: '#FFFFFF',
    padding: spacing(15),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    maxHeight: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5
  },
  instructionTitle: {
    color: '#D32F2F',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginBottom: spacing(8),
    textAlign: 'center'
  },
  instructionText: {
    color: '#424242',
    fontSize: FONT_SIZES.xs,
    marginBottom: spacing(4),
    opacity: 0.9
  },
  instructionWarning: {
    color: '#E65100',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    marginTop: spacing(8),
    textAlign: 'center'
  },
  // Professional Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(20)
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing(30),
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing(20)
  },
  modalIconText: {
    fontSize: 50
  },
  modalTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: spacing(15),
    textAlign: 'center'
  },
  modalMessage: {
    fontSize: FONT_SIZES.md,
    color: '#424242',
    textAlign: 'center',
    marginBottom: spacing(20),
    lineHeight: 22
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: spacing(15)
  },
  modalSubtext: {
    fontSize: FONT_SIZES.md,
    color: '#757575',
    fontWeight: '600',
    marginBottom: spacing(10),
    textAlign: 'center'
  },
  modalFooter: {
    fontSize: FONT_SIZES.sm,
    color: '#9E9E9E',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  // Waiting phase styles
  waitingContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    padding: spacing(25),
    marginVertical: spacing(20),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  waitingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: spacing(10),
    textAlign: 'center'
  },
  waitingMessage: {
    fontSize: FONT_SIZES.md,
    color: '#424242',
    textAlign: 'center',
    marginBottom: spacing(15)
  },
  waitingTimerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: spacing(20),
    alignItems: 'center',
    marginBottom: spacing(15),
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#4CAF50'
  },
  waitingTimerLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    marginBottom: spacing(5)
  },
  waitingTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  waitingSubtext: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: '90%'
  }
});

export default OtpScreen;
