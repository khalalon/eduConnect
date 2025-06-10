import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ProfessorTabParamList } from './types';

// Screens
import ProfessorDashboardScreen from '../screens/professor/ProfessorDashboardScreen';
import ContentLibraryScreen from '../screens/professor/ContentLibraryScreen';
import StudentListScreen from '../screens/professor/StudentListScreen';
import ProfileScreen from '../screens/professor/ProfessorProfileScreen';

const Tab = createBottomTabNavigator<ProfessorTabParamList>();

const ProfessorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Content') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Students') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
      backBehavior="initialRoute"
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ProfessorDashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Content" 
        component={ContentLibraryScreen} 
        options={{ title: 'Content Library' }}
      />
      <Tab.Screen 
        name="Students" 
        component={StudentListScreen} 
        options={{ title: 'Students' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default ProfessorTabNavigator;
