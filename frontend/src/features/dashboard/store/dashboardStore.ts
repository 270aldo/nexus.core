import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashboardMetrics, ClientMetrics, ActivityItem } from '../types';

interface DashboardState {
  // Data
  metrics: DashboardMetrics | null;
  recentClients: ClientMetrics[];
  recentActivity: ActivityItem[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  setMetrics: (metrics: DashboardMetrics) => void;
  setRecentClients: (clients: ClientMetrics[]) => void;
  setRecentActivity: (activity: ActivityItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      metrics: null,
      recentClients: [],
      recentActivity: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      
      // Actions
      setMetrics: (metrics) => set({ 
        metrics, 
        lastUpdated: new Date().toISOString() 
      }),
      
      setRecentClients: (recentClients) => set({ recentClients }),
      
      setRecentActivity: (recentActivity) => set({ recentActivity }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      refreshDashboard: async () => {
        const { setLoading, setError, setMetrics, setRecentClients, setRecentActivity } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          // Mock data for now - replace with actual API calls
          const mockMetrics: DashboardMetrics = {
            activeClients: 156,
            adherenceRate: 87,
            monthlyRevenue: 24500,
            primeClients: 89,
            longevityClients: 67,
            averageSessionTime: '45min'
          };
          
          const mockRecentClients: ClientMetrics[] = [
            {
              id: '1',
              name: 'Sarah Johnson',
              program: 'PRIME',
              adherence: 92,
              lastActivity: '2 hours ago',
              status: 'active'
            },
            {
              id: '2', 
              name: 'Mike Rodriguez',
              program: 'LONGEVITY',
              adherence: 78,
              lastActivity: '1 day ago',
              status: 'active'
            }
          ];
          
          const mockActivity: ActivityItem[] = [
            {
              id: '1',
              type: 'workout_completed',
              description: 'Client Sarah completed workout',
              timestamp: '2 minutes ago',
              clientId: '1'
            },
            {
              id: '2',
              type: 'client_enrolled',
              description: 'New PRIME client enrolled',
              timestamp: '15 minutes ago'
            },
            {
              id: '3',
              type: 'report_generated',
              description: 'Progress report generated',
              timestamp: '1 hour ago'
            }
          ];
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setMetrics(mockMetrics);
          setRecentClients(mockRecentClients);
          setRecentActivity(mockActivity);
          
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to refresh dashboard');
        } finally {
          setLoading(false);
        }
      }
    }),
    {
      name: 'nexus-dashboard-store',
      partialize: (state) => ({
        metrics: state.metrics,
        lastUpdated: state.lastUpdated
      })
    }
  )
);