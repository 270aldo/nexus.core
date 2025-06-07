import { useState, useEffect } from "react";
import { Bell, AlertCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import brain from "brain";
import { NotificationCreate } from "brain";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "components/ProtectedRoute";

interface ClientInfo {
  id: string;
  name: string;
  type: string;
}

interface ProgramInfo {
  id: string;
  name: string;
  type: string;
}

export default function NotificationsDemo() {
  const [userId, setUserId] = useState("user1");
  const [notificationData, setNotificationData] = useState<NotificationCreate>({
    user_id: "user1",
    title: "Nueva actualización en el programa",
    message: "Se ha actualizado un programa asignado a uno de tus clientes.",
    type: "info",
    priority: "medium",
    related_client_id: null,
    related_program_id: null,
    related_data: null,
    action_url: null
  });
  
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [includeActionUrl, setIncludeActionUrl] = useState(false);
  
  useEffect(() => {
    // Cargar lista de clientes para la demostración
    const loadClients = async () => {
      try {
        const response = await brain.search_clients({ limit: 10 });
        const data = await response.json();
        
        if (data && data.clients) {
          setClients(data.clients.map((client: any) => ({
            id: client.id,
            name: client.name,
            type: client.type
          })));
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };
    
    // Cargar lista de programas para la demostración
    const loadPrograms = async () => {
      try {
        const response = await brain.get_training_templates({ limit: 10 });
        const data = await response.json();
        
        if (data && data.programs) {
          setPrograms(data.programs.map((program: any) => ({
            id: program.id || `program-${Math.floor(Math.random() * 1000)}`,
            name: program.name,
            type: program.type
          })));
        } else {
          // Si no hay programas reales, crear algunos de demostración
          setPrograms([
            { id: "program-1", name: "Entrenamiento de Fuerza Básico", type: "strength" },
            { id: "program-2", name: "Pérdida de Peso Avanzado", type: "weight_loss" },
            { id: "program-3", name: "Programa de Rehabilitación", type: "rehabilitation" }
          ]);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        // Si hay error, crear algunos de demostración
        setPrograms([
          { id: "program-1", name: "Entrenamiento de Fuerza Básico", type: "strength" },
          { id: "program-2", name: "Pérdida de Peso Avanzado", type: "weight_loss" },
          { id: "program-3", name: "Programa de Rehabilitación", type: "rehabilitation" }
        ]);
      }
    };
    
    loadClients();
    loadPrograms();
  }, []);
  
  const handleInputChange = (field: keyof NotificationCreate, value: any) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    const selectedClient = clients.find(c => c.id === clientId);
    
    handleInputChange("related_client_id", clientId);
    
    // Si el cliente está seleccionado, actualizar mensaje y título para reflejar esto
    if (selectedClient) {
      handleInputChange("title", `Actualización para cliente: ${selectedClient.name}`);
      handleInputChange("message", `Se ha registrado nueva información para el cliente ${selectedClient.name}.`);
    }
  };
  
  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    const selectedProgram = programs.find(p => p.id === programId);
    
    handleInputChange("related_program_id", programId);
    
    // Si el programa está seleccionado, actualizar mensaje para reflejar esto
    if (selectedProgram) {
      handleInputChange("message", `Se ha actualizado el programa "${selectedProgram.name}" asociado ${selectedClient ? 'al cliente seleccionado' : ''}.`);
    }
  };
  
  const handleActionUrlChange = (checked: boolean) => {
    setIncludeActionUrl(checked);
    
    if (checked) {
      if (selectedClient) {
        handleInputChange("action_url", `/clients/${selectedClient}`);
      } else if (selectedProgram) {
        handleInputChange("action_url", `/programs/${selectedProgram}`);
      } else {
        handleInputChange("action_url", "/dashboard");
      }
    } else {
      handleInputChange("action_url", null);
    }
  };
  
  const createTestReminder = () => {
    // Crear una notificación de tipo recordatorio
    const reminder: NotificationCreate = {
      user_id: userId,
      title: "Recordatorio: Actualización semanal pendiente",
      message: "Necesitas actualizar los datos de progreso de tus clientes esta semana.",
      type: "reminder",
      priority: "medium",
      related_client_id: null,
      related_program_id: null,
      related_data: null,
      action_url: "/progress"
    };
    
    sendNotification(reminder);
  };
  
  const createTestAlert = () => {
    // Crear una notificación de tipo alerta
    const alert: NotificationCreate = {
      user_id: userId,
      title: "¡Alerta! Cliente sin actividad",
      message: "Uno de tus clientes no ha reportado actividad en los últimos 7 días.",
      type: "alert",
      priority: "high",
      related_client_id: clients.length > 0 ? clients[0].id : null,
      related_program_id: null,
      related_data: null,
      action_url: clients.length > 0 ? `/clients/${clients[0].id}` : null
    };
    
    sendNotification(alert);
  };
  
  const createTestMilestone = () => {
    // Crear una notificación de tipo hito
    const milestone: NotificationCreate = {
      user_id: userId,
      title: "¡Felicidades! Meta alcanzada",
      message: "Un cliente ha alcanzado su meta de entrenamiento establecida.",
      type: "milestone",
      priority: "medium",
      related_client_id: clients.length > 0 ? clients[Math.floor(Math.random() * clients.length)].id : null,
      related_program_id: null,
      related_data: {
        goal: "Pérdida de peso",
        target: "5kg",
        achieved: "5.2kg",
        days: 30
      },
      action_url: "/dashboard"
    };
    
    sendNotification(milestone);
  };
  
  const sendNotification = async (notification: NotificationCreate) => {
    try {
      setLoading(true);
      const response = await brain.create_notification(notification);
      const data = await response.json();
      
      if (data.success) {
        toast.success("Notificación creada con éxito");
      } else {
        toast.error("Error al crear la notificación");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Error al crear la notificación");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification({
      ...notificationData,
      user_id: userId
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="container py-6">
        <Toaster richColors />
        
        <h1 className="text-3xl font-bold tracking-tight mb-6">Demo de Notificaciones</h1>
        
        <Tabs defaultValue="custom">
          <TabsList className="mb-4">
            <TabsTrigger value="custom">Notificación Personalizada</TabsTrigger>
            <TabsTrigger value="templates">Plantillas Rápidas</TabsTrigger>
            <TabsTrigger value="integration">Integración en el Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Crear Notificación Personalizada</CardTitle>
                <CardDescription>
                  Utiliza este formulario para crear y probar notificaciones personalizadas.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">ID de Usuario</Label>
                    <Input 
                      id="userId" 
                      value={userId} 
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Ingresa el ID del usuario"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title" 
                      value={notificationData.title} 
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Título de la notificación"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea 
                      id="message" 
                      value={notificationData.message} 
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Contenido del mensaje"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select 
                        value={notificationData.type} 
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Información</SelectItem>
                          <SelectItem value="alert">Alerta</SelectItem>
                          <SelectItem value="reminder">Recordatorio</SelectItem>
                          <SelectItem value="milestone">Hito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select 
                        value={notificationData.priority} 
                        onValueChange={(value) => handleInputChange("priority", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Cliente Relacionado</Label>
                    <Select 
                      value={selectedClient || ""} 
                      onValueChange={handleClientSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Programa Relacionado</Label>
                    <Select 
                      value={selectedProgram || ""} 
                      onValueChange={handleProgramSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un programa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {programs.map(program => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="actionUrl" 
                      checked={includeActionUrl}
                      onCheckedChange={handleActionUrlChange}
                    />
                    <label
                      htmlFor="actionUrl"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir URL de acción
                    </label>
                  </div>
                  
                  {includeActionUrl && (
                    <div className="space-y-2">
                      <Label htmlFor="actionUrl">URL de Acción</Label>
                      <Input 
                        id="actionUrlInput" 
                        value={notificationData.action_url || ""} 
                        onChange={(e) => handleInputChange("action_url", e.target.value)}
                        placeholder="URL para la acción"
                      />
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Crear Notificación"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Notificaciones</CardTitle>
                <CardDescription>
                  Genera notificaciones comunes con un solo clic para probar diferentes escenarios.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-amber-500">Recordatorio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Notificación de recordatorio para actualización semanal de datos.</p>
                      <Button 
                        onClick={createTestReminder}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Crear Recordatorio
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-500">Alerta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Notificación de alerta de alta prioridad sobre cliente inactivo.</p>
                      <Button 
                        onClick={createTestAlert}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Crear Alerta
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-500">Hito</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">Notificación de hito para celebrar el logro de un cliente.</p>
                      <Button 
                        onClick={createTestMilestone}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Crear Hito
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Integración en el Sistema</CardTitle>
                <CardDescription>
                  Guía para integrar notificaciones en otras partes del sistema.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Código para generar notificaciones</h3>
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
{`// Ejemplo en componente React
import brain from "brain";

const createNotification = async () => {
  try {
    const notification = {
      user_id: "user1",
      title: "Actualización importante",
      message: "Hay una nueva actualización disponible",
      type: "info", // info, alert, reminder, milestone
      priority: "medium" // low, medium, high, critical
    };
    
    const response = await brain.create_notification(notification);
    const data = await response.json();
    
    if (data.success) {
      console.log("Notificación enviada");
    }
  } catch (error) {
    console.error("Error al enviar notificación", error);
  }
};`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Eventos comunes para generar notificaciones</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Cuando un cliente alcanza un hito de progreso</li>
                    <li>Cuando se asigna un nuevo programa a un cliente</li>
                    <li>Cuando un cliente no ha registrado actividad por varios días</li>
                    <li>Recordatorios de tareas administrativas pendientes</li>
                    <li>Alertas sobre cambios importantes en los programas</li>
                    <li>Notificaciones de sistema sobre actualizaciones o mantenimiento</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Componentes disponibles</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">NotificationIndicator</code>: 
                      Componente para mostrar indicador de notificaciones en la barra de navegación
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">Página de Notificaciones</code>: 
                      Página completa para gestionar todas las notificaciones
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
