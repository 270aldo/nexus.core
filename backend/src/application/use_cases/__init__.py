"""
Use Cases for NEXUS-CORE Application Layer

Use cases represent the application-specific business rules and orchestrate
the flow of data to and from the entities.
"""

from .client import (
    CreateClientUseCase,
    GetClientUseCase, 
    UpdateClientUseCase,
    DeleteClientUseCase,
    SearchClientsUseCase,
    GetClientAnalyticsUseCase
)

from .mcp import (
    MCPSearchClientsUseCase,
    MCPGetClientUseCase,
    MCPGetAnalyticsUseCase,
    MCPCreateReportUseCase
)

__all__ = [
    # Client Use Cases
    "CreateClientUseCase",
    "GetClientUseCase",
    "UpdateClientUseCase", 
    "DeleteClientUseCase",
    "SearchClientsUseCase",
    "GetClientAnalyticsUseCase",
    
    # MCP Use Cases
    "MCPSearchClientsUseCase",
    "MCPGetClientUseCase",
    "MCPGetAnalyticsUseCase", 
    "MCPCreateReportUseCase",
]