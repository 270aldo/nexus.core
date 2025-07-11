// Agent Service - Bridge between NEXUS-CORE UI and GENESIS-NGX-Agents Backend
// This service provides clean methods to interact with your real AI agents

import { mcpClient } from '../lib/mcpClient';
import { handleAgentServiceError, errorHandler } from '../lib/errorHandler';
import { 
  AgentStatus, 
  AgentRunResponse, 
  AgentListResponse,
  NGXAgentMetrics,
  NGXProgramMetrics,
  NGXActivity,
  ConnectionStatus,
  NgxAgentId,
  NGX_AGENT_IDS,
  AGENT_ID_MAPPING
} from '../types/agents';

export class AgentService {
  private static instance: AgentService;
  private connectionStatus: ConnectionStatus | null = null;
  private agentStatusCache: Map<string, AgentStatus> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  private constructor() {
    // Initialize connection check
    this.checkConnectionStatus();
  }

  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  // Connection Management
  async checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
      this.connectionStatus = await mcpClient.checkConnection();
      return this.connectionStatus;
    } catch (error) {
      const handledError = handleAgentServiceError(error, 'checkConnectionStatus');
      this.connectionStatus = {
        genesis_backend: 'error',
        mcp_server: 'error',
        last_check: new Date().toISOString(),
        error_message: handledError.message
      };
      return this.connectionStatus;
    }
  }

  getConnectionStatus(): ConnectionStatus | null {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.connectionStatus?.genesis_backend === 'connected';
  }

  // Agent Status Methods
  async getAllAgentsStatus(): Promise<Record<string, AgentStatus>> {
    const agentsStatus: Record<string, AgentStatus> = {};
    
    try {
      // Fetch status for all NGX agents in parallel
      const statusPromises = NGX_AGENT_IDS.map(async (agentId) => {
        try {
          const status = await this.getAgentStatus(agentId.toLowerCase());
          return { agentId: agentId.toLowerCase(), status };
        } catch (error) {
          console.warn(`Failed to get status for ${agentId}:`, error);
          return { 
            agentId: agentId.toLowerCase(), 
            status: this.getMockAgentStatus(agentId.toLowerCase()) 
          };
        }
      });

      const results = await Promise.allSettled(statusPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          agentsStatus[result.value.agentId] = result.value.status;
        }
      });

      return agentsStatus;
    } catch (error) {
      console.error('Failed to fetch all agents status:', error);
      
      // Return mock data for all agents if connection fails
      NGX_AGENT_IDS.forEach(agentId => {
        agentsStatus[agentId.toLowerCase()] = this.getMockAgentStatus(agentId.toLowerCase());
      });
      
      return agentsStatus;
    }
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    const cacheKey = agentId.toLowerCase();
    const now = Date.now();
    
    // Check cache first
    if (this.agentStatusCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (now < expiry) {
        return this.agentStatusCache.get(cacheKey)!;
      }
    }

    try {
      const status = await mcpClient.getAgentStatus(agentId);
      
      // Cache the result
      this.agentStatusCache.set(cacheKey, status);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);
      
      return status;
    } catch (error) {
      console.error(`Failed to get status for agent ${agentId}:`, error);
      
      // Return cached data if available, otherwise mock
      if (this.agentStatusCache.has(cacheKey)) {
        return this.agentStatusCache.get(cacheKey)!;
      }
      
      return this.getMockAgentStatus(agentId);
    }
  }

  // Agent Communication Methods
  async sendMessageToAgent(agentId: string, message: string, context?: Record<string, any>): Promise<AgentRunResponse> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to GENESIS backend');
      }

      const response = await mcpClient.chatWithAgent(agentId, message, 'nexus-user');
      
      // Log successful interaction
      console.log(`Successfully sent message to agent ${agentId}`);
      
      return response;
    } catch (error) {
      console.error(`Failed to send message to agent ${agentId}:`, error);
      throw error;
    }
  }

  async sendBatchMessagesToAgents(requests: Array<{ agentId: string; message: string }>): Promise<AgentRunResponse[]> {
    const promises = requests.map(({ agentId, message }) => 
      this.sendMessageToAgent(agentId, message).catch(error => ({
        agent_id: agentId,
        response: `Error: ${error.message}`,
        confidence: 0,
        processing_time: 0,
        status: 'error'
      }))
    );

    return Promise.all(promises);
  }

  // Metrics Methods
  async getAgentMetrics(agentId?: string): Promise<NGXAgentMetrics[]> {
    try {
      return await mcpClient.getAgentMetrics(agentId);
    } catch (error) {
      console.error('Failed to fetch agent metrics:', error);
      return this.getMockAgentMetrics(agentId);
    }
  }

  async getRecentActivity(limit: number = 10): Promise<NGXActivity[]> {
    try {
      return await mcpClient.getRecentActivity(limit);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return this.getMockRecentActivity(limit);
    }
  }

  async getProgramMetrics(): Promise<{ prime: NGXProgramMetrics; longevity: NGXProgramMetrics }> {
    try {
      return await mcpClient.getProgramMetrics();
    } catch (error) {
      console.error('Failed to fetch program metrics:', error);
      return this.getMockProgramMetrics();
    }
  }

  // Agent Discovery
  async discoverAvailableAgents(): Promise<AgentListResponse> {
    try {
      return await mcpClient.getAgentsList();
    } catch (error) {
      console.error('Failed to discover agents:', error);
      return this.getMockAgentsList();
    }
  }

  // Cache Management
  clearCache(): void {
    this.agentStatusCache.clear();
    this.cacheExpiry.clear();
  }

  invalidateAgentCache(agentId: string): void {
    const cacheKey = agentId.toLowerCase();
    this.agentStatusCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  // Mock Data Methods (Fallback when backend unavailable)
  private getMockAgentStatus(agentId: string): AgentStatus {
    const mockStatuses = ['active', 'idle', 'processing'] as const;
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return {
      id: agentId,
      name: agentId.toUpperCase(),
      status: randomStatus,
      currentTask: randomStatus === 'processing' ? `Processing mock task for ${agentId}` : undefined,
      tasksCompleted: Math.floor(Math.random() * 50),
      averageResponseTime: `${Math.floor(Math.random() * 3000)}ms`,
      specialization: [`Mock ${agentId} specialization`],
      lastActivity: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 100)
    };
  }

  private getMockAgentMetrics(agentId?: string): NGXAgentMetrics[] {
    const agents = agentId ? [agentId] : NGX_AGENT_IDS.map(id => id.toLowerCase());
    
    return agents.map(id => ({
      agent_id: id,
      requests_handled: Math.floor(Math.random() * 100),
      average_response_time: Math.floor(Math.random() * 2000),
      success_rate: 85 + Math.floor(Math.random() * 15),
      last_activity: new Date().toISOString(),
      health_score: 80 + Math.floor(Math.random() * 20)
    }));
  }

  private getMockRecentActivity(limit: number): NGXActivity[] {
    const activities: NGXActivity[] = [];
    const programs = ['PRIME', 'LONGEVITY'] as const;
    const agents = NGX_AGENT_IDS;
    
    for (let i = 0; i < limit; i++) {
      activities.push({
        id: `mock-${i}`,
        type: programs[Math.floor(Math.random() * programs.length)],
        message: `Mock activity ${i} completed`,
        time: `${i * 5}m ago`,
        agent: agents[Math.floor(Math.random() * agents.length)].toLowerCase(),
        status: 'completed'
      });
    }
    
    return activities;
  }

  private getMockAgentsList(): AgentListResponse {
    return {
      agents: NGX_AGENT_IDS.map(id => ({
        agent_id: id.toLowerCase(),
        name: id,
        description: `Mock ${id} agent for development`,
        version: '1.0.0-mock',
        capabilities: [`Mock ${id} capabilities`],
        status: 'idle'
      })),
      total: NGX_AGENT_IDS.length,
      status: 'mock'
    };
  }

  private getMockProgramMetrics(): { prime: NGXProgramMetrics; longevity: NGXProgramMetrics } {
    return {
      prime: {
        program_type: 'PRIME',
        active_clients: 89,
        adherence_rate: 92,
        monthly_revenue: 15600,
        avg_session_time: '52min',
        completion_rate: 87
      },
      longevity: {
        program_type: 'LONGEVITY',
        active_clients: 67,
        adherence_rate: 85,
        monthly_revenue: 8900,
        avg_session_time: '38min',
        completion_rate: 91
      }
    };
  }

  // Real-time Updates Support
  setupRealtimeUpdates(onUpdate: (data: any) => void): (() => void) | null {
    try {
      const ws = mcpClient.createWebSocketConnection();
      
      if (!ws) {
        console.warn('WebSocket not supported or disabled');
        return null;
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different types of updates
          switch (data.type) {
            case 'agent_status':
              this.invalidateAgentCache(data.agent_id);
              break;
            case 'metrics_update':
            case 'activity_update':
              // Clear relevant caches
              this.clearCache();
              break;
          }
          
          onUpdate(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      // Return cleanup function
      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to setup realtime updates:', error);
      return null;
    }
  }
}

// Export singleton instance
export const agentService = AgentService.getInstance();
export default agentService;