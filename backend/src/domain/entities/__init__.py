"""
Domain Entities for NEXUS-CORE

This module contains the core business entities that represent the essential
concepts in the NGX Performance & Longevity domain.
"""

from .client import Client, ClientId, ClientStatus, ProgramType
from .program import Program, ProgramId, Exercise, ExerciseType
from .progress import Progress, ProgressId, Measurement, MeasurementType
from .user import User, UserId, UserRole

__all__ = [
    # Client
    "Client",
    "ClientId", 
    "ClientStatus",
    "ProgramType",
    
    # Program
    "Program",
    "ProgramId",
    "Exercise",
    "ExerciseType",
    
    # Progress
    "Progress",
    "ProgressId",
    "Measurement",
    "MeasurementType",
    
    # User
    "User",
    "UserId",
    "UserRole",
]