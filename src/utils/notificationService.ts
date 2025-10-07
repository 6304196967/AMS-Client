import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

const API_BASE_URL = 'http://10.182.66.80:5000';

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
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return null;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log('📱 FCM Token:', fcmToken);

    // Register token with backend
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
