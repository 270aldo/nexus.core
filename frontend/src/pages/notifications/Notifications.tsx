import { useState, useEffect } from "react";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";


import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical, Bell, BellRing, BellOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Toaster } from "sonner";
import { toast } from "sonner";

// Constante para el ID de usuario - en producción esto vendría de la sesión del usuario
const USER_ID = "user1";

// Colores y estilos para los tipos de notificaciones
const notificationStyles = {
  info: {
    icon: <Bell className="h-5 w-5 text-blue-500" />,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-600",
  },
  alert: {
    icon: <BellRing className="h-5 w-5 text-red-500" />,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-600",
  },
  reminder: {
    icon: <Bell className="h-5 w-5 text-amber-500" />,
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-600",
  },
  milestone: {
    icon: <Bell className="h-5 w-5 text-green-500" />,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-600",
  },
};

const priorityLabels = {
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const priorityStyles = {
  critical: "bg-red-500 text-white",
  high: "bg-red-400 text-white",
  medium: "bg-amber-400 text-white",
  low: "bg-gray-400 text-white",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await brain.get_user_notifications({
        user_id: USER_ID,
        limit,
        offset,
        unread_only: activeTab === "unread",
      });
      
      const data: NotificationsResponse = await response.json();
      
      if (data.success && data.data) {
        setNotifications(data.data.notifications);
        setTotalCount(data.data.total);
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, offset]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOffset(0); // Reset pagination when changing tabs
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      const response = await brain.mark_notification_read({ notification_id: notificationId });
      const data = await response.json();
      
      if (data.success) {
        // Update locally to avoid refetching
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true, read_at: new Date().toISOString() } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success("Notificación marcada como leída");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Error al marcar la notificación como leída");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await brain.mark_all_notifications_read({ user_id: USER_ID });
      const data = await response.json();
      
      if (data.success) {
        // Update locally
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            read: true, 
            read_at: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
        toast.success("Todas las notificaciones marcadas como leídas");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Error al marcar todas las notificaciones como leídas");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await brain.delete_notification({ notification_id: notificationId });
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setTotalCount(prev => prev - 1);
        
        // Update unread count if the notification was unread
        const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success("Notificación eliminada");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Error al eliminar la notificación");
    }
  };

  const renderNotificationCard = (notification: Notification) => {
    const style = notificationStyles[notification.type as keyof typeof notificationStyles] || notificationStyles.info;
    const priorityStyle = priorityStyles[notification.priority as keyof typeof priorityStyles] || priorityStyles.medium;
    
    return (
      <Card 
        key={notification.id} 
        className={`mb-4 ${notification.read ? '' : `border-l-4 ${style.borderColor}`} transition-all hover:shadow-md`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${style.bgColor}`}>
                {style.icon}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-semibold ${notification.read ? '' : style.textColor}`}>
                    {notification.title}
                  </h3>
                  <Badge className={priorityStyle}>
                    {priorityLabels[notification.priority as keyof typeof priorityLabels]}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                
                <div className="flex gap-2 mt-2 flex-wrap">
                  {notification.related_client_id && (
                    <Badge variant="outline" className="text-xs">
                      Cliente: {notification.related_client_id}
                    </Badge>
                  )}
                  
                  {notification.related_program_id && (
                    <Badge variant="outline" className="text-xs">
                      Programa: {notification.related_program_id}
                    </Badge>
                  )}
                  
                  {notification.action_url && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto text-xs"
                      onClick={() => window.location.href = notification.action_url!}
                    >
                      Ver detalles
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Recibido: {format(new Date(notification.created_at), "PPpp", { locale: es })}
                  {notification.read && notification.read_at && (
                    <span className="ml-2">
                      · Leído: {format(new Date(notification.read_at), "PPpp", { locale: es })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.read && (
                  <DropdownMenuItem onClick={() => handleMarkRead(notification.id)}>
                    Marcar como leída
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDeleteNotification(notification.id)} className="text-red-600">
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container py-6">
      <Toaster richColors />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificaciones sin leer`
              : "No tienes notificaciones sin leer"}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead}>
            Marcar todas como leídas
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídas ({unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div>
        {loading ? (
          renderSkeletons()
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <BellOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all" 
                    ? "No tienes notificaciones en este momento" 
                    : "No tienes notificaciones sin leer"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {notifications.map(renderNotificationCard)}
            
            {/* Paginación simple */}
            {totalCount > limit && (
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  disabled={offset === 0}
                  onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                >
                  Anterior
                </Button>
                
                <span className="self-center text-sm text-muted-foreground">
                  Mostrando {offset + 1}-{Math.min(offset + limit, totalCount)} de {totalCount}
                </span>
                
                <Button 
                  variant="outline" 
                  disabled={offset + limit >= totalCount}
                  onClick={() => setOffset(prev => prev + limit)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
