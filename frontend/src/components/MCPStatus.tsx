import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertCircle, InfoIcon, ServerIcon, ClockIcon, HistoryIcon, WrenchIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import brain from "brain";
import { MCPActivator } from "./MCPActivator";

export interface MCPStatusProps {
  compact?: boolean;
}

export function MCPStatus({ compact = false }: MCPStatusProps) {
  const [status, setStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [mcpInfo, setMcpInfo] = useState<any>(null);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  const checkMCPStatus = async () => {
    setIsLoading(true);
    try {
      const response = await brain.get_mcp_status();
      const data = await response.json();

      setMcpInfo(data);
      setStatus(data.active ? 'active' : 'inactive');
    } catch (err) {
      console.error("Error al verificar estado del MCP:", err);
      setStatus('inactive');
      toast.error("Error al verificar estado del MCP");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAccessLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await brain.get_mcp_access_logs();
      const data = await response.json();

      if (data.success) {
        setAccessLogs(data.logs || []);
      } else {
        toast.error("Error al cargar logs de acceso: " + data.message);
      }
    } catch (err) {
      console.error("Error al cargar logs de acceso:", err);
      toast.error("Error al cargar logs de acceso");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Activar MCP desde este componente
  const activateMcp = async () => {
    try {
      toast.loading("Activando MCP...");
      const response = await brain.activate_mcp({
        name: "Claude Desktop"
      });
      const data = await response.json();
      
      toast.dismiss();
      if (data.success) {
        toast.success("MCP activado correctamente");
        checkMCPStatus();
      } else {
        toast.error("Error al activar MCP: " + data.message);
      }
    } catch (err) {
      toast.dismiss();
      console.error("Error al activar MCP:", err);
      toast.error("Error al activar MCP");
    }
  };

  useEffect(() => {
    checkMCPStatus();
    
    if (!compact) {
      loadAccessLogs();
    }
    
    // Verificar el estado cada minuto si no es compacto
    const interval = !compact ? setInterval(() => {
      checkMCPStatus();
    }, 60000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [compact]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Si es compacto, mostrar versión simplificada
  if (compact) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm mb-6 border border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-sm">MCP Status</h3>
            </div>

            <div>
              {isLoading ? (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  <div className="animate-spin h-3 w-3 border-2 border-yellow-500 border-t-transparent rounded-full mr-1"></div>
                  Checking
                </Badge>
              ) : status === 'active' ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          
          {status === 'inactive' && (
            <Button 
              onClick={activateMcp} 
              className="w-full mt-2" 
              size="sm" 
              variant="outline"
            >
              Activate MCP
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-border mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <ServerIcon className="h-5 w-5 mr-2 text-primary" />
          MCP System Status
        </CardTitle>
        <CardDescription>
          Current status and activity of the Model Context Protocol server
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status" className="flex items-center gap-1">
              <InfoIcon className="h-4 w-4" />
              <span>Status</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1">
              <WrenchIcon className="h-4 w-4" />
              <span>Available Tools</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1">
              <HistoryIcon className="h-4 w-4" />
              <span>Access Logs</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-card">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <ServerIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">MCP Server</h3>
                  <p className="text-xs text-muted-foreground">Last checked: {mcpInfo ? formatDate(mcpInfo.last_check) : 'Never'}</p>
                </div>
              </div>
              
              <Badge 
                variant={status === 'active' ? 'default' : 'outline'}
                className={status === 'active' ? 'bg-green-500' : status === 'checking' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}
              >
                {status === 'checking' ? (
                  <span className="flex items-center">
                    <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                    Checking
                  </span>
                ) : status === 'active' ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                )}
              </Badge>
            </div>
            
            {mcpInfo && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium mb-1">Deployment URL</h3>
                  <div className="p-2 bg-muted rounded-md font-mono text-xs break-all">
                    {mcpInfo.deployment_url}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Authentication</h3>
                  <div className="p-2 bg-muted rounded-md text-xs">
                    {mcpInfo.auth_required ? 
                      <span className="text-amber-500 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> API Key required</span> : 
                      <span className="text-green-500 flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Direct access enabled (no authentication required)</span>
                    }
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Status Message</h3>
                  <div className="p-2 bg-muted rounded-md text-xs">
                    {mcpInfo.message}
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={checkMCPStatus} 
                    variant="outline" 
                    size="sm"
                    className="mr-2"
                    disabled={isLoading}
                  >
                    <ClockIcon className="h-3.5 w-3.5 mr-1" />
                    Refresh Status
                  </Button>
                  
                  {status !== 'active' && (
                    <Button 
                      onClick={activateMcp}
                      size="sm"
                      disabled={isLoading}
                    >
                      Activate MCP
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tools">
            {mcpInfo?.available_tools && mcpInfo.available_tools.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The following tools are available for Claude Desktop to use through the MCP interface:
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mcpInfo.available_tools.map((tool: string, index: number) => (
                    <div key={index} className="p-2 bg-card rounded-md border border-border text-xs font-mono">
                      {tool}
                    </div>
                  ))}
                </div>
                
                <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                  <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-500 font-medium">How to use these tools</p>
                    <p className="text-muted-foreground">
                      Ask Claude to use any of these tools by referring to them by name. For example:
                      <code className="block mt-1 p-1.5 bg-card rounded">
                        "Use search_clients to find all active PRIME clients"
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {isLoading ? 
                  "Loading available tools..." : 
                  "No tools available. Please activate MCP first."}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Recent Access Logs</h3>
                <Button 
                  onClick={loadAccessLogs} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoadingLogs}
                >
                  <ClockIcon className="h-3.5 w-3.5 mr-1" />
                  Refresh Logs
                </Button>
              </div>
              
              {isLoadingLogs ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading access logs...
                </div>
              ) : accessLogs.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.endpoint}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.success ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No access logs available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
