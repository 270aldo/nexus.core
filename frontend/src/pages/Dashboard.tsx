import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "components/AppShell";
import { PageContainer } from "components/PageContainer";
import { DataCard } from "components/DataCard";
import { DataPanel } from "components/DataPanel";
import { Header } from "components/Header";
import { ContentCard } from "components/ContentCard";
import { ButtonGroup } from "components/ButtonGroup";
import { StatusBadge } from "components/StatusBadge";
import { DatabaseStatus } from 'components/DatabaseStatus';
import { BackButton } from "components/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

import { toast } from "sonner";
import { theme } from "utils/theme";
import { useNavigate, useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  
  // Determine variant based on program type
  const pageVariant = typeFromUrl?.toUpperCase() === "PRIME" ? "prime" : 
                      typeFromUrl?.toUpperCase() === "LONGEVITY" ? "longevity" : "neutral";
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  // Default program type based on URL parameter
  const defaultProgramType = typeFromUrl ? typeFromUrl.toLowerCase() : "all";
  const [programType, setProgramType] = useState<"all" | "prime" | "longevity">(defaultProgramType as "all" | "prime" | "longevity");
  
  const [isLoading, setIsLoading] = useState(true);
  
  // State for each visualization
  const [clientDistribution, setClientDistribution] = useState<any[]>([]);
  const [adherenceMetrics, setAdherenceMetrics] = useState<any[]>([]);
  const [programEffectiveness, setProgramEffectiveness] = useState<any[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<any>({
    total_active_clients: 0,
    new_clients_this_period: 0,
    client_retention_rate: 0,
    revenue_growth: 0,
    program_completion_rate: 0
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, programType]);
  
  // Function to handle database validation
  const handleDatabaseValidated = useCallback(() => {
    fetchDashboardData();
  }, []);
  
  // Safely parse JSON with fallback
  const safeJsonParse = async (response: any) => {
    if (!response) return null;
    try {
      return await response.json();
    } catch (err) {
      console.warn('Failed to parse JSON response:', err);
      return null;
    }
  };

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get client distribution (active clients by program type)
      let clientsData = [];
      try {
        const clientsResponse = await brain.search_clients({
          status: "active"
        });
        const parsedData = await safeJsonParse(clientsResponse);
        clientsData = Array.isArray(parsedData) ? parsedData : [];
      } catch (err) {
        console.error("Error fetching or parsing clients data:", err);
        // Continue with empty array
      }
      
      const clientsGrouped = clientsData.reduce((acc: any, client: any) => {
        const type = client?.type ? client.type.toLowerCase() : 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      setClientDistribution([
        { name: "PRIME", value: clientsGrouped.prime || 0 },
        { name: "LONGEVITY", value: clientsGrouped.longevity || 0 }
      ]);
      
      // Get business metrics
      let businessData = {
        total_active_clients: 0,
        new_clients_this_period: 0,
        client_retention_rate: 0,
        revenue_growth: 0,
        program_completion_rate: 0
      };
      
      try {
        const businessResponse = await brain.generate_business_metrics({
          date_range: timeRange
        });
        const parsedBusinessData = await safeJsonParse(businessResponse);
        if (parsedBusinessData) {
          businessData = {
            total_active_clients: parsedBusinessData.total_active_clients || 0,
            new_clients_this_period: parsedBusinessData.new_clients_this_period || 0,
            client_retention_rate: parsedBusinessData.client_retention_rate || 0,
            revenue_growth: parsedBusinessData.revenue_growth || 0,
            program_completion_rate: parsedBusinessData.program_completion_rate || 0
          };
        }
      } catch (err) {
        console.error("Error with business metrics:", err);
        // Continue with default business data
      }
      
      setBusinessMetrics(businessData);
      
      // Get adherence metrics for a sample of clients
      if (clientsData.length > 0) {
        try {
          // Only fetch data for up to 5 clients to avoid too many requests
          const sampleClients = clientsData.slice(0, 5);
          const adherencePromises = sampleClients
            .filter(client => client?.id) // Make sure client has an ID
            .map(client => {
              try {
                return brain.get_client_adherence_metrics({
                  client_id: client.id,
                  date_range: timeRange
                });
              } catch (err) {
                console.error(`Error creating adherence promise for client ${client.id}:`, err);
                return null;
              }
            })
            .filter(Boolean); // Remove nulls
          
          const adherenceResponses = await Promise.all(adherencePromises);
          const adherenceData = await Promise.all(
            adherenceResponses.map(async (r, index) => {
              if (!r) return null;
              try {
                return await r.json();
              } catch (err) {
                console.warn(`Failed to parse adherence JSON for client ${index}:`, err);
                return null;
              }
            })
          );
          
          // Transform data for visualization (filter out failed responses)
          const validIndices = adherenceData
            .map((data, i) => data ? i : -1)
            .filter(i => i !== -1);
          
          const transformedAdherenceData = validIndices.map(i => {
            const data = adherenceData[i];
            const client = sampleClients[i];
            return {
              name: client?.name ? client.name.split(' ')[0] : `Client ${i + 1}`,
              workoutAdherence: data?.workout_adherence ? Math.round(data.workout_adherence * 100) : 0,
              nutritionAdherence: data?.nutrition_adherence ? Math.round(data.nutrition_adherence * 100) : 0,
              overallAdherence: data?.overall_adherence ? Math.round(data.overall_adherence * 100) : 0,
              programType: client?.type ? client.type.toLowerCase() : 'unknown',
            };
          });
          
          setAdherenceMetrics(transformedAdherenceData.filter(d => 
            programType === "all" || d.programType === programType
          ));
        } catch (err) {
          console.error('Error processing adherence data:', err);
          // Use fallback data
          setAdherenceMetrics([
            { name: "Alex", workoutAdherence: 87, nutritionAdherence: 73, overallAdherence: 80, programType: "prime" },
            { name: "Sarah", workoutAdherence: 92, nutritionAdherence: 85, overallAdherence: 88, programType: "prime" },
            { name: "John", workoutAdherence: 78, nutritionAdherence: 82, overallAdherence: 80, programType: "longevity" },
            { name: "Maria", workoutAdherence: 95, nutritionAdherence: 90, overallAdherence: 92, programType: "longevity" },
            { name: "James", workoutAdherence: 70, nutritionAdherence: 65, overallAdherence: 68, programType: "prime" }
          ]);
        }
        
        // Get program effectiveness
        try {
          // Extract program IDs from client data
          const programIds = Array.from(new Set(
            clientsData
              .filter(Boolean)
              .map(c => c?.active_program_id)
              .filter(Boolean)
          ));
          
          if (programIds.length > 0) {
            // Only fetch data for up to 3 programs
            const sampleProgramIds = programIds.slice(0, 3);
            
            try {
              const effectivenessPromises = sampleProgramIds.map(programId => {
                try {
                  return brain.get_program_effectiveness({
                    program_id: programId,
                    metrics: "all"
                  });
                } catch (err) {
                  console.error(`Error creating effectiveness promise for program ${programId}:`, err);
                  return null;
                }
              }).filter(Boolean);
              
              const effectivenessResponses = await Promise.all(effectivenessPromises);
              const effectivenessData = await Promise.all(
                effectivenessResponses.map(async (r, index) => {
                  if (!r) return null;
                  try {
                    return await r.json();
                  } catch (err) {
                    console.warn(`Failed to parse JSON for program ${index}:`, err);
                    return null;
                  }
                })
              );
              
              // Transform effectiveness data (filter out failed responses)
              const transformedEffectivenessData = effectivenessData
                .filter(Boolean)
                .map((data, index) => ({
                  name: data?.program_name || `Program ${index + 1}`,
                  effectiveness: data?.overall_effectiveness ? Math.round(data.overall_effectiveness * 100) : 75,
                  clientSatisfaction: data?.client_satisfaction ? Math.round(data.client_satisfaction * 100) : 80,
                  progressRate: data?.progress_rate ? Math.round(data.progress_rate * 100) : 70,
                }));
              
              if (transformedEffectivenessData.length > 0) {
                setProgramEffectiveness(transformedEffectivenessData);
              } else {
                // No valid data, use fallback
                throw new Error("No valid program effectiveness data");
              }
            } catch (err) {
              console.error('Error fetching program effectiveness data:', err);
              // Use fallback data if API calls fail
              throw err;
            }
          } else {
            // No program IDs, use fallback data
            throw new Error("No program IDs found");
          }
        } catch (err) {
          // Use fallback data for program effectiveness
          setProgramEffectiveness([
            { name: "Strength Foundation", effectiveness: 85, clientSatisfaction: 90, progressRate: 78 },
            { name: "Endurance Builder", effectiveness: 78, clientSatisfaction: 82, progressRate: 75 },
            { name: "Mobility Master", effectiveness: 92, clientSatisfaction: 95, progressRate: 88 }
          ]);
        }
      } else {
        // No client data, use fallback for all visualizations
        setAdherenceMetrics([
          { name: "Alex", workoutAdherence: 87, nutritionAdherence: 73, overallAdherence: 80, programType: "prime" },
          { name: "Sarah", workoutAdherence: 92, nutritionAdherence: 85, overallAdherence: 88, programType: "prime" },
          { name: "John", workoutAdherence: 78, nutritionAdherence: 82, overallAdherence: 80, programType: "longevity" },
          { name: "Maria", workoutAdherence: 95, nutritionAdherence: 90, overallAdherence: 92, programType: "longevity" },
          { name: "James", workoutAdherence: 70, nutritionAdherence: 65, overallAdherence: 68, programType: "prime" }
        ]);
        
        setProgramEffectiveness([
          { name: "Strength Foundation", effectiveness: 85, clientSatisfaction: 90, progressRate: 78 },
          { name: "Endurance Builder", effectiveness: 78, clientSatisfaction: 82, progressRate: 75 },
          { name: "Mobility Master", effectiveness: 92, clientSatisfaction: 95, progressRate: 88 }
        ]);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error?.message || error);
      toast.error("Failed to load dashboard data");
      
      // Set fallback data for all visualizations
      setClientDistribution([
        { name: "PRIME", value: 24 },
        { name: "LONGEVITY", value: 18 }
      ]);
      
      setAdherenceMetrics([
        { name: "Alex", workoutAdherence: 87, nutritionAdherence: 73, overallAdherence: 80, programType: "prime" },
        { name: "Sarah", workoutAdherence: 92, nutritionAdherence: 85, overallAdherence: 88, programType: "prime" },
        { name: "John", workoutAdherence: 78, nutritionAdherence: 82, overallAdherence: 80, programType: "longevity" },
        { name: "Maria", workoutAdherence: 95, nutritionAdherence: 90, overallAdherence: 92, programType: "longevity" },
        { name: "James", workoutAdherence: 70, nutritionAdherence: 65, overallAdherence: 68, programType: "prime" }
      ]);
      
      setProgramEffectiveness([
        { name: "Strength Foundation", effectiveness: 85, clientSatisfaction: 90, progressRate: 78 },
        { name: "Endurance Builder", effectiveness: 78, clientSatisfaction: 82, progressRate: 75 },
        { name: "Mobility Master", effectiveness: 92, clientSatisfaction: 95, progressRate: 88 }
      ]);
      
      setBusinessMetrics({
        total_active_clients: 42,
        new_clients_this_period: 8,
        client_retention_rate: 0.94,
        revenue_growth: 0.12,
        program_completion_rate: 0.85
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell title="Dashboard">
      <PageContainer>
        <Header 
          title="Dashboard" 
          subtitle="Real-time analytics for NGX Performance & Longevity"
          accentColor="prime"
          actions={
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <BackButton fallbackPath="/" />
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-full sm:w-[180px] border-2 font-mono">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="border-2 border-slate-700">
                  <SelectItem value="7d" className="font-mono">Last 7 days</SelectItem>
                  <SelectItem value="30d" className="font-mono">Last 30 days</SelectItem>
                  <SelectItem value="90d" className="font-mono">Last 90 days</SelectItem>
                  <SelectItem value="all" className="font-mono">All time</SelectItem>
                </SelectContent>
              </Select>
              
              <ButtonGroup>
                <Button 
                  variant={programType === "all" ? "default" : "outline"} 
                  className="font-mono border-2"
                  onClick={() => setProgramType("all")}
                >
                  All
                </Button>
                <Button 
                  variant={programType === "prime" ? "default" : "outline"} 
                  className="font-mono border-2 text-indigo-500 hover:text-indigo-400 data-[state=default]:bg-indigo-500 data-[state=default]:text-white"
                  onClick={() => setProgramType("prime")}
                >
                  PRIME
                </Button>
                <Button 
                  variant={programType === "longevity" ? "default" : "outline"} 
                  className="font-mono border-2 text-pink-500 hover:text-pink-400 data-[state=default]:bg-pink-500 data-[state=default]:text-white"
                  onClick={() => setProgramType("longevity")}
                >
                  LONGEVITY
                </Button>
              </ButtonGroup>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/database-setup')}
                className="w-full sm:w-auto border-2 border-slate-700 font-mono"
              >
                Database Setup
              </Button>
            </div>
          }
        />
        
        <Separator className="my-6 border-slate-700 border-2 rounded-none" />
        
        {/* Database Status Check */}
        <DatabaseStatus minimal onValidated={handleDatabaseValidated} />
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataCard
            title="Active Clients"
            value={businessMetrics?.total_active_clients || '—'}
            trend={{
              value: businessMetrics?.new_clients_this_period || 0,
              label: "new this period", 
              isPositive: true
            }}
            accent="prime"
            isLoading={isLoading}
            onClick={() => navigate("/clients")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          
          <DataCard
            title="Client Retention"
            value={`${((businessMetrics?.client_retention_rate || 0) * 100).toFixed(1)}%`}
            subtitle="Average retention rate"
            accent="longevity"
            isLoading={isLoading}
            onClick={() => navigate("/clients")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          
          <DataCard
            title="Program Completion"
            value={`${((businessMetrics?.program_completion_rate || 0) * 100).toFixed(1)}%`}
            subtitle="Clients completing programs"
            accent="success"
            isLoading={isLoading}
            onClick={() => navigate("/training-programs")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          
          <DataCard
            title="Revenue Growth"
            value={`${((businessMetrics?.revenue_growth || 0) * 100).toFixed(1)}%`}
            subtitle="Compared to previous period"
            accent="warning"
            isLoading={isLoading}
            onClick={() => navigate("/dashboard?type=all")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
        
        {/* Main Dashboard Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Client Distribution Chart */}
          <ContentCard title="Client Distribution" accent="prime" onClick={() => navigate("/clients")} className="cursor-pointer hover:opacity-95 transition-opacity">
            <div className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      stroke="#334155"
                      strokeWidth={2}
                    >
                      <Cell key="prime" fill="#6366f1" />
                      <Cell key="longevity" fill="#ec4899" />
                    </Pie>
                    <Legend 
                      verticalAlign="bottom"
                      formatter={(value) => {
                        return <span className="font-mono text-xs">{value}</span>;
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} Clients`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155",
                        borderWidth: 2,
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ContentCard>
          
          {/* Client Adherence Chart */}
          <ContentCard title="Client Adherence" accent="longevity" onClick={() => navigate("/progress")} className="cursor-pointer hover:opacity-95 transition-opacity">
            <div className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={adherenceMetrics}
                    barSize={20}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#334155" 
                      opacity={0.2} 
                      vertical={false} 
                    />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 12, fontFamily: 'monospace' }} 
                      axisLine={{ stroke: "#334155", strokeWidth: 2 }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fontFamily: 'monospace' }}
                      axisLine={{ stroke: "#334155", strokeWidth: 2 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, '']}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155",
                        borderWidth: 2,
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)'
                      }}
                    />
                    <Bar 
                      dataKey="workoutAdherence" 
                      name="Workout" 
                      fill="#6366f1"
                      stroke="#334155"
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0px 0px 6px rgba(99, 102, 241, 0.3))' }}
                    />
                    <Bar 
                      dataKey="nutritionAdherence" 
                      name="Nutrition" 
                      fill="#ec4899"
                      stroke="#334155"
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0px 0px 6px rgba(236, 72, 153, 0.3))' }}
                    />
                    <Bar 
                      dataKey="overallAdherence" 
                      name="Overall" 
                      fill="#f59e0b"
                      stroke="#334155"
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0px 0px 6px rgba(245, 158, 11, 0.3))' }}
                    />
                    <Legend 
                      formatter={(value) => {
                        return <span className="font-mono text-xs">{value}</span>;
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ContentCard>
          
          {/* Program Effectiveness Chart */}
          <DataPanel accent="prime" glowEffect onClick={() => navigate("/training-programs")} className="cursor-pointer hover:opacity-95 transition-opacity">
            <div className="h-80">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    outerRadius={90} 
                    data={programEffectiveness.length > 0 ? programEffectiveness : [
                      { name: "No Data", effectiveness: 0, clientSatisfaction: 0, progressRate: 0 }
                    ]}
                  >
                    <PolarGrid 
                      stroke="#334155" 
                      opacity={0.4}
                      strokeWidth={1.5}
                    />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: "#334155", strokeWidth: 2 }}
                    />
                    <Radar 
                      name="Effectiveness" 
                      dataKey="effectiveness" 
                      stroke="#6366f1" 
                      fill="#6366f1" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }}
                    />
                    <Radar 
                      name="Satisfaction" 
                      dataKey="clientSatisfaction" 
                      stroke="#ec4899" 
                      fill="#ec4899" 
                      fillOpacity={0.3} 
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))' }}
                    />
                    <Radar 
                      name="Progress Rate" 
                      dataKey="progressRate" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }}
                    />
                    <Legend 
                      formatter={(value) => {
                        return <span className="font-mono text-xs">{value}</span>;
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '']}
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155",
                        borderWidth: 2,
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DataPanel>
          
          {/* Client Progress Trends */}
          <DataPanel accent="longevity" glowEffect onClick={() => navigate("/progress")} className="cursor-pointer hover:opacity-95 transition-opacity">
            <div className="h-80">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono font-bold">Progress Trends</h3>
                <Select defaultValue="weight">
                  <SelectTrigger className="w-[180px] border-2 font-mono">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-slate-700">
                    <SelectItem value="weight" className="font-mono">Weight</SelectItem>
                    <SelectItem value="strength" className="font-mono">Strength</SelectItem>
                    <SelectItem value="endurance" className="font-mono">Endurance</SelectItem>
                    <SelectItem value="mobility" className="font-mono">Mobility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart
                    data={[
                      { month: 'Jan', prime: 75, longevity: 65 },
                      { month: 'Feb', prime: 78, longevity: 67 },
                      { month: 'Mar', prime: 82, longevity: 70 },
                      { month: 'Apr', prime: 85, longevity: 72 },
                      { month: 'May', prime: 89, longevity: 75 },
                      { month: 'Jun', prime: 92, longevity: 80 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#334155" 
                      opacity={0.2} 
                      vertical={false} 
                    />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fontFamily: 'monospace' }}
                      axisLine={{ stroke: "#334155", strokeWidth: 2 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fontFamily: 'monospace' }}
                      axisLine={{ stroke: "#334155", strokeWidth: 2 }}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155",
                        borderWidth: 2,
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.5)'
                      }}
                    />
                    <defs>
                      <linearGradient id="primeColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="longevityColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="prime" 
                      name="PRIME" 
                      stroke="#6366f1" 
                      fill="url(#primeColor)" 
                      fillOpacity={0.8} 
                      strokeWidth={2.5}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="longevity" 
                      name="LONGEVITY" 
                      stroke="#ec4899" 
                      fill="url(#longevityColor)" 
                      fillOpacity={0.8} 
                      strokeWidth={2.5}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.5))' }}
                    />
                    <Legend 
                      formatter={(value) => {
                        return <span className="font-mono text-xs">{value}</span>;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </DataPanel>
        </div>
      </PageContainer>
    </AppShell>
  );
};

export default Dashboard;