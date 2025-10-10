import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notifier, NotifierComponents } from 'react-native-notifier';

const API_BASE_URL = 'http://192.168.241.104:5000';
// const API_BASE_URL = 'http://10.182.66.80:5000';

/**
 * Check if notification permission is currently granted
 * @returns true if permission is granted, false otherwise
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};

/**
 * Request notification permissions from the user
 * @returns true if permission granted, false otherwise
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      // Android 13+ requires runtime permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    // Request Firebase messaging permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token and register it with the backend
 * Smart logic: Only register/update if token has changed or doesn't exist
 * @param userEmail - The email of the logged-in user
 * @returns The FCM token if successful, null otherwise
 */
export const registerFCMToken = async (userEmail: string): Promise<string | null> => {
  try {
    // Check if permission is granted
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      // Store email for retry later
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
      return null;
    }

    // Get current FCM token
    const fcmToken = await messaging().getToken();

    // Check if we have a previously registered token
    const lastRegisteredToken = await AsyncStorage.getItem('fcm_last_token');
    const wasRegistered = await AsyncStorage.getItem('fcm_token_registered');
    
    // If token hasn't changed and was already registered, skip registration
    if (fcmToken === lastRegisteredToken && wasRegistered === 'true') {
      return fcmToken;
    }

    // Try to register/update token with backend
    const response = await fetch(`${API_BASE_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        fcm_token: fcmToken,
        device_type: Platform.OS,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear pending registration
      await AsyncStorage.removeItem('pending_fcm_registration');
      // Mark token as registered
      await AsyncStorage.setItem('fcm_token_registered', 'true');
      await AsyncStorage.setItem('fcm_last_token', fcmToken);
      return fcmToken;
    } else {
      // Check if it's a unique constraint error
      const errorMessage = data.error || '';
      if (errorMessage.includes('unique constraint') || errorMessage.includes('already exists')) {
        // Even though backend returned error, the token IS registered
        // Just update local storage to match
        await AsyncStorage.removeItem('pending_fcm_registration');
        await AsyncStorage.setItem('fcm_token_registered', 'true');
        await AsyncStorage.setItem('fcm_last_token', fcmToken);
        return fcmToken;
      } else {
        console.error('❌ Failed to register FCM token:', data.error);
        return null;
      }
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return null;
  }
};

/**
 * Retry FCM token registration if it was pending
 * Call this when permission status changes or app returns to foreground
 */
export const retryPendingFCMRegistration = async (): Promise<void> => {
  try {
    const pendingEmail = await AsyncStorage.getItem('pending_fcm_registration');
    if (!pendingEmail) {
      return; // No pending registration
    }

    const hasPermission = await checkNotificationPermission();
    if (hasPermission) {
      await registerFCMToken(pendingEmail);
    } else {
      console.error('⚠️ Permission still not granted, cannot retry registration');
    }
  } catch (error) {
    console.error('Error retrying FCM registration:', error);
  }
};

/**
 * Force FCM token registration for current user
 * Use this for manual retry or debugging
 * @param userEmail - User's email address
 */
export const forceRegisterFCMToken = async (userEmail: string): Promise<boolean> => {
  try {
    
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      // Request permission
      const granted = await requestNotificationPermission();
      if (!granted) {
        return false;
      }
    }
    
    const token = await registerFCMToken(userEmail);
    return token !== null;
  } catch (error) {
    console.error('Error force registering FCM token:', error);
    return false;
  }
};

/**
 * Remove FCM token from backend when permission is revoked
 * @param userEmail - User's email address
 * @returns Success status
 */
export const removeFCMToken = async (userEmail: string): Promise<boolean> => {
  try {    
    // Call backend to remove token by email and device type
    // This matches the unique constraint (student_email, device_type)
    const response = await fetch(`${API_BASE_URL}/api/notifications/remove-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        device_type: Platform.OS, // Include device_type to match unique constraint
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear any stored token info
      await AsyncStorage.removeItem('fcm_token_registered');
      await AsyncStorage.removeItem('fcm_last_token');
      // Store email for retry when permission is granted again
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
      return true;
    } else {
      console.error('❌ Failed to remove FCM token:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return false;
  }
};

/**
 * Monitor permission status changes and handle token lifecycle
 * Detects when permission is revoked and removes token from backend
 */
export const monitorPermissionChanges = async (userEmail: string): Promise<void> => {
  try {
    const currentPermission = await checkNotificationPermission();
    const wasRegistered = await AsyncStorage.getItem('fcm_token_registered');
    
    // Permission revoked after token was registered
    if (!currentPermission && wasRegistered === 'true') {
      await removeFCMToken(userEmail);
      // Store email for retry when permission is granted again
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
    }
    
    // Permission granted and token not yet registered
    if (currentPermission && wasRegistered !== 'true') {
      
      // Try to register token directly with current user email
      await registerFCMToken(userEmail);
      
      // Also check for any pending registration (legacy support)
      const pendingEmail = await AsyncStorage.getItem('pending_fcm_registration');
      if (pendingEmail && pendingEmail !== userEmail) {
        await registerFCMToken(pendingEmail);
      }
    }
  } catch (error) {
    console.error('Error monitoring permission changes:', error);
  }
};

/**
 * Send notification to class students (CR only)
 * @param crEmail - Email of the CR sending the notification
 * @param title - Notification title
 * @param message - Notification message
 * @returns Response data from the API
 */
export const sendNotificationToClass = async (
  crEmail: string,
  title: string,
  message: string
): Promise<{ success: boolean; message: string; details?: any; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cr/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cr_email: crEmail,
        title,
        message,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      message: '',
      error: 'Failed to send notification. Please check your connection.',
    };
  }
};

/**
 * Get notification history for a CR
 * @param crEmail - Email of the CR
 * @returns List of notifications sent by the CR
 */
export const getNotificationHistory = async (
  crEmail: string
): Promise<{ success: boolean; notifications?: any[]; error?: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/history?cr_email=${encodeURIComponent(crEmail)}`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return {
      success: false,
      error: 'Failed to fetch notification history',
    };
  }
};

/**
 * Setup foreground notification handler
 * Shows beautiful in-app notification banner when app is in foreground
 * @param onNotificationReceived - Optional callback function when notification is received
 */
export const setupForegroundNotificationHandler = (
  onNotificationReceived?: (notification: any) => void
) => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground notification received:', remoteMessage);
    
    // Show beautiful in-app notification banner
    Notifier.showNotification({
      title: remoteMessage.notification?.title || 'New Notification',
      description: remoteMessage.notification?.body || '',
      duration: 5000,
      showAnimationDuration: 800,
      onHidden: () => console.log('Notification hidden'),
      onPress: () => {
        console.log('Notification pressed');
        if (onNotificationReceived) {
          onNotificationReceived(remoteMessage);
        }
      },
      hideOnPress: true,
      Component: NotifierComponents.Alert,
      componentProps: {
        alertType: 'info',
      },
    });
    
    // Call optional callback
    if (onNotificationReceived) {
      onNotificationReceived(remoteMessage);
    }
  });

  return unsubscribe;
};

/**
 * Setup background notification handler
 * This should be called outside of any component, typically in index.js
 */
export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // You can perform background tasks here if needed
  });
};

/**
 * Handle notification when app is opened from a notification
 * @param onNotificationOpened - Callback function when app is opened from notification
 */
export const setupNotificationOpenedHandler = (
  onNotificationOpened: (notification: any) => void
) => {
  // Handle notification when app is opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        onNotificationOpened(remoteMessage);
      }
    });

  // Handle notification when app is opened from background
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    onNotificationOpened(remoteMessage);
  });

  return unsubscribe;
};

/**
 * Cleanup FCM token on logout
 * Keeps token in backend and local storage for seamless re-login
 * Token is only removed if user explicitly denies permission or device is unauthorized
 * @param userEmail - User's email address
 */
export const cleanupFCMOnLogout = async (userEmail: string): Promise<void> => {
  try {
    
    // SMART LOGOUT STRATEGY:
    // ✅ Keep token in backend - device is still authorized
    // ✅ Keep fcm_last_token - for smart comparison on next login
    // ✅ Keep fcm_token_registered - so we can skip registration on next login
    // ✅ Only clear pending registration (no longer needed)
    
    // Only clear pending registration
    await AsyncStorage.removeItem('pending_fcm_registration');
    
  } catch (error) {
    console.error('Error during FCM cleanup:', error);
  }
};

/**
 * Complete FCM token removal (for unauthorized access or device binding failure)
 * Removes token from backend AND clears all local storage
 * Use this when user should NOT be able to receive notifications (device unauthorized)
 * @param userEmail - User's email address
 */
export const forceRemoveFCMToken = async (userEmail: string): Promise<void> => {
  try {
    
    // Remove token from backend
    await removeFCMToken(userEmail);
    
    // Clear ALL FCM-related storage
    await AsyncStorage.multiRemove([
      'pending_fcm_registration',
      'fcm_token_registered',
      'fcm_last_token',
    ]);
  } catch (error) {
    console.error('Error during forced FCM removal:', error);
  }
};

/**
 * Setup permission monitoring to retry FCM registration
 * Call this in App.tsx after user is logged in
 */
export const setupPermissionMonitoring = (userEmail: string): (() => void) => {
  let appStateSubscription: any;

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // When app comes to foreground, check for permission changes
      await monitorPermissionChanges(userEmail);
    }
  };

  // Listen to app state changes
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Also check immediately
  monitorPermissionChanges(userEmail);

  // Return cleanup function
  return () => {
    if (appStateSubscription) {
      appStateSubscription.remove();
    }
  };
};

// Debug function to check FCM token status
// Logs all relevant information for troubleshooting
const debugFCMStatus = async (userEmail: string): Promise<void> => {
  try {
    // Check permission
    const hasPermission = await checkNotificationPermission();
    console.log('📱 Permission Status:', hasPermission ? '✅ GRANTED' : '❌ DENIED');
    // Check AsyncStorage
    const pendingEmail = await AsyncStorage.getItem('pending_fcm_registration');
    const wasRegistered = await AsyncStorage.getItem('fcm_token_registered');
    const lastToken = await AsyncStorage.getItem('fcm_last_token');

    console.log('🔍 ===== FCM DEBUG STATUS =====');
    console.log('📱 Permission Status:', hasPermission ? '✅ GRANTED' : '❌ DENIED');
    console.log('💾 AsyncStorage Status:');
    console.log('  - pending_fcm_registration:', pendingEmail || 'Not set');
    console.log('  - fcm_token_registered:', wasRegistered || 'Not set');
    console.log('  - fcm_last_token:', lastToken ? lastToken.substring(0, 20) + '...' : 'Not set');

    // Try to get current token
    if (hasPermission) {
      try {
        const currentToken = await messaging().getToken();
      } catch (error) {
        console.log('❌ Error getting current token:', error);
      }
    } else {
      console.log('⚠️ Cannot get current token - permission denied');
    }

    console.log('👤 Current User Email:', userEmail);
    console.log('🔍 ===== END DEBUG =====');
  } catch (error) {
    console.error('Error in debug:', error);
  }
};
