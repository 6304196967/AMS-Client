// student/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar } from 'react-native';
import { Text, TextInput } from '../../components';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary } from 'react-native-image-picker';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../../utils/responsive';
import { cleanupFCMOnLogout } from '../../utils/notificationService';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_LARGE_DEVICE = SCREEN_WIDTH > 414;

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [studentDetails, setStudentDetails] = useState<{
    year: string;
    department: string;
    section: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel) return;

      if (result.errorMessage) {
        Alert.alert('Error', result.errorMessage);
        return;
      }

      if (result.assets && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await AsyncStorage.setItem(`profileImage_${user.email}`, imageUri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleLogout = async () => {
    try {
      await cleanupFCMOnLogout(user.email);
    } catch (error) {
      console.error('Error during FCM cleanup:', error);
    }
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    setLogoutModalVisible(false);
  };

  // Responsive calculations
  const avatarSize = IS_SMALL_DEVICE ? SCREEN_WIDTH * 0.28 : SCREEN_WIDTH * 0.32;
const headerHeight = IS_SMALL_DEVICE ? SCREEN_HEIGHT * 0.30 : SCREEN_HEIGHT * 0.35;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#800000" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={[styles.header, { height: headerHeight }]}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleImageUpload} style={styles.avatarTouchable}>
              <Image
                source={profileImage ? { uri: profileImage } : require('../../../assets/images/rgukt_w.png')}
                style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
              />
              <View style={styles.cameraIcon}>
                <Icon name="camera-plus" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={2}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Icon name="account" size={14} color="#F8E0E0" />
              <Text style={styles.userRole}>{user.role || "Student"}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#800000" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <>
              {/* Quick Stats */}
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statCard1]}>
                  <Icon name="school" size={22} color="#2E7D32" />
                  <Text style={styles.statLabel}>Year</Text>
                  <Text style={[styles.statValue, styles.statValue1]}>
                    {studentDetails?.year || "N/A"}
                  </Text>
                </View>

                <View style={[styles.statCard, styles.statCard2]}>
                  <Icon name="book-open-page-variant" size={22} color="#800000" />
                  <Text style={styles.statLabel}>Department</Text>
                  <Text style={[styles.statValue, styles.statValue2]} numberOfLines={1}>
                    {studentDetails?.department || "N/A"}
                  </Text>
                </View>

                <View style={[styles.statCard, styles.statCard3]}>
                  <Icon name="google-classroom" size={22} color="#EF6C00" />
                  <Text style={styles.statLabel}>Section</Text>
                  <Text style={[styles.statValue, styles.statValue3]}>
                    {studentDetails?.section || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Personal Info */}
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                
                <InfoRow 
                  icon="card-account-details" 
                  label="Student ID" 
                  value={user.email.replace('@rguktrkv.ac.in', '').toUpperCase() || "N/A"}
                />
                <InfoRow 
                  icon="email" 
                  label="Email Address" 
                  value={user.email}
                  isLast={true}
                />
              </View>

              {/* Logout Button */}
              <TouchableOpacity 
                style={styles.logoutBtn}
                onPress={() => setLogoutModalVisible(true)}
              >
                <Icon name="logout" size={20} color="#FFF" />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal 
        visible={logoutModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Icon name="logout" size={40} color="#800000" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleLogout}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({ icon, label, value, isLast = false }: any) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <Icon name={icon} size={20} color="#800000" style={styles.rowIcon} />
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#800000',
    paddingHorizontal: SPACING.lg,
    paddingTop: spacing(50),
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing(12),
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 70,
    backgroundColor: "#F8E0E0",
    borderWidth: 4,
    borderColor: '#FFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#800000',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: { 
    fontSize: fontSize(20), 
    fontWeight: "700", 
    color: "#FFF", 
    textAlign: 'center',
    marginBottom: spacing(6),
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(4),
    borderRadius: 12,
  },
  userRole: { 
    fontSize: FONT_SIZES.sm, 
    color: "#F8E0E0", 
    marginLeft: spacing(4),
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: spacing(20),
    paddingBottom: spacing(30),
  },
  loader: {
    paddingVertical: spacing(60),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing(12),
    fontSize: FONT_SIZES.md,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(20),
    gap: spacing(8),
  },
  statCard: {
    flex: 1,
    padding: spacing(12),
    borderRadius: 12,
    alignItems: 'center',
    minHeight: IS_SMALL_DEVICE ? 80 : 90,
  },
  statCard1: { backgroundColor: '#ebe7e7ff' },
  statCard2: { backgroundColor: '#ebe7e7ff' },
  statCard3: { backgroundColor: '#ebe7e7ff' },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    marginTop: spacing(6),
    textAlign: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginTop: spacing(2),
  },
  statValue1: { color: '#2E7D32' },
  statValue2: { color: '#800000' },
  statValue3: { color: '#EF6C00' },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: spacing(16),
    marginBottom: spacing(20),
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#800000',
    marginBottom: spacing(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(12),
    minHeight: 50,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowIcon: {
    marginRight: spacing(12),
    width: 24,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#800000',
    paddingVertical: spacing(14),
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#800000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 50,
  },
  logoutBtnText: { 
    color: "#FFF", 
    fontWeight: "700", 
    fontSize: FONT_SIZES.md, 
    marginLeft: spacing(8),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalCard: { 
    width: "100%", 
    maxWidth: 350,
    backgroundColor: "#FFF", 
    borderRadius: 20, 
    padding: spacing(24),
    elevation: 8,
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing(16),
  },
  modalTitle: { 
    fontSize: FONT_SIZES.lg, 
    fontWeight: "700", 
    marginBottom: spacing(8), 
    textAlign: "center",
    color: "#800000",
  },
  modalText: {
    marginBottom: spacing(16),
    fontSize: FONT_SIZES.md,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  highlight: {
    fontWeight: "700",
    color: '#800000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: spacing(12),
    marginBottom: spacing(20),
    fontSize: FONT_SIZES.md,
    backgroundColor: "#F9F9F9",
  },
  modalActions: { 
    flexDirection: "row", 
    gap: spacing(12),
  },
  modalBtn: { 
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
  modalBtnText: { 
    color: "#FFF", 
    fontWeight: "600",
    fontSize: FONT_SIZES.md,
  },
});

export default ProfileScreen;