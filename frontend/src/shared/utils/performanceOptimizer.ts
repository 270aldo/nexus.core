// Performance optimization utilities for NEXUS-CORE
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private loadedChunks = new Set<string>();
  private preloadQueue: string[] = [];
  
  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }
  
  // Intelligent preloading based on user behavior
  preloadByRoute(currentRoute: string) {
    const preloadMap: Record<string, string[]> = {
      '/dashboard': ['clients'],
      '/clients': ['auth'],
      '/auth': ['dashboard', 'clients']
    };
    
    const toPreload = preloadMap[currentRoute] || [];
    toPreload.forEach(feature => this.queuePreload(feature));
  }
  
  // Queue features for preloading
  private queuePreload(feature: string) {
    if (!this.loadedChunks.has(feature) && !this.preloadQueue.includes(feature)) {
      this.preloadQueue.push(feature);
      this.processPreloadQueue();
    }
  }
  
  // Process preload queue with throttling
  private async processPreloadQueue() {
    if (this.preloadQueue.length === 0) return;
    
    // Only preload during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => this.loadNextInQueue());
    } else {
      setTimeout(() => this.loadNextInQueue(), 100);
    }
  }
  
  private async loadNextInQueue() {
    const feature = this.preloadQueue.shift();
    if (!feature) return;
    
    try {
      await this.preloadFeature(feature);
      this.loadedChunks.add(feature);
    } catch (error) {
      console.warn(`Failed to preload ${feature}:`, error);
    }
    
    // Continue processing queue
    if (this.preloadQueue.length > 0) {
      this.processPreloadQueue();
    }
  }
  
  private async preloadFeature(feature: string): Promise<void> {
    const featureMap: Record<string, () => Promise<any>> = {
      'clients': () => import('../../features/clients'),
      'auth': () => import('../../features/auth'),
      'dashboard': () => import('../../features/dashboard')
    };
    
    const loader = featureMap[feature];
    if (loader) {
      console.log(`⚡ Preloading: ${feature}`);
      await loader();
    }
  }
  
  // Measure and log performance metrics
  measureFeatureLoad(featureName: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    console.log(`📊 ${featureName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to analytics if needed
    this.trackPerformance(featureName, loadTime);
  }
  
  private trackPerformance(feature: string, loadTime: number) {
    // Integration point for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'feature_load_time', {
        feature_name: feature,
        load_time: Math.round(loadTime),
        custom_parameter: 'nexus_core'
      });
    }
  }
  
  // Bundle size monitoring
  estimateBundleSize() {
    if ('navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const transferSize = navEntry.transferSize || 0;
      
      console.log(`📦 Initial bundle size: ${(transferSize / 1024).toFixed(2)}KB`);
      return transferSize;
    }
    return 0;
  }
  
  // Memory usage tracking
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      return memory.usedJSHeapSize;
    }
    return 0;
  }
  
  // Critical path optimization
  optimizeCriticalPath() {
    // Preload critical resources immediately
    const criticalFeatures = ['dashboard', 'clients'];
    criticalFeatures.forEach(feature => this.queuePreload(feature));
  }
}

// Singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const measureComponentRender = (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    };
  };
  
  const trackFeatureUsage = (featureName: string) => {
    console.log(`📈 Feature accessed: ${featureName}`);
    performanceOptimizer.preloadByRoute(`/${featureName}`);
  };
  
  return {
    measureComponentRender,
    trackFeatureUsage,
    estimateBundleSize: performanceOptimizer.estimateBundleSize,
    trackMemoryUsage: performanceOptimizer.trackMemoryUsage
  };
}