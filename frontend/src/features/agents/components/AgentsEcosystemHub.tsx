import React, { useState, useEffect } from 'react';
import { AgentBadge, NGX_AGENTS } from '../../../shared/components/NgxBrand';
import { SystemHealthMonitor } from '../../../shared/components/SystemHealthMonitor';
import { agentService } from '../../../services/agentService';
import { AgentStatus, ConnectionStatus } from '../../../types/agents';

// Real Agent Status Hook
const useRealAgentStatuses = () => {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeAgents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check connection to GENESIS backend
        const connStatus = await agentService.checkConnectionStatus();
        setConnectionStatus(connStatus);

        // Fetch all agent statuses
        const statuses = await agentService.getAllAgentsStatus();
        setAgentStatuses(statuses);

        // Setup real-time updates if connected
        if (connStatus.genesis_backend === 'connected') {
          cleanup = agentService.setupRealtimeUpdates((data) => {
            if (data.type === 'agent_status') {
              setAgentStatuses(prev => ({
                ...prev,
                [data.agent_id]: data.data
              }));
            }
          });
        }
      } catch (err) {
        console.error('Failed to initialize agents:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to agents');
      } finally {
        setLoading(false);
      }
    };

    initializeAgents();

    // Periodic status updates every 30 seconds
    const interval = setInterval(async () => {
      try {
        const statuses = await agentService.getAllAgentsStatus();
        setAgentStatuses(statuses);
      } catch (err) {
        console.warn('Failed to update agent statuses:', err);
      }
    }, 30000);

    return () => {
      if (cleanup) cleanup();
      clearInterval(interval);
    };
  }, []);

  return { agentStatuses, connectionStatus, loading, error };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-ngx-success';
    case 'processing': return 'text-ngx-warning';
    case 'idle': return 'text-ngx-slate-400';
    default: return 'text-ngx-slate-400';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'active': return 'bg-ngx-success/20 border-ngx-success/30';
    case 'processing': return 'bg-ngx-warning/20 border-ngx-warning/30';
    case 'idle': return 'bg-ngx-slate-500/20 border-ngx-slate-500/30';
    default: return 'bg-ngx-slate-500/20 border-ngx-slate-500/30';
  }
};

export const AgentsEcosystemHub: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [communicating, setCommunicating] = useState<string | null>(null);
  
  // Use real agent data from GENESIS backend
  const { agentStatuses, connectionStatus, loading, error } = useRealAgentStatuses();

  const activeAgents = Object.values(agentStatuses).filter(agent => agent.status === 'active').length;
  const processingAgents = Object.values(agentStatuses).filter(agent => agent.status === 'processing').length;
  const errorAgents = Object.values(agentStatuses).filter(agent => agent.status === 'error').length;

  // Handler for sending message to agent
  const handleSendToAgent = async (agentId: string, message: string) => {
    setCommunicating(agentId);
    try {
      const response = await agentService.sendMessageToAgent(agentId, message);
      console.log(`Response from ${agentId}:`, response);
      // You could show a toast notification here
    } catch (error) {
      console.error(`Failed to communicate with ${agentId}:`, error);
      // You could show an error toast here
    } finally {
      setCommunicating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Monitor */}
      <SystemHealthMonitor className="mb-4" />

      {/* Connection Status Banner */}
      {connectionStatus && connectionStatus.genesis_backend !== 'connected' && (
        <div className="bg-ngx-warning/20 border border-ngx-warning/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-ngx-warning rounded-full animate-pulse"></div>
            <div>
              <div className="text-ngx-warning font-medium">GENESIS Backend Status: {connectionStatus.genesis_backend}</div>
              <div className="text-sm text-ngx-slate-300">
                {connectionStatus.error_message || 'Using fallback data. Check backend connection.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-8 text-center">
          <div className="w-8 h-8 bg-ngx-electric-violet rounded-full animate-pulse mx-auto mb-4"></div>
          <div className="text-white">Connecting to GENESIS-NGX-Agents...</div>
          <div className="text-ngx-slate-400 text-sm">Loading real agent data</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-ngx-error/20 border border-ngx-error/30 rounded-lg p-4">
          <div className="text-ngx-error font-medium">Failed to connect to agents</div>
          <div className="text-sm text-ngx-slate-300">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-ngx-error text-white rounded text-sm hover:bg-ngx-error/80"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            NGX Agents Ecosystem
            {connectionStatus?.genesis_backend === 'connected' && (
              <span className="w-3 h-3 bg-ngx-success rounded-full"></span>
            )}
          </h1>
          <p className="text-ngx-slate-300">
            9 Specialized AI Agents • {activeAgents} Active • {processingAgents} Processing
            {errorAgents > 0 && ` • ${errorAgents} Error`}
          </p>
          <p className="text-xs text-ngx-slate-500">
            {connectionStatus?.genesis_backend === 'connected' 
              ? '🔗 Connected to GENESIS-NGX-Agents' 
              : '📱 Using fallback data'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-ngx-electric-violet text-white' 
                : 'bg-ngx-slate-700 text-ngx-slate-300 hover:bg-ngx-slate-600'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list' 
                ? 'bg-ngx-electric-violet text-white' 
                : 'bg-ngx-slate-700 text-ngx-slate-300 hover:bg-ngx-slate-600'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">9</div>
          <div className="text-sm text-ngx-slate-400">Total Agents</div>
        </div>
        <div className="bg-ngx-success/10 border border-ngx-success/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-success mb-1">{activeAgents}</div>
          <div className="text-sm text-ngx-slate-400">Active Now</div>
        </div>
        <div className="bg-ngx-warning/10 border border-ngx-warning/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-warning mb-1">{processingAgents}</div>
          <div className="text-sm text-ngx-slate-400">Processing</div>
        </div>
        <div className="bg-ngx-electric-violet/10 border border-ngx-electric-violet/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-electric-violet mb-1">
            {Object.values(agentStatuses).reduce((sum, agent) => sum + agent.tasksCompleted, 0)}
          </div>
          <div className="text-sm text-ngx-slate-400">Tasks Today</div>
        </div>
      </div>

      {/* Agents Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(NGX_AGENTS).map(([agentKey, agent]) => {
            const status = agentStatuses[agent.id];
            return (
              <div
                key={agent.id}
                className={`bg-ngx-slate-800 border rounded-lg p-6 cursor-pointer transition-all hover:scale-105 ${
                  selectedAgent === agent.id 
                    ? 'border-ngx-electric-violet shadow-lg' 
                    : `border-ngx-slate-700 hover:border-ngx-slate-600`
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-4">
                  <AgentBadge agentId={agentKey as keyof typeof NGX_AGENTS} size="md" />
                  <div className={`w-3 h-3 rounded-full ${
                    status.status === 'active' ? 'bg-ngx-success' :
                    status.status === 'processing' ? 'bg-ngx-warning animate-pulse' :
                    'bg-ngx-slate-400'
                  }`} />
                </div>

                {/* Agent Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-white font-josefin text-lg">{agent.name}</h3>
                    <p className="text-sm text-ngx-slate-400">{agent.role}</p>
                  </div>

                  <p className="text-sm text-ngx-slate-300">{agent.description}</p>

                  {/* Current Task */}
                  {status.currentTask && (
                    <div className={`p-3 rounded-lg border ${getStatusBg(status.status)}`}>
                      <div className="text-xs text-ngx-slate-400 mb-1">Current Task</div>
                      <div className="text-sm text-white">{status.currentTask}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <div className="text-lg font-bold text-white">{status.tasksCompleted}</div>
                      <div className="text-xs text-ngx-slate-400">Tasks Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{status.averageResponseTime}</div>
                      <div className="text-xs text-ngx-slate-400">Avg Response</div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1">
                    {status.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 bg-ngx-slate-700 text-ngx-slate-300 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-ngx-slate-700">
            <h3 className="text-lg font-semibold text-white">Agent Status Overview</h3>
          </div>
          
          <div className="divide-y divide-ngx-slate-700">
            {Object.entries(NGX_AGENTS).map(([agentKey, agent]) => {
              const status = agentStatuses[agent.id];
              return (
                <div key={agent.id} className="p-4 hover:bg-ngx-slate-900/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <AgentBadge agentId={agentKey as keyof typeof NGX_AGENTS} size="sm" />
                      <div>
                        <div className="font-medium text-white">{agent.name}</div>
                        <div className="text-sm text-ngx-slate-400">{agent.role}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{status.tasksCompleted}</div>
                        <div className="text-xs text-ngx-slate-400">Tasks</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{status.averageResponseTime}</div>
                        <div className="text-xs text-ngx-slate-400">Response</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          status.status === 'active' ? 'bg-ngx-success' :
                          status.status === 'processing' ? 'bg-ngx-warning animate-pulse' :
                          'bg-ngx-slate-400'
                        }`} />
                        <span className={`text-sm capitalize ${getStatusColor(status.status)}`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {status.currentTask && (
                    <div className="mt-3 text-sm text-ngx-slate-300">
                      <span className="text-ngx-slate-500">Current: </span>
                      {status.currentTask}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Communication Hub - Real MCP Integration */}
      <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Agent Communication Hub</h3>
        <div className="bg-ngx-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus?.genesis_backend === 'connected' 
                ? 'bg-ngx-success' 
                : 'bg-ngx-warning animate-pulse'
            }`}></div>
            <span className="text-sm text-ngx-slate-300">
              {connectionStatus?.genesis_backend === 'connected' 
                ? 'GENESIS Backend Connected • Real MCP Channel' 
                : 'Fallback Mode • Check Backend Connection'
              }
            </span>
          </div>
          <textarea
            placeholder={
              connectionStatus?.genesis_backend === 'connected'
                ? "Send command to real NGX agents via GENESIS..."
                : "Backend disconnected. Commands will use mock responses..."
            }
            className="w-full bg-ngx-slate-800 border border-ngx-slate-600 rounded-lg p-3 text-white placeholder-ngx-slate-400 resize-none"
            rows={3}
            value={communicating ? 'Communicating with agents...' : ''}
            disabled={!!communicating}
            onChange={(e) => {
              // Handle message input
            }}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-ngx-slate-500">
              {connectionStatus?.genesis_backend === 'connected' 
                ? '🔗 Commands routed through real NEXUS orchestrator in GENESIS'
                : '📱 Mock responses - Connect to GENESIS for real agent communication'
              }
            </div>
            <button 
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                connectionStatus?.genesis_backend === 'connected'
                  ? 'bg-ngx-electric-violet text-white hover:bg-ngx-electric-violet/80'
                  : 'bg-ngx-slate-600 text-ngx-slate-400 cursor-not-allowed'
              }`}
              disabled={communicating || connectionStatus?.genesis_backend !== 'connected'}
              onClick={() => {
                // Example: Send test message to NEXUS orchestrator
                handleSendToAgent('nexus', 'Status check from NEXUS-CORE interface');
              }}
            >
              {communicating ? 'Sending...' : 'Send to NEXUS'}
            </button>
          </div>
          
          {/* Connection Details */}
          <div className="mt-4 pt-3 border-t border-ngx-slate-700">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-ngx-slate-400">Backend Status:</span>
                <span className={`ml-2 font-medium ${
                  connectionStatus?.genesis_backend === 'connected' ? 'text-ngx-success' : 'text-ngx-warning'
                }`}>
                  {connectionStatus?.genesis_backend || 'checking...'}
                </span>
              </div>
              <div>
                <span className="text-ngx-slate-400">Last Check:</span>
                <span className="ml-2 text-ngx-slate-300">
                  {connectionStatus?.last_check ? new Date(connectionStatus.last_check).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
              {connectionStatus?.latency && (
                <div>
                  <span className="text-ngx-slate-400">Latency:</span>
                  <span className="ml-2 text-ngx-slate-300">{connectionStatus.latency.toFixed(0)}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};