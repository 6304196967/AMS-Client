import React, { useState } from "react";
import { Alert, View, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
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

  // Don't render anything if user is not available
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
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
      setOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
    }
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
          <View style={styles.dropdown}>
            <View style={styles.userInfo}>
              <Icon name="person" size={fontSize(20)} color="#600202" />
              <Text style={styles.usernameDropdown}>
                {user?.name || 'User'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={handleLogout}
            >
              <Icon name="logout" size={fontSize(20)} color="red" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    width: wp(40),
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
});

export default Profile;