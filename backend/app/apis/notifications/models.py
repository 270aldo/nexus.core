from datetime import datetime
from typing import Optional, Dict, Any, Literal

from pydantic import BaseModel, Field

class NotificationCreate(BaseModel):
    user_id: str = Field(..., description="ID of the user to notify")
    title: str = Field(..., description="Title of the notification")
    message: str = Field(..., description="Message content of the notification")
    type: Literal["info", "alert", "reminder", "milestone"] = Field(
        "info", description="Type of notification"
    )
    priority: Literal["low", "medium", "high", "critical"] = Field(
        "medium", description="Priority level"
    )
    related_client_id: Optional[str] = Field(
        None, description="ID of the related client if applicable"
    )
    related_program_id: Optional[str] = Field(
        None, description="ID of the related program if applicable"
    )
    related_data: Optional[Dict[str, Any]] = Field(
        None, description="Additional related data"
    )
    action_url: Optional[str] = Field(
        None, description="URL for action if applicable"
    )

class Notification(NotificationCreate):
    id: str = Field(..., description="Unique identifier for the notification")
    created_at: datetime = Field(..., description="When the notification was created")
    read: bool = Field(False, description="Whether the notification has been read")
    read_at: Optional[datetime] = Field(
        None, description="When the notification was read"
    )

class NotificationResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")
    data: Optional[Any] = Field(None, description="Response data")
    message: Optional[str] = Field(None, description="Response message")
