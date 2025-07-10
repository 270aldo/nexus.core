import React, { useEffect, useState } from "react";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { MetricCard } from "components/MetricCard";
import { ProgramCard } from "components/ProgramCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "components/ProtectedRoute";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";
import * as ds from "utils/design-system";
import { BaseCard } from "components/BaseCard";
import { CardTitle as DesignCardTitle } from "components/CardTitle";
import { useAuth } from "utils/auth-context";

export default function App() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    activeClients: "--",
    adherence: "--",
    sessions: "--",
    revenue: "--",
    adherenceTrend: "neutral" as "up" | "down" | "neutral",
    sessionsTrend: "neutral" as "up" | "down" | "neutral",
    revenueTrend: "neutral" as "up" | "down" | "neutral"
  });
  const [primeStats, setPrimeStats] = useState({
    activeClients: "--",
    avgProgress: "--",
    completionRate: "--",
    satisfaction: "--"
  });
  const [longevityStats, setLongevityStats] = useState({
    activeClients: "--",
    avgProgress: "--",
    completionRate: "--",
    satisfaction: "--"
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Solo cargar datos del dashboard cuando el usuario está autenticado
    if (user) {
      loadDashboardData();
    }
  }, [user]); // Dependencia en user para recargar cuando cambie el estado de autenticación

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get business metrics for the dashboard
      const response = await brain.generate_business_metrics({
        date_range: "30days"
      });
      const data = await response.json();
      
      // Set default data in case database is not initialized
      if (data?.error && data.error.includes("does not exist")) {
        toast.error("Database not initialized. Please go to Database Setup to create tables.");
        navigate("/database-setup");
        return;
      }
      
      // Update metrics with real data - adding null checks to prevent errors
      setMetrics({
        activeClients: data?.active_clients?.toString() || "--",
        adherence: data?.program_adherence_percentage ? `${Math.round(data.program_adherence_percentage)}%` : "--",
        sessions: data?.total_sessions?.toString() || "--",
        revenue: data?.monthly_revenue ? `$${data.monthly_revenue.toLocaleString()}` : "--",
        adherenceTrend: data?.adherence_trend > 0 ? "up" : data?.adherence_trend < 0 ? "down" : "neutral",
        sessionsTrend: data?.sessions_trend > 0 ? "up" : data?.sessions_trend < 0 ? "down" : "neutral",
        revenueTrend: data?.revenue_trend > 0 ? "up" : data?.revenue_trend < 0 ? "down" : "neutral"
      });

      // Update program stats with null checks
      setPrimeStats({
        activeClients: data?.prime_clients?.toString() || "--",
        avgProgress: data?.prime_avg_progress ? `+${data.prime_avg_progress}%` : "--",
        completionRate: data?.prime_completion_rate ? `${data.prime_completion_rate}%` : "--",
        satisfaction: data?.prime_satisfaction ? `${data.prime_satisfaction}/5` : "--"
      });

      setLongevityStats({
        activeClients: data?.longevity_clients?.toString() || "--",
        avgProgress: data?.longevity_avg_progress ? `+${data.longevity_avg_progress}%` : "--",
        completionRate: data?.longevity_completion_rate ? `${data.longevity_completion_rate}%` : "--",
        satisfaction: data?.longevity_satisfaction ? `${data.longevity_satisfaction}/5` : "--"
      });

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data. Database may not be initialized.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Header 
          title="NEXUSCORE Control Center" 
          subtitle="Centralized management for NGX Performance & Longevity programs"
          actions={
            <Button 
              variant="outline" 
              className="font-mono text-sm border border-input"
              onClick={() => navigate("/mcp-status")}
            >
              System Status
            </Button>
          }
        />
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard 
            title="Active Clients" 
            value={metrics.activeClients}
            subtitle="Across all programs"
            trend="up"
            trendValue="+5 this month"
            onClick={() => navigate("/clients")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          <MetricCard 
            title="Program Adherence" 
            value={metrics.adherence}
            subtitle="Average across clients"
            trend={metrics.adherenceTrend}
            trendValue={metrics.adherenceTrend === "up" ? "+2% from last month" : 
                       metrics.adherenceTrend === "down" ? "-1% from last month" : 
                       "No change from last month"}
            onClick={() => navigate("/progress")}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          <MetricCard 
            title="Total Sessions" 
            value={metrics.sessions}
            subtitle="This month"
            trend={metrics.sessionsTrend}
            trendValue={metrics.sessionsTrend === "up" ? "+23 from last month" : 
                       metrics.sessionsTrend === "down" ? "-15 from last month" : 
                       "No change from last month"}
            onClick={() => navigate("/dashboard")} 
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
          <MetricCard 
            title="Revenue" 
            value={metrics.revenue}
            subtitle="Monthly recurring"
            trend={metrics.revenueTrend}
            trendValue={metrics.revenueTrend === "up" ? "+$2,200 from last month" : 
                       metrics.revenueTrend === "down" ? "-$1,800 from last month" : 
                       "No change from last month"}
            onClick={() => navigate("/dashboard")} 
            className="cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
        
        {/* Program Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* PRIME Program Card */}
          <div className="space-y-4">
            <h2 className={`${ds.typography.sectionTitle} ${ds.borders.divider} pb-2 ${ds.colors.prime.text}`}>
              NGX PRIME
            </h2>
            <ProgramCard 
              title="PRIME Performance" 
              subtitle="High-intensity athletic development program"
              stats={[
                { label: "Active Clients", value: primeStats.activeClients },
                { label: "Avg. Progress", value: primeStats.avgProgress },
                { label: "Completion Rate", value: primeStats.completionRate },
                { label: "Satisfaction", value: primeStats.satisfaction }
              ]}
              ctaText="View PRIME Clients"
              onCtaClick={() => navigate("/clients?type=PRIME")}
              variant="prime"
              onClick={() => navigate("/dashboard?type=PRIME")}
              className="cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
          
          {/* LONGEVITY Program Card */}
          <div className="space-y-4">
            <h2 className={`${ds.typography.sectionTitle} ${ds.borders.divider} pb-2 ${ds.colors.longevity.text}`}>
              NGX LONGEVITY
            </h2>
            <ProgramCard 
              title="LONGEVITY Wellness" 
              subtitle="Sustainable health optimization program"
              stats={[
                { label: "Active Clients", value: longevityStats.activeClients },
                { label: "Avg. Progress", value: longevityStats.avgProgress },
                { label: "Completion Rate", value: longevityStats.completionRate },
                { label: "Satisfaction", value: longevityStats.satisfaction }
              ]}
              ctaText="View LONGEVITY Clients"
              onCtaClick={() => navigate("/clients?type=LONGEVITY")}
              variant="longevity"
              onClick={() => navigate("/dashboard?type=LONGEVITY")}
              className="cursor-pointer hover:opacity-95 transition-opacity"
            />
          </div>
        </div>
        
        {/* System Overview */}
        <BaseCard 
          className="mb-6"
          header={<DesignCardTitle>NEXUSCORE Platform Overview</DesignCardTitle>}
        >
          <div className="space-y-3">
            <p className="text-sm">
              NEXUSCORE es tu centro de control centralizado para programas NGX Performance & Longevity, 
              proporcionando herramientas de gestión completas y análisis en tiempo real. Utiliza la integración 
              del servidor MCP para interactuar con todos los datos a través de Claude Desktop.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className={`${ds.borders.thin} ${ds.borders.sm} p-3 cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5`} onClick={() => navigate("/clients")}>
                <h3 className={`${ds.typography.cardTitle} mb-2`}>Client Management</h3>
                <p className="text-xs text-muted-foreground">
                  Centralized client profiles, progress tracking, and program assignment
                </p>
                <Button 
                  variant="link" 
                  className="px-0 text-xs h-auto mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/clients");
                  }}
                >
                  View Clients
                </Button>
              </div>
              <div className={`${ds.borders.thin} ${ds.borders.sm} p-3 cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5`} onClick={() => navigate("/training-programs")}>
                <h3 className={`${ds.typography.cardTitle} mb-2`}>Program Control</h3>
                <p className="text-xs text-muted-foreground">
                  Create, customize and manage training and nutrition programs
                </p>
                <Button 
                  variant="link" 
                  className="px-0 text-xs h-auto mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/training-programs");
                  }}
                >
                  View Programs
                </Button>
              </div>
              <div className={`${ds.borders.thin} ${ds.borders.sm} p-3 cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-indigo-500/5`} onClick={() => navigate("/mcp-status")}>
                <h3 className={`${ds.typography.cardTitle} mb-2`}>MCP Integration</h3>
                <p className="text-xs text-muted-foreground">
                  Seamless interaction with platform data through Claude Desktop
                </p>
                <Button 
                  variant="link" 
                  className="px-0 text-xs h-auto mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/coach-assistant");
                  }}
                >
                  Abrir Asistente
                </Button>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <div className="container mx-auto mt-0 mb-4 flex flex-col gap-3">          
          <h1 className="scroll-m-20 text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl">
            NexusCore
          </h1>
          <p className="leading-7">
            Centro de control para NGX Performance & Longevity
          </p>
          
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full">              
              <h2 className="text-2xl font-bold mb-4">Herramientas MCP</h2>
            </div>
            
            <Card className="flex flex-col hover:shadow-lg transition-all" onClick={() => navigate("/macro-calculator-page")}>
              <CardHeader>
                <CardTitle>Calculadora de Macronutrientes</CardTitle>
                <CardDescription>
                  Herramienta avanzada para calcular requerimientos calóricos y nutrientes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Calcula tus necesidades calóricas y optimiza la distribución de macronutrientes según tus objetivos y nivel de actividad física.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  navigate("/macro-calculator-page");
                }}>
                  Abrir Calculadora
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Asistente MCP para Entrenadores</CardTitle>
                <CardDescription>
                  Chat interactivo con IA para generar programas, analizar datos y obtener recomendaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Interactúa directamente con Claude para planificar programas, analizar el progreso de clientes y recibir sugerencias personalizadas sin salir del sistema.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate("/coach-assistant")}>
                  Abrir Asistente
                </Button>
              </CardFooter>
            </Card>

        <Card
          onClick={() => navigate("/mcp")}
          className="cursor-pointer transition-all bg-gradient-to-br from-zinc-900 to-zinc-800 hover:shadow-lg hover:scale-[1.01] border-0"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <span className="h-5 w-5 text-white flex items-center justify-center font-bold">S</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Estado MCP Claude</h3>
              <p className="text-xs text-muted-foreground">Gestionar conexión con Claude Desktop</p>
            </div>
            <span className="ml-auto h-4 w-4 opacity-50">›</span>
          </div>
        </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

