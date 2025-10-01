import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { pick, types} from '@react-native-documents/picker';

import { Faculty, InputFieldProps, FilterButtonsProps} from 'src/services/Interfaces';


// Filter options
const departmentOptions = ['All', 'CSE', 'ECE', 'EEE', 'CIVIL', 'ME', 'MME', 'CHEM'];
const yearOptions = ['All', 'E1', 'E2', 'E3', 'E4'];
const sectionOptions = ['All', 'A', 'B', 'C', 'D', 'E'];
const batch = {'1': 'E1', '2': 'E2', '3': 'E3', '4': 'E4'};
const API_BASE_URL = 'http://10.182.66.80:5000';

const FacultyManagement = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyList, setFacultyList] = useState<Faculty[]>([{
    id: "",
    name: "",
    department: "",
    subject_code: "",
    year: "",
    section: "",
    assignment_id: 0,
  }]);
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
      console.log(facultyData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch faculty list");
      console.error("Error fetching faculty list:", error);
    } finally {
      setIsLoading(false);
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
  const handleAddFaculty = async () => {
    const formData = new FormData();
    // Validation
    if (!newFaculty || !newFaculty.id || !newFaculty.name || !newFaculty.subject_code || !newFaculty.department || !newFaculty.year || !newFaculty.section ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    formData.append('faculty', JSON.stringify(newFaculty));

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/faculties/add`, { method : 'POST', body : formData}).then(res => res.json());
      const newFaculty = response['faculty'];
      
      newFaculty.year = batch[newFaculty.year as keyof typeof batch] || newFaculty.year;

      if (response.success) {
        const updatedList = [...facultyList, newFaculty];
        setFacultyList(updatedList);
        resetAddForm();
        Alert.alert("Success", "Faculty added successfully!");
      } else {
        Alert.alert("Error", response.message || "Failed to add faculty");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add faculty. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Icon name="badge" size={14} color="#600202" />
            <Text style={styles.facultyDetails}>ID: {item.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="business" size={14} color="#600202" />
            <Text style={styles.facultyDetails}>Dept: {item.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="menu-book" size={14} color="#600202" />
            <Text style={styles.facultyDetails}>Subject Code: {item.subject_code}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={14} color="#600202" />
            <Text style={styles.facultyDetails}>Year: {item.year} • Section: {item.section}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editFaculty(item)}
        >
          <Icon name="edit" size={16} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFaculty(item.assignment_id)}
        >
          <Icon name="delete" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render input field for forms
  const renderInputField = (label : string, value : string, onChange : (text: string) => void, placeholder : string, keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        editable={!isSubmitting}
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
          <Icon name="search" size={20} color="#600202" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or subject_code..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#600206" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton1, countActiveFilters() > 0 && styles.filterButtonActive1]} 
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={25} color="#ffffff" />
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
          <Icon name="upload" size={20} color="#FFF" />
          <Text style={styles.uploadButtonText}>Upload Excel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
          <Icon name="person-add" size={20} color="#FFF" />
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={60} color="#f5f5f5" />
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
      <Modal visible={isFilterModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Icon name="close" size={24} color="#600202" />
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
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Faculty</Text>
              {!isSubmitting && (
                <TouchableOpacity onPress={resetAddForm}>
                  <Icon name="close" size={24} color="#600202" />
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
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Faculty</Text>
              {!isSubmitting && (
                <TouchableOpacity onPress={resetEditForm}>
                  <Icon name="close" size={24} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.formContainer}>
              {editingFaculty && (
                <>
                  {renderInputField("Faculty ID", editingFaculty.id, (text) => setEditingFaculty({...editingFaculty, id: text}), "Enter faculty ID")}
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
      <Modal visible={isUploadModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Excel Sheet</Text>
              {!isUploading && (
                <TouchableOpacity onPress={() => setIsUploadModalVisible(false)}>
                  <Icon name="close" size={24} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.uploadContainer}>
              <Icon name="cloud-upload" size={60} color="#600202" />
              <Text style={styles.uploadTitle}>Upload Faculty Excel Sheet</Text>
              <Text style={styles.uploadDescription}>
                Upload an Excel file with columns: Faculty ID, Name, Department, Subject_code, Year, Section
              </Text>
              
              {isUploading && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={[styles.uploadModalButton, isUploading && styles.buttonDisabled]} 
                onPress={handleExcelUpload}
                disabled={isUploading}
              >
                <Icon name="upload" size={20} color="#FFF" />
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
    padding: 15,
    paddingBottom: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#600202',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  filterButton1: {
    backgroundColor: '#495057',
    padding: 12,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  statsText: {
    color: '#f5f5f5',
    fontSize: 12,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  facultyCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 10,
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
    marginBottom: 8,
  },
  facultyName: {
    color: '#600202',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  facultyBadge: {
    backgroundColor: '#600202',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  facultyBadgeText: {
    color: '#f5f5f5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  facultyDetailsContainer: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  facultyDetails: {
    color: '#600202',
    fontSize: 12,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    color: 'rgba(245, 245, 245, 0.7)',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#600202',
  },
  filtersModalContainer: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterLabel: {
    color: '#600202',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
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
    fontSize: 14,
  },
  filterButtonTextSelected: {
    color: '#f5f5f5',
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearAllButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: 10,
    alignItems: 'center',
  },
  clearAllButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#600202',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  optionButtons: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: 10,
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
    fontSize: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadContainer: {
    alignItems: 'center',
    padding: 30,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#600202',
    marginTop: 10,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    lineHeight: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#600202',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  loadingText: {
    color: '#f5f5f5',
    marginTop: 10,
  },
    // Add new styles for the modal upload button
  uploadModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  uploadModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
}); 

export default FacultyManagement;