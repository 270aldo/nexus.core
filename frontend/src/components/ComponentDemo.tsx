// Sample implementation of using all components together
import React from "react";
import { AppShell } from "components/AppShell";
import { PageContainer } from "components/PageContainer";
import { ContentCard } from "components/ContentCard";
import { DataCard } from "components/DataCard";
import { StatusBadge } from "components/StatusBadge";
import { ButtonGroup } from "components/ButtonGroup";
import { DataPanel } from "components/DataPanel";
import { Header } from "components/Header";
import { Button } from "@/components/ui/button";
import { Plus, Filter, LineChart, Users, ArrowUpRight } from "lucide-react";

export function ComponentDemo() {
  return (
    <AppShell title="Component Demo">
      <PageContainer>
        {/* Page Header */}
        <Header 
          title="Neo-Brutalist Components" 
          subtitle="Demonstration of all available components"
          accentColor="prime"
          actions={
            <ButtonGroup>
              <Button variant="outline" className="border-2 font-mono">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button className="font-mono bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </ButtonGroup>
          }
        />
        
        {/* Status Badges Section */}
        <ContentCard title="Status Badges" accent="prime">
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
        </ContentCard>
        
        {/* Data Cards Section */}
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
        
        {/* Data Panel */}
        <DataPanel accent="prime" glowEffect className="h-80">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <LineChart className="h-12 w-12 mx-auto text-indigo-500" />
              <h3 className="font-mono text-xl font-bold">Chart Visualization Panel</h3>
              <p className="text-slate-400 font-mono text-sm max-w-md">
                This panel is designed to contain data visualizations with the neo-brutalist
                aesthetic including precise borders and optional glow effects.
              </p>
            </div>
          </div>
        </DataPanel>
        
        {/* Button Groups */}
        <ContentCard title="Button Group Variants" accent="longevity">
          <div className="space-y-6">
            <div>
              <h3 className="font-mono text-sm mb-2">Default Variant</h3>
              <ButtonGroup>
                <Button variant="outline" className="border-2 font-mono">Option 1</Button>
                <Button variant="outline" className="border-2 font-mono">Option 2</Button>
                <Button variant="outline" className="border-2 font-mono">Option 3</Button>
              </ButtonGroup>
            </div>
            
            <div>
              <h3 className="font-mono text-sm mb-2">Prime Variant</h3>
              <ButtonGroup variant="prime">
                <Button variant="outline" className="border-2 font-mono text-indigo-500 hover:text-indigo-400">Filter</Button>
                <Button variant="outline" className="border-2 font-mono text-indigo-500 hover:text-indigo-400">Sort</Button>
                <Button className="font-mono bg-indigo-600 hover:bg-indigo-700">Apply</Button>
              </ButtonGroup>
            </div>
            
            <div>
              <h3 className="font-mono text-sm mb-2">Longevity Variant</h3>
              <ButtonGroup variant="longevity">
                <Button variant="outline" className="border-2 font-mono text-pink-500 hover:text-pink-400">Day</Button>
                <Button variant="outline" className="border-2 font-mono text-pink-500 hover:text-pink-400">Week</Button>
                <Button className="font-mono bg-pink-600 hover:bg-pink-700">Month</Button>
              </ButtonGroup>
            </div>
          </div>
        </ContentCard>
      </PageContainer>
    </AppShell>
  );
}
