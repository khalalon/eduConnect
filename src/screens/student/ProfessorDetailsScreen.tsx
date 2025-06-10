import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ProfessorDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProfessorDetails'>;
type ProfessorDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfessorDetails'>;

type Props = {
  route: ProfessorDetailsScreenRouteProp;
  navigation: ProfessorDetailsScreenNavigationProp;
};

const ProfessorDetailsScreen = ({ route, navigation }: Props) => {
  // In a real app, you would fetch professor details using an ID from route.params
  const professorName = "Dr. Smith"; // Placeholder

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{professorName}</Text>
        <Text style={styles.title}>Professor of Computer Science</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>
          Experienced professor with expertise in machine learning and artificial intelligence.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <Text style={styles.courseItem}>Introduction to Programming</Text>
        <Text style={styles.courseItem}>Advanced Algorithms</Text>
        <Text style={styles.courseItem}>Machine Learning Fundamentals</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => navigation.navigate('Chat', { name: professorName })}
      >
        <Text style={styles.chatButtonText}>Start Chat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  courseItem: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfessorDetailsScreen;