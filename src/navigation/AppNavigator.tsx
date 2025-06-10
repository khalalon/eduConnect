import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AuthContext } from '../contexts/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import StudentTabNavigator from './StudentTabNavigator';
import ProfessorTabNavigator from './ProfessorTabNavigator';

// Screens
import ContentDetailsScreen from '../screens/professor/ContentDetailsScreen';
import UploadContentScreen from '../screens/professor/UploadContentScreen';
import EditContentScreen from '../screens/professor/EditContentScreen';
import StudentDetailsScreen from '../screens/professor/StudentDetailsScreen';
import ProfessorDetailsScreen from '../screens/student/ProfessorDetailsScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import PaymentHistoryScreen from '../screens/shared/PaymentHistoryScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import BulkMessageScreen from '../screens/professor/BulkMessageScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { state } = useContext(AuthContext);
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
        },
      }}
    >
      {!state.isAuthenticated ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
          options={{ headerShown: false }}
        />
      ) : state.userType === 'student' ? (
        <>
          <Stack.Screen 
            name="StudentTabs" 
            component={StudentTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ProfessorDetails" 
            component={ProfessorDetailsScreen} 
            options={{ title: 'Professor Profile' }}
          />
          <Stack.Screen 
            name="ContentDetails" 
            component={ContentDetailsScreen} 
            options={{ title: 'Content Details' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="ProfessorTabs" 
            component={ProfessorTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="StudentDetails" 
            component={StudentDetailsScreen} 
            options={{ title: 'Student Profile' }}
          />
          <Stack.Screen 
            name="ContentDetails" 
            component={ContentDetailsScreen} 
            options={{ title: 'Content Details' }}
          />
          <Stack.Screen 
            name="UploadContent" 
            component={UploadContentScreen} 
            options={{ title: 'Upload Content' }}
          />
          <Stack.Screen 
            name="EditContent" 
            component={EditContentScreen} 
            options={{ title: 'Edit Content' }}
          />
          <Stack.Screen 
            name="BulkMessage" 
            component={BulkMessageScreen} 
            options={{ title: 'Message Students' }}
          />
        </>
      )}
      
      {/* Common screens for both user types */}
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen 
        name="PaymentHistory" 
        component={PaymentHistoryScreen} 
        options={{ title: 'Payment History' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
