"""
Program Domain Exceptions
"""

from .base import DomainException


class ProgramException(DomainException):
    """Base exception for program-related domain errors"""
    pass


class ProgramNotFound(ProgramException):
    """Raised when a program is not found"""
    
    def __init__(self, program_id: str):
        super().__init__(
            message=f"Program with ID '{program_id}' not found",
            error_code="PROGRAM_NOT_FOUND",
            details={"program_id": program_id}
        )


class InvalidProgramAssignment(ProgramException):
    """Raised when attempting an invalid program assignment"""
    
    def __init__(self, message: str, client_id: str = None, program_id: str = None):
        super().__init__(
            message=message,
            error_code="INVALID_PROGRAM_ASSIGNMENT",
            details={"client_id": client_id, "program_id": program_id}
        )