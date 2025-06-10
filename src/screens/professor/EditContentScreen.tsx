import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image, 
  Platform 
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Chip, 
  Switch, 
  HelperText, 
  Divider, 
  Title, 
  Paragraph,
  ActivityIndicator,
  Text
} from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { RootStackParamList } from '../../navigation/types';
import api from '../../services/api';

type EditContentRouteProp = RouteProp<RootStackParamList, 'EditContent'>;

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
}

const EditContentScreen = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [thumbnail, setThumbnail] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    price?: string;
  }>({});
  
  const route = useRoute<EditContentRouteProp>();
  const navigation = useNavigation();
  const { contentId } = route.params;
  
  useEffect(() => {
    fetchContentDetails();
  }, [contentId]);
  
  const fetchContentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/content/${contentId}`);
      const contentData = response.data;
      
      setContent(contentData);
      setTitle(contentData.title);
      setDescription(contentData.description);
      setIsPremium(contentData.isPremium);
      setPrice(contentData.price ? contentData.price.toString() : '');
      setTags(contentData.tags);
      
      // Set thumbnail if exists
      if (contentData.thumbnailUrl) {
        setThumbnail({
          uri: contentData.thumbnailUrl,
          name: 'current-thumbnail.jpg',
          type: 'image/jpeg',
        });
      }
    } catch (error) {
      console.error('Error fetching content details:', error);
      Alert.alert('Error', 'Failed to load content details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      price?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (isPremium && (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      const fileInfo = result.assets[0];
      const fileSize = await FileSystem.getInfoAsync(fileInfo.uri);
      
      setFile({
        uri: fileInfo.uri,
        name: fileInfo.name,
        type: fileInfo.mimeType || 'application/octet-stream',
        size: fileSize.size || 0,
      });
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };
  
  const pickThumbnail = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (result.canceled) return;
      
      const imageInfo = result.assets[0];
      const fileType = imageInfo.uri.split('.').pop() || 'jpg';
      
      setThumbnail({
        uri: imageInfo.uri,
        name: `thumbnail.${fileType}`,
        type: `image/${fileType}`,
      });
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };
  
  const renderFileTypeIcon = () => {
    if (!content) return null;
    
    switch (content.type) {
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
  
  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    try {
      setUpdating(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('isPremium', isPremium ? 'true' : 'false');
      
      if (isPremium && price) {
        formData.append('price', price);
      }
      
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }
      
      // Add file if selected
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }
      
      // Add thumbnail if selected
      if (thumbnail && thumbnail.uri !== content?.thumbnailUrl) {
        formData.append('thumbnail', {
          uri: thumbnail.uri,
          name: thumbnail.name,
          type: thumbnail.type,
        } as any);
      }
      
      // Update content
      await api.put(`/content/${contentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert(
        'Success',
        'Content updated successfully',
        [
          {
            text: 'View Content',
            onPress: () => navigation.navigate('ContentDetails', { contentId }),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating content:', error);
      Alert.alert('Error', 'Failed to update content');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.screenTitle}>Edit Content</Title>
        
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          error={!!errors.title}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}
        
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}
        
        <Divider style={styles.divider} />
        
        <Title style={styles.sectionTitle}>Current File</Title>
        
        <View style={styles.filePreview}>
          <View style={styles.fileInfo}>
            <View style={styles.fileIconContainer}>
              {renderFileTypeIcon()}
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{content?.fileUrl.split('/').pop()}</Text>
              <Text style={styles.fileType}>{content?.type.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <Button
          mode="outlined"
          icon="file-upload-outline"
          onPress={pickDocument}
          style={styles.uploadButton}
        >
          Replace File
        </Button>
        
        {file && (
          <View style={styles.newFilePreview}>
            <Text style={styles.newFileLabel}>New file selected:</Text>
            <View style={styles.fileInfo}>
              <View style={styles.fileIconContainer}>
                {renderFileTypeIcon()}
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileSize}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.fileRemoveButton}
              onPress={() => setFile(null)}
            >
              <Ionicons name="close-circle" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <Title style={styles.sectionTitle}>Thumbnail</Title>
        
        {thumbnail ? (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailPreview} />
            <TouchableOpacity
              style={styles.thumbnailRemoveButton}
              onPress={() => setThumbnail(null)}
            >
              <Ionicons name="close-circle" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            mode="outlined"
            icon="image-outline"
            onPress={pickThumbnail}
            style={styles.uploadButton}
          >
            Add Thumbnail
          </Button>
        )}
        
        <Divider style={styles.divider} />
        
        <Title style={styles.sectionTitle}>Tags</Title>
        
        <View style={styles.tagsInputContainer}>
          <TextInput
            label="Add tags"
            value={tagInput}
            onChangeText={setTagInput}
            mode="outlined"
            style={styles.tagInput}
            right={
              <TextInput.Icon 
                icon="plus" 
                onPress={handleAddTag} 
                disabled={!tagInput.trim()}
              />
            }
            onSubmitEditing={handleAddTag}
          />
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              style={styles.tag}
              onClose={() => handleRemoveTag(index)}
            >
              {tag}
            </Chip>
          ))}
          {tags.length === 0 && (
            <Text style={styles.noTagsText}>No tags added yet</Text>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <Title style={styles.sectionTitle}>Pricing</Title>
        
        <View style={styles.pricingContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Premium Content</Text>
            <Switch
              value={isPremium}
              onValueChange={setIsPremium}
              color="#0066cc"
            />
          </View>
          
          {isPremium && (
            <>
              <TextInput
                label="Price ($)"
                value={price}
                onChangeText={setPrice}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                error={!!errors.price}
              />
              {errors.price && <HelperText type="error">{errors.price}</HelperText>}
            </>
          )}
        </View>
        
        <Button
          mode="contained"
          onPress={handleUpdate}
          loading={updating}
          disabled={updating}
          style={styles.submitButton}
        >
          Update Content
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  filePreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  fileType: {
    fontSize: 14,
    color: '#666',
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    marginBottom: 16,
  },
  newFilePreview: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  newFileLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#0066cc',
  },
  fileRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  thumbnailPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  thumbnailRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  tagsInputContainer: {
    marginBottom: 12,
  },
  tagInput: {
    backgroundColor: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    margin: 4,
  },
  noTagsText: {
    color: '#666',
    fontStyle: 'italic',
    padding: 4,
  },
  pricingContainer: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginBottom: 24,
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
});

export default EditContentScreen;