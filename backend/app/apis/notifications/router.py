from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from .models import NotificationCreate, NotificationResponse
from . import services

router = APIRouter()


@router.post("/notifications", response_model=NotificationResponse)
def create_notification(notification: NotificationCreate):
    try:
        new_notification = services.create_notification(notification)
        return NotificationResponse(
            success=True,
            data=new_notification,
            message="Notification created successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notifications/user/{user_id}", response_model=NotificationResponse)
def get_user_notifications(
    user_id: str,
    limit: int = Query(20, ge=1, le=100, description="Maximum number of notifications to return"),
    offset: int = Query(0, ge=0, description="Number of notifications to skip"),
    unread_only: bool = Query(False, description="Whether to return only unread notifications"),
    type: Optional[str] = Query(None, description="Filter by notification type"),
):
    try:
        data = services.get_user_notifications(user_id, limit, offset, unread_only, type)
        return NotificationResponse(
            success=True,
            data=data,
            message=f"Retrieved {len(data['notifications'])} notifications for user {user_id}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: str):
    try:
        updated = services.mark_notification_read(notification_id)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Notification with ID {notification_id} not found")
        return NotificationResponse(success=True, message=f"Notification {notification_id} marked as read")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/notifications/user/{user_id}/read-all", response_model=NotificationResponse)
def mark_all_notifications_read(user_id: str):
    try:
        count = services.mark_all_notifications_read(user_id)
        return NotificationResponse(success=True, message=f"Marked {count} notifications as read for user {user_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/notifications/{notification_id}", response_model=NotificationResponse)
def delete_notification(notification_id: str):
    try:
        deleted = services.delete_notification(notification_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Notification with ID {notification_id} not found")
        return NotificationResponse(success=True, message=f"Notification {notification_id} deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
