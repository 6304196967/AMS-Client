/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import { name as appName } from './app.json';

// Register background handler for push notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background notification received:', remoteMessage);
  // You can perform background tasks here if needed
});

AppRegistry.registerComponent(appName, () => App);
