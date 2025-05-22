import React from "react";
import { AppShell } from "components/AppShell";
import { PageContainer } from "components/PageContainer";
import { ContentCard } from "components/ContentCard";
import { DataCard } from "components/DataCard";
import { StatusBadge } from "components/StatusBadge";
import { ButtonGroup } from "components/ButtonGroup";
import { DataPanel } from "components/DataPanel";
import { Header } from "components/Header";
import { TabPanel } from "components/TabPanel";
import { LoadingIndicator } from "components/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Filter, LineChart, Users, ArrowUpRight, ChevronRight, Activity, Loader2 } from "lucide-react";

/**
 * Component showcase page demonstrating the neo-brutalist UI library
 * Serves as documentation for the available components and usage patterns
 */
const ComponentShowcase = () => {
  return (
    <AppShell title="Component Library">
      <PageContainer>
        <Header 
          title="Neo-Brutalist UI Components" 
          subtitle="Documentation and usage examples for the NGX design system"
          accentColor="prime"
          actions={
            <Button className="font-mono bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              New Component
            </Button>
          }
        />
        
        {/* Introduction */}
        <ContentCard 
          title="Design System Overview" 
          subtitle="Following neo-brutalist principles with illuminated data visualization"
          accent="prime"
        >
          <div className="space-y-4 text-slate-300">
            <p>
              This component library implements the neo-brutalist design system for the NGX Performance & Longevity platform. 
              The design approach combines strong structural elements with sophisticated data visualization, 
              creating a powerful yet refined control center aesthetic.
            </p>
            
            <h3 className="font-mono font-bold text-lg">Key Design Features</h3>
            <ul className="list-disc pl-5 space-y-1 font-mono text-sm text-slate-400">
              <li>Strong rectilinear forms with hard edges</li>
              <li>High contrast color palette with illuminated accents</li>
              <li>Monospaced typography for technical information</li>
              <li>Brutalist spacing with intentional hierarchy</li>
              <li>Glowing accent highlights for critical data points</li>
            </ul>
          </div>
        </ContentCard>
        
        {/* Layout Components */}
        <div className="space-y-6 mt-6">
          <h2 className="text-2xl font-mono font-bold tracking-tighter">Layout Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard title="AppShell" accent="prime">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  The root component that applies the theme and provides the application structure.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<AppShell title="Dashboard">
  <PageContainer>
    {/* Page content */}
  </PageContainer>
</AppShell>`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="PageContainer" accent="prime">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Container with consistent padding and max-width for page content.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<PageContainer>
  <Header title="Page Title" />
  {/* Page content */}
</PageContainer>`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="Header" accent="prime">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Page header with title, subtitle and optional action buttons.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<Header 
  title="Page Title" 
  subtitle="Page description"
  accentColor="prime"
  actions={<Button>Action</Button>}
/>`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="ContentCard" accent="prime">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Card component with optional accent color for content containers.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<ContentCard 
  title="Card Title" 
  subtitle="Card description"
  accent="prime"
>
  {/* Card content */}
</ContentCard>`}
                </pre>
              </div>
            </ContentCard>
          </div>
        </div>
        
        {/* Data Visualization Components */}
        <div className="space-y-6 mt-6">
          <h2 className="text-2xl font-mono font-bold tracking-tighter">Data Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DataCard 
              title="Active Clients" 
              value="42"
              subtitle="Total active clients"
              accent="prime"
              trend={{ value: 8, label: "new this month", isPositive: true }}
              icon={<Users className="h-5 w-5" />}
            />
            
            <DataCard 
              title="Retention Rate" 
              value="94%"
              subtitle="Average retention"
              accent="longevity"
            />
            
            <DataCard 
              title="Program Completion" 
              value="85%"
              subtitle="Completion rate"
              accent="success"
            />
            
            <DataCard 
              title="Revenue Growth" 
              value="12%"
              subtitle="vs previous period"
              accent="warning"
              icon={<ArrowUpRight className="h-5 w-5" />}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard title="DataCard" accent="longevity">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Card for displaying key metrics with optional trend indicators.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<DataCard 
  title="Active Clients" 
  value="42"
  subtitle="Total count"
  accent="prime"
  trend={{ 
    value: 8, 
    label: "new this month", 
    isPositive: true 
  }}
  icon={<Users className="h-5 w-5" />}
/>`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="DataPanel" accent="longevity">
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Container for data visualizations with optional glow effects.
                </p>
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<DataPanel 
  accent="prime" 
  glowEffect 
  padding="md"
>
  {/* Visualization content */}
</DataPanel>`}
                </pre>
              </div>
            </ContentCard>
          </div>
          
          <DataPanel accent="longevity" glowEffect className="h-64">
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <LineChart className="h-12 w-12 mx-auto text-pink-500" />
                <h3 className="font-mono text-xl font-bold">Data Visualization Container</h3>
                <p className="text-slate-400 font-mono text-sm max-w-md">
                  This panel provides a container for charts and data visualizations with
                  the neo-brutalist styling including precise borders and glow effects.
                </p>
              </div>
            </div>
          </DataPanel>
        </div>
        
        {/* UI Elements */}
        <div className="space-y-6 mt-6">
          <h2 className="text-2xl font-mono font-bold tracking-tighter">UI Elements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard title="Status Badges" accent="success">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Display status information with consistent styling.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" />
                  <StatusBadge status="paused" />
                  <StatusBadge status="inactive" />
                  <StatusBadge status="success" />
                  <StatusBadge status="warning" />
                  <StatusBadge status="danger" />
                  <StatusBadge status="info" />
                  <StatusBadge status="prime" />
                  <StatusBadge status="longevity" />
                </div>
                
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<StatusBadge status="active" />
<StatusBadge status="prime" size="lg" />
<StatusBadge status="longevity" label="Custom" />`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="Button Groups" accent="success">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Group related buttons with consistent styling.
                </p>
                
                <div className="space-y-3">
                  <ButtonGroup>
                    <Button variant="outline" className="border-2 font-mono">Day</Button>
                    <Button variant="outline" className="border-2 font-mono">Week</Button>
                    <Button className="font-mono">Month</Button>
                  </ButtonGroup>
                  
                  <ButtonGroup variant="prime">
                    <Button variant="outline" className="border-2 font-mono text-indigo-500 hover:text-indigo-400">Filter</Button>
                    <Button className="font-mono bg-indigo-600 hover:bg-indigo-700">Apply</Button>
                  </ButtonGroup>
                </div>
                
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<ButtonGroup variant="prime">
  <Button variant="outline">Option 1</Button>
  <Button>Option 2</Button>
</ButtonGroup>`}
                </pre>
              </div>
            </ContentCard>
          </div>
        </div>

        {/* Tab Panel & Loading Indicator */}
        <div className="space-y-6 mt-6">
          <h2 className="text-2xl font-mono font-bold tracking-tighter">Interactive Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContentCard title="Tab Panel" accent="prime">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Switch between different content sections with styled tabs.
                </p>
                
                <TabPanel
                  variant="prime"
                  tabs={[
                    {
                      id: "tab1",
                      label: "Overview",
                      content: (
                        <div className="p-4 border-2 border-slate-700 bg-slate-800/50">
                          <p className="text-sm text-slate-400">Tab content for Overview section</p>
                        </div>
                      )
                    },
                    {
                      id: "tab2",
                      label: "Statistics",
                      content: (
                        <div className="p-4 border-2 border-slate-700 bg-slate-800/50">
                          <p className="text-sm text-slate-400">Tab content for Statistics section</p>
                        </div>
                      )
                    },
                    {
                      id: "tab3",
                      label: "Settings",
                      content: (
                        <div className="p-4 border-2 border-slate-700 bg-slate-800/50">
                          <p className="text-sm text-slate-400">Tab content for Settings section</p>
                        </div>
                      )
                    }
                  ]}
                />
                
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<TabPanel
  variant="prime"
  tabs={[
    {
      id: "tab1",
      label: "Overview",
      content: <div>Tab content</div>
    },
    // More tabs...
  ]}
/>`}
                </pre>
              </div>
            </ContentCard>
            
            <ContentCard title="Loading Indicator" accent="longevity">
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Display loading state with neo-brutalist styling.
                </p>
                
                <div className="flex items-center justify-center py-4">
                  <LoadingIndicator 
                    size="md" 
                    variant="longevity" 
                    message="Loading data..." 
                  />
                </div>
                
                <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`<LoadingIndicator 
  size="md" 
  variant="longevity" 
  message="Loading data..." 
  fullPage={false} 
/>`}
                </pre>
              </div>
            </ContentCard>
          </div>
        </div>
        
        {/* Usage Examples */}
        <div className="space-y-6 mt-6 mb-8">
          <h2 className="text-2xl font-mono font-bold tracking-tighter">Usage Examples</h2>
          
          <ContentCard title="Dashboard Layout Example" accent="warning">
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Example of how to structure a dashboard page using the component library.
              </p>
              
              <pre className="bg-slate-900 p-3 rounded text-xs font-mono overflow-x-auto">
{`// Dashboard.tsx
import { AppShell, PageContainer, Header, ContentCard, DataCard, DataPanel } from "components";

const Dashboard = () => {
  return (
    <AppShell title="Dashboard">
      <PageContainer>
        <Header title="Dashboard" accentColor="prime" />
        
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DataCard title="Active Clients" value="42" accent="prime" />
          <DataCard title="Retention Rate" value="94%" accent="longevity" />
          {/* More metrics... */}
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataPanel accent="prime" glowEffect>
            {/* Chart component */}
          </DataPanel>
          
          <ContentCard title="Program Effectiveness">
            {/* Table or list component */}
          </ContentCard>
        </div>
      </PageContainer>
    </AppShell>
  );
};

export default Dashboard;`}
              </pre>
            </div>
          </ContentCard>
        </div>
      </PageContainer>
    </AppShell>
  );
};

export default ComponentShowcase;