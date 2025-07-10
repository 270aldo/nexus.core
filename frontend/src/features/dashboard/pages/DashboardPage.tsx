import React, { Suspense, useEffect } from 'react';
import { usePerformanceMonitoring } from '../../../shared/utils/performanceOptimizer';

// Lazy load heavy dashboard components
const ExecutiveDashboard = React.lazy(() => 
  import('../components/ExecutiveDashboard').then(module => ({
    default: module.ExecutiveDashboard || DefaultExecutiveDashboard
  }))
);

const MetricsOverview = React.lazy(() => 
  import('../components/MetricsOverview').then(module => ({
    default: module.MetricsOverview || DefaultMetricsOverview
  }))
);

const RecentActivity = React.lazy(() => 
  import('../components/RecentActivity').then(module => ({
    default: module.RecentActivity || DefaultRecentActivity
  }))
);

// Fallback components
const DefaultExecutiveDashboard = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Executive Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium text-blue-900">Active Clients</h3>
        <p className="text-2xl font-bold text-blue-600">156</p>
      </div>
      <div className="bg-green-50 p-4 rounded">
        <h3 className="font-medium text-green-900">Adherence Rate</h3>
        <p className="text-2xl font-bold text-green-600">87%</p>
      </div>
      <div className="bg-purple-50 p-4 rounded">
        <h3 className="font-medium text-purple-900">Monthly Revenue</h3>
        <p className="text-2xl font-bold text-purple-600">$24.5K</p>
      </div>
    </div>
  </div>
);

const DefaultMetricsOverview = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Metrics Overview</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span>PRIME Clients</span>
        <span className="font-semibold">89</span>
      </div>
      <div className="flex justify-between items-center">
        <span>LONGEVITY Clients</span>
        <span className="font-semibold">67</span>
      </div>
      <div className="flex justify-between items-center">
        <span>Average Session Time</span>
        <span className="font-semibold">45min</span>
      </div>
    </div>
  </div>
);

const DefaultRecentActivity = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-sm">Client Sarah completed workout</span>
        <span className="text-xs text-gray-500 ml-auto">2m ago</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <span className="text-sm">New PRIME client enrolled</span>
        <span className="text-xs text-gray-500 ml-auto">15m ago</span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
        <span className="text-sm">Progress report generated</span>
        <span className="text-xs text-gray-500 ml-auto">1h ago</span>
      </div>
    </div>
  </div>
);

// Loading component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 h-24 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { measureComponentRender, trackFeatureUsage } = usePerformanceMonitoring();
  
  useEffect(() => {
    const endMeasure = measureComponentRender('DashboardPage');
    trackFeatureUsage('dashboard');
    
    return endMeasure;
  }, [measureComponentRender, trackFeatureUsage]);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            NGX Operations Dashboard
          </h1>
          <p className="text-gray-600">
            Central command for NEXUS-CORE operations
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Executive Overview */}
      <Suspense fallback={<DashboardSkeleton />}>
        <ExecutiveDashboard />
      </Suspense>
      
      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={
          <div className="bg-gray-200 h-64 rounded animate-pulse"></div>
        }>
          <MetricsOverview />
        </Suspense>
        
        <Suspense fallback={
          <div className="bg-gray-200 h-64 rounded animate-pulse"></div>
        }>
          <RecentActivity />
        </Suspense>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded hover:bg-gray-50">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">View Clients</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded hover:bg-gray-50">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">Analytics</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded hover:bg-gray-50">
            <div className="text-2xl mb-2">🏋️</div>
            <div className="text-sm font-medium">Programs</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded hover:bg-gray-50">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-sm font-medium">MCP Chat</div>
          </button>
        </div>
      </div>
    </div>
  );
};