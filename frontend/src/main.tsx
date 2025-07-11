import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { NgxBrandProvider, NgxLogo, AgentBadge, ProgramBadge, StatusIndicator, NGX_AGENTS } from './shared/components/NgxBrand'
import { PrimeLongevityDashboard } from './features/dashboard/components/PrimeLongevityDashboard'
import { AgentsEcosystemHub } from './features/agents/components/AgentsEcosystemHub'
import { HybridVisualization } from './features/hybrid/components/HybridVisualization'

// Main Navigation Component
const Navigation = ({ currentView, setCurrentView }: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) => {
  const navItems = [
    { id: 'welcome', label: 'Welcome', icon: '🏠' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'hybrid', label: 'Hybrid AI', icon: '⚡' },
  ];

  return (
    <nav className="bg-ngx-slate-800 border-b border-ngx-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <NgxLogo size="sm" className="text-white" />
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-ngx-electric-violet text-white'
                      : 'text-ngx-slate-300 hover:bg-ngx-slate-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <StatusIndicator status="active" size="sm" />
            <span className="text-sm text-ngx-slate-300">MCP Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Welcome Component
const WelcomeView = () => (
  <div className="min-h-screen bg-ngx-black-onyx flex items-center justify-center p-4">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {/* NGX Logo */}
      <div className="mb-8">
        <NgxLogo size="lg" className="text-white mb-4" />
        <div className="h-1 w-24 bg-gradient-to-r from-ngx-electric-violet to-ngx-deep-purple mx-auto rounded"></div>
      </div>
      
      {/* Main Title */}
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-white font-sans tracking-tight">
          NEXUS-CORE
        </h1>
        <p className="text-xl text-ngx-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enterprise Command Center for NGX Performance & Longevity Operations
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <StatusIndicator status="active" size="md" />
            <h3 className="text-lg font-semibold text-white">Backend API</h3>
          </div>
          <p className="text-ngx-slate-300 text-sm mb-2">FastAPI Server</p>
          <code className="text-ngx-electric-violet text-sm">localhost:8000</code>
        </div>
        
        <div className="bg-ngx-slate-800 border border-ngx-slate-700 rounded-lg p-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <StatusIndicator status="active" size="md" />
            <h3 className="text-lg font-semibold text-white">MCP Integration</h3>
          </div>
          <p className="text-ngx-slate-300 text-sm mb-2">Claude Desktop Ready</p>
          <code className="text-ngx-deep-purple text-sm">Model Context Protocol</code>
        </div>
      </div>

      {/* Programs */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-white mb-4">NGX Programs</h3>
        <div className="flex justify-center gap-4">
          <ProgramBadge program="PRIME" size="lg" />
          <ProgramBadge program="LONGEVITY" size="lg" />
        </div>
      </div>

      {/* NGX Agents Ecosystem */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-white mb-6">NGX Agents Ecosystem</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(NGX_AGENTS).map((agent) => (
            <div key={agent.id} className="group">
              <AgentBadge 
                agentId={agent.id as keyof typeof NGX_AGENTS} 
                size="sm" 
                className="w-full justify-center hover:scale-105 transition-transform"
              />
              <p className="text-xs text-ngx-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {agent.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-ngx-slate-700">
        <p className="text-ngx-slate-400 text-sm">
          🚀 Ready for NGX Performance & Longevity Operations
        </p>
      </div>
    </div>
  </div>
);

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('welcome');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="min-h-screen bg-ngx-black-onyx">
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PrimeLongevityDashboard />
            </div>
          </div>
        );
      case 'agents':
        return (
          <div className="min-h-screen bg-ngx-black-onyx">
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AgentsEcosystemHub />
            </div>
          </div>
        );
      case 'hybrid':
        return (
          <div className="min-h-screen bg-ngx-black-onyx">
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <HybridVisualization />
            </div>
          </div>
        );
      default:
        return <WelcomeView />;
    }
  };

  return (
    <NgxBrandProvider>
      {renderView()}
    </NgxBrandProvider>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)