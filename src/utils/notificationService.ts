import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'https://ams-server-4eol.onrender.com';
const API_BASE_URL = 'http://10.182.66.80:5000';

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
        console.log('Notification permission denied');
        return false;
      }
    }

    // Request Firebase messaging permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted:', authStatus);
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token and register it with the backend
 * @param userEmail - The email of the logged-in user
 * @returns The FCM token if successful, null otherwise
 */
export const registerFCMToken = async (userEmail: string): Promise<string | null> => {
  try {
    // Check if permission is granted
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('⚠️ Notification permission not granted. Will retry when permission is granted.');
      // Store email for retry later
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
      return null;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log('📱 FCM Token:', fcmToken);

    // ALWAYS remove existing token entry for this email first
    // This prevents unique constraint errors when user clears storage and logs in again
    console.log('🧹 Removing existing FCM token entry for this email...');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/remove-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          fcm_token: fcmToken,
        }),
      });
      console.log('✅ Cleaned up existing token entry');
    } catch (error) {
      console.log('⚠️ Could not remove existing token (may not exist):', error);
    }

    // Register new token with backend
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
      console.log('✅ FCM token registered with backend:', data.message);
      // Clear pending registration
      await AsyncStorage.removeItem('pending_fcm_registration');
      // Mark token as registered
      await AsyncStorage.setItem('fcm_token_registered', 'true');
      await AsyncStorage.setItem('fcm_last_token', fcmToken);
      return fcmToken;
    } else {
      console.error('❌ Failed to register FCM token:', data.error);
      return null;
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
      console.log('ℹ️ No pending FCM registration found');
      return; // No pending registration
    }

    const hasPermission = await checkNotificationPermission();
    if (hasPermission) {
      console.log('🔄 Retrying FCM token registration for:', pendingEmail);
      await registerFCMToken(pendingEmail);
    } else {
      console.log('⚠️ Permission still not granted, cannot retry registration');
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
    console.log('🔧 Force registering FCM token for:', userEmail);
    
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('❌ Cannot force register - permission not granted');
      // Request permission
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('❌ User denied permission');
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
    // Try to get current token (might fail if permission revoked)
    let fcmToken = null;
    try {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        fcmToken = await messaging().getToken();
      }
    } catch (error) {
      console.log('Could not get FCM token for removal:', error);
    }

    // Call backend to remove token
    const response = await fetch(`${API_BASE_URL}/api/notifications/remove-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        fcm_token: fcmToken, // May be null if permission already revoked
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ FCM token removed from backend:', data.message);
      // Clear any stored token info
      await AsyncStorage.removeItem('fcm_token_registered');
      await AsyncStorage.removeItem('fcm_last_token');
      // Store email for retry when permission is granted again
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
      console.log('💾 Stored email for retry when permission is granted');
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
    
    console.log('🔍 Monitoring permission changes:', {
      currentPermission,
      wasRegistered,
      userEmail
    });
    
    // Permission revoked after token was registered
    if (!currentPermission && wasRegistered === 'true') {
      console.log('⚠️ Notification permission revoked - removing FCM token from backend');
      await removeFCMToken(userEmail);
      // Store email for retry when permission is granted again
      await AsyncStorage.setItem('pending_fcm_registration', userEmail);
    }
    
    // Permission granted and token not yet registered
    if (currentPermission && wasRegistered !== 'true') {
      console.log('✅ Permission granted and token not registered - attempting registration');
      
      // Try to register token directly with current user email
      await registerFCMToken(userEmail);
      
      // Also check for any pending registration (legacy support)
      const pendingEmail = await AsyncStorage.getItem('pending_fcm_registration');
      if (pendingEmail && pendingEmail !== userEmail) {
        console.log('📧 Found different pending email, registering for:', pendingEmail);
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
 * @param onNotificationReceived - Callback function when notification is received
 */
export const setupForegroundNotificationHandler = (
  onNotificationReceived: (notification: any) => void
) => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground notification received:', remoteMessage);
    onNotificationReceived(remoteMessage);
  });

  return unsubscribe;
};

/**
 * Setup background notification handler
 * This should be called outside of any component, typically in index.js
 */
export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background notification received:', remoteMessage);
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
        console.log('📩 App opened from quit state via notification:', remoteMessage);
        onNotificationOpened(remoteMessage);
      }
    });

  // Handle notification when app is opened from background
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📩 App opened from background via notification:', remoteMessage);
    onNotificationOpened(remoteMessage);
  });

  return unsubscribe;
};

/**
 * Cleanup FCM token on logout
 * Removes token from backend and clears local storage
 * @param userEmail - User's email address
 */
export const cleanupFCMOnLogout = async (userEmail: string): Promise<void> => {
  try {
    console.log('🧹 Cleaning up FCM token on logout');
    
    // Remove token from backend
    await removeFCMToken(userEmail);
    
    // Clear all FCM-related storage
    await AsyncStorage.multiRemove([
      'pending_fcm_registration',
      'fcm_token_registered',
      'fcm_last_token',
    ]);
    
    console.log('✅ FCM cleanup completed');
  } catch (error) {
    console.error('Error during FCM cleanup:', error);
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
      console.log('🔍 App active - checking for permission changes');
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

/**
 * Debug function to check FCM token status
 * Logs all relevant information for troubleshooting
 * @param userEmail - User's email address
 */
export const debugFCMStatus = async (userEmail: string): Promise<void> => {
  console.log('🔍 ===== FCM DEBUG STATUS =====');
  
  try {
    // Check permission
    const hasPermission = await checkNotificationPermission();
    console.log('📱 Permission Status:', hasPermission ? '✅ GRANTED' : '❌ DENIED');
    
    // Check AsyncStorage
    const pendingEmail = await AsyncStorage.getItem('pending_fcm_registration');
    const wasRegistered = await AsyncStorage.getItem('fcm_token_registered');
    const lastToken = await AsyncStorage.getItem('fcm_last_token');
    
    console.log('💾 AsyncStorage Status:');
    console.log('  - pending_fcm_registration:', pendingEmail || 'Not set');
    console.log('  - fcm_token_registered:', wasRegistered || 'Not set');
    console.log('  - fcm_last_token:', lastToken ? lastToken.substring(0, 20) + '...' : 'Not set');
    
    // Try to get current token
    if (hasPermission) {
      try {
        const currentToken = await messaging().getToken();
        console.log('🔑 Current FCM Token:', currentToken ? currentToken.substring(0, 20) + '...' : 'Not available');
        console.log('🔄 Token Changed:', currentToken !== lastToken ? 'YES' : 'NO');
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
