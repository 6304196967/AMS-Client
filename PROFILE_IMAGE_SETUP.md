# Profile Image Upload Setup

## Current Status
✅ **Student Details Feature**: Fully implemented and ready to use
- Fetches Year, Department, Section from backend API
- API Endpoint: `GET /student/profile/:studentId`

⚠️ **Image Upload Feature**: Temporarily disabled (needs rebuild)

## To Enable Image Upload Feature:

### Step 1: The package is already installed
```bash
# Already done - react-native-image-picker is installed
```

### Step 2: Rebuild the Android app
```bash
npx react-native run-android
```

### Step 3: Uncomment the code in ProfileScreen.tsx

In `src/student/screens/ProfileScreen.tsx`:

1. **Line 17** - Uncomment the import:
```typescript
import { launchImageLibrary } from 'react-native-image-picker';
```

2. **Lines 104-130** - Uncomment the image picker code in `handleImageUpload` function

### Step 4: Test the feature
- Tap on the profile picture
- Select an image from gallery
- Image will be saved in AsyncStorage (local storage)

## Backend API Required

Make sure your backend has this endpoint:

```
GET /student/profile/:studentId
```

**Response format:**
```json
{
  "year": "E1",
  "department": "CSE",
  "section": "A"
}
```

## Features Included:
- ✅ Camera icon on profile picture
- ✅ Tap to upload image
- ✅ Image stored in AsyncStorage (persists across app sessions)
- ✅ Each student has their own profile image (keyed by email)
- ✅ Displays Year, Department, Section instead of phone number
- ✅ Loading state while fetching data
- ✅ Error handling for failed requests
