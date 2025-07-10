"""
Repository Interfaces for NEXUS-CORE Domain

Repository interfaces define the contract for data persistence
without coupling to specific implementation details.
"""

from .client_repository import IClientRepository
from .program_repository import IProgramRepository
from .progress_repository import IProgressRepository
from .user_repository import IUserRepository

__all__ = [
    "IClientRepository",
    "IProgramRepository", 
    "IProgressRepository",
    "IUserRepository",
]