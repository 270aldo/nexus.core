"""
Client-specific Domain Exceptions
"""

from typing import Dict, Any, Optional
from .base import DomainException


class ClientException(DomainException):
    """Base exception for client-related errors"""
    pass


class ClientNotFound(ClientException):
    """Raised when a client cannot be found"""
    
    def __init__(self, client_id: str, details: Optional[Dict[str, Any]] = None):
        message = f"Client not found: {client_id}"
        super().__init__(
            message=message,
            error_code="CLIENT_NOT_FOUND",
            details={"client_id": client_id, **(details or {})}
        )


class InvalidClientStatus(ClientException):
    """Raised when trying to perform an operation invalid for current client status"""
    
    def __init__(
        self, 
        current_status: str, 
        operation: str, 
        valid_statuses: list[str] = None
    ):
        message = f"Cannot perform '{operation}' on client with status '{current_status}'"
        if valid_statuses:
            message += f". Valid statuses: {', '.join(valid_statuses)}"
        
        super().__init__(
            message=message,
            error_code="INVALID_CLIENT_STATUS",
            details={
                "current_status": current_status,
                "operation": operation,
                "valid_statuses": valid_statuses or []
            }
        )


class ClientAlreadyExists(ClientException):
    """Raised when trying to create a client that already exists"""
    
    def __init__(self, email: str):
        message = f"Client with email '{email}' already exists"
        super().__init__(
            message=message,
            error_code="CLIENT_ALREADY_EXISTS",
            details={"email": email}
        )


class InvalidClientData(ClientException):
    """Raised when client data violates business rules"""
    
    def __init__(self, field: str, value: Any, reason: str):
        message = f"Invalid {field}: {reason}"
        super().__init__(
            message=message,
            error_code="INVALID_CLIENT_DATA",
            details={
                "field": field,
                "value": str(value),
                "reason": reason
            }
        )