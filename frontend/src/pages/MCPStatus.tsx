import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRightIcon, CheckCircleIcon, Code2Icon, GlobeIcon, InfoIcon, XIcon, UsersIcon } from "lucide-react";
import brain from "brain";
import { toast } from "sonner";
import { Layout } from "components/Layout";
import { MCPStatus as MCPStatusComponent } from "components/MCPStatus";
import { MCPActivator } from "components/MCPActivator";

const MCPStatus = () => {
  const navigate = useNavigate();
  const [mcpActive, setMcpActive] = useState(false);
  
  // Callback for MCPActivator to update status
  const handleStatusChange = (isActive: boolean) => {
    setMcpActive(isActive);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-6xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
              <span className="text-lg font-bold">S</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Estado MCP para Claude Desktop</h1>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">Volver al inicio</Button>
        </div>
        
        {/* Componente MCPStatus */}
        <div className="mb-8">
          <MCPStatusComponent />
        </div>

        {/* Componente MCPActivator */}
        <div className="mb-8">
          <MCPActivator onStatusChange={handleStatusChange} />
        </div>

        {/* Instrucciones para Claude Desktop */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle>Cómo Usar con Claude Desktop</CardTitle>
            <CardDescription>
              Instrucciones para conectar Claude Desktop a tu servidor MCP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Activa el MCP</h3>
                <p className="text-sm">Asegúrate de que el MCP esté activado usando el activador arriba.</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">2. En Claude Desktop</h3>
                <p className="text-sm">Escribe el siguiente comando a Claude Desktop:</p>
                <code className="block p-3 mt-2 bg-gray-800 text-green-400 rounded text-sm overflow-x-auto">
                  Conéctate al servidor MCP en https://ngxmealplannerpro.databutton.app/nexus-core
                </code>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">3. Probar Conexión</h3>
                <p className="text-sm">Pide a Claude que pruebe una herramienta:</p>
                <code className="block p-3 mt-2 bg-gray-800 text-green-400 rounded text-sm overflow-x-auto">
                  Dame la lista de clientes usando search_clients
                </code>
              </div>
              <Separator />
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
                <h3 className="font-semibold mb-2">Solución de problemas</h3>
                <p className="text-sm">Si Claude no puede conectarse a los endpoints con prefijo, prueba usar endpoints directos sin prefijo:</p>
                <code className="block p-3 mt-2 bg-gray-800 text-green-400 rounded text-sm overflow-x-auto">
                  Usa el endpoint directo /add_client para añadir un cliente<br />
                  O busca usando /search_clients sin el prefijo
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MCPStatus;