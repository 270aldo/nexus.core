// Dashboard feature barrel export with lazy loading
import { lazy } from 'react';
import React from 'react';

// Lazy load dashboard components
export const DashboardPage = lazy(() => 
  import('./pages/DashboardPage').then(module => ({
    default: module.DashboardPage
  }))
);

// Placeholder components until they are implemented
export const ExecutiveDashboard = () => React.createElement('div', { className: 'p-4 border rounded' }, 'Executive Dashboard Coming Soon');

export const MetricsCard = () => React.createElement('div', { className: 'p-4 border rounded' }, 'Metrics Card');

// Dashboard store (eager loaded for state management)
export { useDashboardStore } from './store/dashboardStore';

// Dashboard types
export type { DashboardMetrics, ClientMetrics } from './types';

// Default export for router
export default DashboardPage;