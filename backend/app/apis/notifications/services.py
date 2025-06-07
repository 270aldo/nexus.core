from datetime import datetime
import re
import uuid
from typing import Optional

import databutton as db

from .models import (
    NotificationCreate,
    Notification,
)


def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r"[^a-zA-Z0-9._-]", "", key)


def get_notifications_storage():
    """Get or initialize the notifications storage"""
    try:
        notifications = db.storage.json.get("notifications", default=None)
        if notifications is None:
            notifications = {
                "notifications": [],
                "last_updated": datetime.now().isoformat(),
            }
            db.storage.json.put("notifications", notifications)
        return notifications
    except Exception as e:
        print(f"Error getting notifications storage: {str(e)}")
        return {"notifications": [], "last_updated": datetime.now().isoformat()}


def save_notifications_storage(notifications_data):
    """Save notifications to storage"""
    if "notifications" in notifications_data:
        for notification in notifications_data["notifications"]:
            if isinstance(notification.get("created_at"), datetime):
                notification["created_at"] = notification["created_at"].isoformat()
            if isinstance(notification.get("read_at"), datetime):
                notification["read_at"] = notification["read_at"].isoformat()

    notifications_data["last_updated"] = datetime.now().isoformat()
    db.storage.json.put("notifications", notifications_data)


def create_notification(notification: NotificationCreate) -> Notification:
    notifications_data = get_notifications_storage()
    notifications_list = notifications_data.get("notifications", [])

    new_notification = Notification(
        **notification.dict(),
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        read=False,
        read_at=None,
    )

    notifications_list.append(new_notification.dict())
    notifications_data["notifications"] = notifications_list
    save_notifications_storage(notifications_data)
    return new_notification


def get_user_notifications(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    type: Optional[str] = None,
):
    notifications_data = get_notifications_storage()
    notifications_list = notifications_data.get("notifications", [])

    user_notifications = [n for n in notifications_list if n.get("user_id") == user_id]

    if unread_only:
        user_notifications = [n for n in user_notifications if not n.get("read", False)]

    if type is not None:
        user_notifications = [n for n in user_notifications if n.get("type") == type]

    user_notifications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {
        "notifications": user_notifications[offset : offset + limit],
        "total": len(user_notifications),
        "unread_count": len([n for n in user_notifications if not n.get("read", False)]),
    }


def mark_notification_read(notification_id: str):
    notifications_data = get_notifications_storage()
    notifications_list = notifications_data.get("notifications", [])

    for i, notification in enumerate(notifications_list):
        if notification.get("id") == notification_id:
            notifications_list[i]["read"] = True
            notifications_list[i]["read_at"] = datetime.now().isoformat()
            save_notifications_storage(notifications_data)
            return True
    return False


def mark_all_notifications_read(user_id: str) -> int:
    notifications_data = get_notifications_storage()
    notifications_list = notifications_data.get("notifications", [])

    count = 0
    current_time = datetime.now().isoformat()
    for i, notification in enumerate(notifications_list):
        if notification.get("user_id") == user_id and not notification.get("read", False):
            notifications_list[i]["read"] = True
            notifications_list[i]["read_at"] = current_time
            count += 1

    save_notifications_storage(notifications_data)
    return count


def delete_notification(notification_id: str) -> bool:
    notifications_data = get_notifications_storage()
    notifications_list = notifications_data.get("notifications", [])

    updated_list = []
    found = False
    for notification in notifications_list:
        if notification.get("id") != notification_id:
            updated_list.append(notification)
        else:
            found = True

    if not found:
        return False

    notifications_data["notifications"] = updated_list
    save_notifications_storage(notifications_data)
    return True
