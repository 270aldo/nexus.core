// Client management related types

export interface HealthCondition {
  condition: string;
  diagnosis_date?: string;
  notes?: string;
  medications?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Assessment {
  date: string;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  notes?: string;
  metrics?: Record<string, any>;
}

export interface Client {
  id: string;
  type: 'PRIME' | 'LONGEVITY';
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  join_date: string;
  status: 'active' | 'paused' | 'inactive';
  goals?: string[];
  health_conditions?: HealthCondition[];
  emergency_contact?: EmergencyContact;
  initial_assessment?: Assessment;
  payment_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientCreateRequest {
  type: 'PRIME' | 'LONGEVITY';
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  status?: 'active' | 'paused' | 'inactive';
  goals?: string[];
  health_conditions?: HealthCondition[];
  emergency_contact?: EmergencyContact;
  initial_assessment?: Assessment;
  payment_status?: string;
}

export interface ClientUpdateRequest {
  type?: 'PRIME' | 'LONGEVITY';
  name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  status?: 'active' | 'paused' | 'inactive';
  goals?: string[];
  health_conditions?: HealthCondition[];
  emergency_contact?: EmergencyContact;
  initial_assessment?: Assessment;
  payment_status?: string;
}

export interface ClientSearchResponse {
  clients: Client[];
  total: number;
}
