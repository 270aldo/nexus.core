import React, { useEffect, useState } from "react";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { BaseCard } from "components/BaseCard";
import { CardTitle as DesignCardTitle } from "components/CardTitle";
import * as ds from "utils/design-system";
import { CopyButton } from "components/CopyButton";
import { CodeBlock } from "components/CodeBlock";

export default function MCP() {
  const [isActivated, setIsActivated] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [mcpStatus, setMcpStatus] = useState({
    token: "",
    mcp_url: "",
    active: false,
    last_used: "",
    total_calls: 0,
    available_tools: [],
  });
  
  useEffect(() => {
    checkMcpStatus();
  }, []);

  const checkMcpStatus = async () => {
    try {
      const response = await brain.get_mcp_status_endpoint2();
      const data = await response.json();
      console.log("MCP Status:", data);
      
      if (data.success) {
        setMcpStatus({
          token: data.token || "",
          mcp_url: data.mcp_url || "",
          active: data.active || false,
          last_used: data.last_used || "Never",
          total_calls: data.total_calls || 0,
          available_tools: data.available_tools || [],
        });
        setIsActivated(data.active || false);
      } else {
        toast.error("Error al obtener estado de MCP");
      }
    } catch (error) {
      console.error("Error checking MCP status:", error);
      toast.error("Error al comunicarse con el servidor MCP");
    }
  };

  const activateMcp = async () => {
    setIsActivating(true);
    try {
      const response = await brain.activate_mcp_endpoint2({});
      const data = await response.json();
      console.log("MCP Activation:", data);
      
      if (data.success) {
        setMcpStatus({
          ...mcpStatus,
          token: data.token || mcpStatus.token,
          mcp_url: data.mcp_url || mcpStatus.mcp_url,
          active: true
        });
        setIsActivated(true);
        toast.success("MCP activado correctamente");
      } else {
        toast.error(data.error || "Error al activar MCP");
      }
    } catch (error) {
      console.error("Error activating MCP:", error);
      toast.error("Error al comunicarse con el servidor MCP");
    } finally {
      setIsActivating(false);
    }
  };

  const getMcpTools = async () => {
    try {
      const response = await brain.get_mcp_tools_endpoint();
      const data = await response.json();
      console.log("MCP Tools:", data);
      
      if (data.success) {
        setMcpStatus({
          ...mcpStatus,
          available_tools: data.tools || []
        });
        toast.success("Herramientas MCP actualizadas");
      } else {
        toast.error(data.error || "Error al obtener herramientas MCP");
      }
    } catch (error) {
      console.error("Error getting MCP tools:", error);
      toast.error("Error al comunicarse con el servidor MCP");
    }
  };

  const renderToolsList = () => {
    if (!mcpStatus.available_tools || mcpStatus.available_tools.length === 0) {
      return <p className="text-sm text-muted-foreground italic">No hay herramientas disponibles.</p>;
    }

    return (
      <div className="space-y-2 mt-2">
        {mcpStatus.available_tools.map((tool, index) => (
          <div key={index} className={`${ds.borders.thin} ${ds.borders.sm} p-3`}>
            <h4 className="font-medium text-sm">{tool.name}</h4>
            <p className="text-xs text-muted-foreground">{tool.description || "Sin descripción"}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderClaudeSetupInstructions = () => (
    <div className="space-y-4">
      <h3 className={`${ds.typography.sectionTitle}`}>Configuración en Claude Desktop</h3>
      
      <div className="space-y-2">
        <p className="text-sm">1. Abre Claude Desktop y haz clic en "Settings" (⚙️)</p>
        <p className="text-sm">2. Selecciona "Model Context Protocol"</p>
        <p className="text-sm">3. Haz clic en "Add MCP Server"</p>
        <p className="text-sm">4. Ingresa los siguientes datos:</p>
        
        <div className="ml-6 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nombre del servidor:</p>
            <div className="flex items-center gap-2">
              <Input value="NEXUSCORE" readOnly className="font-mono text-sm h-8" />
              <CopyButton textToCopy="NEXUSCORE" />
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">URL del servidor MCP:</p>
            <div className="flex items-center gap-2">
              <Input value={mcpStatus.mcp_url} readOnly className="font-mono text-sm h-8" />
              <CopyButton textToCopy={mcpStatus.mcp_url} />
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Token de autorización:</p>
            <div className="flex items-center gap-2">
              <Input 
                value={mcpStatus.token} 
                readOnly 
                className="font-mono text-sm h-8" 
                type="password"
              />
              <CopyButton textToCopy={mcpStatus.token} />
            </div>
          </div>
        </div>
        
        <p className="text-sm mt-4">5. Haz clic en "Save" para guardar la configuración</p>
        <p className="text-sm">6. Ahora puedes activar NEXUSCORE desde el menú desplegable de MCP en Claude Desktop</p>
      </div>

      <div className="mt-4">
        <h4 className={`${ds.typography.cardTitle} mb-2`}>Comandos de prueba para Claude</h4>
        <CodeBlock code={`Muestra los clientes activos en el sistema`} />
        <CodeBlock code={`Analiza el rendimiento del programa PRIME en los últimos 30 días`} />
        <CodeBlock code={`Crea un nuevo cliente de tipo LONGEVITY con nombre "Juan Pérez" y email "juan@example.com"`} />
      </div>
    </div>
  );

  return (
    <Layout>
      <Header 
        title="Integración con Claude Desktop"
        subtitle="Configuración del servidor MCP para interactuar con asistentes de IA"
        accentColor="prime"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de estado */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Estado del Servidor MCP</CardTitle>
            <CardDescription>Modelo de Contexto para Claude</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <span className={`text-sm font-mono ${isActivated ? "text-green-500" : "text-red-500"}`}>
                  {isActivated ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Última conexión:</span>
                <span className="text-sm font-mono">{mcpStatus.last_used || "Nunca"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total de llamadas:</span>
                <span className="text-sm font-mono">{mcpStatus.total_calls || 0}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <Button 
                onClick={activateMcp} 
                disabled={isActivating || isActivated}
                className="w-full"
                variant={isActivated ? "outline" : "default"}
              >
                {isActivating ? "Activando..." : isActivated ? "MCP Activado" : "Activar MCP"}
              </Button>
              
              <Button 
                onClick={checkMcpStatus} 
                variant="outline" 
                className="w-full mt-2"
              >
                Actualizar Estado
              </Button>
              
              <Button 
                onClick={getMcpTools} 
                variant="outline" 
                className="w-full mt-2"
              >
                Verificar Herramientas
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Panel de configuración */}
        <div className="lg:col-span-2 space-y-6">
          <BaseCard
            header={<DesignCardTitle>Conexión con Claude Desktop</DesignCardTitle>}
          >
            {isActivated ? renderClaudeSetupInstructions() : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Activa el servidor MCP para obtener las credenciales de conexión</p>
                <Button onClick={activateMcp} disabled={isActivating}>
                  {isActivating ? "Activando..." : "Activar MCP"}
                </Button>
              </div>
            )}
          </BaseCard>
          
          <BaseCard
            header={<DesignCardTitle>Herramientas disponibles para Claude</DesignCardTitle>}
          >
            <div className="space-y-4">
              <p className="text-sm">
                Las siguientes herramientas están disponibles para Claude a través del servidor MCP.
                Claude puede utilizar estas funciones cuando interactúas con él a través de la interfaz de chat.
              </p>
              
              {renderToolsList()}
              
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={getMcpTools}>
                  Actualizar lista de herramientas
                </Button>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </Layout>
  );
}
