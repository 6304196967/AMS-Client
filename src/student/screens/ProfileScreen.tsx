// student/screens/ProfileScreen.tsx
import React, { useState } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type ProfileScreenProps = {
  user: { name: string; email: string; role?: string; id?: string; phone?: string };
  setIsLoggedIn: (val: boolean) => void;
  setUser: (user: any) => void;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, setIsLoggedIn, setUser }) => {
  // 🔥 State for Logout Modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutInput, setLogoutInput] = useState("");

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header with avatar */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // replace with user.photo if available
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role || "Student"}</Text>
      </View>

      {/* Profile Info Card */}
      <View style={styles.card}>
        <InfoRow icon="card-account-details" label="User ID" value={user.id || "N/A"} />
        <InfoRow icon="email" label="Email" value={user.email} />
        <InfoRow icon="phone" label="Phone" value={user.phone || "N/A"} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
        <Icon name="logout" size={22} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={{ marginBottom: 10 }}>
              Please type <Text style={{ fontWeight: "bold" }}>"I want to logout"</Text> to confirm.
            </Text>
            <TextInput
              placeholder="Type here..."
              value={logoutInput}
              onChangeText={setLogoutInput}
              style={styles.input}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
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
    <Icon name={icon} size={22} color="#2E3B55" style={{ marginRight: 12 }} />
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
    paddingVertical: 30,
    backgroundColor: "#2E3B55",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: "#DDD",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  role: { fontSize: 16, color: "#CCC", marginTop: 4 },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  infoLabel: { fontSize: 13, color: "#666" },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#111" },
  logoutButton: {
    marginTop: 40,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B71C1C",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
  },
  logoutText: { color: "#FFF", fontWeight: "bold", fontSize: 16, marginLeft: 8 },

  // 🔥 Extra modal styles (kept minimal so styles remain intact)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: { width: "85%", backgroundColor: "#FFF", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: { backgroundColor: "#28a745", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});

export default ProfileScreen;
