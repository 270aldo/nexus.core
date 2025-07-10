import React, { Suspense, lazy } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAppStore } from '../stores';

// Core components (always loaded)
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
);

// Lazy load heavy components only when needed
const Sidebar = lazy(() => import('../../components/Sidebar'));
const Header = lazy(() => import('../../components/Header'));
const NotificationIndicator = lazy(() => import('../../components/NotificationIndicator'));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
    <h2 className="text-xl font-semibold text-red-600 mb-2">
      Something went wrong
    </h2>
    <p className="text-gray-600 mb-4 text-center text-sm">
      {error.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
    >
      Try again
    </button>
  </div>
);

// Optimized layout with conditional loading
export const OptimizedLayout: React.FC = () => {
  const { sidebarOpen } = useAppStore();
  const location = useLocation();
  
  // Determine which components to load based on route
  const isAuthRoute = location.pathname.startsWith('/auth');
  const isFullscreenRoute = ['/login', '/signup', '/404'].includes(location.pathname);
  
  // Minimal layout for auth routes
  if (isAuthRoute || isFullscreenRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
  
  // Full layout for app routes
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - lazy loaded */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={
          <div className="h-16 bg-white shadow-sm border-b flex items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">NEXUS-CORE</h1>
          </div>
        }>
          <Header />
        </Suspense>
      </ErrorBoundary>

      <div className="flex">
        {/* Sidebar - conditionally lazy loaded */}
        {sidebarOpen && (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={
              <div className="w-64 bg-white shadow-sm border-r min-h-screen">
                <div className="p-4">
                  <LoadingSpinner />
                </div>
              </div>
            }>
              <Sidebar />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Main content area */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-0' : ''}`}>
          <div className="p-6">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        {/* Notifications - lazy loaded only when needed */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={null}>
            <NotificationIndicator />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};