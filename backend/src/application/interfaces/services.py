"""
Service interfaces for application layer
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class IEventPublisher(ABC):
    """Interface for publishing domain events"""
    
    @abstractmethod
    async def publish(self, event: Dict[str, Any]) -> None:
        """
        Publish an event to the event bus.
        
        Args:
            event: Event data to publish
        """
        pass
    
    @abstractmethod
    async def publish_batch(self, events: List[Dict[str, Any]]) -> None:
        """
        Publish multiple events in a batch.
        
        Args:
            events: List of events to publish
        """
        pass


class IEmailService(ABC):
    """Interface for email services"""
    
    @abstractmethod
    async def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """
        Send an email.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            attachments: Email attachments (optional)
            
        Returns:
            True if email was sent successfully
        """
        pass
    
    @abstractmethod
    async def send_template_email(
        self,
        to: str,
        template_id: str,
        template_data: Dict[str, Any]
    ) -> bool:
        """
        Send an email using a template.
        
        Args:
            to: Recipient email address
            template_id: Email template identifier
            template_data: Data for template substitution
            
        Returns:
            True if email was sent successfully
        """
        pass


class INotificationService(ABC):
    """Interface for notification services"""
    
    @abstractmethod
    async def send_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "info",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send a notification to a user.
        
        Args:
            user_id: Target user identifier
            title: Notification title
            message: Notification message
            notification_type: Type of notification (info, warning, error, success)
            metadata: Additional notification metadata
            
        Returns:
            True if notification was sent successfully
        """
        pass
    
    @abstractmethod
    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send a push notification.
        
        Args:
            user_id: Target user identifier
            title: Notification title
            body: Notification body
            data: Additional data payload
            
        Returns:
            True if push notification was sent successfully
        """
        pass
    
    @abstractmethod
    async def get_user_notifications(
        self,
        user_id: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get notifications for a user.
        
        Args:
            user_id: User identifier
            limit: Maximum number of notifications
            offset: Offset for pagination
            unread_only: Return only unread notifications
            
        Returns:
            List of notification data
        """
        pass
    
    @abstractmethod
    async def mark_notification_read(self, notification_id: str) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: Notification identifier
            
        Returns:
            True if notification was marked as read
        """
        pass