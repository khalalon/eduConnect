import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ContentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Content'>;

type Props = {
  navigation: ContentScreenNavigationProp;
};

// Mock data for content
const CONTENT = [
  { 
    id: '1', 
    title: 'Introduction to Programming - Lecture 1', 
    type: 'pdf', 
    date: '2023-05-10', 
    size: '2.5 MB',
    course: 'Introduction to Programming'
  },
  { 
    id: '2', 
    title: 'Data Structures - Assignment 1', 
    type: 'doc', 
    date: '2023-05-08', 
    size: '1.2 MB',
    course: 'Data Structures and Algorithms'
  },
  { 
    id: '3', 
    title: 'Machine Learning - Dataset', 
    type: 'csv', 
    date: '2023-05-05', 
    size: '4.7 MB',
    course: 'Machine Learning Fundamentals'
  },
  { 
    id: '4', 
    title: 'Web Development - Project Guidelines', 
    type: 'pdf', 
    date: '2023-05-01', 
    size: '3.1 MB',
    course: 'Web Development'
  },
];

const ContentScreen = ({ navigation }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  
  const filters = ['All', 'PDF', 'DOC', 'CSV', 'Other'];
  
  const filteredContent = selectedFilter === 'All' 
    ? CONTENT 
    : CONTENT.filter(item => item.type.toLowerCase() === selectedFilter.toLowerCase());

  const getIconName = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf': return 'document-text';
      case 'doc': return 'document';
      case 'csv': return 'grid';
      default: return 'document-attach';
    }
  };

  const renderContentItem = ({ item }: { item: typeof CONTENT[0] }) => (
    <TouchableOpacity 
      style={styles.contentItem}
      onPress={() => navigation.navigate('ContentDetails', { contentId: item.id })}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getIconName(item.type)} size={24} color="#007bff" />
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentCourse}>{item.course}</Text>
        <View style={styles.contentMeta}>
          <Text style={styles.contentDate}>{item.date}</Text>
          <Text style={styles.contentSize}>{item.size}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Library</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => navigation.navigate('UploadContent')}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text 
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredContent}
        renderItem={renderContentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content found</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  contentItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentCourse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentDate: {
    fontSize: 12,
    color: '#888',
  },
  contentSize: {
    fontSize: 12,
    color: '#888',
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

export default ContentScreen;
