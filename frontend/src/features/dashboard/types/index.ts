// Dashboard feature types
export interface DashboardMetrics {
  activeClients: number;
  adherenceRate: number;
  monthlyRevenue: number;
  primeClients: number;
  longevityClients: number;
  averageSessionTime: string;
}

export interface ClientMetrics {
  id: string;
  name: string;
  program: 'PRIME' | 'LONGEVITY';
  adherence: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'paused';
}

export interface ActivityItem {
  id: string;
  type: 'workout_completed' | 'client_enrolled' | 'report_generated';
  description: string;
  timestamp: string;
  clientId?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: string;
  description?: string;
}