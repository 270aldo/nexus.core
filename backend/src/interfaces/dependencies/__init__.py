"""
Dependency Injection Container for NEXUS-CORE

Handles the wiring of all dependencies throughout the application layers.
"""

from .container import Container, get_container
from .providers import (
    get_client_repository,
    get_create_client_use_case,
    get_get_client_use_case,
    get_update_client_use_case,
    get_search_clients_use_case,
    get_logger,
    get_event_publisher
)

__all__ = [
    "Container",
    "get_container",
    "get_client_repository",
    "get_create_client_use_case",
    "get_get_client_use_case", 
    "get_update_client_use_case",
    "get_search_clients_use_case",
    "get_logger",
    "get_event_publisher",
]