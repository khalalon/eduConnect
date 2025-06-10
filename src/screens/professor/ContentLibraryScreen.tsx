import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from 'react-native';
import { 
  Searchbar, 
  FAB, 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Menu, 
  Divider,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Content {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'image';
  fileUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  price?: number;
  tags: string[];
  views: number;
  downloads: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

const ContentLibraryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'rating'>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  
  const navigation = useNavigation();
  
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/content/professor');
      setContents(response.data);
      applyFiltersAndSort(response.data, searchQuery, filterType, sortBy);
    } catch (error) {
      console.error('Error fetching contents:', error);
      Alert.alert('Error', 'Failed to load content library');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      fetchContents();
    }, [])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchContents();
  };
  
  const applyFiltersAndSort = (
    data: Content[], 
    query: string, 
    type: string | null, 
    sort: 'newest' | 'oldest' | 'popular' | 'rating'
  ) => {
    // Filter by search query
    let filtered = data;
    
    if (query) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filter by content type
    if (type) {
      filtered = filtered.filter(item => item.type === type);
    }
    
    // Sort
    switch (sort) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
    }
    
    setFilteredContents(filtered);
  };
  
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSort(contents, query, filterType, sortBy);
  };
  
  const handleFilterByType = (type: string | null) => {
    setFilterType(type);
    setFilterMenuVisible(false);
    applyFiltersAndSort(contents, searchQuery, type, sortBy);
  };
  
  const handleSortBy = (sort: 'newest' | 'oldest' | 'popular' | 'rating') => {
    setSortBy(sort);
    setSortMenuVisible(false);
    applyFiltersAndSort(contents, searchQuery, filterType, sort);
  };
  
  const handleContentPress = (contentId: string) => {
    navigation.navigate('ContentDetails', { contentId });
  };
  
  const handleEditContent = (contentId: string) => {
    setMenuVisible(null);
    navigation.navigate('EditContent', { contentId });
  };
  
  const handleDeleteContent = (contentId: string) => {
    setMenuVisible(null);
    
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/content/${contentId}`);
              setContents(contents.filter(item => item.id !== contentId));
              setFilteredContents(filteredContents.filter(item => item.id !== contentId));
              Alert.alert('Success', 'Content deleted successfully');
            } catch (error) {
              console.error('Error deleting content:', error);
              Alert.alert('Error', 'Failed to delete content');
            }
          },
        },
      ]
    );
  };
  
  const renderContentTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <Ionicons name="document-outline" size={24} color="#0066cc" />;
      case 'video':
        return <Ionicons name="videocam-outline" size={24} color="#0066cc" />;
      case 'audio':
        return <Ionicons name="musical-notes-outline" size={24} color="#0066cc" />;
      case 'image':
        return <Ionicons name="image-outline" size={24} color="#0066cc" />;
      default:
        return <Ionicons name="document-outline" size={24} color="#0066cc" />;
    }
  };
  
  const renderContentItem = ({ item }: { item: Content }) => (
    <Card style={styles.card} onPress={() => handleContentPress(item.id)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.typeIconContainer}>
              {renderContentTypeIcon(item.type)}
            </View>
            <Title style={styles.title} numberOfLines={1}>{item.title}</Title>
          </View>
          
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(item.id)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => handleEditContent(item.id)} 
              title="Edit" 
              icon="pencil-outline" 
            />
            <Menu.Item 
              onPress={() => handleDeleteContent(item.id)} 
              title="Delete" 
              icon="trash-outline" 
              titleStyle={{ color: '#f44336' }}
            />
          </Menu>
        </View>
        
        <Paragraph numberOfLines={2} style={styles.description}>
          {item.description}
        </Paragraph>
        
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
          {item.tags.length > 3 && (
            <Chip style={styles.tag} textStyle={styles.tagText}>
              +{item.tags.length - 3}
            </Chip>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="download-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.downloads}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
          </View>
          
          {item.isPremium && (
            <Chip style={styles.premiumChip} textStyle={styles.premiumChipText}>
              Premium
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No content found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || filterType
          ? 'Try adjusting your filters or search query'
          : 'Start by uploading your first content'}
      </Text>
      {!searchQuery && !filterType && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('UploadContent')}
        >
          <Text style={styles.emptyButtonText}>Upload Content</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search content..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterContainer}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={[
                  styles.filterButton,
                  filterType && styles.filterButtonActive
                ]}
                onPress={() => setFilterMenuVisible(true)}
              >
                <Ionicons name="filter-outline" size={18} color={filterType ? "#0066cc" : "#666"} />
                <Text style={[
                  styles.filterButtonText,
                  filterType && styles.filterButtonTextActive
                ]}>
                  {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'Filter'}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => handleFilterByType(null)} title="All Types" />
            <Menu.Item onPress={() => handleFilterByType('document')} title="Documents" />
            <Menu.Item onPress={() => handleFilterByType('video')} title="Videos" />
            <Menu.Item onPress={() => handleFilterByType('audio')} title="Audio" />
            <Menu.Item onPress={() => handleFilterByType('image')} title="Images" />
          </Menu>
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setSortMenuVisible(true)}
              >
                <Ionicons name="swap-vertical-outline" size={18} color="#666" />
                <Text style={styles.filterButtonText}>
                  {sortBy === 'newest' ? 'Newest' : 
                   sortBy === 'oldest' ? 'Oldest' : 
                   sortBy === 'popular' ? 'Popular' : 'Top Rated'}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => handleSortBy('newest')} title="Newest First" />
            <Menu.Item onPress={() => handleSortBy('oldest')} title="Oldest First" />
            <Menu.Item onPress={() => handleSortBy('popular')} title="Most Viewed" />
            <Menu.Item onPress={() => handleSortBy('rating')} title="Top Rated" />
          </Menu>
        </View>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContents}
          renderItem={renderContentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
            />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('UploadContent')}
        color="#fff"
      />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  filterButtonText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#0066cc',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  description: {
    color: '#666',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  premiumChip: {
    marginLeft: 'auto',
    backgroundColor: '#ffd700',
  },
  premiumChipText: {
    color: '#333',
    fontWeight: '500',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0066cc',
  },
});

export default ContentLibraryScreen;
