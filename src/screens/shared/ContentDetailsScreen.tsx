import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

type ContentDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'ContentDetails'>;
  navigation: StackNavigationProp<RootStackParamList, 'ContentDetails'>;
};

// Mock data for content
const contentData = {
  id: '1',
  title: 'Introduction to React Native',
  description: 'Learn the basics of React Native development and how to create cross-platform mobile applications.',
  type: 'video',
  date: '2023-05-15',
  size: '45 MB',
  course: 'Mobile Development',
  author: 'John Smith',
  downloadUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
  previewAvailable: true
};

const ContentDetailsScreen = ({ route, navigation }: ContentDetailsScreenProps) => {
  const { contentId } = route.params;
  const [content, setContent] = useState(contentData);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, fetch content details based on contentId
    navigation.setOptions({
      title: content.title,
    });
    
    // Check if file is already downloaded
    checkIfDownloaded();
  }, [contentId, navigation, content.title]);

  const checkIfDownloaded = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${content.id}.mp4`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        setIsDownloaded(true);
        setDownloadedUri(fileUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not check if file is downloaded');
    }
  };

  const downloadContent = async () => {
    if (isDownloaded) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const downloadResumable = FileSystem.createDownloadResumable(
      content.downloadUrl,
      `${FileSystem.documentDirectory}${content.id}.mp4`,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      }
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      setIsDownloaded(true);
      setDownloadedUri(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Download Error', 'Could not download the file');
    } finally {
      setIsDownloading(false);
    }
  };

  const openFile = async () => {
    if (!downloadedUri) return;
    
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadedUri);
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open the file');
    }
  };

  const renderPreview = () => {
    if (content.type === 'video' && content.previewAvailable) {
      return (
        <Video
          source={{ uri: content.downloadUrl }}
          style={styles.videoPreview}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      );
    } else if (content.type === 'pdf' || content.type === 'document') {
      return (
        <View style={styles.documentPreview}>
          <Ionicons name="document-text" size={80} color="#0066cc" />
          <Text style={styles.previewText}>Preview not available</Text>
        </View>
      );
    }
    return null;
  };

  const renderDownloadButton = () => {
    if (isDownloaded && downloadedUri) {
      return (
        <TouchableOpacity style={styles.button} onPress={() => openFile()}>
          <Ionicons name="open-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Open File</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        style={[styles.button, isDownloading ? styles.downloadingButton : null]} 
        onPress={downloadContent}
        disabled={isDownloading}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {isDownloading 
            ? `Downloading ${Math.round(downloadProgress * 100)}%` 
            : 'Download'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.previewContainer}>
        {renderPreview()}
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.author}>By {content.author}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{content.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{content.type}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="save-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{content.size}</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{content.description}</Text>
        
        <Text style={styles.sectionTitle}>Course</Text>
        <Text style={styles.courseText}>{content.course}</Text>
        
        <View style={styles.buttonContainer}>
          {renderDownloadButton()}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  previewContainer: {
    backgroundColor: '#000',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
  },
  previewText: {
    marginTop: 10,
    color: '#666',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 6,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
  },
  courseText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  downloadingButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ContentDetailsScreen;
