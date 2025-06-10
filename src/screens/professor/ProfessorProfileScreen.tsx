import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Text, 
  Title, 
  Subheading, 
  TextInput, 
  Button, 
  Avatar, 
  Divider, 
  Switch,
  Card,
  Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

interface Expertise {
  id: string;
  name: string;
}

interface ProfessorProfile {
  bio: string;
  department: string;
  title: string;
  officeHours: string;
  contactEmail: string;
  phoneNumber: string;
  website: string;
  qualifications: Qualification[];
  expertise: Expertise[];
  isAvailableForMentoring: boolean;
  pairingCode: string;
}

const ProfessorProfileScreen = () => {
  const { state, updateUser, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfessorProfile>({
    bio: '',
    department: '',
    title: '',
    officeHours: '',
    contactEmail: state.user?.email || '',
    phoneNumber: '',
    website: '',
    qualifications: [],
    expertise: [],
    isAvailableForMentoring: false,
    pairingCode: ''
  });
  
  const [newQualification, setNewQualification] = useState({
    degree: '',
    institution: '',
    year: ''
  });
  
  const [newExpertise, setNewExpertise] = useState('');
  
  useEffect(() => {
    fetchProfessorProfile();
  }, []);
  
  const fetchProfessorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professor/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching professor profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      await api.put('/professor/profile', profile);
      
      // Update user data in context if needed
      if (state.user) {
        await updateUser({
          ...state.user,
          email: profile.contactEmail
        });
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfilePictureUpdate = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Create form data for image upload
        const formData = new FormData();
        formData.append('profilePicture', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile-picture.jpg',
        } as any);
        
        setLoading(true);
        
        const response = await api.post('/professor/profile/picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Update user in context
        if (state.user) {
          await updateUser({
            ...state.user,
            profilePicture: response.data.profilePicture
          });
        }
        
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };
  
  const addQualification = () => {
    if (!newQualification.degree || !newQualification.institution || !newQualification.year) {
      Alert.alert('Error', 'Please fill in all qualification fields');
      return;
    }
    
    setProfile({
      ...profile,
      qualifications: [
        ...profile.qualifications,
        {
          id: Date.now().toString(),
          ...newQualification
        }
      ]
    });
    
    setNewQualification({
      degree: '',
      institution: '',
      year: ''
    });
  };
  
  const removeQualification = (id: string) => {
    setProfile({
      ...profile,
      qualifications: profile.qualifications.filter(q => q.id !== id)
    });
  };
  
  const addExpertise = () => {
    if (!newExpertise.trim()) {
      return;
    }
    
    setProfile({
      ...profile,
      expertise: [
        ...profile.expertise,
        {
          id: Date.now().toString(),
          name: newExpertise.trim()
        }
      ]
    });
    
    setNewExpertise('');
  };
  
  const removeExpertise = (id: string) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter(e => e.id !== id)
    });
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => logout()
        }
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleProfilePictureUpdate}
            disabled={loading}
          >
            {state.user?.profilePicture ? (
              <Avatar.Image 
                source={{ uri: state.user.profilePicture }} 
                size={100} 
              />
            ) : (
              <Avatar.Icon 
                size={100} 
                icon="account" 
                backgroundColor="#0066cc" 
              />
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Title style={styles.name}>{state.user?.name}</Title>
            <Subheading style={styles.email}>{state.user?.email}</Subheading>
            
            <View style={styles.pairingCodeContainer}>
              <Text style={styles.pairingCodeLabel}>Pairing Code:</Text>
              <Text style={styles.pairingCode}>{profile.pairingCode}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => {
                  // In a real app, you would use Clipboard.setString(profile.pairingCode)
                  Alert.alert('Copied', 'Pairing code copied to clipboard');
                }}
              >
                <Ionicons name="copy-outline" size={16} color="#0066cc" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <Button 
                mode="contained" 
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setIsEditing(false);
                  fetchProfessorProfile();
                }}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              mode="contained" 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Basic Information</Title>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Title</Text>
            {isEditing ? (
              <TextInput
                value={profile.title}
                onChangeText={(text) => setProfile({ ...profile, title: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Associate Professor"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.title || 'Not specified'}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Department</Text>
            {isEditing ? (
              <TextInput
                value={profile.department}
                onChangeText={(text) => setProfile({ ...profile, department: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Computer Science"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.department || 'Not specified'}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                mode="outlined"
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Tell students about yourself..."
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.bio || 'No bio provided'}</Text>
            )}
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                value={profile.contactEmail}
                onChangeText={(text) => setProfile({ ...profile, contactEmail: text })}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.contactEmail}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                value={profile.phoneNumber}
                onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="e.g., +1 (123) 456-7890"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.phoneNumber || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Website</Text>
            {isEditing ? (
              <TextInput
                value={profile.website}
                onChangeText={(text) => setProfile({ ...profile, website: text })}
                mode="outlined"
                style={styles.input}
                keyboardType="url"
                placeholder="e.g., https://yourwebsite.com"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.website || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Office Hours</Text>
            {isEditing ? (
              <TextInput
                value={profile.officeHours}
                onChangeText={(text) => setProfile({ ...profile, officeHours: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Mon, Wed 2-4 PM"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.officeHours || 'Not specified'}</Text>
            )}
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Qualifications</Title>
          
          {profile.qualifications.length > 0 ? (
            profile.qualifications.map((qualification) => (
              <Card key={qualification.id} style={styles.qualificationCard}>
                <Card.Content>
                  <View style={styles.qualificationHeader}>
                    <Text style={styles.qualificationDegree}>{qualification.degree}</Text>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => removeQualification(qualification.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close-circle" size={20} color="#f44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.qualificationInstitution}>{qualification.institution}</Text>
                  <Text style={styles.qualificationYear}>{qualification.year}</Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>No qualifications added</Text>
          )}
          
          {isEditing && (
            <View style={styles.addQualificationContainer}>
              <Title style={styles.addSectionTitle}>Add Qualification</Title>
              
              <TextInput
                label="Degree"
                value={newQualification.degree}
                onChangeText={(text) => setNewQualification({ ...newQualification, degree: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Ph.D. in Computer Science"
              />
              
              <TextInput
                label="Institution"
                value={newQualification.institution}
                onChangeText={(text) => setNewQualification({ ...newQualification, institution: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Stanford University"
              />
              
              <TextInput
                label="Year"
                value={newQualification.year}
                onChangeText={(text) => setNewQualification({ ...newQualification, year: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., 2018"
                keyboardType="number-pad"
              />
              
              <Button
                mode="contained"
                onPress={addQualification}
                style={styles.addButton}
              >
                Add Qualification
              </Button>
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Areas of Expertise</Title>
          
          <View style={styles.expertiseContainer}>
            {profile.expertise.length > 0 ? (
              <View style={styles.chipContainer}>
                {profile.expertise.map((item) => (
                  <Chip
                    key={item.id}
                    style={styles.chip}
                    onClose={isEditing ? () => removeExpertise(item.id) : undefined}
                  >
                    {item.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No expertise areas added</Text>
            )}
          </View>
          
          {isEditing && (
            <View style={styles.addExpertiseContainer}>
              <TextInput
                label="Add Expertise"
                value={newExpertise}
                onChangeText={setNewExpertise}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Machine Learning"
                right={
                  <TextInput.Icon
                    icon="plus"
                    onPress={addExpertise}
                  />
                }
                onSubmitEditing={addExpertise}
              />
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Preferences</Title>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Available for Mentoring</Text>
            {isEditing ? (
              <Switch
                value={profile.isAvailableForMentoring}
                onValueChange={(value) => setProfile({ ...profile, isAvailableForMentoring: value })}
                color="#0066cc"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {profile.isAvailableForMentoring ? 'Yes' : 'No'}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
            color="#f44336"
          >
            Logout
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
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginRight: 20,
    position: 'relative',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0066cc',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
  },
  pairingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
  },
  pairingCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  pairingCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  copyButton: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  editButton: {
    width: '80%',
    backgroundColor: '#0066cc',
  },
  saveButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#f44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#fff',
    marginBottom: 10,
    height: 100,
  },
  qualificationCard: {
    marginBottom: 10,
    elevation: 2,
  },
  qualificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualificationDegree: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualificationInstitution: {
    fontSize: 14,
    color: '#333',
  },
  qualificationYear: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 5,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  addQualificationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addSectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#0066cc',
  },
  expertiseContainer: {
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
    backgroundColor: '#e3f2fd',
  },
  addExpertiseContainer: {
    marginTop: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutContainer: {
    padding: 20,
    alignItems: 'center',
  },
  logoutButton: {
    width: '80%',
    borderColor: '#f44336',
  },
});

export default ProfessorProfileScreen;