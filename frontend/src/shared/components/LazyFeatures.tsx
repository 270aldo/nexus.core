
import { lazy } from 'react';
import { ComponentType } from 'react';

// Lazy load heavy features only when needed
export const LazyChartComponent = lazy(() => 
  import('recharts').then(module => ({ 
    default: module.ResponsiveContainer 
  }))
);

export const LazyAuthComponents = lazy(() => 
  import('../features/auth').then(module => ({ 
    default: module.AuthGuard 
  }))
);

export const LazyFormComponents = lazy(() => 
  import('react-hook-form').then(module => ({ 
    default: module.Controller 
  }))
);

// Conditional component loader
export function loadFeatureComponent<T = ComponentType>(
  featureName: string,
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  console.log(`Loading feature: ${featureName}`);
  return importFn();
}

// Feature detection utilities
export const hasFeature = (featureName: string): boolean => {
  const features = [
    'charts', 'auth', 'forms', 'editor', 'maps', 'crypto'
  ];
  return features.includes(featureName);
};
