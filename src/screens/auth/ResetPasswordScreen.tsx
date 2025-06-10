import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

type Props = {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
};

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);

  // In a real app, you would get this from the route params or a token in the URL
  const resetToken = route.params?.token || 'dummy-token';

  const handleResetPassword = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      alert('Please enter both password fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setResetComplete(true);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        
        {!resetComplete ? (
          <>
            <Text style={styles.description}>
              Please enter your new password below.
            </Text>
            
            <TextInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />
            
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={secureConfirmTextEntry}
              right={
                <TextInput.Icon
                  icon={secureConfirmTextEntry ? "eye-off" : "eye"}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                />
              }
            />
            
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.resetButton}
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
          </>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Your password has been successfully reset!
            </Text>
            <Text style={styles.successSubText}>
              You can now log in with your new password.
            </Text>
            
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              Go to Login
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  resetButton: {
    padding: 8,
    marginBottom: 20,
  },
  successContainer: {
    backgroundColor: '#e6f7ff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    padding: 8,
    width: '100%',
  },
});

export default ResetPasswordScreen;