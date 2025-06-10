// Core entity types
export enum UserRole {
  STUDENT = 'student',
  PROFESSOR = 'professor',
  ADMIN = 'admin'
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PENDING = 'pending'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  createdAt: Date;
}

export interface Student extends User {
  role: UserRole.STUDENT;
  enrolledProfessors: string[]; // Array of professor IDs
}

export interface Professor extends User {
  role: UserRole.PROFESSOR;
  pairingCode: string;
  specialization: string;
  averageRating: number;
}

export interface Subscription {
  id: string;
  studentId: string;
  professorId: string;
  startDate: Date;
  status: 'active' | 'inactive';
  payments: Payment[];
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: Date;
  paidDate?: Date;
}

export interface Content {
  id: string;
  professorId: string;
  title: string;
  description: string;
  type: 'document' | 'video';
  url: string;
  fileSize: number;
  uploadDate: Date;
  category: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Review {
  id: string;
  studentId: string;
  professorId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}