import { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import brain from "brain";
import { NotificationsResponse, Notification } from "brain";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface NotificationIndicatorProps {
  userId: string;
}

const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="h-5 w-5" />;
    case "reminder":
      return <Bell className="h-5 w-5" />;
    case "milestone":
      return <CheckCircle2 className="h-5 w-5" />;
    case "info":
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationTypeStyle = (type: string) => {
  switch (type) {
    case "alert":
      return "bg-red-500";
    case "reminder":
      return "bg-amber-500";
    case "milestone":
      return "bg-green-500";
    case "info":
    default:
      return "bg-blue-500";
  }
};

const getNotificationPriorityStyle = (priority: string) => {
  switch (priority) {
    case "critical":
      return "text-red-500 font-bold";
    case "high":
      return "text-red-400";
    case "medium":
      return "text-amber-400";
    case "low":
    default:
      return "text-gray-400";
  }
};

export function NotificationIndicator({ userId }: NotificationIndicatorProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await brain.get_user_notifications({ user_id: userId, limit: 5, offset: 0, unread_only: false });
      const data: NotificationsResponse = await response.json();
      
      if (data.success && data.data) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Configurar un intervalo para actualizar las notificaciones cada minuto
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      const response = await brain.mark_notification_read({ notification_id: notificationId });
      const data = await response.json();
      
      if (data.success) {
        // Actualizar localmente para evitar tener que recargar
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true, read_at: new Date().toISOString() } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await brain.mark_all_notifications_read({ user_id: userId });
      const data = await response.json();
      
      if (data.success) {
        // Actualizar localmente
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ 
            ...notification, 
            read: true, 
            read_at: new Date().toISOString() 
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleViewAllNotifications = () => {
    setOpen(false);
    navigate("/Notifications");
  };

  const renderNotification = (notification: Notification) => {
    return (
      <div 
        key={notification.id} 
        className={`p-2 ${notification.read ? 'bg-background' : 'bg-muted/30'} rounded-md hover:bg-muted/50 transition-colors`}
        onClick={() => !notification.read && handleMarkRead(notification.id)}
      >
        <div className="flex items-start gap-2">
          <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationTypeStyle(notification.type)}`}></div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className={`text-sm font-medium ${notification.read ? '' : 'font-semibold'}`}>
                {notification.title}
              </h4>
              <span className="text-xs text-muted-foreground">
                {formatDistance(new Date(notification.created_at), new Date(), { 
                  addSuffix: true,
                  locale: es
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
            
            {notification.related_client_id && (
              <Badge 
                variant="outline" 
                className="mt-2 text-xs"
              >
                Cliente: {notification.related_client_id}
              </Badge>
            )}
            
            {/* Si hay una URL de acción, mostrar un botón */}
            {notification.action_url && (
              <Button 
                variant="link" 
                size="sm" 
                className="mt-1 p-0 h-auto text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = notification.action_url!;
                }}
              >
                Ver detalles
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationsPopover = () => {
    return (
      <PopoverContent className="w-[280px] md:w-80 max-h-[70vh] overflow-y-auto p-0" align="end">
        <div className="p-2 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleMarkAllRead}
              >
                Marcar todas
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-1">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3">
                <div className="flex items-start gap-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <>
              {notifications.map(renderNotification)}
            </>
          )}
        </div>
        
        <Separator />
        
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleViewAllNotifications}
          >
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      {renderNotificationsPopover()}
    </Popover>
  );
}
