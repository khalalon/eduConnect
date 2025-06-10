import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

import { NavigatorScreenParams } from '@react-navigation/native';

// Main stack navigator params
export type RootStackParamList = {
  Auth: undefined;
  StudentTabs: undefined;
  ProfessorTabs: undefined;
  ProfessorDetails: { professorId: string };
  StudentDetails: { studentId: string };
  ContentDetails: { contentId: string };
  Content: undefined;
  UploadContent: undefined;
  EditContent: { contentId: string };
  Chat: { userId: string; name: string };
  PaymentHistory: undefined;
  Settings: undefined;
  StudentList: undefined;
  BulkMessage: { studentIds: string[] };
};

// Student bottom tab navigator params
export type StudentTabParamList = {
  Dashboard: undefined;
  Explore: undefined;
  Library: undefined;
  Profile: undefined;
};

// Professor bottom tab navigator params
export type ProfessorTabParamList = {
  Dashboard: undefined;
  Content: undefined;
  Students: undefined;
  Profile: undefined;
};

// Auth stack navigator params
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

// Declare global type augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
