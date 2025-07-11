import React, { useState, useEffect } from 'react';
import { AgentBadge, ProgramBadge, StatusIndicator, NGX_AGENTS } from '../../../shared/components/NgxBrand';
import { agentService } from '../../../services/agentService';
import { NGXProgramMetrics, NGXActivity, ConnectionStatus } from '../../../types/agents';

// Real Dashboard Data Hook
const useRealDashboardData = () => {
  const [programMetrics, setProgramMetrics] = useState<{ prime: NGXProgramMetrics; longevity: NGXProgramMetrics } | null>(null);
  const [recentActivity, setRecentActivity] = useState<NGXActivity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check connection status
        const connStatus = await agentService.checkConnectionStatus();
        setConnectionStatus(connStatus);

        // Fetch program metrics and recent activity in parallel
        const [metrics, activities] = await Promise.allSettled([
          agentService.getProgramMetrics(),
          agentService.getRecentActivity(10)
        ]);

        if (metrics.status === 'fulfilled') {
          setProgramMetrics(metrics.value);
        } else {
          console.warn('Failed to fetch program metrics:', metrics.reason);
          setProgramMetrics(getMockProgramData());
        }

        if (activities.status === 'fulfilled') {
          setRecentActivity(activities.value);
        } else {
          console.warn('Failed to fetch recent activity:', activities.reason);
          setRecentActivity(getMockActivities());
        }

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        
        // Set mock data as fallback
        setProgramMetrics(getMockProgramData());
        setRecentActivity(getMockActivities());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);

    return () => clearInterval(interval);
  }, []);

  return { programMetrics, recentActivity, connectionStatus, loading, error };
};

// Mock data fallback functions
const getMockProgramData = () => ({
  prime: {
    program_type: 'PRIME' as const,
    active_clients: 89,
    adherence_rate: 92,
    monthly_revenue: 15600,
    avg_session_time: '52min',
    completion_rate: 87
  },
  longevity: {
    program_type: 'LONGEVITY' as const,
    active_clients: 67,
    adherence_rate: 85,
    monthly_revenue: 8900,
    avg_session_time: '38min',
    completion_rate: 91
  }
});

const getMockActivities = (): NGXActivity[] => [
  { id: '1', type: 'PRIME', message: 'Sarah completed HIIT session', time: '5m ago', agent: 'blaze', status: 'completed' },
  { id: '2', type: 'LONGEVITY', message: 'Marcus finished mobility routine', time: '12m ago', agent: 'wave', status: 'completed' },
  { id: '3', type: 'PRIME', message: 'New optimization generated', time: '18m ago', agent: 'nova', status: 'completed' },
  { id: '4', type: 'LONGEVITY', message: 'Recovery plan updated', time: '25m ago', agent: 'luna', status: 'completed' },
  { id: '5', type: 'PRIME', message: 'Performance metrics analyzed', time: '31m ago', agent: 'code', status: 'completed' }
];

export const PrimeLongevityDashboard: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<'PRIME' | 'LONGEVITY' | 'BOTH'>('BOTH');
  
  // Use real data from GENESIS backend
  const { programMetrics, recentActivity, connectionStatus, loading, error } = useRealDashboardData();

  // Filter activities based on selected program
  const filteredActivities = selectedProgram === 'BOTH' 
    ? recentActivity
    : recentActivity.filter(activity => activity.type === selectedProgram);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-8 text-center">
          <div className="w-8 h-8 bg-ngx-electric-violet rounded-full animate-pulse mx-auto mb-4"></div>
          <div className="text-white">Loading Dashboard Data...</div>
          <div className="text-ngx-slate-400 text-sm">Connecting to GENESIS backend</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {connectionStatus && connectionStatus.genesis_backend !== 'connected' && (
        <div className="bg-ngx-warning/20 border border-ngx-warning/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-ngx-warning rounded-full animate-pulse"></div>
            <div>
              <div className="text-ngx-warning font-medium">Dashboard using fallback data</div>
              <div className="text-sm text-ngx-slate-300">
                Connect to GENESIS backend for real-time metrics • Status: {connectionStatus.genesis_backend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-ngx-error/20 border border-ngx-error/30 rounded-lg p-4">
          <div className="text-ngx-error font-medium">Dashboard Error</div>
          <div className="text-sm text-ngx-slate-300">{error}</div>
        </div>
      )}

      {/* Program Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            NGX Operations Dashboard
          </h1>
          <p className="text-ngx-slate-300">
            Performance & Longevity Program Analytics
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedProgram('BOTH')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              selectedProgram === 'BOTH' 
                ? 'bg-ngx-electric-violet text-white' 
                : 'bg-ngx-slate-700 text-ngx-slate-300 hover:bg-ngx-slate-600'
            }`}
          >
            All Programs
          </button>
          <button
            onClick={() => setSelectedProgram('PRIME')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              selectedProgram === 'PRIME' 
                ? 'bg-ngx-prime-500 text-white' 
                : 'bg-ngx-slate-700 text-ngx-slate-300 hover:bg-ngx-slate-600'
            }`}
          >
            PRIME Only
          </button>
          <button
            onClick={() => setSelectedProgram('LONGEVITY')}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              selectedProgram === 'LONGEVITY' 
                ? 'bg-ngx-longevity-500 text-white' 
                : 'bg-ngx-slate-700 text-ngx-slate-300 hover:bg-ngx-slate-600'
            }`}
          >
            LONGEVITY Only
          </button>
        </div>
      </div>

      {/* Program Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PRIME Program */}
        {(selectedProgram === 'BOTH' || selectedProgram === 'PRIME') && (
          <div className="bg-ngx-slate-800 border border-ngx-prime-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ProgramBadge program="PRIME" size="md" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Performance Optimization</h3>
                  <p className="text-sm text-ngx-slate-400">High-intensity training & optimization</p>
                </div>
              </div>
              <StatusIndicator status="active" size="md" showLabel />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ngx-prime-500/10 border border-ngx-prime-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-prime-400 mb-1">
                  {programMetrics?.prime.active_clients || 0}
                </div>
                <div className="text-sm text-ngx-slate-300">Active Clients</div>
              </div>
              
              <div className="bg-ngx-prime-500/10 border border-ngx-prime-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-prime-400 mb-1">
                  {programMetrics?.prime.adherence_rate || 0}%
                </div>
                <div className="text-sm text-ngx-slate-300">Adherence Rate</div>
              </div>
              
              <div className="bg-ngx-prime-500/10 border border-ngx-prime-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-prime-400 mb-1">
                  ${((programMetrics?.prime.monthly_revenue || 0) / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-ngx-slate-300">Monthly Revenue</div>
              </div>
              
              <div className="bg-ngx-prime-500/10 border border-ngx-prime-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-prime-400 mb-1">
                  {programMetrics?.prime.avg_session_time || '0min'}
                </div>
                <div className="text-sm text-ngx-slate-300">Avg Session</div>
              </div>
            </div>
          </div>
        )}

        {/* LONGEVITY Program */}
        {(selectedProgram === 'BOTH' || selectedProgram === 'LONGEVITY') && (
          <div className="bg-ngx-slate-800 border border-ngx-longevity-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ProgramBadge program="LONGEVITY" size="md" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Wellness & Recovery</h3>
                  <p className="text-sm text-ngx-slate-400">Sustainable health & longevity focus</p>
                </div>
              </div>
              <StatusIndicator status="active" size="md" showLabel />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ngx-longevity-500/10 border border-ngx-longevity-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-longevity-400 mb-1">
                  {programMetrics?.longevity.active_clients || 0}
                </div>
                <div className="text-sm text-ngx-slate-300">Active Clients</div>
              </div>
              
              <div className="bg-ngx-longevity-500/10 border border-ngx-longevity-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-longevity-400 mb-1">
                  {programMetrics?.longevity.adherence_rate || 0}%
                </div>
                <div className="text-sm text-ngx-slate-300">Adherence Rate</div>
              </div>
              
              <div className="bg-ngx-longevity-500/10 border border-ngx-longevity-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-longevity-400 mb-1">
                  ${((programMetrics?.longevity.monthly_revenue || 0) / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-ngx-slate-300">Monthly Revenue</div>
              </div>
              
              <div className="bg-ngx-longevity-500/10 border border-ngx-longevity-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-ngx-longevity-400 mb-1">
                  {programMetrics?.longevity.avg_session_time || '0min'}
                </div>
                <div className="text-sm text-ngx-slate-300">Avg Session</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Combined Performance Chart */}
      {selectedProgram === 'BOTH' && (
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Program Performance Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {(programMetrics?.prime.active_clients || 0) + (programMetrics?.longevity.active_clients || 0)}
              </div>
              <div className="text-sm text-ngx-slate-400">Total Active Clients</div>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs text-ngx-prime-400">PRIME: {programMetrics?.prime.active_clients || 0}</span>
                <span className="text-xs text-ngx-slate-500">•</span>
                <span className="text-xs text-ngx-longevity-400">LONGEVITY: {programMetrics?.longevity.active_clients || 0}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                ${(((programMetrics?.prime.monthly_revenue || 0) + (programMetrics?.longevity.monthly_revenue || 0)) / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-ngx-slate-400">Total Monthly Revenue</div>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs text-ngx-prime-400">{(((programMetrics?.prime.monthly_revenue || 0) / ((programMetrics?.prime.monthly_revenue || 0) + (programMetrics?.longevity.monthly_revenue || 0) || 1)) * 100).toFixed(0)}%</span>
                <span className="text-xs text-ngx-slate-500">•</span>
                <span className="text-xs text-ngx-longevity-400">{(((programMetrics?.longevity.monthly_revenue || 0) / ((programMetrics?.prime.monthly_revenue || 0) + (programMetrics?.longevity.monthly_revenue || 0) || 1)) * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(((programMetrics?.prime.adherence_rate || 0) + (programMetrics?.longevity.adherence_rate || 0)) / 2)}%
              </div>
              <div className="text-sm text-ngx-slate-400">Average Adherence</div>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs text-ngx-prime-400">PRIME: {programMetrics?.prime.adherence_rate || 0}%</span>
                <span className="text-xs text-ngx-slate-500">•</span>
                <span className="text-xs text-ngx-longevity-400">LONGEVITY: {programMetrics?.longevity.adherence_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <div className="text-sm text-ngx-slate-400">
            {selectedProgram === 'BOTH' ? 'All Programs' : selectedProgram}
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredActivities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-ngx-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <ProgramBadge program={activity.type as 'PRIME' | 'LONGEVITY'} size="sm" />
                <AgentBadge agentId={activity.agent.toLowerCase() as keyof typeof NGX_AGENTS} size="sm" />
                <span className="text-sm text-ngx-slate-300">{activity.message}</span>
              </div>
              <span className="text-xs text-ngx-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-sm text-ngx-electric-violet hover:text-ngx-electric-violet/80 transition-colors">
          View All Activity →
        </button>
      </div>
    </div>
  );
};