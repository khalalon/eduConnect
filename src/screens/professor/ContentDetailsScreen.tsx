import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Share,
  Platform,
  Linking
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Button, 
  Divider, 
  Text,
  ActivityIndicator,
  Avatar
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as IntentLauncher from 'expo-intent-launcher';
import { RootStackParamList } from '../../navigation/types';
import api from '../../services/api';

type ContentDetailsRouteProp = RouteProp<RootStackParamList, 'ContentDetails'>;

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
  author: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ContentDetailsScreen = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userType, setUserType] = useState<'student' | 'professor'>('professor');
  const [hasPurchased, setHasPurchased] = useState(false);
  
  const route = useRoute<ContentDetailsRouteProp>();
  const navigation = useNavigation();
  const { contentId } = route.params;
  
  useEffect(() => {
    fetchContentDetails();
    fetchReviews();
    checkUserType();
    checkPurchaseStatus();
  }, [contentId]);
  
  const checkUserType = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserType(response.data.type);
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };
  
  const checkPurchaseStatus = async () => {
    if (userType === 'professor') {
      setHasPurchased(true);
      return;
    }
    
    try {
      const response = await api.get(`/purchases/check/${contentId}`);
      setHasPurchased(response.data.hasPurchased);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };
  
  const fetchContentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/content/${contentId}`);
      setContent(response.data);
      
      // Increment view count
      await api.post(`/content/${contentId}/view`);
    } catch (error) {
      console.error('Error fetching content details:', error);
      Alert.alert('Error', 'Failed to load content details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchReviews = async () => {
    try {
      const response = await api.get(`/content/${contentId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };
  
  const handleDownload = async () => {
    if (!content) return;
    
    // Check if premium and not purchased
    if (content.isPremium && !hasPurchased) {
      Alert.alert(
        'Premium Content',
        'You need to purchase this content to download it.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Purchase',
            onPress: handlePurchase,
          },
        ]
      );
      return;
    }
    
    try {
      // Request permissions
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need storage permissions to download files');
          return;
        }
      }
      
      setDownloading(true);
      setProgress(0);
      
      // Get file extension from URL
      const fileExt = content.fileUrl.split('.').pop() || '';
      const fileName = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Download file
      const downloadResumable = FileSystem.createDownloadResumable(
        content.fileUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(progress);
        }
      );
      
      const { uri } = await downloadResumable.downloadAsync();
      
      // Save file to device
      if (Platform.OS === 'android') {
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      }
      
      // Increment download count
      await api.post(`/content/${contentId}/download`);
      
      // Refresh content details
      fetchContentDetails();
      
      Alert.alert(
        'Download Complete',
        'File has been saved to your device',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
          {
            text: 'Open',
            onPress: () => openFile(uri, content?.type || 'document'),
          },
        ]
      );
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };
  
  const openFile = async (uri: string, type: string) => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(uri);
      } else {
        let UTI = 'application/octet-stream';
        
        switch (type) {
          case 'document':
            if (uri.endsWith('.pdf')) UTI = 'application/pdf';
            else if (uri.endsWith('.doc') || uri.endsWith('.docx')) UTI = 'application/msword';
            break;
          case 'video':
            UTI = 'video/*';
            break;
          case 'audio':
            UTI = 'audio/*';
            break;
          case 'image':
            UTI = 'image/*';
            break;
        }
        
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: uri,
          flags: 1,
          type: UTI,
        });
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Could not open the file');
    }
  };
  
  const handlePurchase = async () => {
    if (!content) return;
    
    try {
      // Navigate to payment screen or show payment modal
      // This is a placeholder for actual payment implementation
      Alert.alert(
        'Purchase Content',
        `Would you like to purchase "${content.title}" for $${content.price}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Purchase',
            onPress: async () => {
              try {
                await api.post(`/purchases/${contentId}`);
                setHasPurchased(true);
                Alert.alert('Success', 'Content purchased successfully');
              } catch (error) {
                console.error('Error purchasing content:', error);
                Alert.alert('Error', 'Failed to complete purchase');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error initiating purchase:', error);
      Alert.alert('Error', 'Failed to initiate purchase');
    }
  };
  
  const handleShare = async () => {
    if (!content) return;
    
    try {
      await Share.share({
        message: `Check out this ${content.type}: ${content.title}\n\nDescription: ${content.description}\n\nShared via EduShare App`,
      });
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };
  
  const handleEdit = () => {
    navigation.navigate('EditContent', { contentId });
  };
  
  const handleDelete = () => {
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
              Alert.alert('Success', 'Content deleted successfully');
              navigation.goBack();
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
        return <Ionicons name="document" size={24} color="#0066cc" />;
      case 'video':
        return <Ionicons name="videocam" size={24} color="#0066cc" />;
      case 'audio':
        return <Ionicons name="musical-notes" size={24} color="#0066cc" />;
      case 'image':
        return <Ionicons name="image" size={24} color="#0066cc" />;
      default:
        return <Ionicons name="document" size={24} color="#0066cc" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={16} color="#FFC107" />
      );
    }
    
    // Add half star if needed
    if (halfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFC107" />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFC107" />
      );
    }
    
    return (
      <View style={styles.ratingStars}>
        {stars}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading content details...</Text>
      </View>
    );
  }
  
  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#f44336" />
        <Text style={styles.errorTitle}>Content Not Found</Text>
        <Text style={styles.errorText}>The content you're looking for doesn't exist or has been removed.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {content.thumbnailUrl ? (
          <Card.Cover source={{ uri: content.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            {renderContentTypeIcon(content.type)}
            <Text style={styles.placeholderText}>{content.type.toUpperCase()}</Text>
          </View>
        )}
        
        <Card.Content>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{content.title}</Title>
            {content.isPremium && (
              <Chip style={styles.premiumChip} textStyle={styles.premiumChipText}>
                Premium
              </Chip>
            )}
          </View>
          
          <View style={styles.authorContainer}>
{/*             <Avatar.Image 
              size={36} 
              source={content.author.profilePicture ? { uri: content.author.profilePicture } : require('../../assets/default-avatar.png')} 
            /> */}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{content.author.name}</Text>
              <Text style={styles.dateText}>
                Uploaded on {formatDate(content.createdAt)}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={18} color="#666" />
              <Text style={styles.statText}>{content.views} views</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="download" size={18} color="#666" />
              <Text style={styles.statText}>{content.downloads} downloads</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#666" />
              <Text style={styles.statText}>
                {content.rating.toFixed(1)} ({content.reviewCount})
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Title style={styles.sectionTitle}>Description</Title>
          <Paragraph style={styles.description}>{content.description}</Paragraph>
          
          <View style={styles.tagsContainer}>
            {content.tags.map((tag, index) => (
              <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          {userType === 'professor' ? (
            <View style={styles.actionButtonsContainer}>
              <Button 
                mode="contained" 
                icon="download" 
                onPress={handleDownload}
                loading={downloading}
                disabled={downloading}
                style={styles.actionButton}
              >
                Download
              </Button>
              
              <Button 
                mode="outlined" 
                icon="share-variant" 
                onPress={handleShare}
                style={styles.actionButton}
              >
                Share
              </Button>
              
              <Button 
                mode="outlined" 
                icon="pencil" 
                onPress={handleEdit}
                style={styles.actionButton}
              >
                Edit
              </Button>
              
              <Button 
                mode="outlined" 
                icon="delete" 
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
                labelStyle={styles.deleteButtonText}
              >
                Delete
              </Button>
            </View>
          ) : (
            <View style={styles.actionButtonsContainer}>
              {content.isPremium && !hasPurchased ? (
                <Button 
                  mode="contained" 
                  icon="cart" 
                  onPress={handlePurchase}
                  style={styles.purchaseButton}
                >
                  Purchase for ${content.price}
                </Button>
              ) : (
                <Button 
                  mode="contained" 
                  icon="download" 
                  onPress={handleDownload}
                  loading={downloading}
                  disabled={downloading}
                  style={styles.actionButton}
                >
                  Download
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.reviewsCard}>
        <Card.Content>
          <View style={styles.reviewsHeader}>
            <Title style={styles.sectionTitle}>Reviews</Title>
            <Text style={styles.reviewCount}>
              {content.reviewCount} {content.reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          
          {content.reviewCount > 0 ? (
            <View style={styles.ratingOverview}>
              <View style={styles.ratingOverviewItem}>
                <Text style={styles.ratingOverviewValue}>{content.rating.toFixed(1)}</Text>
                <Text style={styles.ratingOverviewLabel}>Average Rating</Text>
                {renderRatingStars(content.rating)}
              </View>
            </View>
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}
          
          <Divider style={styles.divider} />
          
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUser}>
                    {review.userProfileImage ? (
                      <Card.Cover 
                        source={{ uri: review.userProfileImage }} 
                        style={styles.reviewUserImage} 
                      />
                    ) : (
                      <View style={styles.reviewUserImagePlaceholder}>
                        <Text style={styles.reviewUserInitial}>
                          {review.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={styles.reviewUserName}>{review.userName}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {renderRatingStars(review.rating)}
                </View>
                <Paragraph style={styles.reviewComment}>{review.comment}</Paragraph>
                <Divider style={styles.reviewDivider} />
              </View>
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 15,
  },
  errorButton: {
    marginTop: 10,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    flex: 1,
  },
  metaInfo: {
    marginTop: 10,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  contentCard: {
    margin: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },
  tag: {
    margin: 4,
    backgroundColor: '#e0e0e0',
  },
  tagText: {
    color: '#333',
  },
  premiumChip: {
    backgroundColor: '#FFF8E1',
    marginLeft: 10,
  },
  premiumChipText: {
    color: '#FFA000',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  purchaseButton: {
    width: '100%',
    marginVertical: 5,
  },
  reviewsCard: {
    margin: 15,
    marginTop: 0,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    color: '#666',
  },
  ratingOverview: {
    alignItems: 'center',
    marginVertical: 15,
  },
  ratingOverviewItem: {
    alignItems: 'center',
  },
  ratingOverviewValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  ratingOverviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 15,
  },
  noReviewsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 15,
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewUserImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewUserInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  reviewUserName: {
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewComment: {
    lineHeight: 20,
  },
  reviewDivider: {
    marginTop: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 10,
    marginBottom: 5,
  },
  placeholderThumbnail: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontWeight: '500',
    fontSize: 16,
  },
  card: {
    margin: 15,
  },
  thumbnail: {
    height: 200,
  },
});

export default ContentDetailsScreen;
