import React, { useState } from "react";
import { Alert, View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Text } from '../components';
import Icon from "react-native-vector-icons/MaterialIcons";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { wp, spacing, fontSize, FONT_SIZES } from '../utils/responsive';
import { cleanupFCMOnLogout } from '../utils/notificationService';

type ProfileProps = {
  user: {
    name: string;
    email: string;
  } | null; // Allow user to be null
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: { name: string; email: string } | null) => void;
};

const Profile: React.FC<ProfileProps> = ({ user, setIsLoggedIn, setUser }) => {
  const [open, setOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Don't render anything if user is not available
  if (!user) {
    return null;
  }

  const handleLogoutConfirm = async () => {
    try {
      // Cleanup FCM token before logout
      try {
        await cleanupFCMOnLogout(user.email);
      } catch (error) {
        console.error('Error during FCM cleanup:', error);
        // Continue with logout even if cleanup fails
      }
      
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      setUser(null); 
      setLogoutModalVisible(false);
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
    }
  };

  const handleLogoutPress = () => {
    setOpen(false);
    setLogoutModalVisible(true);
  };

  // Calculate dynamic width based on name length
  const getDropdownWidth = () => {
    const nameLength = user?.name?.length || 4;
    // Base width: 50% for short names, up to 65% for very long names
    const dynamicWidth = Math.min(Math.max(50, 50 + nameLength * 1.5), 65);
    return wp(dynamicWidth);
  };

  return (
    <View style={{ marginRight: spacing(10) }}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.profileButton}
      >
        <Icon name="person" size={fontSize(28)} color="#f5f5f5" />
    
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={[styles.dropdown, { width: getDropdownWidth() }]}>
            <View style={styles.userInfo}>
              <Icon name="person" size={fontSize(20)} color="#600202" />
              <Text style={styles.usernameDropdown}>
                {user?.name || 'User'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={handleLogoutPress}
            >
              <Icon name="logout" size={fontSize(20)} color="red" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutModalIcon}>
              <Icon name="logout" size={40} color="#800000" />
            </View>
            <Text style={styles.logoutModalTitle}>Confirm Logout</Text>
            <Text style={styles.logoutModalText}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={[styles.logoutModalBtn, styles.cancelBtn]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.logoutModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutModalBtn, styles.confirmBtn]}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.logoutModalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(8),
    borderRadius: 20,
    justifyContent: "center",
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  dropdown: {
    marginTop: spacing(60),
    marginRight: spacing(10),
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: wp(50),
    maxWidth: wp(85),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(10),
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  usernameDropdown: {
    marginLeft: spacing(8),
    marginRight: spacing(8),
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(12),
  },
  logoutText: {
    marginLeft: spacing(8),
    fontSize: FONT_SIZES.md,
    color: 'red',
    fontWeight: '500',
  },
  
  // Logout Confirmation Modal Styles
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing(20),
  },
  logoutModalCard: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: spacing(24),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutModalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing(16),
  },
  logoutModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: spacing(8),
    textAlign: "center",
    color: "#800000",
  },
  logoutModalText: {
    marginBottom: spacing(20),
    fontSize: FONT_SIZES.md,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutModalActions: {
    flexDirection: "row",
    gap: spacing(12),
  },
  logoutModalBtn: {
    flex: 1,
    paddingVertical: spacing(12),
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
  },
  cancelBtn: {
    backgroundColor: "#757575"
  },
  confirmBtn: {
    backgroundColor: "#800000"
  },
  logoutModalBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: FONT_SIZES.md,
  },
});

export default Profile;