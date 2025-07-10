"""
Progress Domain Exceptions
"""

from .base import DomainException


class ProgressException(DomainException):
    """Base exception for progress-related domain errors"""
    pass


class InvalidMeasurement(ProgressException):
    """Raised when a measurement is invalid"""
    
    def __init__(self, message: str, measurement_type: str = None, value: str = None):
        super().__init__(
            message=message,
            error_code="INVALID_MEASUREMENT",
            details={"measurement_type": measurement_type, "value": value}
        )