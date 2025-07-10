"""
Repository interfaces for application layer

Re-exports domain repository interfaces for use in application layer.
"""

# Re-export domain repository interfaces
from ...domain.repositories import (
    IClientRepository,
    IProgramRepository,
    IProgressRepository,
    IUserRepository
)

__all__ = [
    "IClientRepository",
    "IProgramRepository", 
    "IProgressRepository",
    "IUserRepository",
]