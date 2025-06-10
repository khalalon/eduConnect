import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type StudentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Students'>;

type Props = {
  navigation: StudentsScreenNavigationProp;
};

// Mock data for students
const STUDENTS = [
  { id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', program: 'Computer Science', year: 3 },
  { id: '2', name: 'John Smith', email: 'john.smith@example.com', program: 'Computer Science', year: 2 },
  { id: '3', name: 'Emily Johnson', email: 'emily.j@example.com', program: 'Data Science', year: 4 },
  { id: '4', name: 'Michael Brown', email: 'michael.b@example.com', program: 'Software Engineering', year: 1 },
  { id: '5', name: 'Sarah Wilson', email: 'sarah.w@example.com', program: 'Computer Science', year: 3 },
  { id: '6', name: 'David Lee', email: 'david.lee@example.com', program: 'Artificial Intelligence', year: 2 },
];

const StudentsScreen = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredStudents = STUDENTS.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudentItem = ({ item }: { item: typeof STUDENTS[0] }) => (
    <TouchableOpacity 
      style={styles.studentItem}
      onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
        <Text style={styles.studentProgram}>{item.program}, Year {item.year}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat', { name: item.name })}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  studentProgram: {
    fontSize: 14,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default StudentsScreen;