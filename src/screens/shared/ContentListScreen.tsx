import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Chip, Searchbar, Button, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Content } from '../../types';
import api, { ApiResponse } from '../../services/api';

// Memoized content item component for better performance
const ContentItem = memo(({ item, onPress }: { item: Content; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <Card style={styles.contentCard}>
      <Card.Content>
        <Title style={styles.contentTitle}>{item.title}</Title>
        <Paragraph numberOfLines={2} style={styles.contentDescription}>
          {item.description}
        </Paragraph>
        
        <View style={styles.contentMeta}>
          <Chip 
            icon={item.type === 'document' ? 'file-document' : 'video'} 
            style={styles.contentTypeChip}
          >
            {item.type}
          </Chip>
          <Text style={styles.contentDate}>
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
));

const ContentListScreen = () => {
  const navigation = useNavigation();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  useEffect(() => {
    fetchContents();
  }, []);
  
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Content[]>>('/content');
      
      if (response.data.success) {
        const contentData = response.data.data || [];
        setContents(contentData);
        setFilteredContents(contentData);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(contentData.map(content => content.category))
        );
        setCategories(uniqueCategories);
      } else {
        setError('Failed to load contents');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching contents:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...contents];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        content => 
          content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(content => content.type === typeFilter);
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(content => content.category === categoryFilter);
    }
    
    setFilteredContents(filtered);
  };
  
  useEffect(() => {
    applyFilters();
  }, [searchQuery, typeFilter, categoryFilter, contents]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleTypeFilter = (type: string | null) => {
    setTypeFilter(type === typeFilter ? null : type);
  };
  
  const handleCategoryFilter = (category: string | null) => {
    setCategoryFilter(category);
    setShowCategoryMenu(false);
  };
  
  const clearFilters = () => {
    setTypeFilter(null);
    setCategoryFilter(null);
    setSearchQuery('');
  };
  
  const navigateToContentDetails = (contentId: string) => {
    navigation.navigate('ContentDetails', { contentId });
  };
  
  const renderContentItem = useCallback(({ item }: { item: Content }) => (
    <ContentItem 
      item={item} 
      onPress={() => navigateToContentDetails(item.id)} 
    />
  ), []);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading contents...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search contents"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={typeFilter === 'document'}
            onPress={() => handleTypeFilter('document')}
            style={styles.filterChip}
            icon="file-document"
          >
            Documents
          </Chip>
          <Chip
            selected={typeFilter === 'video'}
            onPress={() => handleTypeFilter('video')}
            style={styles.filterChip}
            icon="video"
          >
            Videos
          </Chip>
          
          <Menu
            visible={showCategoryMenu}
            onDismiss={() => setShowCategoryMenu(false)}
            anchor={
              <Chip
                selected={categoryFilter !== null}
                onPress={() => setShowCategoryMenu(true)}
                style={styles.filterChip}
                icon="folder"
              >
                {categoryFilter || 'Category'}
              </Chip>
            }
          >
            <Menu.Item onPress={() => handleCategoryFilter(null)} title="All Categories" />
            {categories.map(category => (
              <Menu.Item 
                key={category} 
                onPress={() => handleCategoryFilter(category)} 
                title={category} 
              />
            ))}
          </Menu>
          
          {(typeFilter || categoryFilter || searchQuery) && (
            <Chip
              onPress={clearFilters}
              style={styles.filterChip}
              icon="close"
            >
              Clear Filters
            </Chip>
          )}
        </ScrollView>
      </View>
      
      {filteredContents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contents found</Text>
          {(typeFilter || categoryFilter || searchQuery) && (
            <Button mode="outlined" onPress={clearFilters} style={styles.clearButton}>
              Clear Filters
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredContents}
          renderItem={renderContentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    paddingBottom: 5,
  },
  searchbar: {
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 15,
  },
  contentCard: {
    marginBottom: 15,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 18,
  },
  contentDescription: {
    marginTop: 5,
    color: '#666',
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  contentTypeChip: {
    height: 24,
  },
  contentDate: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  clearButton: {
    marginTop: 10,
  },
});

export default ContentListScreen;
