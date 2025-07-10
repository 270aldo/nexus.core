import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { performanceOptimizer, usePerformanceMonitoring } from '../utils/performanceOptimizer';

interface PerformanceContextType {
  measureRender: (componentName: string) => () => void;
  trackFeature: (featureName: string) => void;
  preloadRoute: (route: string) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const { measureComponentRender, trackFeatureUsage } = usePerformanceMonitoring();
  
  useEffect(() => {
    // Initialize performance monitoring
    console.log('🚀 NEXUS-CORE Performance Monitoring Initialized');
    
    // Start critical path optimization
    performanceOptimizer.optimizeCriticalPath();
    
    // Log initial metrics
    performanceOptimizer.estimateBundleSize();
    performanceOptimizer.trackMemoryUsage();
    
    // Set up performance observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log(`📊 Navigation timing: ${entry.duration}ms`);
          }
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`🎨 Largest Contentful Paint: ${entry.startTime}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  const contextValue: PerformanceContextType = {
    measureRender: measureComponentRender,
    trackFeature: trackFeatureUsage,
    preloadRoute: (route: string) => {
      performanceOptimizer.preloadByRoute(route);
    }
  };
  
  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};