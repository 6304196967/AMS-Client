/**
 * DEVICE BINDING SERVICE - SIMPLIFIED APPROACH
 * 
 * Purpose: Ensure one user per device (one device per student)
 * - Generates unique device fingerprint (ONLY hardware + platform)
 * - Stores binding_id in backend Student table (UNIQUE constraint!)
 * - Database enforces uniqueness - prevents multiple accounts on same device
 * 
 * Key Insight:
 * - Fingerprint does NOT include email
 * - Same device = Same fingerprint for all users
 * - Database unique constraint on binding_id catches conflicts
 * - Simpler and more robust!
 * 
 * Flow:
 * 1. Generate device fingerprint (hardware only, no email)
 * 2. Try to save binding to backend
 * 3. If UNIQUE CONSTRAINT violation:
 *    - Different user trying to use this device
 *    - Deny login with clear message ✅
 * 4. If SUCCESS:
 *    - First time on this device, binding saved ✅
 *    - Or same user, binding already exists ✅
 * 
 * Backend Routes Used:
 * - POST /student/bind-device/<student_id>     → Save binding_id
 * - POST /admin/reset-device-binding/<student_id> → Admin: Reset binding
 */

import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

/**
 * Extract Student ID from Email
 * 
 * Examples:
 * - "n200504@rguktrkv.ac.in" → "n200504"
 * - "faculty@rguktrkv.ac.in" → "faculty"
 * - "admin@rguktrkv.ac.in" → "admin"
 */
export const extractStudentId = (email: string): string => {
  return email.split('@')[0].toUpperCase();
};

/**
 * Generate Device Fingerprint
 * 
 * SIMPLIFIED: Uses ONLY hardware identifiers (NO email!)
 * 
 * Why NO email?
 * - Database unique constraint on binding_id handles conflicts
 * - Simpler fingerprint generation
 * - Same device always generates same fingerprint
 * - Database prevents different users on same device
 * 
 * Format: bind_<deviceId>_<platform>
 * Example: bind_abc123xyz_android
 * 
 * Persists even after:
 * - App uninstall/reinstall (hardware ID persists)
 * - Storage clearing (regenerates same fingerprint)
 * 
 * Note: NO timestamp, NO email to ensure consistent fingerprint
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    // Get hardware-based identifiers
    const deviceId = await DeviceInfo.getUniqueId(); // Hardware ID (most reliable)
    const platform = Platform.OS;

    // Create deterministic fingerprint (no timestamp, no email!)
    // Format: bind_<deviceId>_<platform>
    const fingerprint = `bind_${deviceId}_${platform}`;
    
    // Cache locally for quick access
    await AsyncStorage.setItem('device_fingerprint', fingerprint);
    
    return fingerprint;
  } catch (error) {
    console.error('❌ Error generating device fingerprint:', error);
    throw new Error('Failed to generate device fingerprint');
  }
};

/**
 * Validate Device Binding - SIMPLIFIED APPROACH
 * 
 * Main function called during login
 * 
 * Flow (Database-Driven):
 * 1. Extract student ID from email
 * 2. Generate device fingerprint (hardware only, NO email!)
 * 3. Try to save binding to backend
 * 4. Backend has UNIQUE constraint on binding_id:
 *    - If binding_id already exists for DIFFERENT student: UNIQUE CONSTRAINT ERROR
 *    - If binding_id same for SAME student: Success (already bound)
 *    - If no binding: Success (new binding created)
 * 5. Handle response:
 *    - Success → Allow login ✅
 *    - Unique constraint error → Different user on same device → Deny ❌
 * 
 * Why This is Better:
 * - Simpler logic (no GET call needed)
 * - Database enforces uniqueness (more reliable)
 * - Same fingerprint for same device (email not needed)
 * - Clear error when different user tries same device
 * 
 * Returns:
 * - { allowed: true } → Login permitted
 * - { allowed: false, message: "..." } → Login denied with reason
 */
export const validateDeviceBinding = async (
  userEmail: string
): Promise<{ allowed: boolean; message?: string; conflictEmail?: string }> => {
  try {
    // Step 1: Extract student ID from email
    const studentId = extractStudentId(userEmail);
    
    // Step 2: Generate device fingerprint (NO email - hardware only!)
    const deviceFingerprint = await generateDeviceFingerprint();
    
    // Step 3: Try to save binding to backend
    // Backend will handle uniqueness check via database constraint
    const response = await fetch(
      `${API_BASE_URL}/student/bind-device/${studentId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ binding_id: deviceFingerprint }),
      }
    );

    const data = await response.json();

    // Step 4: Handle response
    if (response.ok && data.success) {
      // Success - either new binding or same student re-binding      
      // Cache locally
      await AsyncStorage.setItem('device_fingerprint', deviceFingerprint);
      await AsyncStorage.setItem('bound_student', studentId);
      
      return { allowed: true };
    } else {
      // Check if it's a unique constraint error
      const errorMessage = data.error || data.message || '';
      
      if (errorMessage.toLowerCase().includes('unique') || 
          errorMessage.toLowerCase().includes('already bound') ||
          errorMessage.toLowerCase().includes('different')) {
        // UNIQUE CONSTRAINT VIOLATION
        // This device is already bound to a DIFFERENT student
        
        return {
          allowed: false,
          message: `This device is already registered to another student account.\n\n` +
                   `You are trying to login with: ${userEmail}\n\n` +
                   `Only ONE student can use this device.\n\n` +
                   `If you lost access to your original account, contact admin to reset device binding.`,
          conflictEmail: errorMessage // Backend might include which email it's bound to
        };
      } else {
        // Some other error
        console.error('❌ Failed to save binding:', errorMessage);
        throw new Error(errorMessage || 'Failed to save device binding');
      }
    }
  } catch (error: any) {
    console.error('❌ Device binding validation error:', error);
    
    // In case of network error or backend issue
    // OPTION A: Deny login (strict security)
    // OPTION B: Allow login with warning (user convenience)
    
    // Currently using OPTION B - change to OPTION A if needed
    return {
      allowed: true, // Change to false for stricter security
      message: '⚠️ Warning: Could not verify device binding. Network error.'
    };
  }
};

/**
 * Get Cached Binding Info
 * 
 * Quick local check (not authoritative, backend is source of truth)
 * Used for offline scenarios or quick validations
 */
export const getCachedBindingInfo = async (): Promise<{ fingerprint: string | null; studentId: string | null }> => {
  try {
    const fingerprint = await AsyncStorage.getItem('device_fingerprint');
    const studentId = await AsyncStorage.getItem('bound_student');
    return { fingerprint, studentId };
  } catch (error) {
    console.error('Error getting cached binding:', error);
    return { fingerprint: null, studentId: null };
  }
};

/**
 * Clear Device Binding Cache
 * 
 * Clears local cache only (backend binding remains)
 * Used during logout or troubleshooting
 * 
 * NOTE: This does NOT unbind the device from backend!
 * Only admin can reset binding via: POST /admin/reset-device-binding/<student_id>
 */
export const clearDeviceBindingCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'device_fingerprint',
      'bound_student'
    ]);
  } catch (error) {
    console.error('Error clearing device binding cache:', error);
  }
};

/**
 * Admin Reset Device Binding
 * 
 * Calls: POST /admin/reset-device-binding/<student_id>
 * 
 * This allows admin to unbind a device from a student account
 * Student can then login from a new device
 * 
 * NOTE: This requires admin authentication in production
 */
export const adminResetDeviceBinding = async (studentId: string): Promise<void> => {
  try {
    
    const response = await fetch(
      `${API_BASE_URL}/admin/reset-device-binding/${studentId}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // TODO: Add admin authentication token
          // 'Authorization': `Bearer ${adminToken}`
        },
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {      
      // Clear local cache
      await AsyncStorage.removeItem(`bound_student_${studentId}`);
    } else {
      console.error('❌ Failed to reset binding:', data.message);
      throw new Error(data.message || 'Failed to reset device binding');
    }
  } catch (error: any) {
    console.error('❌ Error resetting binding:', error);
    throw error;
  }
};
