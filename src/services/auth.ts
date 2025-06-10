import api, { ApiResponse } from './api';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterData extends LoginCredentials {
  name: string;
  specialization?: string; // For professors
}

interface AuthResponse {
  user: User;
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.data.success) {
      await SecureStore.setItemAsync('authToken', response.data.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    
    throw new Error(response.data.message);
  } catch (error) {
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<User> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    if (response.data.success) {
      await SecureStore.setItemAsync('authToken', response.data.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    
    throw new Error(response.data.message);
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync('authToken');
  await SecureStore.deleteItemAsync('user');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await SecureStore.getItemAsync('user');
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  } catch (error) {
    return null;
  }
};