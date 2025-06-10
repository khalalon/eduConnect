import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Chip, 
  Avatar, 
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import api from '../../services/api';

type BulkMessageRouteProp = RouteProp<RootStackParamList, 'BulkMessage'>;

interface Student {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

const BulkMessageScreen = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  const route = useRoute<BulkMessageRouteProp>();
  const navigation = useNavigation();
  const { studentIds } = route.params;
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  useEffect(() => {
    // Initialize selected students with the IDs passed from the previous screen
    setSelectedStudents(studentIds);
  }, [studentIds]);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch details for each student ID
      const promises = studentIds.map(id => api.get(`/students/${id}`));
      const responses = await Promise.all(promises);
      
      const fetchedStudents = responses.map(response => response.data);
      setStudents(fetchedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load student information');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  const handleSendMessage = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student');
      return;
    }
    
    try {
      setSending(true);
      
      await api.post('/messages/bulk', {
        studentIds: selectedStudents,
        subject,
        message
      });
      
      Alert.alert(
        'Success',
        `Message sent to ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error sending messages:', error);
      Alert.alert('Error', 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recipients ({selectedStudents.length})</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.recipientsContainer}
            contentContainerStyle={styles.recipientsContent}
          >
            {students.map(student => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.recipientChip,
                  selectedStudents.includes(student.id) && styles.selectedRecipientChip
                ]}
                onPress={() => toggleStudentSelection(student.id)}
              >
{/*                 <Avatar.Image 
                  size={24} 
                  source={student.profilePicture ? { uri: student.profilePicture } : require('../../assets/default-avatar.png')} 
                  style={styles.recipientAvatar}
                /> */}
                <Text 
                  style={[
                    styles.recipientName,
                    selectedStudents.includes(student.id) && styles.selectedRecipientName
                  ]}
                >
                  {student.name}
                </Text>
                {selectedStudents.includes(student.id) && (
                  <Ionicons name="checkmark-circle" size={16} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Divider style={styles.divider} />
          
          <TextInput
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Message"
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            multiline
            numberOfLines={8}
            style={styles.messageInput}
          />
          
          <Button
            mode="contained"
            onPress={handleSendMessage}
            loading={sending}
            disabled={sending || selectedStudents.length === 0}
            style={styles.sendButton}
          >
            Send Message
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  recipientsContainer: {
    marginBottom: 16,
  },
  recipientsContent: {
    paddingRight: 16,
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedRecipientChip: {
    backgroundColor: '#0066cc',
  },
  recipientAvatar: {
    marginRight: 6,
  },
  recipientName: {
    fontSize: 14,
    color: '#333',
  },
  selectedRecipientName: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 4,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  messageInput: {
    marginBottom: 24,
    backgroundColor: '#fff',
    height: 150,
  },
  sendButton: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});

export default BulkMessageScreen;