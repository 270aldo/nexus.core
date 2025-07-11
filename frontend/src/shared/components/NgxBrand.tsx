import React from 'react';

/**
 * NGX Brand Component System
 * Provides consistent brand elements and agent representations
 */

// NGX Agent Data
export const NGX_AGENTS = {
  NEXUS: {
    id: 'nexus',
    name: 'NEXUS',
    role: 'Central Orchestrator',
    color: 'text-ngx-agents-nexus',
    bgColor: 'bg-ngx-agents-nexus',
    description: 'Coordinates all NGX systems and agents',
    personality: 'Strategic, comprehensive, integrative'
  },
  BLAZE: {
    id: 'blaze',
    name: 'BLAZE',
    role: 'Intensity Specialist',
    color: 'text-ngx-agents-blaze',
    bgColor: 'bg-ngx-agents-blaze',
    description: 'High-intensity training and performance optimization',
    personality: 'Fiery, driven, performance-focused'
  },
  SAGE: {
    id: 'sage',
    name: 'SAGE',
    role: 'Wisdom & Knowledge',
    color: 'text-ngx-agents-sage',
    bgColor: 'bg-ngx-agents-sage',
    description: 'Research, wisdom, and evidence-based insights',
    personality: 'Wise, analytical, research-oriented'
  },
  WAVE: {
    id: 'wave',
    name: 'WAVE',
    role: 'Flow & Movement',
    color: 'text-ngx-agents-wave',
    bgColor: 'bg-ngx-agents-wave',
    description: 'Movement quality, flow states, and biomechanics',
    personality: 'Fluid, adaptive, movement-focused'
  },
  SPARK: {
    id: 'spark',
    name: 'SPARK',
    role: 'Energy & Motivation',
    color: 'text-ngx-agents-spark',
    bgColor: 'bg-ngx-agents-spark',
    description: 'Energy optimization and motivational coaching',
    personality: 'Energetic, inspiring, motivation-driven'
  },
  STELLA: {
    id: 'stella',
    name: 'STELLA',
    role: 'Precision & Form',
    color: 'text-ngx-agents-stella',
    bgColor: 'bg-ngx-agents-stella',
    description: 'Technical precision and form optimization',
    personality: 'Precise, detail-oriented, perfection-focused'
  },
  NOVA: {
    id: 'nova',
    name: 'NOVA',
    role: 'Innovation & Growth',
    color: 'text-ngx-agents-nova',
    bgColor: 'bg-ngx-agents-nova',
    description: 'Innovation, growth strategies, and breakthrough methods',
    personality: 'Innovative, forward-thinking, growth-oriented'
  },
  CODE: {
    id: 'code',
    name: 'CODE',
    role: 'Technical Systems',
    color: 'text-ngx-agents-code',
    bgColor: 'bg-ngx-agents-code',
    description: 'Technical analysis, data processing, and system optimization',
    personality: 'Logical, systematic, data-driven'
  },
  LUNA: {
    id: 'luna',
    name: 'LUNA',
    role: 'Intuition & Recovery',
    color: 'text-ngx-agents-luna',
    bgColor: 'bg-ngx-agents-luna',
    description: 'Intuitive coaching, recovery, and holistic wellness',
    personality: 'Intuitive, calming, holistic-focused'
  }
} as const;

// Agent Badge Component
interface AgentBadgeProps {
  agentId: keyof typeof NGX_AGENTS;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
  className?: string;
}

export const AgentBadge: React.FC<AgentBadgeProps> = ({ 
  agentId, 
  size = 'md', 
  showRole = false,
  className = '' 
}) => {
  const agent = NGX_AGENTS[agentId];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-md font-josefin font-semibold ${sizeClasses[size]} ${agent.bgColor} text-white ${className}`}>
      <span>{agent.name}</span>
      {showRole && (
        <span className="text-xs opacity-80">• {agent.role}</span>
      )}
    </div>
  );
};

// NGX Logo Component
export const NgxLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`font-bold font-sans tracking-wider ${sizeClasses[size]} ${className}`}>
      <span className="text-ngx-black-onyx">NGX</span>
      <span className="text-ngx-electric-violet">•</span>
      <span className="text-ngx-deep-purple">NEXUS</span>
    </div>
  );
};

// Program Badge Component
interface ProgramBadgeProps {
  program: 'PRIME' | 'LONGEVITY';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgramBadge: React.FC<ProgramBadgeProps> = ({ 
  program, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const programStyles = {
    PRIME: 'bg-ngx-prime-500 text-white',
    LONGEVITY: 'bg-ngx-longevity-500 text-white'
  };

  return (
    <span className={`inline-flex items-center rounded-md font-semibold ${sizeClasses[size]} ${programStyles[program]} ${className}`}>
      {program}
    </span>
  );
};

// Status Indicator Component
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'md',
  showLabel = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusStyles = {
    active: 'bg-ngx-success',
    inactive: 'bg-gray-400',
    pending: 'bg-ngx-warning',
    error: 'bg-ngx-error'
  };

  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive', 
    pending: 'Pending',
    error: 'Error'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`rounded-full ${sizeClasses[size]} ${statusStyles[status]}`} />
      {showLabel && (
        <span className="text-sm text-gray-600 capitalize">
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
};

// NGX Brand Provider Context
export const NgxBrandContext = React.createContext({
  theme: 'brutalist' as 'brutalist' | 'light' | 'dark',
  setTheme: (theme: 'brutalist' | 'light' | 'dark') => {}
});

export const NgxBrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<'brutalist' | 'light' | 'dark'>('brutalist');

  React.useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = '';
    if (theme === 'brutalist') {
      document.documentElement.classList.add('ngx-brutalist');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  return (
    <NgxBrandContext.Provider value={{ theme, setTheme }}>
      {children}
    </NgxBrandContext.Provider>
  );
};

export const useNgxBrand = () => React.useContext(NgxBrandContext);