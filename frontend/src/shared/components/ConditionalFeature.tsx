
import React, { Suspense, ComponentType } from 'react';
import { featureLoader } from '../utils/featureLoader';

interface ConditionalFeatureProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  condition?: boolean;
}

export function ConditionalFeature({ 
  feature, 
  fallback = <div>Loading...</div>, 
  children, 
  condition = true 
}: ConditionalFeatureProps) {
  if (!condition) {
    return <div>Feature {feature} not available</div>;
  }
  
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// HOC for wrapping features
export function withConditionalFeature<P extends object>(
  WrappedComponent: ComponentType<P>,
  featureName: string
) {
  return function ConditionalFeatureWrapper(props: P) {
    return (
      <ConditionalFeature feature={featureName}>
        <WrappedComponent {...props} />
      </ConditionalFeature>
    );
  };
}
