import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PaymentStatus, Content } from '../../types';
import api, { ApiResponse } from '../../services/api';

interface DashboardData {
  totalProfessors: number;
  pendingPayments: number;
  recentContent: Content[];
  upcomingPayments: {
    id: string;
    professorName: string;
    amount: number;
    dueDate: string;
  }[];
}

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProfessors: 0,
    pendingPayments: 0,
    recentContent: [],
    upcomingPayments: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<DashboardData>>('/student/dashboard');
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'video':
        return '🎬';
      default:
        return '📁';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <Avatar.Text size={40} label={user?.name?.substring(0, 2) || 'U'} />
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search content or professors"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{dashboardData.totalProfessors}</Title>
            <Paragraph style={styles.statLabel}>Professors</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{dashboardData.pendingPayments}</Title>
            <Paragraph style={styles.statLabel}>Pending Payments</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Content</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Content')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dashboardData.recentContent.map((content) => (
            <TouchableOpacity 
              key={content.id}
              onPress={() => navigation.navigate('ContentDetails', { contentId: content.id })}
            >
              <Card style={styles.contentCard}>
                <View style={styles.contentTypeIcon}>
                  <Text style={styles.contentTypeIconText}>
                    {getContentTypeIcon(content.type)}
                  </Text>
                </View>
                <Card.Content>
                  <Title style={styles.contentTitle} numberOfLines={1}>
                    {content.title}
                  </Title>
                  <Paragraph style={styles.contentDescription} numberOfLines={2}>
                    {content.description}
                  </Paragraph>
                  <View style={styles.contentMeta}>
                    <Chip size={20} style={styles.contentTypeChip}>
                      {content.type}
                    </Chip>
                    <Text style={styles.contentDate}>
                      {new Date(content.uploadDate).toLocaleDateString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentHistory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.upcomingPayments.map((payment) => (
          <Card key={payment.id} style={styles.paymentCard}>
            <Card.Content style={styles.paymentCardContent}>
              <View style={styles.paymentInfo}>
                <Avatar.Text size={40} label={payment.professorName.substring(0, 2)} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{payment.professorName}</Text>
                  <Text style={styles.paymentDate}>Due: {payment.dueDate}</Text>
                </View>
              </View>
              <View style={styles.paymentAmount}>
                <Text style={styles.amountText}>${payment.amount}</Text>
                <Button 
                  mode="contained" 
                  compact 
                  style={styles.payButton}
                  onPress={() => {/* Handle payment */}}
                >
                  Pay Now
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Professors')}
          >
            <Text style={styles.actionButtonText}>Find Professors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Handle subscription */}}
          >
            <Text style={styles.actionButtonText}>Enter Pairing Code</Text>
            <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Handle subscription */}}
          >
            <Text style={styles.actionButtonText}>Enter Pairing Code</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    padding: 15,
    marginTop: -10,
  },
  searchbar: {
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  statsCard: {
    width: '48%',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 15,
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
    color: '#2196F3',
  },
  contentCard: {
    width: 200,
    marginRight: 15,
    elevation: 2,
  },
  contentTypeIcon: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    alignItems: 'center',
  },
  contentTypeIconText: {
    fontSize: 24,
  },
  contentTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  contentDescription: {
    fontSize: 12,
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
  paymentCard: {
    marginBottom: 10,
    elevation: 2,
  },
  paymentCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    marginLeft: 10,
  },
  paymentName: {
    fontWeight: 'bold',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  payButton: {
    height: 30,
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;