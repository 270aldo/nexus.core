// Types for NGX Agents Integration with GENESIS-NGX-Agents Backend

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'processing' | 'error' | 'offline';
  currentTask?: string;
  tasksCompleted: number;
  averageResponseTime: string;
  specialization: string[];
  lastActivity?: string;
  confidence?: number;
}

export interface AgentRunRequest {
  message: string;
  user_id: string;
  context?: Record<string, any>;
  stream?: boolean;
}

export interface AgentRunResponse {
  agent_id: string;
  response: string;
  confidence: number;
  processing_time: number;
  status: string;
  suggestions?: string[];
  context?: Record<string, any>;
}

export interface AgentInfo {
  agent_id: string;
  name: string;
  description: string;
  version: string;
  capabilities: string[];
  status: AgentStatus['status'];
  configuration?: Record<string, any>;
}

export interface AgentListResponse {
  agents: AgentInfo[];
  total: number;
  status: string;
}

// Hybrid Intelligence Types
export interface HybridProcessingStep {
  agent: string;
  action: string;
  output: string;
  timestamp: number;
  confidence: number;
  processing_time: number;
}

export interface HybridIntelligenceFlow {
  flow_id: string;
  client_input: string;
  processing_steps: HybridProcessingStep[];
  final_recommendation: string;
  confidence_score: number;
  total_processing_time: number;
  agents_involved: string[];
  status: 'processing' | 'completed' | 'error';
}

// MCP Protocol Types
export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
  id?: string;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string;
}

// NGX Specific Types
export interface NGXAgentMetrics {
  agent_id: string;
  requests_handled: number;
  average_response_time: number;
  success_rate: number;
  last_activity: string;
  health_score: number;
}

export interface NGXProgramMetrics {
  program_type: 'PRIME' | 'LONGEVITY';
  active_clients: number;
  adherence_rate: number;
  monthly_revenue: number;
  avg_session_time: string;
  completion_rate: number;
}

export interface NGXActivity {
  id: string;
  type: 'PRIME' | 'LONGEVITY';
  message: string;
  time: string;
  agent: string;
  client_id?: string;
  status: 'completed' | 'pending' | 'error';
}

// API Response Types
export interface GenesisAPIResponse<T = any> {
  data: T;
  status: string;
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface GenesisErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: 'error';
  timestamp: string;
  request_id?: string;
}

// Connection Status
export interface ConnectionStatus {
  genesis_backend: 'connected' | 'disconnected' | 'error';
  mcp_server: 'connected' | 'disconnected' | 'error';
  last_check: string;
  latency?: number;
  error_message?: string;
}

// Real-time Update Types
export interface RealtimeUpdate {
  type: 'agent_status' | 'hybrid_flow' | 'metrics' | 'activity';
  data: any;
  timestamp: string;
  agent_id?: string;
}

// Agent Chat Types (for MCP communication)
export interface AgentChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agent_id?: string;
  metadata?: Record<string, any>;
}

export interface AgentChatSession {
  session_id: string;
  agent_id: string;
  messages: AgentChatMessage[];
  status: 'active' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

// Configuration Types
export interface McpClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  enableMocking: boolean;
  enableRealTime: boolean;
  clientId: string;
}

export const NGX_AGENT_IDS = [
  'NEXUS',
  'BLAZE', 
  'SAGE',
  'WAVE',
  'SPARK',
  'STELLA',
  'NOVA',
  'CODE',
  'LUNA'
] as const;

export type NgxAgentId = typeof NGX_AGENT_IDS[number];

// Agent Mapping (Visual ID to Backend ID)
export const AGENT_ID_MAPPING: Record<string, string> = {
  'nexus': 'orchestrator',
  'blaze': 'elite_training_strategist', 
  'sage': 'precision_nutrition_architect',
  'wave': 'wave_performance_analytics',
  'spark': 'motivation_behavior_coach',
  'stella': 'progress_tracker',
  'nova': 'nova_biohacking_innovator',
  'code': 'code_genetic_specialist',
  'luna': 'female_wellness_coach'
};

export const BACKEND_TO_VISUAL_ID: Record<string, string> = Object.fromEntries(
  Object.entries(AGENT_ID_MAPPING).map(([visual, backend]) => [backend, visual])
);