# 📱 Push Notifications - Visual Flow Guide

## 🎨 User Interface

### CR Home Screen
```
┌─────────────────────────────────────┐
│  Hello,                             │
│  John Doe!                          │
│                                     │
│  [Today] [Tomorrow]                 │
│                                     │
│  Today's Classes          [+] [🔔] │ ← Bell icon here!
│  ─────────────────────────────────  │
│  ┌───────────────────────────────┐ │
│  │ 📚 Data Structures            │ │
│  │ ⏰ 8:30 - 9:30 | 📍 Lab 201  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Send Notification Modal (After clicking bell)
```
┌─────────────────────────────────────┐
│ 🔔 Send Notification            [X] │
│─────────────────────────────────────│
│ 👥 E2 CSE - A                       │
│─────────────────────────────────────│
│                                     │
│ Quick Templates:                    │
│ [Class Cancelled] [Venue Changed]   │
│ [Time Changed] [Assignment]         │
│                                     │
│ Title                     (0/100)   │
│ ┌─────────────────────────────────┐ │
│ │ Class Update                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Message                   (0/500)   │
│ ┌─────────────────────────────────┐ │
│ │ Tomorrow's class venue          │ │
│ │ changed to Lab 201              │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────┐    │
│  │  📤 Send to Class          │    │
│  └────────────────────────────┘    │
│                                     │
│ ℹ️  Will be sent to all students   │
│    in your class with the app      │
└─────────────────────────────────────┘
```

---

## 🔄 Notification Flow

### When CR Sends Notification:

```
  CR Device                Backend Server              Student Devices
     │                           │                           │
     │ 1. Click Bell Icon        │                           │
     │ ────────────────>         │                           │
     │                           │                           │
     │ 2. Enter Title/Message    │                           │
     │                           │                           │
     │ 3. Click "Send"           │                           │
     │ ────────────────>         │                           │
     │                           │                           │
     │                      4. Validate CR                   │
     │                           │                           │
     │                      5. Get Class Students            │
     │                           │                           │
     │                      6. Get FCM Tokens                │
     │                           │                           │
     │                      7. Send to Firebase FCM          │
     │                           │ ─────────────────>        │
     │                           │                      8. Receive Push
     │                           │                           │
     │ <──── Success! ────       │                      9. Show Notification
     │ "Sent to 43 students"     │                           │
```

---

## 🔔 Student Notification States

### Foreground (App Open)
```
┌─────────────────────────────────────┐
│          Class Update               │
│─────────────────────────────────────│
│  Tomorrow's class venue changed     │
│  to Lab 201                         │
│                                     │
│              [  OK  ]               │
└─────────────────────────────────────┘
```

### Background/Quit (System Notification)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AMS App                        now
  
  Class Update
  Tomorrow's class venue changed
  to Lab 201
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Data Flow Diagram

### Token Registration (On Login)
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Student    │      │   Backend    │      │   Firebase   │
│   Login      │      │   Server     │      │     FCM      │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                      │
       │ 1. Google Login     │                      │
       ├─────────────────────>                      │
       │                     │                      │
       │ 2. Get FCM Token    │                      │
       ├─────────────────────┼──────────────────────>
       │                     │                      │
       │ 3. Register Token   │                      │
       ├─────────────────────>                      │
       │                     │                      │
       │                4. Store Token              │
       │                     │ (Database)           │
       │                     │                      │
       │ 5. Success          │                      │
       <─────────────────────┤                      │
       │                     │                      │
```

### Sending Notification
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│      CR      │      │   Backend    │      │   Firebase   │
│              │      │   Server     │      │     FCM      │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                      │
       │ 1. Click Bell       │                      │
       │                     │                      │
       │ 2. Enter Details    │                      │
       │                     │                      │
       │ 3. Send Request     │                      │
       ├─────────────────────>                      │
       │                     │                      │
       │                4. Verify CR                │
       │                     │                      │
       │                5. Get Class Students       │
       │                     │                      │
       │                6. Get FCM Tokens           │
       │                     │                      │
       │                7. Call Firebase API        │
       │                     ├──────────────────────>
       │                     │                      │
       │                     │                 8. Send to Devices
       │                     │                      │
       │                9. Log Notification         │
       │                     │                      │
       │ 10. Return Stats    │                      │
       <─────────────────────┤                      │
       │                     │                      │
```

---

## 🗂️ Backend Database Tables

### FCMToken Table
```
┌────────────────────────────────────────────────────┐
│ id │ student_email      │ fcm_token    │ device  │
├────┼────────────────────┼──────────────┼─────────┤
│ 1  │ e230123@rgukt...   │ eXaMpLe...   │ android │
│ 2  │ e230124@rgukt...   │ tOkEn123...  │ ios     │
│ 3  │ e230125@rgukt...   │ aBcDeF...    │ android │
└────────────────────────────────────────────────────┘
```

### NotificationLog Table
```
┌──────────────────────────────────────────────────────────────┐
│ id │ cr_email     │ title        │ message      │ count │ ... │
├────┼──────────────┼──────────────┼──────────────┼───────┼─────┤
│ 1  │ cr@rgukt...  │ Class Update │ Venue...     │ 43    │ ... │
│ 2  │ cr@rgukt...  │ Assignment   │ Due date...  │ 43    │ ... │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### CR Actions
| Action | Result |
|--------|--------|
| Login | See bell icon on home screen |
| Click 🔔 | Open notification modal |
| Select template | Auto-fill title/message |
| Type custom | Enter any title/message |
| Send | Notification sent to all class students |

### Student Actions
| Action | Result |
|--------|--------|
| Login | FCM token auto-registered |
| Receive notification (foreground) | Alert popup |
| Receive notification (background) | System notification |
| Tap notification | Open app |

---

## 🔧 Technical Stack

```
Frontend:
  ├── React Native
  ├── @react-native-firebase/messaging
  └── TypeScript

Backend:
  ├── Flask
  ├── firebase-admin
  └── SQLAlchemy

Services:
  └── Firebase Cloud Messaging (FCM)
```

---

## 📱 Supported Platforms

✅ Android (Fully Configured)
⚠️ iOS (Needs GoogleService-Info.plist)

---

## 🎓 Example Scenarios

### Scenario 1: Class Cancelled
```
Title: Class Cancelled
Message: Today's Data Structures class (8:30 AM) has been cancelled.

→ 43 students receive notification instantly
```

### Scenario 2: Venue Change
```
Title: Venue Changed
Message: Tomorrow's lab session will be in Computer Lab 3 instead of Lab 2.

→ All students notified before the class
```

### Scenario 3: Assignment Reminder
```
Title: Assignment Due Tomorrow
Message: Reminder: DBMS assignment submission deadline is tomorrow at 11:59 PM.

→ Students get timely reminder
```

---

**Pro Tip**: Use quick templates to save time and ensure consistent messaging! 🚀
