# AMS - Attendance Management System (RGUKT-RKV)This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).



> A comprehensive, secure React Native mobile application for attendance management with device binding, biometric authentication, and push notifications.# Getting Started



**Version:** 1.0.2 | **Package:** com.amsrkv | **Platform:** Android> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.



---## Step 1: Start Metro



## 📋 Table of ContentsFirst, you will need to run **Metro**, the JavaScript build tool for React Native.



- [Overview](#overview)To start the Metro dev server, run the following command from the root of your React Native project:

- [Features](#features)

- [Quick Start](#quick-start)```sh

- [Building & Deployment](#building--deployment)# Using npm

- [Architecture](#architecture)npm start

- [Security Features](#security-features)

- [Push Notifications](#push-notifications)# OR using Yarn

- [UI/UX System](#uiux-system)yarn start

- [Testing](#testing)```

- [Troubleshooting](#troubleshooting)

- [Technology Stack](#technology-stack)## Step 2: Build and run your app



---With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:



## 🎯 Overview### Android



AMS is a production-ready attendance management system built for RGUKT-RKV that supports three user roles with role-specific features:```sh

# Using npm

### User Rolesnpm run android



| Role | Email Pattern | Features |# OR using Yarn

|------|---------------|----------|yarn android

| **Student** | `r20xxxx@rguktrkv.ac.in` | View schedule, mark attendance, receive notifications |```

| **Faculty** | Custom faculty emails | Manage schedules, mark attendance, send notifications |

| **Admin** | `r210016@rguktrkv.a.in` | Full system access, user management, device binding resets |### iOS



### Key MetricsFor iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

- **APK Size:** 25-35 MB (down from 140 MB)

- **Security:** Device binding + biometric auth + screenshot restrictionThe first time you create a new project, run the Ruby bundler to install CocoaPods itself:

- **Backend:** https://ams-server-4eol.onrender.com

- **Build Time:** 3-5 min (full clean) | 1-2 min (quick)```sh

bundle install

---```



## ✨ FeaturesThen, and every time you update your native dependencies, run:



### 🔐 Authentication & Security```sh

- **Google Sign-In** with domain validation (`@rguktrkv.ac.in`)bundle exec pod install

- **Device Binding** - One device per student (hardware-based)```

- **Biometric Auth** - Fingerprint/Face ID with PIN fallback

- **Screenshot Restriction** - Prevents capturing sensitive dataFor more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

- **Multi-user Support** - Different users on same device (separate storage)

```sh

### 📱 Attendance Management# Using npm

- **OTP Verification** - 6-digit OTP with 45-second validitynpm run ios

- **Time-bound Access** - Class-based attendance windows

- **Security Checks** - Detects calls, screen mirroring, rooting, overlays# OR using Yarn

- **Violation Tracking** - Automatic marking and navigationyarn ios

```

### 🔔 Push Notifications (FCM)

- **Foreground Banners** - Beautiful in-app notifications (5s auto-dismiss)If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

- **Background/Quit** - System notifications with smart navigation

- **CR Features** - Class Representatives can send notificationsThis is one way to run your app — you can also build it directly from Android Studio or Xcode.

- **Templates** - Quick messages (Cancelled, Venue Changed, etc.)

- **Token Management** - Automatic registration & refresh## Step 3: Modify your app



### 🎨 UI/UX FeaturesNow that you have successfully run the app, let's make changes!

- **Responsive Design** - Adapts to all screen sizes

- **Font Scaling Disabled** - Prevents UI breaking with system font changesOpen `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

- **Custom Components** - Text & TextInput wrappers

- **Role-based Navigation** - Different tab structures per roleWhen you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Animations** - react-native-animatable for smooth transitions

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

---- **iOS**: Press <kbd>R</kbd> in iOS Simulator.



## 🚀 Quick Start## Congratulations! :tada:



### PrerequisitesYou've successfully run and modified your React Native App. :partying_face:

```bash

# Required### Now what?

Node.js >= 20

React Native CLI- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).

Android Studio- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

JDK 11+

# Troubleshooting

# Optional (iOS)

Xcode (macOS only)If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

CocoaPods

```# Learn More



### InstallationTo learn more about React Native, take a look at the following resources:



```bash- [React Native Website](https://reactnative.dev) - learn more about React Native.

# Clone repository- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.

git clone <repository-url>- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.

cd AMSRKV- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.

- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Install dependencies
npm install

# iOS only (macOS)
cd ios
bundle install
bundle exec pod install
cd ..
```

### First Run

```powershell
# Development (with hot reload)
./clean-build.ps1

# OR Manual
npm start -- --reset-cache  # Terminal 1
npm run android             # Terminal 2
```

---

## 🏗️ Building & Deployment

### Build Scripts

| Script | Purpose | Time | Use Case |
|--------|---------|------|----------|
| `rebuild-release.ps1` | Full clean production build | 3-5 min | First time, major changes |
| `quick-rebuild.ps1` | Fast production build | 1-2 min | Quick testing, minor changes |
| `clean-build.ps1` | Debug build | 2-3 min | Active development |
| `build-optimized.ps1` | Optimized release | 3-4 min | Final deployment |

### Version Management

**Before EVERY build, update:**

**1. `android/app/build.gradle` (Lines 96-97)**
```groovy
versionCode 3          // Increment by 1
versionName "1.0.2"    // Update semantic version
```

**2. `src/App.tsx` (Line ~32)**
```tsx
const currentAppVersion = '1.0.2'; // MUST match versionName
```

### Production Build Process

```powershell
# 1. Update versions (see above)

# 2. Full clean build
./rebuild-release.ps1

# 3. APKs generated at:
# android/app/build/outputs/apk/release/
#   ├── app-arm64-v8a-release.apk   (Modern devices - 25-35 MB)
#   ├── app-armeabi-v7a-release.apk (Older devices - 25-30 MB)
#   ├── app-x86_64-release.apk      (Emulators - 25-35 MB)
#   └── app-x86-release.apk         (Old emulators - 25-30 MB)

# 4. Install on device
adb devices
adb uninstall com.amsrkv
adb install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

### Manual Build Commands

```powershell
# Clean
cd android
./gradlew clean
cd ..

# Build Release
cd android
./gradlew assembleRelease
cd ..

# Build AAB (Google Play)
cd android
./gradlew bundleRelease
cd ..
```

---

## 🏛️ Architecture

### Project Structure

```
AMSRKV/
├── android/                      # Android native
│   ├── app/
│   │   ├── google-services.json  # Firebase config
│   │   └── build.gradle          # App build config
│   └── build.gradle              # Project build config
├── ios/                          # iOS native
├── src/
│   ├── admin/                    # Admin screens & components
│   │   ├── Profile.tsx
│   │   └── StudentManagement.tsx
│   ├── components/               # Shared components
│   │   ├── CustomText.tsx        # Font scaling disabled
│   │   ├── CustomTextInput.tsx   # Font scaling disabled
│   │   └── index.ts
│   ├── faculty/                  # Faculty screens
│   ├── student/                  # Student screens
│   │   ├── Navigators/
│   │   │   └── StudentNavigator.tsx
│   │   └── screens/
│   │       ├── HomeScreen.tsx
│   │       ├── OtpScreen.tsx
│   │       ├── BiometricScreen.tsx
│   │       ├── AnalyticsScreen.tsx
│   │       ├── HistoryScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       └── SendNotificationModal.tsx
│   ├── services/
│   │   └── Interfaces.tsx
│   ├── utils/                    # Utilities & services
│   │   ├── deviceBindingService.ts
│   │   ├── notificationService.ts
│   │   ├── biometricService.ts
│   │   └── responsive.ts
│   ├── modules/
│   │   └── AudioCheckModule.ts   # Security checks
│   ├── App.tsx                   # Main entry
│   └── LandingPage.tsx           # Login screen
├── assets/
│   ├── images/
│   └── fonts/
├── *.ps1                         # Build scripts
├── package.json
├── tsconfig.json
└── README.md
```

### Navigation Flow

```
App.tsx (Root)
  ├─ User logged in?
  │   ├─ NO → LandingPage (Google Sign-In)
  │   └─ YES → Determine role:
  │       ├─ Admin (r210016@rguktrkv.a.in) → AdminNavigator
  │       ├─ Faculty (faculty@rguktrkv.ac.in) → FacultyNavigator
  │       └─ Student (r20xxxx@rguktrkv.ac.in) → StudentNavigator
  │           ├─ Tabs (Bottom Navigation)
  │           │   ├─ Home (Today's Schedule)
  │           │   ├─ Analytics (Attendance Stats)
  │           │   ├─ History (Past Classes)
  │           │   └─ Profile (User Info)
  │           └─ Screens (Stack)
  │               ├─ Otp (OTP Verification)
  │               ├─ Biometric (Fingerprint/PIN)
  │               └─ Blocked (Violation State)
```

---

## 🔒 Security Features

### 1. Device Binding System

**Purpose:** Ensure one device per student account

**How it works:**
```typescript
// Device Fingerprint Format
"bind_<hardwareId>_<platform>"

// Example
"bind_abc123xyz789_android"
```

**Flow:**
```
1. Student logs in with Google (@rguktrkv.ac.in)
2. Extract student ID from email (e.g., "n200504")
3. Generate device fingerprint using hardware ID
4. Backend checks database:
   ├─ No binding exists → Save new binding → Allow login ✅
   ├─ Same student, same device → Allow login ✅
   └─ Different student, same device → Deny login ❌
```

**Key Files:**
- `src/utils/deviceBindingService.ts` - Core logic
- `src/LandingPage.tsx` - Integration in login flow

**Functions:**
```typescript
// Generate unique device fingerprint
generateDeviceFingerprint(): Promise<string>

// Validate during login
validateDeviceBinding(userEmail: string): Promise<{
  allowed: boolean;
  message?: string;
}>

// Admin: Reset binding
adminResetDeviceBinding(studentId: string): Promise<void>

// Local cache management
clearDeviceBindingCache(): Promise<void>
getCachedBindingInfo(): Promise<{fingerprint, studentId}>
```

**Backend Endpoints:**
```
POST /student/bind-device/:studentId
Body: { binding_id: "bind_..." }
Response: { success: boolean, message: string }

GET /student/device-binding/:studentId  
Response: { binding_id: "bind_..." }

POST /admin/reset-device-binding/:studentId
Response: { success: boolean }
```

**Security Benefits:**
- ✅ Cannot be bypassed by clearing app storage
- ✅ Cannot be bypassed by uninstalling app
- ✅ Uses hardware identifiers (persistent)
- ✅ Database enforces uniqueness via UNIQUE constraint
- ✅ Prevents account sharing

### 2. Biometric Authentication

**Supported Methods:**
- Fingerprint (primary)
- Face ID/Recognition
- PIN/Password/Pattern (fallback)

**Features:**
- **Time-based requirement** - Configurable timeout
- **Fallback to PIN** - After failed fingerprint attempts
- **User-specific storage** - Separate biometric data per user
- **Automatic retry** - Smart retry logic

**Flow:**
```
1. Student clicks "Mark Attendance"
2. OTP Screen → Verify 6-digit code
3. OTP Success → Navigate to Biometric Screen
4. Try Fingerprint (3 attempts)
   ├─ Success → Mark attendance ✅
   ├─ Failed 3 times → Auto fallback to PIN
   └─ User cancels → Confirm dialog → Return home or retry
5. PIN Success → Mark attendance ✅
```

**Key File:** `src/student/screens/BiometricScreen.tsx`

**Implementation:**
```typescript
// Check biometric availability
const { available, biometryType } = await rnBiometrics.isSensorAvailable();

// Fingerprint prompt (NO PIN button)
const result = await rnBiometrics.simplePrompt({
  promptMessage: "Confirm your identity to mark attendance",
  cancelButtonText: "Cancel"
});

// PIN/Password fallback
const rnBiometricsWithPIN = new ReactNativeBiometrics({
  allowDeviceCredentials: true
});

const pinResult = await rnBiometricsWithPIN.simplePrompt({
  promptMessage: "Enter your device PIN/Password/Pattern",
  fallbackPromptMessage: "Use PIN/Password"
});
```

### 3. OTP Security

**Configuration:**
- **Length:** 6 digits
- **Validity:** 45 seconds from backend generation
- **One-time use:** OTP invalidated after verification

**Security Checks (Pre-verification):**
```typescript
// Performed in OtpScreen useEffect
const checks = await Promise.all([
  AudioCheckModule.isCallActive(),          // Active phone call
  AudioCheckModule.isMicrophoneInUse(),     // Mic in use
  AudioCheckModule.isScreenMirroring(),     // Screen mirroring
  AudioCheckModule.hasOverlayPermission(),  // Overlay apps
  AudioCheckModule.isDeviceRooted(),        // Rooted device
  AudioCheckModule.isAccessibilityServiceEnabled() // Accessibility
]);

// If ANY check fails → Block attendance + Show violation
```

**Violation Handling:**
```typescript
// Auto-navigate back to home after 3 seconds
if (violation_detected) {
  setShowViolationModal(true);
  markScheduleAsViolated(); // Backend API call
  setTimeout(() => navigateBackToHome(), 3000);
}
```

**Key File:** `src/student/screens/OtpScreen.tsx`

### 4. Screenshot Restriction

**Implementation:** Native Android flag in `MainActivity.java`

```java
// Prevents screenshots and screen recording
getWindow().setFlags(
  WindowManager.LayoutParams.FLAG_SECURE,
  WindowManager.LayoutParams.FLAG_SECURE
);
```

**Protects:**
- OTP screens
- Biometric prompts
- Attendance data
- Student information

---

## 🔔 Push Notifications

### Setup Requirements

**1. Firebase Configuration**
```bash
# Download from Firebase Console:
# https://console.firebase.google.com/

# File: android/app/google-services.json
# Package name: com.amsrkv (MUST match exactly)
```

**2. Build Configuration (Already done ✅)**
```gradle
// android/build.gradle
classpath 'com.google.gms:google-services:4.4.0'

// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'
```

### FCM Integration

**Auto Token Registration (on login):**
```typescript
// src/LandingPage.tsx - After successful login
await registerFCMToken(userEmail, userName);

// src/utils/notificationService.ts
export const registerFCMToken = async (
  email: string,
  name: string
): Promise<void> => {
  const token = await messaging().getToken();
  const deviceInfo = await DeviceInfo.getDeviceName();
  
  await fetch(`${API_BASE_URL}/student/fcm-tokens`, {
    method: 'POST',
    body: JSON.stringify({
      student_id: extractStudentId(email),
      fcm_token: token,
      device_info: deviceInfo
    })
  });
};
```

### Notification Types

**1. Foreground (App Open)**
```typescript
// Shows beautiful banner at top
// Auto-dismisses in 5 seconds
// Tap to dismiss immediately

messaging().onMessage(async remoteMessage => {
  Notifier.showNotification({
    title: remoteMessage.notification?.title,
    description: remoteMessage.notification?.body,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: 'info',
    },
    duration: 5000,
  });
});
```

**2. Background/Quit (App Minimized/Closed)**
```typescript
// System notification
// Tap to open app with smart navigation

messaging().onNotificationOpenedApp(remoteMessage => {
  // Navigate based on user role
  const email = userEmail;
  if (email === "r210016@rguktrkv.a.in") {
    navigationRef.current?.navigate('Home'); // Admin
  } else if (email === "r210387@rguktrkv.ac.in") {
    navigationRef.current?.navigate('Schedule'); // Faculty
  } else {
    navigationRef.current?.navigate('Home'); // Student
  }
});
```

### CR (Class Representative) Features

**Send Notification Modal:**
```typescript
// Triggered by bell icon on HomeScreen
// Only visible to CRs

interface NotificationPayload {
  title: string;        // Max 100 chars
  message: string;      // Max 500 chars
  classInfo: {
    year: string;       // E2
    branch: string;     // CSE
    section: string;    // A
  };
}

// Quick Templates:
- "Class Cancelled"
- "Venue Changed"
- "Time Changed"
- "Assignment Reminder"
```

**API Call:**
```typescript
// Send to entire class
const response = await fetch(`${API_BASE_URL}/api/cr/send-notification`, {
  method: 'POST',
  body: JSON.stringify({
    cr_email: userEmail,
    title: notificationTitle,
    message: notificationBody
  })
});

// Response includes count
// "Sent to 43 students"
```

**Key Files:**
- `src/utils/notificationService.ts` - FCM logic
- `src/student/screens/SendNotificationModal.tsx` - CR UI
- `src/student/screens/HomeScreen.tsx` - Bell icon integration
- `src/App.tsx` - Notification handlers & navigation
- `index.js` - Background handler

### Backend Requirements

```typescript
// Register FCM Token
POST /student/fcm-tokens
Body: {
  student_id: "n200504",
  fcm_token: "eXaMpLeToKeN...",
  device_info: "Pixel 6 (Android 13)"
}

// Send Notification (CR only)
POST /api/cr/send-notification
Body: {
  cr_email: "cr@rguktrkv.ac.in",
  title: "Class Update",
  message: "Venue changed to Lab 201"
}
Response: {
  success: true,
  sent_to: 43,
  failed: 0
}

// Get Notification History (CR only)
GET /api/cr/notification-history?cr_email=cr@rguktrkv.ac.in
Response: [{
  id: 1,
  title: "Class Cancelled",
  message: "...",
  sent_to: 43,
  timestamp: "2025-10-13T10:30:00Z"
}]
```

### Notification Flow Visual

```
CR Sends Notification
    ↓
Backend validates CR
    ↓
Get all students in class
    ↓
Fetch FCM tokens
    ↓
Call Firebase FCM API
    ↓
Firebase sends to devices
    ↓
┌─────────────────────────────────────┐
│ Students with app OPEN (Foreground) │
│ → Beautiful banner slides in        │
│ → Auto-dismiss in 5s                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Students with app CLOSED (Quit)     │
│ → System notification               │
│ → Tap → App opens → Navigate home   │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX System

### Font Scaling Fix

**Problem:** React Native's default `Text` and `TextInput` scale with device font settings, breaking UI layouts.

**Solution:** Custom components with `allowFontScaling={false}`

**Files:**
- `src/components/CustomText.tsx`
- `src/components/CustomTextInput.tsx`
- `src/components/index.ts`

**Usage:**
```tsx
// ❌ DON'T use direct React Native imports
import { Text, TextInput } from 'react-native';

// ✅ DO use custom components
import { Text, TextInput } from '../components';

<Text>This text won't scale</Text>
<TextInput placeholder="Fixed size input" />
```

**Migration:**
```powershell
# Automated migration script
./migrate-font-scaling.ps1

# Dry run first
./migrate-font-scaling.ps1 -DryRun
```

### Responsive System

**File:** `src/utils/responsive.ts`

**Functions:**
```typescript
// Width/Height percentage
wp(percentage: number): number  // 100% of screen width
hp(percentage: number): number  // 100% of screen height

// Dynamic spacing
spacing(multiplier: number): number

// Dynamic font size
fontSize(size: number): number

// Predefined font sizes
FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  heading: 28
}

// Predefined spacing
SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24
}

// Device detection
DEVICE = {
  isSmallDevice: boolean,   // < 375px
  isMediumDevice: boolean,  // 375-414px
  isLargeDevice: boolean    // > 414px
}
```

**Usage:**
```tsx
import { wp, hp, spacing, fontSize, FONT_SIZES, SPACING } from '../utils/responsive';

const styles = StyleSheet.create({
  container: {
    width: wp(90),           // 90% of screen width
    padding: SPACING.lg,     // 16px
  },
  text: {
    fontSize: FONT_SIZES.md, // 16px (responsive)
    marginBottom: spacing(2) // 2x base spacing
  }
});
```

---

## 🧪 Testing

### Pre-build Checklist

- [ ] Updated `versionCode` and `versionName` in `build.gradle`
- [ ] Updated `currentAppVersion` in `App.tsx` to match
- [ ] `google-services.json` exists in `android/app/`
- [ ] All dependencies installed (`npm install`)

### Device Binding Tests

```
Test Case 1: First-time Login
1. Fresh app install
2. Login with student account
3. ✅ Should save device binding
4. ✅ Should allow login

Test Case 2: Same Device, Same User
1. Logout
2. Login with same account
3. ✅ Should allow login (binding matches)

Test Case 3: Same Device, Different User
1. Logout
2. Login with different student account
3. ❌ Should deny login with error message
4. Message should explain device is registered to another account

Test Case 4: Admin Reset
1. Admin resets device binding for student
2. Student logs in from new device
3. ✅ Should allow login
4. ✅ Should save new binding
```

### Biometric Tests

```
Test Case 1: Fingerprint Success
1. Click attendance button
2. Enter correct OTP
3. Show fingerprint prompt
4. Place enrolled finger
5. ✅ Should mark attendance

Test Case 2: Fingerprint Failed → PIN Fallback
1. Click attendance button
2. Enter correct OTP
3. Try incorrect fingerprint 3 times
4. ✅ Should show PIN prompt
5. Enter correct PIN
6. ✅ Should mark attendance

Test Case 3: User Cancels
1. Click attendance button
2. Enter correct OTP
3. Cancel fingerprint prompt
4. ✅ Should show confirmation dialog
5. Click "Yes" to cancel
6. ✅ Should return to home screen
```

### Notification Tests

```
Test Case 1: Foreground Notification
1. Login as student
2. Keep app open (foreground)
3. CR sends notification
4. ✅ Beautiful banner should appear at top
5. ✅ Should auto-dismiss after 5 seconds
6. ✅ Tapping banner should dismiss immediately

Test Case 2: Background Notification - Student
1. Login as student
2. Press Home button (app to background)
3. CR sends notification
4. ✅ System notification should appear
5. Tap notification
6. ✅ App should open and navigate to "Home" tab

Test Case 3: Background Notification - Faculty
1. Login as faculty (r210387@rguktrkv.ac.in)
2. Press Home button
3. Send notification to faculty
4. Tap notification
5. ✅ App should open and navigate to "Schedule" tab

Test Case 4: CR Sends Notification
1. Login as CR
2. ✅ Bell icon should be visible on home screen
3. Click bell icon
4. ✅ Send notification modal should open
5. Fill title and message
6. Click "Send to Class"
7. ✅ Should show success with count ("Sent to 43 students")
```

### Font Scaling Tests

```
Test Case 1: Large Font Size
Android:
1. Settings → Display → Font size → Large
2. Open app
3. ✅ UI should maintain original layout
4. ✅ No text overflow or button breaking

iOS:
1. Settings → Display & Brightness → Text Size → Max
2. Open app
3. ✅ UI should maintain original layout

Test Case 2: Test All Screens
- [ ] Login screen
- [ ] Home screen (schedule list)
- [ ] OTP screen
- [ ] Biometric screen
- [ ] Analytics screen
- [ ] Profile screen
- [ ] Send notification modal (CR)
```

### Security Checks Tests

```
Test Case 1: Active Call Detection
1. Start attendance flow
2. Make/receive phone call
3. ✅ Should show violation modal
4. ✅ Should mark schedule as violated
5. ✅ Should auto-navigate back after 3s

Test Case 2: Screen Mirroring Detection
1. Enable screen mirroring/casting
2. Try to enter OTP screen
3. ✅ Should block and show violation

Test Case 3: Rooted Device Detection
1. On rooted device
2. Try to enter OTP screen
3. ✅ Should block and show violation

Test Case 4: Screenshot Restriction
1. Navigate to OTP screen
2. Try to take screenshot
3. ✅ Should be blocked (screen appears black in screenshot)
```

---

## 🐛 Troubleshooting

### Build Issues

**Problem:** `google-services.json not found`
```powershell
# Solution:
# 1. Download from Firebase Console
# 2. Place in android/app/google-services.json
# 3. Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

**Problem:** `Execution failed for task ':app:processReleaseGoogleServices'`
```powershell
# Solution: Package name mismatch
# Firebase package name MUST be: com.amsrkv
# Check android/app/build.gradle:
applicationId "com.amsrkv"
```

**Problem:** Metro bundler cache issues
```powershell
# Solution:
npm start -- --reset-cache

# Or delete cache manually:
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force android/app/build
npm install
```

**Problem:** Gradle build fails
```powershell
# Solution 1: Clean build
cd android
./gradlew clean
./gradlew assembleRelease --info

# Solution 2: Delete gradle cache
Remove-Item -Recurse -Force android/.gradle
cd android
./gradlew clean
cd ..
```

### Runtime Issues

**Problem:** Device binding fails
```
Error: "Failed to generate device fingerprint"

Solutions:
1. Check network connection
2. Verify backend API is running
3. Check backend logs for errors
4. Verify device has unique hardware ID:
   - Some emulators return same ID
   - Use physical device for testing
```

**Problem:** Biometric not working
```
Solutions:
1. Ensure device has enrolled fingerprint/face
2. Check app has biometric permission
3. Test with PIN fallback
4. Check react-native-biometrics installation:
   cd android
   ./gradlew clean
   cd ..
   npm run android
```

**Problem:** Notifications not received
```
Solutions:
1. Check google-services.json exists
2. Verify FCM token registration in backend logs
3. Check Firebase Console → Cloud Messaging
4. Verify student is in CR's class (database)
5. Test on physical device (emulator may have issues)
6. Check notification permissions:
   Settings → Apps → AMS → Notifications → Enabled
```

**Problem:** App crashes on startup
```
Solutions:
1. Check logs:
   npx react-native log-android

2. Clear app data:
   Settings → Apps → AMS → Storage → Clear Data

3. Uninstall and reinstall:
   adb uninstall com.amsrkv
   adb install <path-to-apk>

4. Check for version mismatches:
   - App version in build.gradle
   - App version in App.tsx
   - Backend API compatibility
```

### Installation Issues

**Problem:** APK won't install
```powershell
# Solution 1: Uninstall old version first
adb uninstall com.amsrkv
adb install <path-to-apk>

# Solution 2: Install with -r flag (replace)
adb install -r <path-to-apk>

# Solution 3: Clear package data
adb shell pm clear com.amsrkv
adb install <path-to-apk>
```

**Problem:** Device not detected
```powershell
# Solution:
1. Enable USB debugging on device:
   Settings → About phone → Tap "Build number" 7 times
   Settings → Developer options → USB debugging → Enable

2. Check ADB connection:
   adb devices

3. Restart ADB server:
   adb kill-server
   adb start-server
   adb devices

4. Try different USB cable/port
```

**Problem:** Multiple devices/emulators detected
```powershell
# List devices
adb devices

# Install to specific device
adb -s <device-id> install <path-to-apk>

# Example:
adb -s emulator-5554 install app-release.apk
```

---

## 📚 Technology Stack

### Core Framework
```json
{
  "react": "19.1.0",
  "react-native": "0.81.4",
  "typescript": "5.8.3"
}
```

### Navigation
- `@react-navigation/native` ^7.1.18
- `@react-navigation/stack` ^7.4.8
- `@react-navigation/bottom-tabs` ^7.4.8
- `@react-navigation/native-stack` ^7.3.27
- `react-native-screens` ^4.16.0
- `react-native-safe-area-context` ^5.5.2
- `react-native-gesture-handler` ^2.28.0

### Authentication & Security
- `@react-native-google-signin/google-signin` ^16.0.0
- `react-native-biometrics` ^3.0.1
- `react-native-device-info` ^14.1.1

### Push Notifications
- `@react-native-firebase/app` ^23.4.0
- `@react-native-firebase/messaging` ^23.4.0
- `react-native-notifier` ^2.0.0

### Storage & State
- `@react-native-async-storage/async-storage` ^2.2.0

### UI Components
- `react-native-vector-icons` ^10.3.0
- `react-native-linear-gradient` ^2.8.3
- `react-native-animatable` ^1.4.0
- `react-native-svg` ^15.13.0
- `react-native-chart-kit` ^6.12.0

### Utilities
- `react-native-fs` ^2.20.0
- `@react-native-documents/picker` ^10.1.7
- `react-native-image-picker` ^8.2.1
- `react-native-file-picker` ^0.0.21
- `react-native-uuid` ^2.0.3
- `@react-native-picker/picker` ^2.11.2
- `@react-native-community/datetimepicker` ^8.4.5

### Development Tools
- `@babel/core` ^7.25.2
- `@react-native-community/cli` 20.0.0
- `eslint` ^8.19.0
- `prettier` 2.8.8
- `jest` ^29.6.3

### Build Configuration
- **Hermes Engine:** Enabled ✅
- **ProGuard/R8:** Enabled ✅
- **Resource Shrinking:** Enabled ✅
- **APK Splitting:** Per CPU architecture ✅

---

## 📊 App Size Optimization

### Before vs After

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Universal APK | ~140 MB | N/A | Disabled |
| ARM64 APK | N/A | 25-35 MB | ~75-80% |
| ARM32 APK | N/A | 25-30 MB | ~75-80% |

### Optimization Techniques Applied

**1. APK Splitting (60-70% reduction)**
```gradle
// android/app/build.gradle
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        universalApk false
    }
}
```

**2. ProGuard/R8 (15-20% reduction)**
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
    }
}
```

**3. Hermes Engine (5-10% reduction)**
```gradle
project.ext.react = [
    enableHermes: true
]
```

**4. Font Optimization (1-2 MB reduction)**
- Removed unnecessary font weights
- Kept only Regular, Medium, Bold
- Total fonts: 23 files → ~9 files

**5. Image Optimization**
- WebP format instead of PNG (where possible)
- Compressed existing images
- Removed unused assets

---

## 🔄 Version History

### v1.0.2 (Current - October 2025)
- ✅ Device binding implementation (hardware-based)
- ✅ FCM push notifications with foreground banners
- ✅ Biometric authentication with PIN fallback
- ✅ Font scaling fixes (custom Text/TextInput components)
- ✅ App size optimization (140 MB → 25-35 MB)
- ✅ Screenshot restriction
- ✅ Security checks (calls, mirroring, rooting, overlays)
- ✅ Send notification modal for CRs
- ✅ Smart navigation based on user roles
- ✅ Responsive UI system

### v1.0.1
- Initial release
- Basic attendance marking
- Google Sign-In
- Role-based navigation

---

## 📞 Support & Contact

**For issues:**
- Create an issue in the repository
- Contact the development team
- Check backend logs: https://ams-server-4eol.onrender.com

**Important Links:**
- Backend Server: https://ams-server-4eol.onrender.com
- Firebase Console: https://console.firebase.google.com/
- React Native Docs: https://reactnative.dev/

---

## 📄 License

This project is private and proprietary to **RGUKT-RKV**.

**Copyright © 2025 RGUKT-RKV. All rights reserved.**

---

## 🙏 Acknowledgments

Built with ❤️ for **RGUKT-RKV** students, faculty, and administrators.

**Key Contributors:**
- Development Team
- Security Implementation
- UI/UX Design
- Backend Integration
- Testing & QA

---

**Last Updated:** October 13, 2025  
**Maintained by:** RGUKT-RKV Development Team
