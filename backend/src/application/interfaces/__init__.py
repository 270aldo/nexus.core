"""
Application Layer Interfaces

These interfaces define contracts for external dependencies
used by the application layer use cases.
"""

from .repositories import IClientRepository, IProgramRepository, IProgressRepository
from .services import IEventPublisher, IEmailService, INotificationService
from .infrastructure import ILogger, IMetricsCollector, ICacheService
from .external import ISupabaseService

__all__ = [
    # Repository Interfaces (re-exported from domain)
    "IClientRepository",
    "IProgramRepository", 
    "IProgressRepository",
    
    # Service Interfaces
    "IEventPublisher",
    "IEmailService",
    "INotificationService",
    
    # Infrastructure Interfaces
    "ILogger",
    "IMetricsCollector",
    "ICacheService",
    
    # External Service Interfaces
    "ISupabaseService",
]