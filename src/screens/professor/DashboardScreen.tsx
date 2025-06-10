import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PaymentStatus } from '../../types';
import api, { ApiResponse } from '../../services/api';

interface DashboardStats {
  totalStudents: number;
  totalContent: number;
  pendingPayments: number;
  averageRating: number;
}

interface RecentPayment {
  id: string;
  studentName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
}

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalContent: 0,
    pendingPayments: 0,
    averageRating: 0,
  });
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<{
          stats: DashboardStats;
          recentPayments: RecentPayment[];
        }>>('/professor/dashboard');
        
        if (response.data.success) {
          setStats(response.data.data.stats);
          setRecentPayments(response.data.data.recentPayments);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
        </View>
        <View style={styles.pairingCodeContainer}>
          <Text style={styles.pairingCodeLabel}>Your Pairing Code</Text>
          <Text style={styles.pairingCode}>{user?.role === 'professor' ? (user as any).pairingCode : 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{stats.totalStudents}</Title>
            <Paragraph style={styles.statLabel}>Students</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{stats.totalContent}</Title>
            <Paragraph style={styles.statLabel}>Content</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{stats.pendingPayments}</Title>
            <Paragraph style={styles.statLabel}>Pending</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statValue}>{stats.averageRating.toFixed(1)}</Title>
            <Paragraph style={styles.statLabel}>Rating</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentHistory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentPayments.map((payment) => (
          <Card key={payment.id} style={styles.paymentCard}>
            <Card.Content style={styles.paymentCardContent}>
              <View style={styles.paymentInfo}>
                <Avatar.Text size={40} label={payment.studentName.substring(0, 2)} />
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentName}>{payment.studentName}</Text>
                  <Text style={styles.paymentDate}>{payment.date}</Text>
                </View>
              </View>
              <View style={styles.paymentAmount}>
                <Text style={styles.amountText}>${payment.amount}</Text>
                <Chip 
                  style={[
                    styles.statusChip, 
                    payment.status === PaymentStatus.PAID 
                      ? styles.paidChip 
                      : payment.status === PaymentStatus.PENDING 
                        ? styles.pendingChip 
                        : styles.unpaidChip
                  ]}
                >
                  {payment.status}
                </Chip>
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
            onPress={() => navigation.navigate('UploadContent')}
          >
            <Text style={styles.actionButtonText}>Upload Content</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Students')}
          >
            <Text style={styles.actionButtonText}>Manage Students</Text>
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
  pairingCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 8,
  },
  pairingCodeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pairingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: -20,
  },
  statsCard: {
    width: '48%',
    marginBottom: 10,
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
    padding: 20,
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
  paymentCard: {
    marginBottom: 10,
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
  },
  statusChip: {
    marginTop: 5,
    height: 24,
  },
  paidChip: {
    backgroundColor: '#4CAF50',
  },
  pendingChip: {
    backgroundColor: '#FFC107',
  },
  unpaidChip: {
    backgroundColor: '#F44336',
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