"""
Dependency Injection Container
"""

import os
from typing import Dict, Any
from functools import lru_cache

from ...infrastructure.database import SupabaseConnection, SupabaseClientRepository
from ...infrastructure.monitoring import Logger, ConsoleLogger
from ...infrastructure.messaging import EventPublisher, InMemoryEventPublisher

from ...application.use_cases import (
    CreateClientUseCase,
    GetClientUseCase,
    UpdateClientUseCase,
    SearchClientsUseCase,
    GetClientAnalyticsUseCase
)


class Container:
    """
    Dependency Injection Container for NEXUS-CORE.
    
    Manages the creation and lifecycle of all application dependencies.
    Uses singleton pattern to ensure single instances of services.
    """
    
    def __init__(self):
        self._instances: Dict[str, Any] = {}
        self._config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load application configuration"""
        return {
            "supabase": {
                "url": os.getenv("SUPABASE_URL"),
                "service_key": os.getenv("SUPABASE_SERVICE_KEY")
            },
            "logging": {
                "level": os.getenv("LOG_LEVEL", "INFO"),
                "format": os.getenv("LOG_FORMAT", "json")
            },
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    
    def _get_or_create(self, key: str, factory_func):
        """Get existing instance or create new one"""
        if key not in self._instances:
            self._instances[key] = factory_func()
        return self._instances[key]
    
    # Infrastructure Layer
    
    def supabase_connection(self) -> SupabaseConnection:
        """Get Supabase database connection"""
        return self._get_or_create(
            "supabase_connection",
            lambda: SupabaseConnection(
                url=self._config["supabase"]["url"],
                key=self._config["supabase"]["service_key"]
            )
        )
    
    def logger(self) -> Logger:
        """Get logger instance"""
        return self._get_or_create(
            "logger",
            lambda: ConsoleLogger(
                level=self._config["logging"]["level"],
                format=self._config["logging"]["format"]
            )
        )
    
    def event_publisher(self) -> EventPublisher:
        """Get event publisher instance"""
        return self._get_or_create(
            "event_publisher",
            lambda: InMemoryEventPublisher(logger=self.logger())
        )
    
    # Repository Layer
    
    def client_repository(self) -> SupabaseClientRepository:
        """Get client repository instance"""
        return self._get_or_create(
            "client_repository",
            lambda: SupabaseClientRepository(connection=self.supabase_connection())
        )
    
    # Use Case Layer
    
    def create_client_use_case(self) -> CreateClientUseCase:
        """Get create client use case"""
        return self._get_or_create(
            "create_client_use_case",
            lambda: CreateClientUseCase(
                client_repository=self.client_repository(),
                event_publisher=self.event_publisher(),
                logger=self.logger()
            )
        )
    
    def get_client_use_case(self) -> GetClientUseCase:
        """Get client use case"""
        return self._get_or_create(
            "get_client_use_case",
            lambda: GetClientUseCase(
                client_repository=self.client_repository()
            )
        )
    
    def update_client_use_case(self) -> UpdateClientUseCase:
        """Get update client use case"""
        return self._get_or_create(
            "update_client_use_case",
            lambda: UpdateClientUseCase(
                client_repository=self.client_repository(),
                event_publisher=self.event_publisher(),
                logger=self.logger()
            )
        )
    
    def search_clients_use_case(self) -> SearchClientsUseCase:
        """Get search clients use case"""
        return self._get_or_create(
            "search_clients_use_case",
            lambda: SearchClientsUseCase(
                client_repository=self.client_repository()
            )
        )
    
    def get_client_analytics_use_case(self) -> GetClientAnalyticsUseCase:
        """Get client analytics use case"""
        return self._get_or_create(
            "get_client_analytics_use_case", 
            lambda: GetClientAnalyticsUseCase(
                client_repository=self.client_repository()
            )
        )
    
    def reset(self):
        """Reset all instances (useful for testing)"""
        self._instances.clear()
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on all services"""
        health_status = {
            "container": "healthy",
            "services": {}
        }
        
        try:
            # Check database connection
            db_connection = self.supabase_connection()
            health_status["services"]["database"] = "healthy" if db_connection else "unhealthy"
            
            # Check logger
            logger = self.logger()
            health_status["services"]["logger"] = "healthy" if logger else "unhealthy"
            
            # Overall status
            all_healthy = all(
                status == "healthy" 
                for status in health_status["services"].values()
            )
            health_status["container"] = "healthy" if all_healthy else "degraded"
            
        except Exception as e:
            health_status["container"] = "unhealthy"
            health_status["error"] = str(e)
        
        return health_status


# Global container instance
_container: Container = None


@lru_cache(maxsize=1)
def get_container() -> Container:
    """Get the global container instance"""
    global _container
    if _container is None:
        _container = Container()
    return _container


def reset_container():
    """Reset the global container (useful for testing)"""
    global _container
    if _container is not None:
        _container.reset()
    _container = None
    get_container.cache_clear()