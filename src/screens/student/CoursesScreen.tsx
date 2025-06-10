import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type CoursesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Courses'>;

type Props = {
  navigation: CoursesScreenNavigationProp;
};

// Mock data for courses
const COURSES = [
  {
    id: '1',
    title: 'Introduction to Programming',
    professor: 'Dr. Smith',
    progress: 75,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Data Structures and Algorithms',
    professor: 'Dr. Johnson',
    progress: 45,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    title: 'Machine Learning Fundamentals',
    professor: 'Dr. Williams',
    progress: 30,
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '4',
    title: 'Web Development',
    professor: 'Dr. Brown',
    progress: 60,
    image: 'https://via.placeholder.com/150',
  },
];

const CoursesScreen = ({ navigation }: Props) => {
  const renderCourseItem = ({ item }: { item: typeof COURSES[0] }) => (
    <TouchableOpacity 
      style={styles.courseItem}
      onPress={() => navigation.navigate('ContentDetails', { contentId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfessorDetails', { professorId: item.id })}
        >
          <Text style={styles.professorName}>Professor: {item.professor}</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
          <Text style={styles.progressText}>{item.progress}% Complete</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      
      <FlatList
        data={COURSES}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    paddingBottom: 20,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  professorName: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 8,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 20,
  },
});

export default CoursesScreen;