import React, { useState, useEffect } from 'react';
import { errorHandler } from '../../lib/errorHandler';

interface SystemHealthProps {
  showDetails?: boolean;
  className?: string;
}

export const SystemHealthMonitor: React.FC<SystemHealthProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [health, setHealth] = useState(errorHandler.getSystemHealth());
  const [stats, setStats] = useState(errorHandler.getErrorStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateHealth = () => {
      setHealth(errorHandler.getSystemHealth());
      setStats(errorHandler.getErrorStats());
    };

    // Update immediately
    updateHealth();

    // Set up interval for regular updates
    const interval = setInterval(updateHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-ngx-success';
      case 'degraded': return 'text-ngx-warning';
      case 'critical': return 'text-ngx-error';
      default: return 'text-ngx-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-ngx-success/10 border-ngx-success/30';
      case 'degraded': return 'bg-ngx-warning/10 border-ngx-warning/30';
      case 'critical': return 'bg-ngx-error/10 border-ngx-error/30';
      default: return 'bg-ngx-slate-500/10 border-ngx-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  return (
    <div className={`${className}`}>
      {/* Compact Status Indicator */}
      <div 
        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${getStatusBg(health.status)}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg">{getStatusIcon(health.status)}</span>
        <div className="flex-1">
          <div className={`font-medium ${getStatusColor(health.status)}`}>
            System Health: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </div>
          {health.issues.length > 0 && (
            <div className="text-xs text-ngx-slate-400">
              {health.issues.length} issue{health.issues.length > 1 ? 's' : ''} detected
            </div>
          )}
        </div>
        <div className="text-xs text-ngx-slate-500">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded Details */}
      {(isExpanded || showDetails) && (
        <div className="mt-4 space-y-4">
          {/* Health Issues */}
          {health.issues.length > 0 && (
            <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Current Issues</h4>
              <ul className="space-y-1">
                {health.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-ngx-slate-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-ngx-warning rounded-full"></span>
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-ngx-slate-400">
                <strong>Recommendation:</strong> {health.recommendation}
              </div>
            </div>
          )}

          {/* Error Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-3">
              <div className="text-lg font-bold text-white">{stats.total}</div>
              <div className="text-xs text-ngx-slate-400">Total Errors</div>
            </div>
            <div className="bg-ngx-error/10 border border-ngx-error/20 rounded-lg p-3">
              <div className="text-lg font-bold text-ngx-error">{stats.by_severity.critical}</div>
              <div className="text-xs text-ngx-slate-400">Critical</div>
            </div>
            <div className="bg-ngx-warning/10 border border-ngx-warning/20 rounded-lg p-3">
              <div className="text-lg font-bold text-ngx-warning">{stats.by_severity.high}</div>
              <div className="text-xs text-ngx-slate-400">High</div>
            </div>
            <div className="bg-ngx-slate-700/20 border border-ngx-slate-600/30 rounded-lg p-3">
              <div className="text-lg font-bold text-ngx-slate-300">{stats.by_severity.medium + stats.by_severity.low}</div>
              <div className="text-xs text-ngx-slate-400">Med/Low</div>
            </div>
          </div>

          {/* Recent Critical Errors */}
          {stats.recent_critical.length > 0 && (
            <div className="bg-ngx-error/5 border border-ngx-error/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-ngx-error mb-2">Recent Critical Errors</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.recent_critical.map((error, index) => (
                  <div key={index} className="text-xs">
                    <div className="text-ngx-error font-medium">{error.code}</div>
                    <div className="text-ngx-slate-300">{error.message}</div>
                    <div className="text-ngx-slate-500">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => errorHandler.clearErrorLog()}
              className="px-3 py-1 text-xs bg-ngx-slate-700 text-white rounded hover:bg-ngx-slate-600 transition-colors"
            >
              Clear Error Log
            </button>
            <button
              onClick={() => {
                const stats = errorHandler.getErrorStats();
                console.log('NGX System Health Report:', {
                  health: errorHandler.getSystemHealth(),
                  stats,
                  recent_errors: errorHandler.getRecentErrors(10)
                });
              }}
              className="px-3 py-1 text-xs bg-ngx-electric-violet text-white rounded hover:bg-ngx-electric-violet/80 transition-colors"
            >
              Export to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthMonitor;