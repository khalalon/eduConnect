import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LibraryScreen = () => {
  // Mock data for purchased content
  const purchasedContent = [
    { 
      id: '1', 
      title: 'Introduction to Programming - Complete Course', 
      author: 'Dr. Sarah Johnson',
      type: 'pdf',
      date: '2023-05-15',
    },
    { 
      id: '2', 
      title: 'Data Structures and Algorithms - Video Series', 
      author: 'Prof. Michael Chen',
      type: 'video',
      date: '2023-05-10',
    },
    { 
      id: '3', 
      title: 'Web Development Fundamentals', 
      author: 'Dr. Emily Rodriguez',
      type: 'pdf',
      date: '2023-05-05',
    },
    { 
      id: '4', 
      title: 'Mobile App Development Workshop', 
      author: 'Prof. David Kim',
      type: 'video',
      date: '2023-04-28',
    },
  ];

  const getIconForType = (type) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'musical-notes';
      default:
        return 'document';
    }
  };

  const renderContentItem = ({ item }) => (
    <TouchableOpacity style={styles.contentCard}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIconForType(item.type)} size={24} color="#0066cc" />
      </View>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentAuthor}>{item.author}</Text>
        <Text style={styles.contentDate}>Purchased: {item.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Library</Text>
      
      <FlatList
        data={purchasedContent}
        renderItem={renderContentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your library is empty</Text>
            <Text style={styles.emptySubtext}>Purchased content will appear here</Text>
          </View>
        }
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
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
  contentAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contentDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default LibraryScreen;