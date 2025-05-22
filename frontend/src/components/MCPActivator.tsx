import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, CheckCircleIcon, CopyIcon, GlobeIcon, ServerIcon } from "lucide-react";
import brain from "brain";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface MCPActivatorProps {
  onStatusChange?: (isActive: boolean) => void;
}

export function MCPActivator({ onStatusChange }: MCPActivatorProps) {
  const [activationInfo, setActivationInfo] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const activateMCP = async () => {
    try {
      setIsActivating(true);
      
      const activationRequest = {
        name: "Claude Desktop",
        api_key: null
      };
      
      toast.info("Activando MCP para Claude Desktop...");
      const response = await brain.activate_mcp(activationRequest);
      const data = await response.json();
      
      if (data.success) {
        setActivationInfo(data.data);
        toast.success("MCP activado correctamente");
        
        // Notificar cambio de estado
        if (onStatusChange) {
          onStatusChange(true);
        }
        
        // Verificar el estado del MCP después de la activación
        await checkMCPStatus();
      } else {
        toast.error(data.message || "Error al activar MCP");
      }
    } catch (err) {
      console.error("Error activando MCP:", err);
      toast.error("Error activando MCP. Intenta nuevamente.");
    } finally {
      setIsActivating(false);
    }
  };
  
  const checkMCPStatus = async () => {
    try {
      const response = await brain.get_mcp_status();
      const data = await response.json();
      
      if (data.active) {
        // Si MCP está activo, verificamos si hay información adicional
        let activationData = {
          mcp_url: data.deployment_url,
          auth_token: "direct-access",
          instructions: {
            claude_desktop: [
              "1. Abre Claude Desktop en tu computador",
              "2. Escribe a Claude: 'Conéctate al servidor MCP en ' + data.deployment_url",
              "3. Claude debería conectarse automáticamente al MCP",
              "4. Prueba diciendo: 'Muestra la lista de clientes usando search_clients'",
              "5. Ahora podrás acceder a tus datos de NGX directamente desde Claude"
            ]
          }
        };
        
        // Actualizar la información de activación
        setActivationInfo(activationData);
        
        // Notificar cambio de estado
        if (onStatusChange) {
          onStatusChange(true);
        }
      } else if (onStatusChange) {
        onStatusChange(false);
      }
    } catch (err) {
      console.error("Error verificando estado del MCP:", err);
    }
  };
  
  // Verificar estado inicial
  useEffect(() => {
    checkMCPStatus();
  }, []);
  
  const resetActivation = () => {
    setActivationInfo(null);
  };
  
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copiado al portapapeles`);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  return (
    <Card className="bg-card/30 backdrop-blur-sm border border-primary/20 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ServerIcon className="h-5 w-5 mr-2 text-primary" />
          Claude Desktop Integration
        </CardTitle>
        <CardDescription>
          Connect Claude AI to NGX Performance & Longevity data
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {!activationInfo ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Activate MCP to use Claude Desktop with your NGX Performance & Longevity data
              </p>
              <Button 
                onClick={activateMCP}
                className="bg-primary hover:bg-primary/90"
                disabled={isActivating}
              >
                {isActivating ? "Activando..." : "Activate MCP for Claude Desktop"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                <p className="text-emerald-500 font-medium flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  MCP Activated Successfully
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Integration Steps</h3>
                <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                  {activationInfo?.instructions?.claude_desktop.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              
              <div>
                <h3 className="text-sm font-medium flex items-center justify-between">
                  <span>Your MCP URL</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5" 
                          onClick={() => copyToClipboard(activationInfo?.mcp_url, "MCP URL")}
                        >
                          {copied === "MCP URL" ? <Check className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="mt-1 p-2 bg-muted rounded-md font-mono text-xs break-all">
                  {activationInfo?.mcp_url}
                </div>
              </div>
              
              {activationInfo?.auth_token && activationInfo.auth_token !== "direct-access" && (
                <div>
                  <h3 className="text-sm font-medium flex items-center justify-between">
                    <span>Your Authentication Token</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => copyToClipboard(activationInfo?.auth_token, "Auth Token")}
                          >
                            {copied === "Auth Token" ? <Check className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="mt-1 p-2 bg-muted rounded-md font-mono text-xs break-all">
                    {activationInfo?.auth_token}
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-blue-500">Tip:</span> When using Claude Desktop,
                  instruct it to connect to your MCP server by saying: 
                  <span className="block mt-1 p-1.5 bg-muted rounded font-mono text-xs">
                    "Connect to the MCP server at {activationInfo?.mcp_url}"
                  </span>
                </p>
              </div>
              
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={resetActivation}
                >
                  Hide Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}  
