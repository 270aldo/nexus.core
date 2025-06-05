from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
import uuid
import re
import databutton as db
from app.logger import get_logger

# Create Notifications router
router = APIRouter()
logger = get_logger(__name__)

# Helper function for sanitizing storage keys
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# ======== Models ========

class NotificationCreate(BaseModel):
    user_id: str = Field(..., description="ID of the user to notify")
    title: str = Field(..., description="Title of the notification")
    message: str = Field(..., description="Message content of the notification")
    type: Literal["info", "alert", "reminder", "milestone"] = Field("info", description="Type of notification")
    priority: Literal["low", "medium", "high", "critical"] = Field("medium", description="Priority level")
    related_client_id: Optional[str] = Field(None, description="ID of the related client if applicable")
    related_program_id: Optional[str] = Field(None, description="ID of the related program if applicable")
    related_data: Optional[Dict[str, Any]] = Field(None, description="Additional related data")
    action_url: Optional[str] = Field(None, description="URL for action if applicable")

class Notification(NotificationCreate):
    id: str = Field(..., description="Unique identifier for the notification")
    created_at: datetime = Field(..., description="When the notification was created")
    read: bool = Field(False, description="Whether the notification has been read")
    read_at: Optional[datetime] = Field(None, description="When the notification was read")

class NotificationResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")
    data: Optional[Any] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Response message")

# ======== Helper Functions ========

def get_notifications_storage():
    """Get or initialize the notifications storage"""
    try:
        notifications = db.storage.json.get("notifications", default=None)
        if notifications is None:
            notifications = {
                "notifications": [],
                "last_updated": datetime.now().isoformat()
            }
            db.storage.json.put("notifications", notifications)
        return notifications
    except Exception as e:
        logger.error("Error getting notifications storage: %s", e)
        return {"notifications": [], "last_updated": datetime.now().isoformat()}

def save_notifications_storage(notifications_data):
    """Save notifications to storage"""
    # Convert datetime objects to isoformat strings before storage
    if "notifications" in notifications_data:
        for notification in notifications_data["notifications"]:
            if isinstance(notification.get("created_at"), datetime):
                notification["created_at"] = notification["created_at"].isoformat()
            if isinstance(notification.get("read_at"), datetime):
                notification["read_at"] = notification["read_at"].isoformat()
    
    notifications_data["last_updated"] = datetime.now().isoformat()
    db.storage.json.put("notifications", notifications_data)

# ======== Endpoints ========

@router.post("/notifications", response_model=NotificationResponse)
def create_notification(notification: NotificationCreate):
    """Create a new notification for a user
    
    This endpoint allows creating notifications for important user events like:
    - Reminders for upcoming client appointments
    - Alerts for missed training sessions
    - Milestone notifications for client achievements
    - System alerts about program changes
    """
    try:
        # Get current notifications
        notifications_data = get_notifications_storage()
        notifications_list = notifications_data.get("notifications", [])
        
        # Create new notification
        new_notification = Notification(
            **notification.dict(),
            id=str(uuid.uuid4()),
            created_at=datetime.now(),
            read=False,
            read_at=None
        )
        
        # Add to list
        notifications_list.append(new_notification.dict())
        notifications_data["notifications"] = notifications_list
        
        # Save to storage
        save_notifications_storage(notifications_data)
        
        return NotificationResponse(
            success=True,
            data=new_notification,
            message="Notification created successfully"
        )
    except Exception as e:
        logger.exception("Error creating notification: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/user/{user_id}", response_model=NotificationResponse)
def get_user_notifications(
    user_id: str,
    limit: int = Query(20, ge=1, le=100, description="Maximum number of notifications to return"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    unread_only: bool = Query(False, description="Whether to return only unread notifications"),
    type: Optional[str] = Query(None, description="Filter by notification type")
):
    """Get notifications for a specific user
    
    Retrieves a list of notifications for the specified user, with options to filter and paginate.
    """
    try:
        # Get current notifications
        notifications_data = get_notifications_storage()
        notifications_list = notifications_data.get("notifications", [])
        
        # Filter by user_id
        user_notifications = [n for n in notifications_list if n.get("user_id") == user_id]
        
        # Filter by read status if needed
        if unread_only:
            user_notifications = [n for n in user_notifications if not n.get("read", False)]
        
        # Filter by type if provided
        if type is not None:
            user_notifications = [n for n in user_notifications if n.get("type") == type]
        
        # Sort by created_at (newest first)
        user_notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Apply pagination
        paginated_notifications = user_notifications[offset:offset + limit]
        
        return NotificationResponse(
            success=True,
            data={
                "notifications": paginated_notifications,
                "total": len(user_notifications),
                "unread_count": len([n for n in user_notifications if not n.get("read", False)])
            },
            message=f"Retrieved {len(paginated_notifications)} notifications for user {user_id}"
        )
    except Exception as e:
        logger.exception("Error getting user notifications: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: str):
    """Mark a notification as read
    
    Updates the read status of a notification to indicate it has been seen by the user.
    """
    try:
        # Get current notifications
        notifications_data = get_notifications_storage()
        notifications_list = notifications_data.get("notifications", [])
        
        # Find notification by ID
        notification_found = False
        for i, notification in enumerate(notifications_list):
            if notification.get("id") == notification_id:
                # Update read status
                notifications_list[i]["read"] = True
                notifications_list[i]["read_at"] = datetime.now().isoformat()
                notification_found = True
                break
        
        if not notification_found:
            raise HTTPException(status_code=404, detail=f"Notification with ID {notification_id} not found")
        
        # Save updated notifications
        notifications_data["notifications"] = notifications_list
        save_notifications_storage(notifications_data)
        
        return NotificationResponse(
            success=True,
            message=f"Notification {notification_id} marked as read"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error marking notification as read: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/notifications/user/{user_id}/read-all", response_model=NotificationResponse)
def mark_all_notifications_read(user_id: str):
    """Mark all notifications for a user as read
    
    Updates all unread notifications for the specified user to be marked as read.
    """
    try:
        # Get current notifications
        notifications_data = get_notifications_storage()
        notifications_list = notifications_data.get("notifications", [])
        
        # Find and update notifications for this user
        count = 0
        current_time = datetime.now().isoformat()
        for i, notification in enumerate(notifications_list):
            if notification.get("user_id") == user_id and not notification.get("read", False):
                notifications_list[i]["read"] = True
                notifications_list[i]["read_at"] = current_time
                count += 1
        
        # Save updated notifications
        notifications_data["notifications"] = notifications_list
        save_notifications_storage(notifications_data)
        
        return NotificationResponse(
            success=True,
            message=f"Marked {count} notifications as read for user {user_id}"
        )
    except Exception as e:
        logger.exception("Error marking all notifications as read: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/notifications/{notification_id}", response_model=NotificationResponse)
def delete_notification(notification_id: str):
    """Delete a specific notification
    
    Permanently removes a notification from the system.
    """
    try:
        # Get current notifications
        notifications_data = get_notifications_storage()
        notifications_list = notifications_data.get("notifications", [])
        
        # Find notification by ID
        notification_found = False
        updated_list = []
        for notification in notifications_list:
            if notification.get("id") != notification_id:
                updated_list.append(notification)
            else:
                notification_found = True
        
        if not notification_found:
            raise HTTPException(status_code=404, detail=f"Notification with ID {notification_id} not found")
        
        # Save updated notifications
        notifications_data["notifications"] = updated_list
        save_notifications_storage(notifications_data)
        
        return NotificationResponse(
            success=True,
            message=f"Notification {notification_id} deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting notification: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
