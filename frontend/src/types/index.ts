// Core Types for NEXUS-CORE

// Common utility types
export type ID = string | number;
export type Timestamp = string; // ISO string
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue; }
export interface JSONArray extends Array<JSONValue> {}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Client types
export interface Client {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  program_type: 'PRIME' | 'LONGEVITY';
  status: 'active' | 'inactive' | 'paused';
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Program types
export interface Program {
  id: ID;
  name: string;
  type: 'training' | 'nutrition';
  client_id: ID;
  created_at: Timestamp;
}

// Progress types
export interface ProgressEntry {
  id: ID;
  client_id: ID;
  date: Timestamp;
  weight?: number;
  measurements?: Record<string, number>;
  notes?: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

// Analytics types
export interface AnalyticsData {
  metric: string;
  value: number;
  change?: number;
  period: string;
}
