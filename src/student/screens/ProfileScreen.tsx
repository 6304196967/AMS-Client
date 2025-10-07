// student/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';

// Configuration
const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

type ProfileScreenProps = {
  user: { name: string; email: string; role?: string; id?: string; phone?: string };
  setIsLoggedIn: (val: boolean) => void;
  setUser: (user: any) => void;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  setIsLoggedIn, 
  setUser
}) => {
  // 🔥 State for Logout Modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutInput, setLogoutInput] = useState("");
  
  // State for student details
  const [studentDetails, setStudentDetails] = useState<{
    year: string;
    department: string;
    section: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch student details from backend
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const studentId = user.email.replace('@rguktrkv.ac.in', '').toUpperCase();
        const response = await fetch(`${API_BASE_URL}/student/profile/${studentId}`);
        
        if (response.ok) {
          const data = await response.json();
          setStudentDetails({
            year: data.year || 'N/A',
            department: data.department || 'N/A',
            section: data.section || 'N/A',
          });
        } else {
          console.error('Failed to fetch student details');
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load profile image from AsyncStorage
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem(`profileImage_${user.email}`);
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    fetchStudentDetails();
    loadProfileImage();
  }, [user.email]);

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorMessage) {
        Alert.alert('Error', result.errorMessage);
        return;
      }

      if (result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(`profileImage_${user.email}`, imageUri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleLogout = async () => {
    if (logoutInput.trim() === "I want to logout") {
      await AsyncStorage.clear();
      setIsLoggedIn(false);
      setUser(null);
      setLogoutModalVisible(false);
      setLogoutInput("");
    } else {
      Alert.alert("Error", "You must type exactly: I want to logout");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing(40) }}>
      {/* Header with avatar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImageUpload} style={styles.avatarContainer}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../../assets/images/rgukt_w.png')}
            style={styles.avatar}
          />
          <View style={styles.cameraIconContainer}>
            <Icon name="camera" size={fontSize(20)} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role || "Student"}</Text>
      </View>

      {/* Profile Info Card */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E3B55" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <InfoRow icon="card-account-details" label="ID Number" value={user.email.replace('@rguktrkv.ac.in', '').toUpperCase() || "N/A"} />
          <InfoRow icon="email" label="Email" value={user.email} />
          <InfoRow icon="school" label="Year" value={studentDetails?.year || "N/A"} />
          <InfoRow icon="book-open-variant" label="Department" value={studentDetails?.department || "N/A"} />
          <InfoRow icon="google-classroom" label="Section" value={studentDetails?.section || "N/A"} />
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
        <Icon name="logout" size={fontSize(22)} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal 
        visible={logoutModalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => {
          setLogoutModalVisible(false);
          setLogoutInput("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={{ marginBottom: spacing(10) }}>
              Please type <Text style={{ fontWeight: "bold" }}>"I want to logout"</Text> to confirm.
            </Text>
            <TextInput
              placeholder="Type here..."
              value={logoutInput}
              onChangeText={setLogoutInput}
              style={styles.input}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: spacing(10) }}>
            <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "red" }]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  setLogoutInput("");
                }}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>Confirm</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={fontSize(22)} color="#2E3B55" style={{ marginRight: SPACING.md }} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    alignItems: "center",
    paddingVertical: spacing(30),
    backgroundColor: "#2E3B55",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing(15),
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DDD",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2E3B55',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  loadingContainer: {
    marginHorizontal: SPACING.xl,
    marginTop: spacing(25),
    padding: spacing(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing(10),
    fontSize: FONT_SIZES.md,
    color: '#666',
  },
  name: { fontSize: fontSize(22), fontWeight: "bold", color: "#FFF" },
  role: { fontSize: FONT_SIZES.lg, color: "#CCC", marginTop: SPACING.xs },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: SPACING.xl,
    marginTop: spacing(25),
    padding: SPACING.xl,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing(18) },
  infoLabel: { fontSize: fontSize(13), color: "#666" },
  infoValue: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: "#111" },
  logoutButton: {
    marginTop: spacing(40),
    marginHorizontal: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B71C1C",
    paddingVertical: spacing(14),
    borderRadius: 12,
    elevation: 3,
  },
  logoutText: { color: "#FFF", fontWeight: "bold", fontSize: FONT_SIZES.lg, marginLeft: SPACING.sm },

  // 🔥 Extra modal styles (kept minimal so styles remain intact)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "85%", backgroundColor: "#FFF", borderRadius: 12, padding: SPACING.xl },
  modalTitle: { fontSize: FONT_SIZES.xxl, fontWeight: "bold", marginBottom: spacing(15), textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: spacing(10),
    marginBottom: spacing(10),
  },
  modalButton: { backgroundColor: "#28a745", paddingVertical: spacing(10), paddingHorizontal: SPACING.xl, borderRadius: 8 },
});

export default ProfileScreen;
