import React, { useState, useEffect } from 'react';
import { AgentBadge, ProgramBadge, StatusIndicator, NGX_AGENTS } from '../../../shared/components/NgxBrand';
import { agentService } from '../../../services/agentService';
import { HybridIntelligenceFlow, ConnectionStatus, HybridProcessingStep } from '../../../types/agents';

// Real Hybrid Intelligence Hook
const useRealHybridIntelligence = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    const status = await agentService.checkConnectionStatus();
    setConnectionStatus(status);
    return status;
  };

  const processHybridQuery = async (query: string): Promise<HybridIntelligenceFlow> => {
    try {
      setLoading(true);
      setError(null);

      const status = await checkConnection();
      
      if (status.genesis_backend === 'connected') {
        // Use real GENESIS backend
        const response = await agentService.sendMessageToAgent('nexus', query);
        
        // Transform response to HybridIntelligenceFlow format
        return {
          flow_id: `hybrid-${Date.now()}`,
          client_input: query,
          processing_steps: [
            {
              agent: 'nexus',
              action: 'Processing Query',
              output: response.response,
              timestamp: Date.now(),
              confidence: response.confidence,
              processing_time: response.processing_time
            }
          ],
          final_recommendation: response.response,
          confidence_score: response.confidence,
          total_processing_time: response.processing_time,
          agents_involved: ['nexus'],
          status: 'completed'
        };
      } else {
        // Use mock data when backend unavailable
        return getMockHybridFlow(query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process hybrid query');
      return getMockHybridFlow(query);
    } finally {
      setLoading(false);
    }
  };

  return { connectionStatus, loading, error, processHybridQuery, checkConnection };
};

// Mock data when backend unavailable
const getMockHybridFlow = (query: string): HybridIntelligenceFlow => ({
  flow_id: `mock-${Date.now()}`,
  client_input: query,
  processing_steps: [
    {
      agent: 'nexus',
      action: 'Initial Analysis & Coordination',
      output: 'Identified query requirements. Routing to specialist agents.',
      timestamp: Date.now(),
      confidence: 95,
      processing_time: 500
    },
    {
      agent: 'sage',
      action: 'Evidence-Based Research',
      output: 'Latest studies analyzed for evidence-based recommendations.',
      timestamp: Date.now() + 500,
      confidence: 92,
      processing_time: 800
    },
    {
      agent: 'blaze',
      action: 'Performance Optimization',
      output: 'Optimized training protocols generated.',
      timestamp: Date.now() + 1000,
      confidence: 88,
      processing_time: 600
    }
  ],
  final_recommendation: `Based on your query: "${query}", our hybrid intelligence system recommends a comprehensive approach combining evidence-based methods with personalized optimization.`,
  confidence_score: 95,
  total_processing_time: 1900,
  agents_involved: ['nexus', 'sage', 'blaze'],
  status: 'completed'
});

// Legacy mock data structure for compatibility
interface LegacyHybridFlowData {
  clientInput: string;
  processingSteps: {
    agent: keyof typeof NGX_AGENTS;
    action: string;
    output: string;
    timestamp: number;
  }[];
  finalRecommendation: string;
  confidenceScore: number;
}

const getMockLegacyFlow = (): LegacyHybridFlowData => ({
  clientInput: "I need a workout plan for improved athletic performance and injury prevention",
  processingSteps: [
    {
      agent: 'NEXUS',
      action: 'Initial Analysis & Coordination',
      output: 'Identified: Performance optimization + injury prevention. Routing to specialist agents.',
      timestamp: 0
    },
    {
      agent: 'SAGE',
      action: 'Evidence-Based Research',
      output: 'Latest studies show strength training + mobility work reduces injury risk by 40%.',
      timestamp: 500
    },
    {
      agent: 'BLAZE',
      action: 'Performance Optimization',
      output: 'Recommend 3x/week strength training with progressive overload + plyometrics.',
      timestamp: 1000
    },
    {
      agent: 'WAVE',
      action: 'Movement Quality Analysis',
      output: 'Include daily mobility routine focusing on hip, ankle, and thoracic spine mobility.',
      timestamp: 1500
    },
    {
      agent: 'STELLA',
      action: 'Technical Precision',
      output: 'Ensure proper form with compound movements: squat, deadlift, overhead press.',
      timestamp: 2000
    },
    {
      agent: 'LUNA',
      action: 'Recovery Integration',
      output: 'Schedule 2 active recovery days with light movement and stress management.',
      timestamp: 2500
    },
    {
      agent: 'CODE',
      action: 'Data Integration',
      output: 'Compiled program parameters: 5 days/week, 60% strength, 30% mobility, 10% recovery.',
      timestamp: 3000
    },
    {
      agent: 'NEXUS',
      action: 'Final Synthesis',
      output: 'Integrated all agent inputs into comprehensive performance + injury prevention program.',
      timestamp: 3500
    }
  ],
  finalRecommendation: "5-day hybrid program: 3 strength sessions (BLAZE protocol) + daily mobility (WAVE routine) + 2 active recovery days (LUNA approach). Evidence-based approach with 95% confidence for performance gains and injury prevention.",
  confidenceScore: 95
});

// Helper function to transform HybridIntelligenceFlow to LegacyHybridFlowData
const transformToLegacyFormat = (flow: HybridIntelligenceFlow): LegacyHybridFlowData => {
  return {
    clientInput: flow.client_input,
    processingSteps: flow.processing_steps.map(step => ({
      agent: step.agent.toUpperCase() as keyof typeof NGX_AGENTS,
      action: step.action,
      output: step.output,
      timestamp: step.timestamp - flow.processing_steps[0].timestamp // Relative timestamp
    })),
    finalRecommendation: flow.final_recommendation,
    confidenceScore: flow.confidence_score
  };
};

export const HybridVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flowData, setFlowData] = useState<LegacyHybridFlowData>(getMockLegacyFlow());
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use real hybrid intelligence hook
  const { connectionStatus, loading, error, processHybridQuery, checkConnection } = useRealHybridIntelligence();

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && activeStep < flowData.processingSteps.length) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= flowData.processingSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeStep, flowData.processingSteps.length]);

  // Initialize connection check
  useEffect(() => {
    checkConnection();
  }, []);

  // Handler for generating new hybrid intelligence flow
  const handleGenerateFlow = async (query: string) => {
    if (!query.trim()) return;
    
    setIsGenerating(true);
    setActiveStep(0);
    setIsPlaying(false);
    
    try {
      const hybridFlow = await processHybridQuery(query);
      const legacyFlow = transformToLegacyFormat(hybridFlow);
      setFlowData(legacyFlow);
      setCurrentQuery(query);
      
      // Auto-start animation after generating
      setTimeout(() => {
        setIsPlaying(true);
      }, 500);
    } catch (err) {
      console.error('Failed to generate hybrid flow:', err);
      // Fallback to mock data
      setFlowData(getMockLegacyFlow());
    } finally {
      setIsGenerating(false);
    }
  };

  const resetFlow = () => {
    setActiveStep(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (activeStep >= flowData.processingSteps.length - 1) {
      resetFlow();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {connectionStatus && connectionStatus.genesis_backend !== 'connected' && (
        <div className="bg-ngx-warning/20 border border-ngx-warning/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-ngx-warning rounded-full animate-pulse"></div>
            <div>
              <div className="text-ngx-warning font-medium">Hybrid Intelligence using fallback mode</div>
              <div className="text-sm text-ngx-slate-300">
                Connect to GENESIS backend for real hybrid intelligence • Status: {connectionStatus.genesis_backend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-ngx-error/20 border border-ngx-error/30 rounded-lg p-4">
          <div className="text-ngx-error font-medium">Hybrid Intelligence Error</div>
          <div className="text-sm text-ngx-slate-300">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {(loading || isGenerating) && (
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-ngx-electric-violet rounded-full animate-pulse"></div>
            <div className="text-white">
              {isGenerating ? 'Generating Hybrid Intelligence Flow...' : 'Connecting to GENESIS...'}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            NGX Hybrid Intelligence Visualization
            {connectionStatus?.genesis_backend === 'connected' && (
              <span className="w-3 h-3 bg-ngx-success rounded-full"></span>
            )}
          </h1>
          <p className="text-ngx-slate-300">
            See how 9 specialized agents collaborate to create optimal solutions
          </p>
          <p className="text-xs text-ngx-slate-500">
            {connectionStatus?.genesis_backend === 'connected' 
              ? '🔗 Connected to GENESIS-NGX-Agents' 
              : '📱 Using fallback visualization'
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={togglePlayback}
            className="px-4 py-2 bg-ngx-electric-violet text-white rounded-lg hover:bg-ngx-electric-violet/80 transition-colors disabled:opacity-50"
            disabled={isGenerating}
          >
            {isPlaying ? '⏸️' : activeStep >= flowData.processingSteps.length - 1 ? '🔄' : '▶️'} 
            {isPlaying ? 'Pause' : activeStep >= flowData.processingSteps.length - 1 ? 'Restart' : 'Play'}
          </button>
          <button
            onClick={resetFlow}
            className="px-4 py-2 bg-ngx-slate-700 text-white rounded-lg hover:bg-ngx-slate-600 transition-colors disabled:opacity-50"
            disabled={isGenerating}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Query Input Interface */}
      <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Generate Hybrid Intelligence Flow
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter your query for hybrid intelligence analysis..."
              className="flex-1 bg-ngx-slate-900 border border-ngx-slate-600 rounded-lg px-4 py-3 text-white placeholder-ngx-slate-400"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateFlow(currentQuery)}
              disabled={isGenerating}
            />
            <button
              onClick={() => handleGenerateFlow(currentQuery)}
              disabled={!currentQuery.trim() || isGenerating}
              className="px-6 py-3 bg-ngx-electric-violet text-white rounded-lg hover:bg-ngx-electric-violet/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Processing...' : 'Generate'}
            </button>
          </div>
          
          {/* Current Input Display */}
          <div className="bg-ngx-slate-900 border border-ngx-slate-600 rounded-lg p-4">
            <div className="text-xs text-ngx-slate-400 mb-2">Current Query:</div>
            <p className="text-ngx-slate-300 italic">
              "{flowData.clientInput}"
            </p>
          </div>
        </div>
      </div>

      {/* Processing Flow */}
      <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Hybrid Intelligence Processing Flow</h3>
          <div className="flex items-center gap-2">
            <StatusIndicator status={isPlaying ? "processing" : "active"} size="sm" />
            <span className="text-sm text-ngx-slate-400">
              Step {activeStep + 1} of {flowData.processingSteps.length}
            </span>
          </div>
        </div>

        {/* Flow Steps */}
        <div className="space-y-4">
          {flowData.processingSteps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isPending = index > activeStep;

            return (
              <div
                key={index}
                className={`relative p-4 rounded-lg border transition-all duration-500 ${
                  isActive 
                    ? 'bg-ngx-electric-violet/10 border-ngx-electric-violet shadow-lg scale-105' 
                    : isCompleted 
                    ? 'bg-ngx-success/10 border-ngx-success/30' 
                    : 'bg-ngx-slate-900 border-ngx-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Agent Badge */}
                  <div className={`transition-opacity ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                    <AgentBadge agentId={step.agent.toLowerCase() as keyof typeof NGX_AGENTS} size="sm" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`font-medium ${isPending ? 'text-ngx-slate-500' : 'text-white'}`}>
                        {step.action}
                      </h4>
                      {isCompleted && <span className="text-ngx-success text-sm">✓</span>}
                      {isActive && <span className="text-ngx-electric-violet text-sm animate-pulse">⚡</span>}
                    </div>
                    <p className={`text-sm ${isPending ? 'text-ngx-slate-600' : 'text-ngx-slate-300'}`}>
                      {step.output}
                    </p>
                    {!isPending && (
                      <div className="mt-2 text-xs text-ngx-slate-500">
                        Processing time: {step.timestamp}ms
                      </div>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < flowData.processingSteps.length - 1 && (
                    <div className={`absolute left-8 top-16 w-0.5 h-8 transition-colors ${
                      isCompleted ? 'bg-ngx-success' : isActive ? 'bg-ngx-electric-violet' : 'bg-ngx-slate-600'
                    }`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Recommendation */}
      {activeStep >= flowData.processingSteps.length - 1 && (
        <div className="bg-gradient-to-r from-ngx-electric-violet/20 to-ngx-deep-purple/20 border border-ngx-electric-violet/30 rounded-lg p-6 animate-in">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-white">Final Hybrid Recommendation</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              flowData.confidenceScore >= 90 
                ? 'bg-ngx-success/20 text-ngx-success border border-ngx-success/30'
                : flowData.confidenceScore >= 70
                ? 'bg-ngx-warning/20 text-ngx-warning border border-ngx-warning/30'
                : 'bg-ngx-error/20 text-ngx-error border border-ngx-error/30'
            }`}>
              {flowData.confidenceScore}% Confidence
            </div>
          </div>
          
          <div className="bg-ngx-slate-900 border border-ngx-slate-600 rounded-lg p-4">
            <p className="text-ngx-slate-200 leading-relaxed">
              {flowData.finalRecommendation}
            </p>
          </div>

          {/* Agent Contributions Summary */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white mb-3">Agent Contributions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from(new Set(flowData.processingSteps.map(step => step.agent))).map((agent) => (
                <div key={agent} className="flex items-center gap-2 p-2 bg-ngx-slate-900/50 rounded">
                  <AgentBadge agentId={agent.toLowerCase() as keyof typeof NGX_AGENTS} size="sm" />
                  <span className="text-xs text-ngx-slate-400">
                    {flowData.processingSteps.filter(step => step.agent === agent).length} input{flowData.processingSteps.filter(step => step.agent === agent).length > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hybrid Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-electric-violet mb-1">9</div>
          <div className="text-sm text-ngx-slate-400">Specialized Agents</div>
        </div>
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-deep-purple mb-1">
            {Math.max(...flowData.processingSteps.map(s => s.timestamp)) / 1000}s
          </div>
          <div className="text-sm text-ngx-slate-400">Total Processing Time</div>
        </div>
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">{flowData.confidenceScore}%</div>
          <div className="text-sm text-ngx-slate-400">Solution Confidence</div>
        </div>
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-ngx-success mb-1">
            {Array.from(new Set(flowData.processingSteps.map(s => s.agent))).length}
          </div>
          <div className="text-sm text-ngx-slate-400">Agents Involved</div>
        </div>
      </div>
    </div>
  );
};