"""
Base Domain Exception
"""

from typing import Dict, Any, Optional


class DomainException(Exception):
    """
    Base exception for all domain-related errors.
    
    This exception should be raised when business rules are violated
    or when domain invariants are not met.
    """
    
    def __init__(
        self, 
        message: str, 
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary representation"""
        return {
            "error_type": self.__class__.__name__,
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details
        }
    
    def __str__(self) -> str:
        return f"{self.error_code}: {self.message}"
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(message='{self.message}', error_code='{self.error_code}')"