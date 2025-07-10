
// Dynamic feature loading utility
export interface FeatureModule {
  name: string;
  component: () => Promise<any>;
  dependencies: string[];
}

class FeatureLoader {
  private loadedFeatures = new Set<string>();
  
  async loadFeature(featureName: string): Promise<any> {
    if (this.loadedFeatures.has(featureName)) {
      console.log(`Feature ${featureName} already loaded`);
      return;
    }
    
    console.log(`Loading feature: ${featureName}`);
    
    switch (featureName) {
      case 'charts':
        return this.loadCharts();
      case 'auth':
        return this.loadAuth();
      case 'forms':
        return this.loadForms();
      default:
        console.warn(`Unknown feature: ${featureName}`);
        return null;
    }
  }
  
  private async loadCharts() {
    const { ResponsiveContainer, LineChart, BarChart } = await import('recharts');
    this.loadedFeatures.add('charts');
    return { ResponsiveContainer, LineChart, BarChart };
  }
  
  private async loadAuth() {
    // Only load auth when needed
    const authModule = await import('../features/auth');
    this.loadedFeatures.add('auth');
    return authModule;
  }
  
  private async loadForms() {
    const { useForm, Controller } = await import('react-hook-form');
    this.loadedFeatures.add('forms');
    return { useForm, Controller };
  }
}

export const featureLoader = new FeatureLoader();
