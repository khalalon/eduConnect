import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, ProgressBar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface DashboardStats {
  totalStudents: number;
  totalContent: number;
  totalRevenue: number;
  totalViews: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'content_view' | 'message' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  relatedType?: string;
}

interface PopularContent {
  id: string;
  title: string;
  type: string;
  views: number;
  rating: number;
}

const ProfessorDashboardScreen = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/professor/dashboard/stats');
      setStats(statsResponse.data);
      
      // Fetch recent activities
      const activitiesResponse = await api.get('/professor/dashboard/activities');
      setActivities(activitiesResponse.data);
      
      // Fetch popular content
      const contentResponse = await api.get('/professor/dashboard/popular-content');
      setPopularContent(contentResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'person-add-outline';
      case 'content_view':
        return 'eye-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'payment':
        return 'cash-outline';
      default:
        return 'alert-circle-outline';
    }
  };
  
  const handleActivityPress = (activity: RecentActivity) => {
    if (activity.relatedId && activity.relatedType) {
      switch (activity.relatedType) {
        case 'student':
          navigation.navigate('StudentDetails', { studentId: activity.relatedId });
          break;
        case 'content':
          navigation.navigate('ContentDetails', { contentId: activity.relatedId });
          break;
        case 'chat':
          navigation.navigate('Chat', { id: activity.relatedId, name: activity.title });
          break;
        case 'payment':
          navigation.navigate('PaymentHistory');
          break;
      }
    }
  };
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return 'document-text-outline';
      case 'video':
        return 'videocam-outline';
      case 'audio':
        return 'musical-notes-outline';
      case 'image':
        return 'image-outline';
      default:
        return 'document-outline';
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Title style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Professor'}</Title>
            <Paragraph style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Paragraph>
          </View>
          
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            {user?.profileImage ? (
              <Avatar.Image source={{ uri: user.profileImage }} size={50} />
            ) : (
              <Avatar.Icon size={50} icon="account" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Ionicons name="people-outline" size={24} color="#0066cc" style={styles.statIcon} />
              <Title style={styles.statValue}>{stats?.totalStudents || 0}</Title>
              <Paragraph style={styles.statLabel}>Students</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Ionicons name="document-outline" size={24} color="#4CAF50" style={styles.statIcon} />
              <Title style={styles.statValue}>{stats?.totalContent || 0}</Title>
              <Paragraph style={styles.statLabel}>Content</Paragraph>
            </Card.Content>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Ionicons name="cash-outline" size={24} color="#FFC107" style={styles.statIcon} />
              <Title style={styles.statValue}>${stats?.totalRevenue || 0}</Title>
              <Paragraph style={styles.statLabel}>Revenue</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content>
              <Ionicons name="eye-outline" size={24} color="#9C27B0" style={styles.statIcon} />
              <Title style={styles.statValue}>{stats?.totalViews || 0}</Title>
              <Paragraph style={styles.statLabel}>Views</Paragraph>
            </Card.Content>
          </Card>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('UploadContent')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cloud-upload-outline" size={24} color="#0066cc" />
            </View>
            <Text style={styles.actionText}>Upload Content</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('StudentList')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>View Students</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Analytics')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="bar-chart-outline" size={24} color="#FFC107" />
            </View>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="wallet-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {activities.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="notifications-off-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No recent activities</Text>
            </Card.Content>
          </Card>
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <TouchableOpacity 
              key={activity.id} 
              onPress={() => handleActivityPress(activity)}
            >
              <Card style={styles.activityCard}>
                <Card.Content style={styles.activityContent}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name={getActivityIcon(activity.type)} size={24} color="#0066cc" />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
              {index < activities.length - 1 && <Divider />}
            </TouchableOpacity>
          ))
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Popular Content</Title>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {popularContent.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="document-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No content available</Text>
            </Card.Content>
          </Card>
        ) : (
          popularContent.slice(0, 3).map((content) => (
            <TouchableOpacity 
              key={content.id}
              onPress={() => navigation.navigate('ContentDetails', { contentId: content.id })}
            >
              <Card style={styles.contentCard}>
                <Card.Content>
                  <View style={styles.contentHeader}>
                    <View style={styles.contentTypeIcon}>
                      <Ionicons name={getContentTypeIcon(content.type)} size={24} color="#0066cc" />
                    </View>
                    <View style={styles.contentInfo}>
                      <Title style={styles.contentTitle}>{content.title}</Title>
                      <View style={styles.contentStats}>
                        <View style={styles.contentStat}>
                          <Ionicons name="eye-outline" size={16} color="#666" />
                          <Text style={styles.contentStatText}>{content.views}</Text>
                        </View>
                        <View style={styles.contentStat}>
                          <Ionicons name="star-outline" size={16} color="#666" />
                          <Text style={styles.contentStatText}>{content.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  statsContainer: {
    marginTop: -20,
    paddingHorizontal: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 10,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#0066cc',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyCard: {
    marginVertical: 10,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  activityCard: {
    marginVertical: 5,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  contentCard: {
    marginVertical: 8,
    borderRadius: 10,
    elevation: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
  },
  contentStats: {
    flexDirection: 'row',
    marginTop: 5,
  },
  contentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  contentStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
});

export default ProfessorDashboardScreen;
