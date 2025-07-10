"""
Data Transfer Objects for NEXUS-CORE Application Layer

DTOs are simple data containers used to transfer data between layers
without exposing internal domain entities.
"""

from .client_dto import (
    ClientDTO,
    ClientCreateDTO,
    ClientUpdateDTO, 
    ClientSearchResultDTO
)

from .program_dto import (
    ProgramDTO,
    ProgramCreateDTO,
    ExerciseDTO
)

from .progress_dto import (
    ProgressDTO,
    MeasurementDTO,
    ProgressSummaryDTO
)

from .analytics_dto import (
    AnalyticsDTO,
    MetricDTO,
    ReportDTO
)

__all__ = [
    # Client DTOs
    "ClientDTO",
    "ClientCreateDTO",
    "ClientUpdateDTO",
    "ClientSearchResultDTO",
    
    # Program DTOs  
    "ProgramDTO",
    "ProgramCreateDTO",
    "ExerciseDTO",
    
    # Progress DTOs
    "ProgressDTO", 
    "MeasurementDTO",
    "ProgressSummaryDTO",
    
    # Analytics DTOs
    "AnalyticsDTO",
    "MetricDTO", 
    "ReportDTO",
]