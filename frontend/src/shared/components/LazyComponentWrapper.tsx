import React, { Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface LazyComponentWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  name?: string;
}

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

// Default error component  
const DefaultError = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center p-4 border border-red-200 rounded bg-red-50">
    <h3 className="text-sm font-medium text-red-800 mb-2">
      Failed to load component
    </h3>
    <p className="text-xs text-red-600 mb-3 text-center">
      {error.message}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
    >
      Retry
    </button>
  </div>
);

/**
 * Universal wrapper for lazy-loaded components with error boundaries and loading states
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback = <DefaultLoading />,
  errorFallback = DefaultError,
  name = 'Component'
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onError={(error) => {
        console.error(`❌ Error in lazy component ${name}:`, error);
      }}
      onReset={() => {
        console.log(`🔄 Retrying lazy component ${name}`);
      }}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// HOC version for wrapping components
export function withLazyWrapper<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
    name?: string;
  }
) {
  const displayName = options?.name || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const LazyWrappedComponent = (props: P) => (
    <LazyComponentWrapper
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
      name={displayName}
    >
      <WrappedComponent {...props} />
    </LazyComponentWrapper>
  );
  
  LazyWrappedComponent.displayName = `LazyWrapper(${displayName})`;
  
  return LazyWrappedComponent;
}