import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// 1. Import the Param List type from your navigator file
import { StudentStackParamList } from './StudentStackNavigator'; // Adjust the import path if needed

const { width } = Dimensions.get("window");

// 2. Define the type for this screen's props
type Props = NativeStackScreenProps<StudentStackParamList, 'StudentManagementBase'>;

// 3. Use the type in your component definition
const StudentManagement: React.FC<Props> = ({ navigation }) => {
  const departments = [
    { name: "CE", color: "#FF6B6B" },
    { name: "CHE", color: "#4ECDC4" },
    { name: "CSE", color: "#FFD93D" },
    { name: "ECE", color: "#1A535C" },
    { name: "EEE", color: "#FF9F1C" },
    { name: "ME", color: "#6A4C93" },
    { name: "MME", color: "#2EC4B6" },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={departments}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tile, { backgroundColor: item.color }]}
            // TypeScript now knows `Maps` is a valid function and
            // that 'DepartmentDetail' is a valid screen name.
            onPress={() =>
              navigation.navigate('DepartmentDetail', { departmentName: item.name })
            }
          >
            <Text style={styles.tileText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#600202",
    padding: 16,
  },
  list: {
    justifyContent: "center",
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tile: {
    width: (width - 80) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tileText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default StudentManagement;