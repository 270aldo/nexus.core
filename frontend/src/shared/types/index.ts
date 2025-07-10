export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trainer' | 'specialist';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  programType: 'PRIME' | 'LONGEVITY';
  status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  type: 'PRIME' | 'LONGEVITY';
  duration: number;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface Metrics {
  adherence: number;
  completedWorkouts: number;
  totalWorkouts: number;
  averageIntensity: number;
  progressScore: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppStore {
  theme: Theme;
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}