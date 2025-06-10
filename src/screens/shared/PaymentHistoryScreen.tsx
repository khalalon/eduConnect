import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

// Mock data for payment history
const MOCK_PAYMENTS = [
  { id: '1', date: '2023-05-15', amount: '$99.99', course: 'Advanced Programming', status: 'Completed' },
  { id: '2', date: '2023-04-10', amount: '$79.99', course: 'Data Structures', status: 'Completed' },
  { id: '3', date: '2023-03-05', amount: '$89.99', course: 'Machine Learning', status: 'Completed' },
  { id: '4', date: '2023-02-20', amount: '$69.99', course: 'Web Development', status: 'Completed' },
];

const PaymentHistoryScreen = () => {
  const renderPaymentItem = ({ item }: { item: typeof MOCK_PAYMENTS[0] }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <Text style={styles.courseName}>{item.course}</Text>
        <Text style={styles.paymentAmount}>{item.amount}</Text>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={styles.paymentDate}>Date: {item.date}</Text>
        <Text style={styles.paymentStatus}>Status: {item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      
      {MOCK_PAYMENTS.length > 0 ? (
        <FlatList
          data={MOCK_PAYMENTS}
          renderItem={renderPaymentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payment history found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  paymentItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
  paymentStatus: {
    fontSize: 14,
    color: '#28a745',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PaymentHistoryScreen;
