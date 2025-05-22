import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CoachAssistantChat } from "components/CoachAssistantChat";
import { useNavigate } from "react-router-dom";

export default function CoachAssistant() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch clients and programs
    fetchClientsAndPrograms();
  }, []);

  const fetchClientsAndPrograms = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, we would fetch from the API
      // const clientsResponse = await fetch('/api/clients');
      // const clientsData = await clientsResponse.json();
      // const programsResponse = await fetch('/api/programs');
      // const programsData = await programsResponse.json();

      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const mockClients = [
        { id: "c1", name: "Juan Pérez", type: "PRIME", program: "Hipertrofia Fase 2" },
        { id: "c2", name: "María González", type: "LONGEVITY", program: "Vitalidad Senior" },
        { id: "c3", name: "Carlos Rodríguez", type: "PRIME", program: "Fuerza Atlética" },
        { id: "c4", name: "Ana Martínez", type: "LONGEVITY", program: "Recuperación Postural" },
        { id: "c5", name: "Miguel Sánchez", type: "PRIME", program: "Rendimiento Elite" }
      ];
      
      const mockPrograms = [
        { id: "p1", name: "Hipertrofia Fase 2", type: "PRIME", clients: 8 },
        { id: "p2", name: "Vitalidad Senior", type: "LONGEVITY", clients: 12 },
        { id: "p3", name: "Fuerza Atlética", type: "PRIME", clients: 6 },
        { id: "p4", name: "Recuperación Postural", type: "LONGEVITY", clients: 9 },
        { id: "p5", name: "Rendimiento Elite", type: "PRIME", clients: 3 }
      ];
      
      setClients(mockClients);
      setPrograms(mockPrograms);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedClientName = () => {
    if (!selectedClient) return null;
    const client = clients.find(c => c.id === selectedClient);
    return client ? client.name : null;
  };

  const getSelectedProgramName = () => {
    if (!selectedProgram) return null;
    const program = programs.find(p => p.id === selectedProgram);
    return program ? program.name : null;
  };

  return (
    <div className="container mx-auto py-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asistente MCP para Entrenadores</h1>
          <p className="text-muted-foreground mt-1">
            Interactúa con el asistente AI para analizar datos, generar programas y obtener recomendaciones
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Clientes Recientes</CardTitle>
            <CardDescription>Selecciona un cliente para contextualizar</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              disabled={isLoading}
              value={selectedClient || "none"}
              onValueChange={(value) => setSelectedClient(value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="none" value="none">Ninguno</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Programas Activos</CardTitle>
            <CardDescription>Selecciona un programa para contextualizar</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              disabled={isLoading}
              value={selectedProgram || "none"}
              onValueChange={(value) => setSelectedProgram(value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar programa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="none" value="none">Ninguno</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name} ({program.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Contexto Actual</CardTitle>
            <CardDescription>Información que el asistente tendrá en cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Cliente:</p>
                  <p className="text-muted-foreground">
                    {getSelectedClientName() || "Sin cliente seleccionado"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Programa:</p>
                  <p className="text-muted-foreground">
                    {getSelectedProgramName() || "Sin programa seleccionado"}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground italic">
                  Nota: El asistente analizará los datos del cliente y programa seleccionados para proporcionar respuestas contextualizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardContent className="p-0 flex-1">
            <CoachAssistantChat
              clientId={selectedClient || undefined}
              programId={selectedProgram || undefined}
              clientName={getSelectedClientName() || undefined}
              programName={getSelectedProgramName() || undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}