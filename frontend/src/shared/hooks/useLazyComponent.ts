import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { useCallback, useRef } from 'react';

// Type definitions for lazy loading
export interface LazyComponentConfig {
  feature: string;
  importPath: string;
  fallback?: ComponentType;
  preload?: boolean;
}

// Hook for managing lazy component loading
export function useLazyComponent<T = ComponentType>(
  config: LazyComponentConfig
): LazyExoticComponent<T> {
  const componentRef = useRef<LazyExoticComponent<T> | null>(null);
  
  const createLazyComponent = useCallback(() => {
    if (componentRef.current) {
      return componentRef.current;
    }
    
    console.log(`🚀 Loading feature: ${config.feature}`);
    
    const LazyComponent = lazy(() => 
      import(config.importPath)
        .then(module => {
          console.log(`✅ Loaded feature: ${config.feature}`);
          return {
            default: module.default || module[config.feature] || config.fallback || (() => null)
          };
        })
        .catch(error => {
          console.error(`❌ Failed to load feature: ${config.feature}`, error);
          const ErrorComponent = () => {
            const React = require('react');
            return React.createElement('div', {
              className: 'p-4 text-center text-red-600'
            }, `Failed to load ${config.feature}`);
          };
          return { default: config.fallback || ErrorComponent };
        })
    ) as LazyExoticComponent<T>;
    
    componentRef.current = LazyComponent;
    return LazyComponent;
  }, [config]);
  
  return createLazyComponent();
}

// Preload helper for critical components
export function preloadComponent(importPath: string): Promise<any> {
  return import(importPath)
    .then(module => {
      console.log(`⚡ Preloaded: ${importPath}`);
      return module;
    })
    .catch(error => {
      console.warn(`⚠️ Failed to preload: ${importPath}`, error);
    });
}

// Feature detection and conditional loading
export function useConditionalFeature(
  featureName: string,
  condition: boolean = true
) {
  const isFeatureEnabled = useCallback(() => {
    // Feature flags could be implemented here
    const enabledFeatures = ['dashboard', 'clients', 'analytics', 'mcp'];
    return condition && enabledFeatures.includes(featureName);
  }, [featureName, condition]);
  
  return {
    isEnabled: isFeatureEnabled(),
    canLoad: condition
  };
}

// Batch preloading for critical features
export function preloadCriticalFeatures() {
  const criticalFeatures = [
    '../../features/dashboard',
    '../../features/clients', 
    '../../components/Header',
    '../../components/Sidebar'
  ];
  
  return Promise.allSettled(
    criticalFeatures.map(feature => preloadComponent(feature))
  );
}