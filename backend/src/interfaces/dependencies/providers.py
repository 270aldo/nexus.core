"""
FastAPI Dependency Providers

These functions provide dependencies for FastAPI endpoints using the
container pattern.
"""

from fastapi import Depends
from typing import Annotated

from .container import get_container, Container
from ...infrastructure.database import SupabaseClientRepository
from ...infrastructure.monitoring import Logger
from ...infrastructure.messaging import EventPublisher
from ...application.use_cases import (
    CreateClientUseCase,
    GetClientUseCase,
    UpdateClientUseCase,
    SearchClientsUseCase,
    GetClientAnalyticsUseCase
)


def get_container_dependency() -> Container:
    """Get the DI container"""
    return get_container()


# Infrastructure Dependencies

def get_client_repository(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> SupabaseClientRepository:
    """Get client repository dependency"""
    return container.client_repository()


def get_logger(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> Logger:
    """Get logger dependency"""
    return container.logger()


def get_event_publisher(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> EventPublisher:
    """Get event publisher dependency"""
    return container.event_publisher()


# Use Case Dependencies

def get_create_client_use_case(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> CreateClientUseCase:
    """Get create client use case dependency"""
    return container.create_client_use_case()


def get_get_client_use_case(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> GetClientUseCase:
    """Get client use case dependency"""
    return container.get_client_use_case()


def get_update_client_use_case(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> UpdateClientUseCase:
    """Get update client use case dependency"""
    return container.update_client_use_case()


def get_search_clients_use_case(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> SearchClientsUseCase:
    """Get search clients use case dependency"""
    return container.search_clients_use_case()


def get_client_analytics_use_case(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> GetClientAnalyticsUseCase:
    """Get client analytics use case dependency"""
    return container.get_client_analytics_use_case()


# Health Check Dependency

def get_health_status(
    container: Annotated[Container, Depends(get_container_dependency)]
) -> dict:
    """Get application health status"""
    return container.health_check()