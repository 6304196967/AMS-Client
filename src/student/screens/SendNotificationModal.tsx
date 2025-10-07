import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { sendNotificationToClass } from '../../utils/notificationService';

interface SendNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  crEmail: string;
  crInfo?: {
    year: string;
    department: string;
    section: string;
  };
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  visible,
  onClose,
  crEmail,
  crInfo,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a notification title');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a notification message');
      return;
    }

    if (title.length > 100) {
      Alert.alert('Error', 'Title is too long. Maximum 100 characters.');
      return;
    }

    if (message.length > 500) {
      Alert.alert('Error', 'Message is too long. Maximum 500 characters.');
      return;
    }

    // Confirm before sending
    Alert.alert(
      'Confirm Send',
      `Send this notification to all students in your class?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async () => {
            setSending(true);
            try {
              const result = await sendNotificationToClass(crEmail, title, message);

              if (result.success) {
                Alert.alert(
                  'Success! 🎉',
                  result.message,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Clear form
                        setTitle('');
                        setMessage('');
                        onClose();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to send notification');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error('Error sending notification:', error);
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (title.trim() || message.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            onPress: () => {
              setTitle('');
              setMessage('');
              onClose();
            },
            style: 'destructive',
          },
        ]
      );
    } else {
      onClose();
    }
  };

  // Quick templates
  const quickTemplates = [
    { title: 'Class Cancelled', message: "Today's class has been cancelled." },
    { title: 'Venue Changed', message: 'Class venue has been changed to ' },
    { title: 'Time Changed', message: 'Class time has been rescheduled to ' },
    { title: 'Assignment Reminder', message: 'Reminder: Assignment submission deadline is ' },
  ];

  const applyTemplate = (template: { title: string; message: string }) => {
    setTitle(template.title);
    setMessage(template.message);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <LinearGradient
              colors={['#600202', '#8B0000']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <Icon name="bell-ring" size={28} color="#FFF" />
                <Text style={styles.headerTitle}>Send Notification</Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={sending}>
                <Icon name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Class Info */}
            {crInfo && (
              <View style={styles.classInfo}>
                <Icon name="account-group" size={20} color="#600202" />
                <Text style={styles.classInfoText}>
                  E{crInfo.year} {crInfo.department} - {crInfo.section}
                </Text>
              </View>
            )}

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Quick Templates */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Templates</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.templatesScroll}
                >
                  {quickTemplates.map((template, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.templateButton}
                      onPress={() => applyTemplate(template)}
                      disabled={sending}
                    >
                      <Text style={styles.templateText}>{template.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Title Input */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Title</Text>
                  <Text style={styles.charCount}>{title.length}/100</Text>
                </View>
                <TextInput
                  style={styles.titleInput}
                  placeholder="e.g., Class Update, Venue Change"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  editable={!sending}
                />
              </View>

              {/* Message Input */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Message</Text>
                  <Text style={styles.charCount}>{message.length}/500</Text>
                </View>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Enter your message here..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  maxLength={500}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  editable={!sending}
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendNotification}
                disabled={sending || !title.trim() || !message.trim()}
              >
                <LinearGradient
                  colors={
                    sending || !title.trim() || !message.trim()
                      ? ['#999', '#777']
                      : ['#600202', '#8B0000']
                  }
                  style={styles.sendButton}
                >
                  {sending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Icon name="send" size={20} color="#FFF" />
                      <Text style={styles.sendButtonText}>Send to Class</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <Icon name="information" size={16} color="#666" />
                <Text style={styles.infoText}>
                  This notification will be sent to all students in your class who have the app
                  installed.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  classInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#600202',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templatesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  templateButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  templateText: {
    fontSize: 13,
    color: '#600202',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
  },
  titleInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  messageInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 120,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default SendNotificationModal;
