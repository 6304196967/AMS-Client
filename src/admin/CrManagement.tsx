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
import {CR} from '../services/Interfaces';
import { spacing, fontSize, FONT_SIZES, SPACING } from '../utils/responsive';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';


// Filter options
const yearOptions = ['All', 'E1', 'E2', 'E3', 'E4'];
const branchOptions = ['All', 'CSE', 'ECE', 'EEE', 'CIVIL', 'ME', 'MME', 'CHEM'];
const batch = {'1': 'E1', '2': 'E2', '3': 'E3', '4': 'E4'};


const CrManagement = () => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [crList, setCrList] = useState<CR[]>([]);
  const [filteredCrList, setFilteredCrList] = useState<CR[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCR, setNewCR] = useState({
    id: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch CR list on component mount
  React.useEffect(() => {
    fetchCRListFromBackend();
  }, []);

  // Auto-filter when selections or search query change
  React.useEffect(() => {
    filterCRs();
  }, [selectedYear, selectedBranch, searchQuery, crList]);

  

  // Fetch CR list from backend
  const fetchCRListFromBackend = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/crs`, {
        method: 'GET'
      });
      const data = (await response.json());
      const crs = data['crs'];

      for (let  cr of crs) {
        cr.year = batch[cr.year as keyof typeof batch] || cr.year;
      }
      setCrList(crs);
      setFilteredCrList(crs);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch CR list");
      console.error("Error fetching CR list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter CRs based on selected filters and search query
  const filterCRs = () => {
    let filtered = [...crList];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(cr => 
        cr.id.toLowerCase().includes(query) || 
        cr.name.toLowerCase().includes(query)
      );
    }
    
    // Apply year filter
    if (selectedYear !== 'All') {
      filtered = filtered.filter(cr => cr.year === selectedYear);
    }
    
    // Apply branch filter
    if (selectedBranch !== 'All') {
      filtered = filtered.filter(cr => cr.branch === selectedBranch);
    }
    
    setFilteredCrList(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear('All');
    setSelectedBranch('All');
    setSearchQuery('');
  };

  // Remove CR
  const removeCR = async (crId: string) => {
    Alert.alert(
      "Remove CR",
      "Are you sure you want to remove this CR?",
      [
        {text: "Cancel", style: "cancel"},
        { 
          text: "Remove", 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/crs/remove/${crId}`, {
                method: 'DELETE',
              });
              const updatedList = crList.filter(cr => cr.id !== crId);
              setCrList(updatedList);
              Alert.alert("Success", "CR removed successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to remove CR");
            }
          }
        }
      ]
    );
  };

  // Add new CR
  const addCR = () => {
    setIsAddModalVisible(true);
  };

  // Handle adding new CR
  const handleAddCR = async () => {

    const formData = new FormData();

    // Validation
    console.log(newCR);
    if (!newCR.id) {
      Alert.alert("Error", "Please enter a student ID");
      return;
    }

    if (!newCR.phone) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (newCR.phone.length !== 10 || isNaN(Number(newCR.phone))) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send only ID and phone to backend
      console.log(newCR);
      formData.append('id', newCR.id);
      formData.append('mobile', newCR.phone);

      const response = await fetch(`${API_BASE_URL}/crs/add`, {
        method  : 'POST',
        body : formData,
      });

      const data = await response.json();
      const newcr = data['newcr'];

      
      newcr.year = batch[newcr.year as keyof typeof batch] || newcr.year;

      if (response.ok) {
        // Add the new CR to the list with data returned from backend
        const updatedList = [...crList, newcr];
        setCrList(updatedList);
        
        // Reset form and close modal
        setNewCR({
          id: '',
          phone: ''
        });
        setIsAddModalVisible(false);
        
        Alert.alert("Success", "CR added successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to add CR");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add CR. Please try again.");
      console.error("Error adding CR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewCR({
      id: '',
      phone: ''
    });
    setIsAddModalVisible(false);
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedYear !== 'All') count++;
    if (selectedBranch !== 'All') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  };

  // Render filter buttons in modal
  const renderFilterButtons = (options: string[], selected: string, setSelected: (value: string) => void, label: string) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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

  // Render CR item
  const renderCRItem = ({ item }: { item: any }) => (
    <View style={styles.crCard}>
      <View style={styles.crInfo}>
        <View style={styles.crHeader}>
          <Text style={styles.crName}>{item.name}</Text>
          <View style={styles.crBadge}>
            <Text style={styles.crBadgeText}>CR</Text>
          </View>
        </View>
        <View style={styles.crDetailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="badge" size={fontSize(14)} color="#600202" />
            <Text style={styles.crDetails}>ID: {item.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={fontSize(14)} color="#600202" />
            <Text style={styles.crDetails}>Year: {item.year} • Branch: {item.branch}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="class" size={fontSize(14)} color="#600202" />
            <Text style={styles.crDetails}>Section: {item.section}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="phone" size={fontSize(14)} color="#600202" />
            <Text style={styles.crDetails}>{item.phone}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeCR(item.id)}
      >
        <Icon name="delete" size={fontSize(18)} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={fontSize(20)} color="#600202" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={fontSize(20)} color="#600202" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={[
            styles.filterButtonMain,
            getActiveFiltersCount() > 0 && styles.filterButtonActive
          ]} 
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={fontSize(24)} color="#FFF" />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addCR}>
          <Icon name="person-add" size={fontSize(20)} color="#FFF" />
          <Text style={styles.addButtonText}>Add New CR</Text>
        </TouchableOpacity>

        
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredCrList.length} CR{filteredCrList.length !== 1 ? 's' : ''}
          {getActiveFiltersCount() > 0 && ` • ${getActiveFiltersCount()} filter${getActiveFiltersCount() !== 1 ? 's' : ''} active`}
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5f5f5" />
          <Text style={styles.loadingText}>Loading CRs...</Text>
        </View>
      )}

      {/* CR List */}
      {!isLoading && (
        <FlatList
          data={filteredCrList}
          renderItem={renderCRItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={fontSize(60)} color="#f5f5f5" />
              <Text style={styles.emptyText}>No CRs Found</Text>
              <Text style={styles.emptySubText}>
                {getActiveFiltersCount() > 0 
                  ? 'Try changing your filters or add a new CR' 
                  : 'No CRs available. Add a new CR to get started'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Add CR Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isSubmitting && setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New CR</Text>
              {!isSubmitting && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Icon name="close" size={fontSize(24)} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student ID *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCR.id}
                  onChangeText={(text) => setNewCR({...newCR, id: text})}
                  placeholder="Enter student ID"
                  placeholderTextColor="#999"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCR.phone}
                  onChangeText={(text) => setNewCR({...newCR, phone: text})}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.noteContainer}>
                <Icon name="info" size={fontSize(16)} color="#600202" />
                <Text style={styles.noteText}>
                  Student details (name, year, branch, section) will be fetched from the database automatically.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, isSubmitting && styles.buttonDisabled]}
                onPress={resetForm}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (!newCR.id || !newCR.phone) && styles.submitButtonDisabled,
                  isSubmitting && styles.buttonDisabled
                ]}
                onPress={handleAddCR}
                disabled={!newCR.id || !newCR.phone || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Icon name="person-add" size={fontSize(20)} color="#FFF" />
                    <Text style={styles.submitButtonText}>Add CR</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Icon name="close" size={fontSize(24)} color="#600202" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalContent}>
              {renderFilterButtons(yearOptions, selectedYear, setSelectedYear, 'Academic Year')}
              {renderFilterButtons(branchOptions, selectedBranch, setSelectedBranch, 'Department')}
              
              <View style={styles.filterActions}>
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={clearFilters}
                >
                  <Icon name="clear" size={fontSize(20)} color="#FFF" />
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: '#600202',
  },
  filterButtonMain: {
    backgroundColor: '#495057',
    padding: SPACING.md,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(15),
    paddingBottom: spacing(10),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    flex: 1,
    marginRight: spacing(10),
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: SPACING.md,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
  },
  statsContainer: {
    paddingHorizontal: spacing(15),
    paddingVertical: SPACING.sm,
    marginBottom: spacing(5),
  },
  statsText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
    fontStyle: 'italic',
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
  crCard: {
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
  crInfo: {
    flex: 1,
  },
  crHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  crName: {
    color: '#600202',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginRight: spacing(10),
  },
  crBadge: {
    backgroundColor: '#600202',
    paddingHorizontal: SPACING.sm,
    paddingVertical: spacing(2),
    borderRadius: 6,
  },
  crBadgeText: {
    color: '#f5f5f5',
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  crDetailsContainer: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  crDetails: {
    color: '#600202',
    fontSize: FONT_SIZES.sm,
    marginLeft: spacing(6),
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: SPACING.sm,
    borderRadius: 6,
    marginLeft: spacing(10),
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
    lineHeight: 20,
  },
  // Modal Styles
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
  closeButton: {
    padding: spacing(5),
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
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: spacing(-10),
  },
  noteText: {
    fontSize: FONT_SIZES.sm,
    color: '#600202',
    marginLeft: SPACING.sm,
    flex: 1,
    fontStyle: 'italic',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(15),
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: spacing(10),
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
    marginLeft: SPACING.sm,
  },
  loadingText: {
    color: '#f5f5f5',
    marginTop: spacing(10),
    fontSize: FONT_SIZES.lg,
  },
  // Filter Modal Styles
  filterModalContent: {
    padding: SPACING.xl,
  },
  filterSection: {
    marginBottom: spacing(25),
  },
  filterLabel: {
    color: '#600202',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: spacing(10),
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 50,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    flex: 1,
    marginRight: spacing(10),
    justifyContent: 'center',
  },
  clearAllButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    marginLeft: spacing(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
});

export default CrManagement;