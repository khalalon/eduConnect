import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { UserProfile } from '../../types';

interface StudentDetailsParams {
  studentId: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  progress: number;
}

const StudentDetailsScreen = () => {
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { studentId } = route.params as StudentDetailsParams;
  
  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);
  
  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch student profile
      const profileResponse = await api.get(`/users/${studentId}`);
      setStudent(profileResponse.data);
      
      // Fetch student enrollments
      const enrollmentsResponse = await api.get(`/enrollments/student/${studentId}`);
      setEnrollments(enrollmentsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student details');
      console.error('Error fetching student details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartChat = () => {
    if (!student) return;
    
    navigation.navigate('Chat', {
      id: student.id,
      name: student.name,
    });
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }
  
  if (error || !student) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Student not found'}</Text>
        <Button mode="contained" onPress={fetchStudentDetails} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {student.profileImage ? (
          <Image source={{ uri: student.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={60} color="#ccc" />
          </View>
        )}
        
        <Title style={styles.name}>{student.name}</Title>
        <Paragraph style={styles.email}>{student.email}</Paragraph>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{enrollments.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {enrollments.length > 0
                ? Math.round(
                    enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length
                  )
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Avg. Progress</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(student.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          icon="chat"
          onPress={handleStartChat}
          style={styles.chatButton}
        >
          Message Student
        </Button>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>About</Title>
        <Paragraph style={styles.bio}>
          {student.bio || 'No bio information available.'}
        </Paragraph>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Enrolled Courses</Title>
        
        {enrollments.length === 0 ? (
          <Text style={styles.emptyText}>This student hasn't enrolled in any courses yet.</Text>
        ) : (
          enrollments.map((enrollment) => (
            <Card key={enrollment.id} style={styles.courseCard}>
              <Card.Content>
                <Title style={styles.courseTitle}>{enrollment.courseName}</Title>
                <Paragraph style={styles.enrollmentDate}>
                  Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                </Paragraph>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress: {enrollment.progress}%</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${enrollment.progress}%` },
                        enrollment.progress > 70 ? styles.progressGood : 
                        enrollment.progress > 30 ? styles.progressMedium : 
                        styles.progressLow
                      ]} 
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Interests</Title>
        
        {student.interests && student.interests.length > 0 ? (
          <View style={styles.interestsContainer}>
            {student.interests.map((interest, index) => (
              <Chip key={index} style={styles.interestChip}>{interest}</Chip>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No interests specified.</Text>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Student ID: {student.id}</Text>
        <Text style={styles.footerText}>Account created: {new Date(student.createdAt).toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  chatButton: {
    marginTop: 10,
    width: '80%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  bio: {
    lineHeight: 22,
  },
  courseCard: {
    marginBottom: 10,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 16,
  },
  enrollmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGood: {
    backgroundColor: '#4CAF50',
  },
  progressMedium: {
    backgroundColor: '#FFC107',
  },
  progressLow: {
    backgroundColor: '#F44336',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestChip: {
    margin: 4,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StudentDetailsScreen;
