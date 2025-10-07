# 🔔 Push Notifications Setup Guide - Frontend (React Native)

## ✅ What's Already Done

The following components have been successfully integrated:

### 1. ✅ Firebase Packages Installed
- `@react-native-firebase/app`
- `@react-native-firebase/messaging`

### 2. ✅ Notification Service Created
- **File**: `src/utils/notificationService.ts`
- Functions:
  - `requestNotificationPermission()` - Request permission from user
  - `registerFCMToken()` - Register device token with backend
  - `sendNotificationToClass()` - CR sends notification to class
  - `getNotificationHistory()` - Get sent notifications history
  - Foreground/Background notification handlers

### 3. ✅ Send Notification Modal Created
- **File**: `src/student/screens/SendNotificationModal.tsx`
- Features:
  - Beautiful UI with quick templates
  - Title and message input with character limits
  - Confirmation before sending
  - Loading states and error handling
  - Class info display

### 4. ✅ Bell Icon Integration
- **File**: `src/student/screens/HomeScreen.tsx`
- CR users see a bell icon next to the + icon
- Clicking bell icon opens the notification modal
- Only visible for CR users

### 5. ✅ FCM Token Registration on Login
- **File**: `src/LandingPage.tsx`
- FCM token is registered automatically when user logs in
- Non-blocking - login succeeds even if FCM registration fails

### 6. ✅ Notification Handlers Setup
- **File**: `src/App.tsx` - Foreground and notification open handlers
- **File**: `index.js` - Background notification handler
- Displays alerts when notifications are received while app is open

---

## 🚨 What You Need to Do

### Step 1: Download google-services.json

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (or create a new one)
3. Click **⚙️ Settings** → **Project Settings**
4. Scroll down to **Your apps** section
5. If you don't have an Android app:
   - Click **Add app** → Select **Android** icon
   - **Package name**: `com.amsrkv` (must match exactly!)
   - **App nickname**: `AMS App` (optional)
   - Click **Register app**
6. **Download** `google-services.json`
7. **IMPORTANT**: Place it in `android/app/google-services.json`

```
AMSRKV/
  android/
    app/
      google-services.json  ← HERE
      build.gradle
```

### Step 2: Verify Build Configuration

Your build.gradle files are already configured! ✅

#### ✅ `android/build.gradle` has:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

#### ✅ `android/app/build.gradle` has:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 3: Clean and Rebuild

After adding `google-services.json`:

```powershell
# Navigate to project root
cd C:\Users\jagad\Desktop\AMS\AMSRKV

# Clean Android build
cd android
.\gradlew clean
cd ..

# Rebuild and run
npx react-native run-android
```

### Step 4: Test the Setup

1. **Install the app** on a physical device (emulator may have issues with FCM)
2. **Login** with a student account
   - FCM token should register automatically
   - Check backend logs to confirm token registration
3. **Login with CR account**
   - You should see a bell icon (🔔) next to the + icon
4. **Click the bell icon**
   - Notification modal should open
5. **Send a test notification**
   - Enter title and message
   - Click "Send to Class"
   - Students should receive the notification

---

## 📱 How It Works

### For Students:
1. **Login** → FCM token automatically registered with backend
2. **Receive notifications** when CR sends class updates
3. **Foreground**: Alert popup with notification
4. **Background/Quit**: System notification (tap to open app)

### For CRs:
1. **Login** → See bell icon on home screen
2. **Click bell icon** → Send notification modal opens
3. **Enter title & message** → Quick templates available
4. **Click "Send to Class"** → All students in class receive notification
5. **Confirmation** → Shows how many students received it

---

## 🔐 Backend API Endpoints Being Used

### 1. Register FCM Token (Auto on Login)
```
POST /api/notifications/register-token
Body: {
  "email": "student@rguktrkv.ac.in",
  "fcm_token": "...",
  "device_type": "android"
}
```

### 2. Send Notification (CR Only)
```
POST /api/cr/send-notification
Body: {
  "cr_email": "cr@rguktrkv.ac.in",
  "title": "Class Update",
  "message": "Venue changed to Lab 201"
}
```

---

## 🧪 Testing Checklist

- [ ] `google-services.json` downloaded from Firebase Console
- [ ] File placed in `android/app/google-services.json`
- [ ] Android project cleaned and rebuilt
- [ ] App installed on physical device
- [ ] Student login successful
- [ ] FCM token registration confirmed in backend logs
- [ ] CR login shows bell icon
- [ ] Bell icon opens notification modal
- [ ] Test notification sent successfully
- [ ] Student receives notification

---

## 🐛 Troubleshooting

### Error: "google-services.json not found"
**Solution**: Make sure the file is in `android/app/` directory

### Error: "No matching client found for package name 'com.amsrkv'"
**Solution**: Package name in Firebase Console must be exactly `com.amsrkv`

### Notifications not received
**Possible causes**:
1. FCM token not registered - Check backend logs
2. Student not in CR's class - Verify database
3. App not installed/logged in - User must login first
4. Backend Firebase credentials missing - Check backend setup

### Build errors after adding google-services.json
**Solution**:
```powershell
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

---

## 🎉 Features Implemented

### ✨ Send Notification Modal Features:
- **Quick Templates**: Pre-filled messages for common scenarios
  - Class Cancelled
  - Venue Changed
  - Time Changed
  - Assignment Reminder
- **Character Limits**: Title (100), Message (500)
- **Live Character Count**: See remaining characters
- **Confirmation Dialog**: Prevent accidental sends
- **Loading States**: Visual feedback during send
- **Success/Error Handling**: Clear feedback to CR
- **Class Info Display**: Shows which class will receive notification

### ✨ Notification Handling:
- **Foreground**: Alert dialog with title and message
- **Background**: System notification
- **Quit State**: System notification, opens app on tap
- **Token Refresh**: Automatic token updates

---

## 📊 Expected User Flow

### Student Journey:
```
1. Open App
   ↓
2. Login with Google (@rguktrkv.ac.in)
   ↓
3. FCM Token Registered (Automatic)
   ↓
4. Navigate App Normally
   ↓
5. CR Sends Notification
   ↓
6. Receive Notification
   - If app open: Alert popup
   - If app background/closed: System notification
```

### CR Journey:
```
1. Open App
   ↓
2. Login with Google (@rguktrkv.ac.in)
   ↓
3. See Bell Icon on Home Screen
   ↓
4. Click Bell Icon
   ↓
5. Fill Title & Message (or use template)
   ↓
6. Click "Send to Class"
   ↓
7. Confirmation → Send
   ↓
8. Success Message Shows Count
   (e.g., "Sent to 43 students")
```

---

## 🔄 Next Steps

After completing the above setup:

1. **Test thoroughly** with multiple student accounts
2. **Monitor backend logs** for token registration
3. **Check Firebase Console** → Cloud Messaging for delivery stats
4. **Optional**: Add notification history screen for CRs
5. **Optional**: Add notification preferences for students

---

## 📝 Code Structure

```
src/
├── utils/
│   └── notificationService.ts          ← FCM token & API calls
├── student/
│   └── screens/
│       ├── HomeScreen.tsx              ← Bell icon for CRs
│       └── SendNotificationModal.tsx   ← Notification form
├── LandingPage.tsx                     ← FCM registration on login
└── App.tsx                             ← Notification handlers

index.js                                ← Background handler

android/
├── app/
│   ├── google-services.json           ← ⚠️ YOU NEED TO ADD THIS
│   └── build.gradle                   ← ✅ Already configured
└── build.gradle                       ← ✅ Already configured
```

---

## 🆘 Support

If you encounter issues:

1. Check Firebase Console for app configuration
2. Verify package name matches exactly: `com.amsrkv`
3. Check backend is running and accessible
4. Review backend logs for API errors
5. Test on a physical device (not emulator)

---

**Last Updated**: October 7, 2025
**Status**: ✅ Ready to test after adding google-services.json

---

## 🎯 Quick Start Command

```powershell
# After adding google-services.json to android/app/

cd C:\Users\jagad\Desktop\AMS\AMSRKV
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

Good luck! 🚀
