import React, { useState } from 'react';
import { View, StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal, KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl } from 'react-native';
import { Text, TextInput } from '../components';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { pick, types} from '@react-native-documents/picker';

import { Faculty, InputFieldProps, FilterButtonsProps} from 'src/services/Interfaces';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../utils/responsive';


// Filter options
const departmentOptions = ['All', 'CSE', 'ECE', 'EEE', 'CIVIL', 'ME', 'MME', 'CHEM'];
const yearOptions = ['All', 'E1', 'E2', 'E3', 'E4'];
const sectionOptions = ['All', 'A', 'B', 'C', 'D', 'E'];
const batch = {'1': 'E1', '2': 'E2', '3': 'E3', '4': 'E4'};
const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

const FacultyManagement = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [filteredFacultyList, setFilteredFacultyList] =  useState<Faculty[]>([{
    id: "",
    name: "",
    department: "",
    subject_code: "",
    year: "",
    section: "",
    assignment_id: 0,
  }]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [newFaculty, setNewFaculty] = useState<Faculty>({
    id: "",
    name: "",
    department: "",
    subject_code: "",
    year: "",
    section: "",
    assignment_id: 0,
  });

  const [editingFaculty, setEditingFaculty] = useState<Faculty>({
    id: "",
    name: "",
    department: "",
    subject_code: "",
    year: "",
    section: "",
    assignment_id: 0,
  });

  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch faculty list on component mount
  React.useEffect(() => {
    fetchFacultyListFromBackend();
  }, []);

  // Filter and search when criteria change
  React.useEffect(() => {
    filterFaculty();
  }, [selectedDepartment, selectedYear, selectedSection, searchQuery, facultyList]);

  // Fetch faculty list from backend
  const fetchFacultyListFromBackend = async () => {
    try {
      setIsLoading(true);
      const data = await fetch(`${API_BASE_URL}/faculties`).then(res => res.json());
      const facultyData = data['faculties']

      for (let  faculty of facultyData) {
        faculty.year = batch[faculty.year as keyof typeof batch] || faculty.year;
      }

      setFacultyList(facultyData);
      
    } catch (error) {
      Alert.alert("Error", "Failed to fetch faculty list");
      console.error("Error fetching faculty list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFacultyListFromBackend();
    } finally {
      setRefreshing(false);
    }
  };

  // Filter faculty based on selected filters and search query
  const filterFaculty = () => {
    let filtered = facultyList;
    
    // Apply department filter
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(faculty => faculty.department === selectedDepartment);
    }
    
    // Apply year filter
    if (selectedYear !== 'All') {
      filtered = filtered.filter(faculty => faculty.year === selectedYear);
    }
    
    // Apply section filter
    if (selectedSection !== 'All') {
      filtered = filtered.filter(faculty => faculty.section === selectedSection);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faculty => 
        faculty.name.toLowerCase().includes(query) ||
        faculty.id.toLowerCase().includes(query) ||
        faculty.subject_code.toLowerCase().includes(query)
      );
    }
    
    setFilteredFacultyList(filtered);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (selectedDepartment !== 'All') count++;
    if (selectedYear !== 'All') count++;
    if (selectedSection !== 'All') count++;
    return count;
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDepartment('All');
    setSelectedYear('All');
    setSelectedSection('All');
    setSearchQuery('');
  };

  // Apply filters and close modal
  const applyFilters = () => {
    setIsFilterModalVisible(false);
    filterFaculty();
  };

  // Remove faculty
  const removeFaculty = async (assigmentId : number) => {
    Alert.alert(
      "Remove Faculty",
      "Are you sure you want to remove this faculty member?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/faculties/remove/${assigmentId}`, {
                method: 'DELETE',
              });
              const updatedList = facultyList.filter(faculty => faculty.assignment_id !== assigmentId);
              setFacultyList(updatedList);
              Alert.alert("Success", "Faculty removed successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to remove faculty");
            }
          }
        }
      ]
    );
  };

  // Edit faculty
  const editFaculty = (faculty : Faculty) => {
    setEditingFaculty({...faculty});
    setIsEditModalVisible(true);
  };

  // Handle adding new faculty
  // Handle adding new faculty - CORRECTED
const handleAddFaculty = async () => {
  // Validation
  if (!newFaculty.id || !newFaculty.name || !newFaculty.subject_code || !newFaculty.department || !newFaculty.year || !newFaculty.section) {
    Alert.alert("Error", "Please fill in all required fields");
    return;
  }

  setIsSubmitting(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/faculties/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFaculty)
    });

    const responseData = await response.json();
    
    if (response.ok && responseData.success) {
      const addedFaculty = responseData.faculty;
      // Convert year back to display format
      addedFaculty.year = batch[addedFaculty.year as keyof typeof batch] || addedFaculty.year;
      
      const updatedList = [...facultyList, addedFaculty];
      setFacultyList(updatedList);
      resetAddForm();
      setIsAddModalVisible(false);
      Alert.alert("Success", "Faculty added successfully!");
    } else {
      Alert.alert("Error", responseData.message || "Failed to add faculty");
    }
  } catch (error) {
    console.error("Add faculty error:", error);
    Alert.alert("Error", "Failed to add faculty. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

// Reset add form - CORRECTED
// (Removed duplicate declaration)

  // Handle updating faculty
  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return;

    const formData = new FormData();

    // Validation
    if (!editingFaculty.assignment_id || !editingFaculty.id || !editingFaculty.name || !editingFaculty.subject_code || !editingFaculty.department || !editingFaculty.year || !editingFaculty.section) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      formData.append('faculty', JSON.stringify(editingFaculty));
      const response = await fetch(`${API_BASE_URL}/faculties/update/${editingFaculty.assignment_id}`, {method : 'PUT', body : formData}).then(res => res.json());
      const editedFaculty = response['faculty'];
      if (response.success) {
        const updatedList = facultyList.map(faculty => 
          faculty.assignment_id === editingFaculty.assignment_id ? editedFaculty : faculty
        );
        setFacultyList(updatedList);
        resetEditForm();
        Alert.alert("Success", "Faculty updated successfully!");
      } else {
        Alert.alert("Error", response.message || "Failed to update faculty");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update faculty. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Excel upload using File Picker
  const handleExcelUpload = async () => {
    try {
      const pickerResult = await pick({
        type: [types.xls, types.xlsx],
      });

      // UPDATED: This is the new, correct way to check for cancellation.
      if (!pickerResult) {
        return; // Exit the function if the user cancels
      }
      
      // Since pick returns an array, we take the first element.
      const file = pickerResult[0];

      // Create FormData (this part remains the same)
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });

      setIsUploading(true);

      // Send the request to your backend
      const response = await fetch(`${API_BASE_URL}/faculties/upload_faculty`, {
        method: 'POST',
        body: formData,
      });

      const responseJson = await response.json();

      if (response.ok) {
        Alert.alert('Success', responseJson.message);
        await fetchFacultyListFromBackend();
      } else {
        throw new Error(responseJson.message || 'Something went wrong');
      }

    } catch (error) {
      // The catch block now only handles genuine errors (e.g., permissions, network issues)
      console.error('An unexpected error occurred:', error);
      Alert.alert('Error', 'An unexpected error occurred during the upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset forms
  const resetAddForm = () => {
    setNewFaculty({
      id: "",
      name: "",
      department: "",
      subject_code: "",
      year: "",
      section: "",
      assignment_id: 0,
    });
    setIsAddModalVisible(false);
  };

  const resetEditForm = () => {
    setNewFaculty({
      id: "",
      name: "",
      department: "",
      subject_code: "",
      year: "",
      section: "",
      assignment_id: 0,
    });
    setIsEditModalVisible(false);
  };

  // Render filter buttons for modal
  const renderFilterButtons = (options: string[] , selected : string, setSelected : (option: string) => void, label : string) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterButtonsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterButton,
                selected === option && styles.filterButtonSelected
              ]}
              onPress={() => setSelected(option)}
            >
              <Text style={[
                styles.filterButtonText,
                selected === option && styles.filterButtonTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render faculty item
  const renderFacultyItem = ({ item }: { item: Faculty }) => (
    <View style={styles.facultyCard}>
      <View style={styles.facultyInfo}>
        <View style={styles.facultyHeader}>
          <Text style={styles.facultyName}>{item.name}</Text>
          <View style={styles.facultyBadge}>
            <Text style={styles.facultyBadgeText}>FACULTY</Text>
          </View>
        </View>
        <View style={styles.facultyDetailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="badge" size={fontSize(14)} color="#600202" />
            <Text style={styles.facultyDetails}>ID: {item.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="business" size={fontSize(14)} color="#600202" />
            <Text style={styles.facultyDetails}>Dept: {item.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="menu-book" size={fontSize(14)} color="#600202" />
            <Text style={styles.facultyDetails}>Subject Code: {item.subject_code}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={fontSize(14)} color="#600202" />
            <Text style={styles.facultyDetails}>Year: {item.year} • Section: {item.section}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editFaculty(item)}
        >
          <Icon name="edit" size={fontSize(16)} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFaculty(item.assignment_id)}
        >
          <Icon name="delete" size={fontSize(16)} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render input field for forms
  const renderInputField = (label : string, value : string, onChange : (text: string) => void, placeholder : string, isEditable: boolean = true, keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' = 'default' ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput
        style={[styles.textInput, !isEditable && styles.textInputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        editable={!isSubmitting && isEditable}
      />
    </View>
  );

  // Render option buttons for forms
  const renderOptionButtons = (label : string, options : string[], selected : string, onSelect : (option: string) => void) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionButtons}>
          {options.filter(opt => opt !== 'All').map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selected === option && styles.optionButtonSelected
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[
                styles.optionButtonText,
                selected === option && styles.optionButtonTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={fontSize(20)} color="#600202" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or subject_code..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={fontSize(20)} color="#600206" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton1, countActiveFilters() > 0 && styles.filterButtonActive1]} 
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={fontSize(25)} color="#ffffff" />
          {countActiveFilters() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{countActiveFilters()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={() => setIsUploadModalVisible(true)}>
          <Icon name="upload" size={fontSize(20)} color="#FFF" />
          <Text style={styles.uploadButtonText}>Upload Excel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
          <Icon name="person-add" size={fontSize(20)} color="#FFF" />
          <Text style={styles.addButtonText}>Add Faculty</Text>
        </TouchableOpacity>

      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredFacultyList.length} faculty assignment{filteredFacultyList.length !== 1 ? 's' : ''}
          {(selectedDepartment !== 'All' || selectedYear !== 'All' || selectedSection !== 'All' || searchQuery !== '') && 
            ` • ${countActiveFilters()} filter${countActiveFilters() !== 1 ? 's' : ''} applied${searchQuery !== '' ? ' + search' : ''}`
          }
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5f5f5" />
          <Text style={styles.loadingText}>Loading Faculty...</Text>
        </View>
      )}

      {/* Faculty List */}
      {!isLoading && (
        <FlatList
          data={filteredFacultyList}
          renderItem={renderFacultyItem}
          //Here item => item.assignmnet_id must be string so i converted it to string
          keyExtractor={item => String(item.assignment_id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#600202']}
              tintColor="#600202"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={fontSize(60)} color="#f5f5f5" />
              <Text style={styles.emptyText}>No Faculty Members Found</Text>
              <Text style={styles.emptySubText}>
                {selectedDepartment !== 'All' || selectedYear !== 'All' || selectedSection !== 'All' || searchQuery !== '' 
                  ? 'Try changing your filters or add a new faculty member' 
                  : 'No faculty members available. Add a new faculty member to get started'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal 
        visible={isFilterModalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Icon name="close" size={fontSize(24)} color="#600202" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersModalContainer}>
              {renderFilterButtons(departmentOptions, selectedDepartment, setSelectedDepartment, 'Department')}
              {renderFilterButtons(yearOptions, selectedYear, setSelectedYear, 'Academic Year')}
              {renderFilterButtons(sectionOptions, selectedSection, setSelectedSection, 'Section')}
              
              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Faculty Modal */}
      <Modal 
        visible={isAddModalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => !isSubmitting && resetAddForm()}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Faculty</Text>
              {!isSubmitting && (
                <TouchableOpacity onPress={resetAddForm}>
                  <Icon name="close" size={fontSize(24)} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.formContainer}>
              {renderInputField("Faculty ID", newFaculty.id, (text) => setNewFaculty({...newFaculty, id: text}), "Enter faculty ID")}
              {renderInputField("Full Name",  newFaculty.name,  (text) => setNewFaculty({...newFaculty, name: text}),  "Enter full name")}
              {renderInputField("Subject Code",  newFaculty.subject_code,  (text) => setNewFaculty({...newFaculty, subject_code: text}),  "Enter subject code")}
              {renderOptionButtons("Department", departmentOptions, newFaculty.department, (dept) => setNewFaculty({...newFaculty, department: dept}))}
              {renderOptionButtons("Academic Year", yearOptions, newFaculty.year, (year) => setNewFaculty({...newFaculty, year: year}))}
              {renderOptionButtons("Section", sectionOptions, newFaculty.section, (section) => setNewFaculty({...newFaculty, section: section}))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.cancelButton, isSubmitting && styles.buttonDisabled]} onPress={resetAddForm} disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, (!newFaculty.id || !newFaculty.name || !newFaculty.subject_code) && styles.submitButtonDisabled, isSubmitting && styles.buttonDisabled]}
                onPress={handleAddFaculty}
                disabled={!newFaculty.id || !newFaculty.name || !newFaculty.subject_code || isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitButtonText}>Add Faculty</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal 
        visible={isEditModalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => !isSubmitting && resetEditForm()}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Faculty</Text>
              {!isSubmitting && (
                <TouchableOpacity onPress={resetEditForm}>
                  <Icon name="close" size={fontSize(24)} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.formContainer}>
              {editingFaculty && (
                <>
                  {renderInputField("Faculty ID", editingFaculty.id, (text) => setEditingFaculty({...editingFaculty, id: text}), "Enter faculty ID", false)}
                  {renderInputField("Full Name", editingFaculty.name, (text) => setEditingFaculty({...editingFaculty, name: text}), "Enter full name")}
                  {renderInputField("Subject_code", editingFaculty.subject_code, (text) => setEditingFaculty({...editingFaculty, subject_code: text}), "Enter subject_code")}
                  {renderOptionButtons("Department", departmentOptions, editingFaculty.department, (dept) => setEditingFaculty({...editingFaculty, department: dept}))}
                  {renderOptionButtons("Academic Year", yearOptions, editingFaculty.year, (year) => setEditingFaculty({...editingFaculty, year: year}))}
                  {renderOptionButtons("Section", sectionOptions, editingFaculty.section, (section) => setEditingFaculty({...editingFaculty, section: section}))}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.cancelButton, isSubmitting && styles.buttonDisabled]} onPress={resetEditForm} disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, (!editingFaculty?.id || !editingFaculty?.name || !editingFaculty?.subject_code) && styles.submitButtonDisabled, isSubmitting && styles.buttonDisabled]}
                onPress={handleUpdateFaculty}
                disabled={!editingFaculty?.id || !editingFaculty?.name || !editingFaculty?.subject_code || isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitButtonText}>Update Faculty</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Upload Excel Modal */}
      <Modal 
        visible={isUploadModalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => !isUploading && setIsUploadModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Excel Sheet</Text>
              {!isUploading && (
                <TouchableOpacity onPress={() => setIsUploadModalVisible(false)}>
                  <Icon name="close" size={fontSize(24)} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.uploadContainer}>
              <Icon name="cloud-upload" size={fontSize(60)} color="#600202" />
              <Text style={styles.uploadTitle}>Upload Faculty Excel Sheet</Text>
              <Text style={styles.uploadDescription}>
                Upload an Excel file with columns: Faculty ID, Name, Department, Subject_code, Year, Section
              </Text>
              
              {isUploading && (
                <View style={styles.uploadLoadingContainer}>
                  <ActivityIndicator size="large" color="#600202" />
                  <Text style={styles.loadingText}>Uploading...</Text>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.uploadModalButton, isUploading && styles.buttonDisabled]} 
                onPress={handleExcelUpload}
                disabled={isUploading}
              >
                <Icon name="upload" size={fontSize(20)} color="#FFF" />
                <Text style={styles.uploadModalButtonText}>
                  {isUploading ? 'Uploading...' : 'Choose Excel File'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#600202',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(15),
    paddingBottom: spacing(5),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    marginRight: spacing(10),
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: '#600202',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing(15),
    marginBottom: spacing(10),
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingHorizontal: spacing(15),
    paddingVertical: SPACING.md,
    borderRadius: 10,
    flex: 1,
    marginRight: spacing(10),
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: spacing(15),
    paddingVertical: SPACING.md,
    borderRadius: 10,
    flex: 1,
    marginRight: spacing(10),
    justifyContent: 'center',
  },
  filterButton1: {
    backgroundColor: '#495057',
    padding: SPACING.md,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

  },
  filterButtonActive1: {
    backgroundColor: '#495057',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: SPACING.md,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.sm,
  },
  statsContainer: {
    paddingHorizontal: spacing(15),
    paddingVertical: SPACING.sm,
  },
  statsText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing(10),
    paddingBottom: SPACING.xl,
  },
  facultyCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    marginHorizontal: spacing(10),
    alignItems: 'center',
    borderLeftWidth: 6,
    borderLeftColor: '#dd5e5eff',
  },
  facultyInfo: {
    flex: 1,
  },
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  facultyName: {
    color: '#600202',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginRight: spacing(10),
  },
  facultyBadge: {
    backgroundColor: '#600202',
    paddingHorizontal: SPACING.sm,
    paddingVertical: spacing(2),
    borderRadius: 6,
  },
  facultyBadgeText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  facultyDetailsContainer: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  facultyDetails: {
    color: '#600202',
    fontSize: FONT_SIZES.sm,
    marginLeft: spacing(6),
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: SPACING.sm,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: SPACING.sm,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(40),
    marginTop: SPACING.xl,
  },
  emptyText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubText: {
    color: 'rgba(245, 245, 245, 0.7)',
    fontSize: FONT_SIZES.md,
    marginTop: spacing(6),
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: SPACING.xl,
    borderRadius: 15,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#600202',
  },
  filtersModalContainer: {
    padding: SPACING.xl,
  },
  filterSection: {
    marginBottom: spacing(25),
  },
  filterLabel: {
    color: '#600202',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: SPACING.lg,
    paddingVertical: spacing(10),
    borderRadius: 20,
    marginRight: spacing(10),
    marginBottom: spacing(10),
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonSelected: {
    backgroundColor: '#600202',
    borderColor: '#600202',
  },
  filterButtonText: {
    color: '#495057',
    fontWeight: '500',
    fontSize: FONT_SIZES.md,
  },
  filterButtonTextSelected: {
    color: '#f5f5f5',
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  clearAllButton: {
    flex: 1,
    padding: spacing(15),
    borderRadius: 10,
    backgroundColor: '#6c757d',
    marginRight: spacing(10),
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    padding: spacing(15),
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: spacing(10),
    alignItems: 'center',
  },
  clearAllButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  formContainer: {
    padding: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#600202',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.lg,
    backgroundColor: '#f8f9fa',
  },
  textInputDisabled: {
    backgroundColor: '#e9ecef', // Light gray background for disabled state
    color: '#868e96',          // Faded text color
    borderColor: '#ced4da',    // Slightly darker border for contrast
  },
  optionButtons: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: SPACING.lg,
    paddingVertical: spacing(10),
    borderRadius: 20,
    marginRight: spacing(10),
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  optionButtonSelected: {
    backgroundColor: '#600202',
    borderColor: '#600202',
  },
  optionButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: spacing(15),
    borderRadius: 10,
    backgroundColor: '#6c757d',
    marginRight: spacing(10),
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    padding: spacing(15),
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: spacing(10),
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  uploadContainer: {
    alignItems: 'center',
    padding: spacing(30),
  },
  uploadTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#600202',
    marginTop: spacing(10),
  },
  uploadDescription: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    textAlign: 'center',
    marginTop: spacing(5),
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  uploadLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: '#600202',
    marginTop: spacing(10),
    fontWeight: '500',
  },
    // Add new styles for the modal upload button
  uploadModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 8,
    marginTop: spacing(15),
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  uploadModalButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    flexShrink: 1,
  },
}); 

export default FacultyManagement;