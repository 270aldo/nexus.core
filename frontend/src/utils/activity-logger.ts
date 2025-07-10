
import { toast } from "sonner";

/**
 * Utility function to log activities in the system
 * This provides a consistent way to log activities across the application
 * 
 * Supports standardized activity tracking with flexibility for different entity types
 * and custom details. Activities are persisted in the database and can be viewed in
 * the Activity Logs section of the admin panel.
 */
export async function logActivity({
  action,
  entityType,
  entityId,
  userId,
  details,
  showToast = false
}: {
  action: 'create' | 'update' | 'delete' | 'view' | 'assign' | 'login' | 'logout' | string;
  entityType: 'client' | 'program' | 'nutrition' | 'progress' | 'user' | 'system' | string;
  entityId?: string;
  userId?: string;
  details?: Record<string, any>;
  showToast?: boolean;
}) {
  try {
    const response = await brain.log_activity({
      action,
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      details
    });
    
    const data = await response.json();
    
    if (showToast && data.success) {
      toast.success(`Activity logged: ${action} ${entityType}`);
    }
    
    return data.success;
  } catch (error) {
    console.error('Error logging activity:', error);
    if (showToast) {
      toast.error('Failed to log activity');
    }
    return false;
  }
}

/**
 * Hook to create an activity logger with pre-configured entity type
 * Useful for components that deal with a specific entity type
 * 
 * Usage example:
 * ```typescript
 * const clientLogger = createActivityLogger('client', currentUser?.id);
 * 
 * // Then use it to log actions
 * clientLogger.create(newClient.id, { name: newClient.name });
 * clientLogger.update(clientId, { field: 'status', from: 'active', to: 'inactive' });
 * ```
 */
export function createActivityLogger(entityType: string, userId?: string) {
  return {
    log: (action: string, entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action,
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    },
    create: (entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action: 'create',
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    },
    update: (entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action: 'update',
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    },
    delete: (entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action: 'delete',
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    },
    view: (entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action: 'view',
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    },
    assign: (entityId?: string, details?: Record<string, any>, showToast = false) => {
      return logActivity({
        action: 'assign',
        entityType,
        entityId,
        userId,
        details,
        showToast
      });
    }
  };
}