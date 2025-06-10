import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { TextInput, Button, Chip, Switch, HelperText, Divider, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import api from '../../services/api';

interface Tag {
  id: string;
  name: string;
}

const UploadContentScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'document' | 'video' | 'audio' | 'image'>('document');
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
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    file?: string;
    price?: string;
  }>({});
  
  const navigation = useNavigation();
  
  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      file?: string;
      price?: string;
    } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }
    
    if (isPremium && (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const fileInfo = result.assets[0];
      const fileSize = await getFileSize(fileInfo.uri);
      
      // Check file size (limit to 50MB)
      if (fileSize > 50 * 1024 * 1024) {
        Alert.alert('Error', 'File size exceeds 50MB limit');
        return;
      }
      
      setFile({
        uri: fileInfo.uri,
        name: fileInfo.name,
        type: fileInfo.mimeType || 'application/octet-stream',
        size: fileSize,
      });
      
      // Auto-detect content type based on file extension
      const extension = fileInfo.name.split('.').pop()?.toLowerCase();
      if (extension) {
        if (['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
          setContentType('document');
        } else if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(extension)) {
          setContentType('video');
        } else if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(extension)) {
          setContentType('audio');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
          setContentType('image');
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };
  
  const getFileSize = async (fileUri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.size || 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  };
  
  const pickThumbnail = async () => {
    try {
      // Request permission
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to upload a thumbnail');
          return;
        }
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (result.canceled) {
        return;
      }
      
      const asset = result.assets[0];
      const fileExtension = asset.uri.split('.').pop() || 'jpg';
      
      setThumbnail({
        uri: asset.uri,
        name: `thumbnail.${fileExtension}`,
        type: `image/${fileExtension}`,
      });
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to select thumbnail');
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  
  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('contentType', contentType);
      formData.append('isPremium', String(isPremium));
      
      if (isPremium) {
        formData.append('price', price);
      }
      
      tags.forEach((tag) => {
        formData.append('tags[]', tag);
      });
      
      // Append file
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }
      
      // Append thumbnail if available
      if (thumbnail) {
        formData.append('thumbnail', {
          uri: thumbnail.uri,
          name: thumbnail.name,
          type: thumbnail.type,
        } as any);
      }
      
      // Upload content
      const response = await api.post('/content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert(
        'Success',
        'Content uploaded successfully',
        [
          {
            text: 'View Content',
            onPress: () => navigation.navigate('ContentDetails', { contentId: response.data.id }),
          },
          {
            text: 'Upload Another',
            onPress: () => {
              setTitle('');
              setDescription('');
              setContentType('document');
              setFile(null);
              setThumbnail(null);
              setIsPremium(false);
              setPrice('');
              setTags([]);
              setErrors({});
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading content:', error);
      Alert.alert('Error', 'Failed to upload content');
    } finally {
      setUploading(false);
    }
  };
  
  const renderFileTypeIcon = () => {
    switch (contentType) {
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Title style={styles.sectionTitle}>Content Information</Title>
        
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
        
        <Title style={styles.sectionTitle}>Content Type</Title>
        
        <View style={styles.contentTypeContainer}>
          <TouchableOpacity
            style={[
              styles.contentTypeOption,
              contentType === 'document' && styles.contentTypeSelected,
            ]}
            onPress={() => setContentType('document')}
          >
            <Ionicons 
              name="document-outline" 
              size={24} 
              color={contentType === 'document' ? '#0066cc' : '#666'} 
            />
            <Text 
              style={[
                styles.contentTypeText,
                contentType === 'document' && styles.contentTypeTextSelected,
              ]}
            >
              Document
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.contentTypeOption,
              contentType === 'video' && styles.contentTypeSelected,
            ]}
            onPress={() => setContentType('video')}
          >
            <Ionicons 
              name="videocam-outline" 
              size={24} 
              color={contentType === 'video' ? '#0066cc' : '#666'} 
            />
            <Text 
              style={[
                styles.contentTypeText,
                contentType === 'video' && styles.contentTypeTextSelected,
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.contentTypeOption,
              contentType === 'audio' && styles.contentTypeSelected,
            ]}
            onPress={() => setContentType('audio')}
          >
            <Ionicons 
              name="musical-notes-outline" 
              size={24} 
              color={contentType === 'audio' ? '#0066cc' : '#666'} 
            />
            <Text 
              style={[
                styles.contentTypeText,
                contentType === 'audio' && styles.contentTypeTextSelected,
              ]}
            >
              Audio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.contentTypeOption,
              contentType === 'image' && styles.contentTypeSelected,
            ]}
            onPress={() => setContentType('image')}
          >
            <Ionicons 
              name="image-outline" 
              size={24} 
              color={contentType === 'image' ? '#0066cc' : '#666'} 
            />
            <Text 
              style={[
                styles.contentTypeText,
                contentType === 'image' && styles.contentTypeTextSelected,
              ]}
            >
              Image
            </Text>
          </TouchableOpacity>
        </View>
        
        <Title style={styles.sectionTitle}>Upload File</Title>
        
        {file ? (
          <View style={styles.filePreview}>
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
        ) : (
          <Button
            mode="outlined"
            icon="file-upload-outline"
            onPress={pickDocument}
            style={styles.uploadButton}
          >
            Select File
          </Button>
        )}
        {errors.file && <HelperText type="error">{errors.file}</HelperText>}
        
        <Title style={styles.sectionTitle}>Thumbnail (Optional)</Title>
        <Paragraph style={styles.helperText}>
          Add a thumbnail image for better visibility
        </Paragraph>
        
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
            Select Thumbnail
          </Button>
        )}
        
        <Title style={styles.sectionTitle}>Tags</Title>
        <Paragraph style={styles.helperText}>
          Add tags to help students find your content
        </Paragraph>
        
        <View style={styles.tagInputContainer}>
          <TextInput
            label="Add a tag"
            value={tagInput}
            onChangeText={setTagInput}
            mode="outlined"
            style={styles.tagInput}
            right={
              <TextInput.Icon
                icon="plus"
                onPress={addTag}
                disabled={!tagInput.trim()}
              />
            }
            onSubmitEditing={addTag}
          />
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              style={styles.tag}
              onClose={() => removeTag(index)}
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
          onPress={handleUpload}
          loading={uploading}
          disabled={uploading}
          style={styles.submitButton}
        >
          Upload Content
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
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  contentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contentTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  contentTypeSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#E3F2FD',
  },
  contentTypeText: {
    marginTop: 5,
    color: '#666',
  },
  contentTypeTextSelected: {
    color: '#0066cc',
    fontWeight: '500',
  },
  uploadButton: {
    marginVertical: 10,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 10,
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
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontWeight: '500',
  },
  fileSize: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  fileRemoveButton: {
    padding: 5,
  },
  thumbnailContainer: {
    position: 'relative',
    marginVertical: 10,
    alignItems: 'center',
  },
  thumbnailPreview: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    resizeMode: 'cover',
  },
  thumbnailRemoveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  tagInputContainer: {
    marginBottom: 10,
  },
  tagInput: {
    backgroundColor: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    margin: 4,
  },
  noTagsText: {
    color: '#888',
    fontStyle: 'italic',
    padding: 10,
  },
  divider: {
    marginVertical: 20,
  },
  pricingContainer: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
  },
  submitButton: {
    marginVertical: 20,
    paddingVertical: 8,
  },
});

export default UploadContentScreen;
