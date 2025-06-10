import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Searchbar, Chip, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Content, User, Professor, Student, UserRole } from '../../types';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

type SearchResult = {
  type: 'content' | 'user';
  item: Content | User;
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'content' | 'users'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      // In a real app, you might store these in AsyncStorage
      // For now, we'll use dummy data
      setRecentSearches(['programming', 'math', 'physics', 'history']);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
      // In a real app, save to AsyncStorage here
    }
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get('/search', {
        params: {
          query,
          filter: activeFilter === 'all' ? undefined : activeFilter,
        },
      });
      
      setResults(response.data);
      saveRecentSearch(query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: 'all' | 'content' | 'users') => {
    setActiveFilter(filter);
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'content') {
      const content = result.item as Content;
      navigation.navigate('ContentDetails', { contentId: content.id });
    } else {
      const profile = result.item as User;
      if (profile.role === UserRole.PROFESSOR) {
        navigation.navigate('ProfessorDetails', { professorId: profile.id });
      } else {
        navigation.navigate('StudentDetails', { studentId: profile.id });
      }
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    if (item.type === 'content') {
      const content = item.item as Content;
      return (
        <TouchableOpacity onPress={() => handleResultPress(item)}>
          <Card style={styles.resultCard}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={content.type === 'video' ? 'videocam' : 'document-text'} 
                  size={24} 
                  color="#0066cc" 
                />
                <Title style={styles.resultTitle}>{content.title}</Title>
              </View>
              <Paragraph numberOfLines={2} style={styles.resultDescription}>
                {content.description}
              </Paragraph>
              <View style={styles.tagsContainer}>
                <Chip style={styles.tagChip} textStyle={styles.tagText}>
                  {content.type}
                </Chip>
                {content.tags?.map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    } else {
      const profile = item.item as User;
      return (
        <TouchableOpacity onPress={() => handleResultPress(item)}>
          <Card style={styles.resultCard}>
            <Card.Content>
              <View style={styles.resultHeader}>
                <Ionicons name="person" size={24} color="#0066cc" />
                <Title style={styles.resultTitle}>{profile.name}</Title>
              </View>
              <Paragraph style={styles.resultDescription}>
                {profile.role === UserRole.PROFESSOR ? 'Professor' : 'Student'}
                {profile.role === UserRole.PROFESSOR && (profile as Professor).specialization && (
                  <Text style={styles.specialization}>
                    {(profile as Professor).specialization}
                  </Text>
                )}
              </Paragraph>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    }
  };

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.recentSearchItem} 
      onPress={() => {
        setSearchQuery(item);
        handleSearch(item);
      }}
    >
      <Ionicons name="time-outline" size={18} color="#666" />
      <Text style={styles.recentSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search for content, professors, students..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch()}
        style={styles.searchBar}
      />
      
      <View style={styles.filterContainer}>
        <Chip 
          selected={activeFilter === 'all'} 
          onPress={() => handleFilterChange('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip 
          selected={activeFilter === 'content'} 
          onPress={() => handleFilterChange('content')}
          style={styles.filterChip}
        >
          Content
        </Chip>
        <Chip 
          selected={activeFilter === 'users'} 
          onPress={() => handleFilterChange('users')}
          style={styles.filterChip}
        >
          Users
        </Chip>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => `${item.type}-${item.item.id || index}`}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : searchQuery.trim() ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsSubtext}>Try different keywords or filters</Text>
        </View>
      ) : (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <Divider />}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchBar: {
    marginBottom: 10,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterChip: {
    marginRight: 8,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTitle: {
    marginLeft: 10,
    fontSize: 16,
  },
  resultDescription: {
    fontSize: 14,
    color: '#555',
  },
  specialization: {
    fontSize: 14,
    color: '#0066cc',
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    marginRight: 5,
    marginBottom: 5,
    height: 26,
  },
  tagText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  noResultsText: {
    fontSize: 18,
    color: '#555',
    marginTop: 15,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  recentSearchesContainer: {
    flex: 1,
    paddingTop: 10,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  recentSearchText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  separator: {
    height: 8,
  },
});

export default SearchScreen;
                  
