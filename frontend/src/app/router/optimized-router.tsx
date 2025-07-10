import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Shared components (always loaded)
import { useAppStore } from '../../shared/stores';

// Lazy load all features for optimal code splitting
const DashboardFeature = lazy(() => 
  import('../../features/dashboard').then(module => ({
    default: module.DashboardPage || (() => <div>Dashboard Loading...</div>)
  }))
);

const ClientsFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Clients Coming Soon</div>
  })
);

const AuthFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Auth Coming Soon</div>
  })
);

const ProgramsFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Programs Coming Soon</div>
  })
);

const NutritionFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Nutrition Coming Soon</div>
  })
);

const ProgressFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Progress Coming Soon</div>
  })
);

const AnalyticsFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>Analytics Coming Soon</div>
  })
);

const MCPFeature = lazy(() => 
  Promise.resolve({
    default: () => <div>MCP Integration Coming Soon</div>
  })
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
    <h2 className="text-xl font-semibold text-red-600 mb-2">
      Oops! Something went wrong
    </h2>
    <p className="text-gray-600 mb-4 text-center">
      {error.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try again
    </button>
  </div>
);

// Layout wrapper with suspense and error boundary
const FeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Import optimized layout
const OptimizedLayout = lazy(() => 
  import('../../shared/components/OptimizedLayout').then(module => ({
    default: module.OptimizedLayout
  }))
);

// Fallback layout for immediate loading
const FallbackLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">NEXUS-CORE</h1>
            <span className="text-sm text-gray-500">NGX Operations Platform</span>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

// Optimized router with code splitting
export const optimizedRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<FallbackLayout />}>
        <OptimizedLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <FeatureWrapper>
            <DashboardFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "dashboard",
        element: (
          <FeatureWrapper>
            <DashboardFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "clients/*",
        element: (
          <FeatureWrapper>
            <ClientsFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "programs/*",
        element: (
          <FeatureWrapper>
            <ProgramsFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "nutrition/*",
        element: (
          <FeatureWrapper>
            <NutritionFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "progress/*",
        element: (
          <FeatureWrapper>
            <ProgressFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "analytics/*",
        element: (
          <FeatureWrapper>
            <AnalyticsFeature />
          </FeatureWrapper>
        ),
      },
      {
        path: "mcp/*",
        element: (
          <FeatureWrapper>
            <MCPFeature />
          </FeatureWrapper>
        ),
      },
    ],
  },
  {
    path: "/auth/*",
    element: (
      <FeatureWrapper>
        <AuthFeature />
      </FeatureWrapper>
    ),
  },
  {
    path: "*",
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
  },
]);

export default optimizedRouter;