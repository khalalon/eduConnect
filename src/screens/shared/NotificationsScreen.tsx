import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for notifications
const NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Assignment',
    message: 'A new assignment has been posted in Introduction to Programming.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    title: 'Grade Posted',
    message: 'Your grade for Data Structures Quiz 2 has been posted.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '3',
    title: 'Course Announcement',
    message: 'Important announcement regarding the Machine Learning midterm exam.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    title: 'Discussion Reply',
    message: 'Dr. Smith replied to your comment in the Web Development forum.',
    time: '3 days ago',
    read: false,
  },
  {
    id: '5',
    title: 'Deadline Reminder',
    message: 'The assignment "Data Analysis Project" is due tomorrow at 11:59 PM.',
    time: '4 days ago',
    read: true,
  },
];

const NotificationsScreen = () => {
  const renderNotificationItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllButtonText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  markAllButtonText: {
    color: '#007bff',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  unreadItem: {
    backgroundColor: '#e6f2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default NotificationsScreen;
