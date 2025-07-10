"""
Domain Exceptions for NEXUS-CORE

Custom exceptions that represent business rule violations
and domain-specific error conditions.
"""

from .base import DomainException
from .client import ClientException, ClientNotFound, InvalidClientStatus

__all__ = [
    # Base
    "DomainException",
    
    # Client
    "ClientException",
    "ClientNotFound", 
    "InvalidClientStatus",
]