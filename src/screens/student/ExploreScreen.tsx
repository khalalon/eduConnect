import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for professors
  const professors = [
    { id: '1', name: 'Dr. Sarah Johnson', subject: 'Computer Science', rating: 4.8 },
    { id: '2', name: 'Prof. Michael Chen', subject: 'Data Science', rating: 4.6 },
    { id: '3', name: 'Dr. Emily Rodriguez', subject: 'Web Development', rating: 4.9 },
    { id: '4', name: 'Prof. David Kim', subject: 'Mobile App Development', rating: 4.7 },
  ];

  const renderProfessorItem = ({ item }) => (
    <View style={styles.professorCard}>
      <View style={styles.professorInfo}>
        <Text style={styles.professorName}>{item.name}</Text>
        <Text style={styles.professorSubject}>{item.subject}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search professors or subjects..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Popular Professors</Text>
      
      <FlatList
        data={professors}
        renderItem={renderProfessorItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  professorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  professorInfo: {
    flex: 1,
  },
  professorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  professorSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
});

export default ExploreScreen;