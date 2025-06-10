import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Avatar, Divider, Chip, Button, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  enrollmentDate: string;
  coursesEnrolled: number;
  lastActive?: string;
}

const StudentListScreen = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'inactive'>('all');
  const navigation = useNavigation();
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [students, searchQuery, filter]);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professor/students');
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };
  
  const applyFilters = () => {
    let result = [...students];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        student => 
          student.name.toLowerCase().includes(query) || 
          student.email.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filter === 'recent') {
      // Students who enrolled in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter(student => 
        new Date(student.enrollmentDate) >= thirtyDaysAgo
      );
    } else if (filter === 'inactive') {
      // Students who haven't been active in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      result = result.filter(student => 
        !student.lastActive || new Date(student.lastActive) < thirtyDaysAgo
      );
    }
    
    setFilteredStudents(result);
  };
  
  const handleStudentPress = (studentId: string) => {
    navigation.navigate('StudentDetails', { studentId });
  };
  
  const renderStudentItem = ({ item }: { item: Student }) => (
    <TouchableOpacity 
      style={styles.studentItem}
      onPress={() => handleStudentPress(item.id)}
    >
      <View style={styles.studentInfo}>
        {item.profileImage ? (
          <Avatar.Image source={{ uri: item.profileImage }} size={50} />
        ) : (
          <Avatar.Text size={50} label={item.name.substring(0, 2).toUpperCase()} />
        )}
        
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
          <View style={styles.studentMeta}>
            <Text style={styles.metaText}>
              <Ionicons name="book-outline" size={14} color="#666" /> {item.coursesEnrolled} courses
            </Text>
            {item.lastActive && (
              <Text style={styles.metaText}>
                <Ionicons name="time-outline" size={14} color="#666" /> Last active: {new Date(item.lastActive).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No students found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery 
          ? 'Try a different search term' 
          : filter !== 'all' 
            ? 'Try a different filter' 
            : 'Students you enroll will appear here'}
      </Text>
    </View>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search students..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <View style={styles.filterChips}>
          <Chip 
            selected={filter === 'all'} 
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip 
            selected={filter === 'recent'} 
            onPress={() => setFilter('recent')}
            style={styles.filterChip}
          >
            Recent
          </Chip>
          <Chip 
            selected={filter === 'inactive'} 
            onPress={() => setFilter('inactive')}
            style={styles.filterChip}
          >
            Inactive
          </Chip>
        </View>
      </View>
      
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={filteredStudents.length === 0 ? styles.emptyList : null}
        ListEmptyComponent={renderEmptyList}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: {filteredStudents.length} students</Text>
        <Button 
          mode="contained" 
          icon="email-outline"
          onPress={() => navigation.navigate('BulkMessage', { studentIds: filteredStudents.map(s => s.id) })}
          disabled={filteredStudents.length === 0}
        >
          Message All
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#666',
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentDetails: {
    marginLeft: 15,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  studentMeta: {
    flexDirection: 'row',
    marginTop: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalText: {
    fontSize: 14,
    color: '#666',
  },
});

export default StudentListScreen;