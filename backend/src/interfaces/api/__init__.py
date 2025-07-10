"""
API Interface Layer

FastAPI routers and controllers that expose the application functionality
through REST endpoints.
"""

from . import clients, health, mcp

__all__ = [
    "clients",
    "health", 
    "mcp",
]