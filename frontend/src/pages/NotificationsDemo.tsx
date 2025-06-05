import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import brain from 'brain';
import { NotificationCreate } from 'brain';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from 'components/ProtectedRoute';

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
  const [userId, setUserId] = useState('user1');
  const [notificationData, setNotificationData] = useState<NotificationCreate>({
    user_id: 'user1',
    title: 'New program update',
    message: 'A program assigned to one of your clients has been updated.',
    type: 'info',
    priority: 'medium',
    related_client_id: null,
    related_program_id: null,
    related_data: null,
    action_url: null,
  });

  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [includeActionUrl, setIncludeActionUrl] = useState(false);

  useEffect(() => {
    // Load client list for the demo
    const loadClients = async () => {
      try {
        const response = await brain.search_clients({ limit: 10 });
        const data = await response.json();

        if (data && data.clients) {
          setClients(
            data.clients.map((client: any) => ({
              id: client.id,
              name: client.name,
              type: client.type,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    // Load program list for the demo
    const loadPrograms = async () => {
      try {
        const response = await brain.get_training_templates({ limit: 10 });
        const data = await response.json();

        if (data && data.programs) {
          setPrograms(
            data.programs.map((program: any) => ({
              id: program.id || `program-${Math.floor(Math.random() * 1000)}`,
              name: program.name,
              type: program.type,
            }))
          );
        } else {
          // If there are no real programs create some demo ones
          setPrograms([
            {
              id: 'program-1',
              name: 'Basic Strength Training',
              type: 'strength',
            },
            {
              id: 'program-2',
              name: 'Advanced Weight Loss',
              type: 'weight_loss',
            },
            {
              id: 'program-3',
              name: 'Rehabilitation Program',
              type: 'rehabilitation',
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading programs:', error);
        // On error create some demo ones
        setPrograms([
          {
            id: 'program-1',
            name: 'Basic Strength Training',
            type: 'strength',
          },
          {
            id: 'program-2',
            name: 'Advanced Weight Loss',
            type: 'weight_loss',
          },
          {
            id: 'program-3',
            name: 'Rehabilitation Program',
            type: 'rehabilitation',
          },
        ]);
      }
    };

    loadClients();
    loadPrograms();
  }, []);

  const handleInputChange = (field: keyof NotificationCreate, value: any) => {
    setNotificationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    const selectedClient = clients.find((c) => c.id === clientId);

    handleInputChange('related_client_id', clientId);

    // If a client is selected update message and title accordingly
    if (selectedClient) {
      handleInputChange('title', `Update for client: ${selectedClient.name}`);
      handleInputChange(
        'message',
        `New information has been recorded for client ${selectedClient.name}.`
      );
    }
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    const selectedProgram = programs.find((p) => p.id === programId);

    handleInputChange('related_program_id', programId);

    // If a program is selected update the message accordingly
    if (selectedProgram) {
      handleInputChange(
        'message',
        `Program "${selectedProgram.name}" has been updated${selectedClient ? ' for the selected client' : ''}.`
      );
    }
  };

  const handleActionUrlChange = (checked: boolean) => {
    setIncludeActionUrl(checked);

    if (checked) {
      if (selectedClient) {
        handleInputChange('action_url', `/clients/${selectedClient}`);
      } else if (selectedProgram) {
        handleInputChange('action_url', `/programs/${selectedProgram}`);
      } else {
        handleInputChange('action_url', '/dashboard');
      }
    } else {
      handleInputChange('action_url', null);
    }
  };

  const createTestReminder = () => {
    // Create a reminder notification
    const reminder: NotificationCreate = {
      user_id: userId,
      title: 'Reminder: Weekly update pending',
      message: "You need to update your clients' progress data this week.",
      type: 'reminder',
      priority: 'medium',
      related_client_id: null,
      related_program_id: null,
      related_data: null,
      action_url: '/progress',
    };

    sendNotification(reminder);
  };

  const createTestAlert = () => {
    // Create an alert notification
    const alert: NotificationCreate = {
      user_id: userId,
      title: 'Alert! Inactive client',
      message:
        'One of your clients has not reported activity in the last 7 days.',
      type: 'alert',
      priority: 'high',
      related_client_id: clients.length > 0 ? clients[0].id : null,
      related_program_id: null,
      related_data: null,
      action_url: clients.length > 0 ? `/clients/${clients[0].id}` : null,
    };

    sendNotification(alert);
  };

  const createTestMilestone = () => {
    // Create a milestone notification
    const milestone: NotificationCreate = {
      user_id: userId,
      title: 'Congratulations! Goal achieved',
      message: 'A client has reached their training goal.',
      type: 'milestone',
      priority: 'medium',
      related_client_id:
        clients.length > 0
          ? clients[Math.floor(Math.random() * clients.length)].id
          : null,
      related_program_id: null,
      related_data: {
        goal: 'Weight loss',
        target: '5kg',
        achieved: '5.2kg',
        days: 30,
      },
      action_url: '/dashboard',
    };

    sendNotification(milestone);
  };

  const sendNotification = async (notification: NotificationCreate) => {
    try {
      setLoading(true);
      const response = await brain.create_notification(notification);
      const data = await response.json();

      if (data.success) {
        toast.success('Notification created successfully');
      } else {
        toast.error('Error creating notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error creating notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification({
      ...notificationData,
      user_id: userId,
    });
  };

  return (
    <ProtectedRoute>
      <div className="container py-6">
        <Toaster richColors />

        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Notifications Demo
        </h1>

        <Tabs defaultValue="custom">
          <TabsList className="mb-4">
            <TabsTrigger value="custom">Custom Notification</TabsTrigger>
            <TabsTrigger value="templates">Quick Templates</TabsTrigger>
            <TabsTrigger value="integration">System Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Notification</CardTitle>
                <CardDescription>
                  Use this form to create and test custom notifications.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter the user ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationData.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      placeholder="Notification title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={notificationData.message}
                      onChange={(e) =>
                        handleInputChange('message', e.target.value)
                      }
                      placeholder="Message content"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={notificationData.type}
                        onValueChange={(value) =>
                          handleInputChange('type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={notificationData.priority}
                        onValueChange={(value) =>
                          handleInputChange('priority', value as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Related Client</Label>
                    <Select
                      value={selectedClient || ''}
                      onValueChange={handleClientSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Related Program</Label>
                    <Select
                      value={selectedProgram || ''}
                      onValueChange={handleProgramSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {programs.map((program) => (
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
                      Include action URL
                    </label>
                  </div>

                  {includeActionUrl && (
                    <div className="space-y-2">
                      <Label htmlFor="actionUrl">Action URL</Label>
                      <Input
                        id="actionUrlInput"
                        value={notificationData.action_url || ''}
                        onChange={(e) =>
                          handleInputChange('action_url', e.target.value)
                        }
                        placeholder="URL for the action"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Create Notification'}
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
                  Genera notificaciones comunes con un solo clic para probar
                  diferentes escenarios.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-amber-500">
                        Recordatorio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Reminder notification for weekly data update.
                      </p>
                      <Button
                        onClick={createTestReminder}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Create Reminder
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-500">Alerta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        High priority alert notification for an inactive client.
                      </p>
                      <Button
                        onClick={createTestAlert}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Create Alert
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-500">Hito</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">
                        Milestone notification to celebrate a client's
                        achievement.
                      </p>
                      <Button
                        onClick={createTestMilestone}
                        variant="outline"
                        className="w-full"
                        disabled={loading}
                      >
                        Create Milestone
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
                <CardTitle>System Integration</CardTitle>
                <CardDescription>
                  Guide to integrate notifications into other parts of the
                  system.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Code to generate notifications
                  </h3>
                  <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                    {`// Example in a React component
import brain from "brain";

const createNotification = async () => {
  try {
    const notification = {
      user_id: "user1",
      title: "Important update",
      message: "There is a new update available",
      type: "info", // info, alert, reminder, milestone
      priority: "medium" // low, medium, high, critical
    };
    
    const response = await brain.create_notification(notification);
    const data = await response.json();
    
    if (data.success) {
      console.log("Notification sent");
    }
  } catch (error) {
    console.error("Error sending notification", error);
  }
};`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Common events for generating notifications
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>When a client reaches a progress milestone</li>
                    <li>When a new program is assigned to a client</li>
                    <li>
                      When a client has not logged activity for several days
                    </li>
                    <li>Reminders for pending administrative tasks</li>
                    <li>Alerts about important program changes</li>
                    <li>System notifications about updates or maintenance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Available components
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">
                        NotificationIndicator
                      </code>
                      : Component to show a notification indicator in the
                      navigation bar
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded">
                        NotificationsPage
                      </code>
                      : Full page to manage all notifications
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
