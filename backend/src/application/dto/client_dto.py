"""
Client Data Transfer Objects
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

from ...domain.entities import Client


@dataclass
class ClientDTO:
    """
    Data Transfer Object for Client entity.
    
    Used to transfer client data between application layers
    without exposing domain entity internals.
    """
    
    id: str
    name: str
    email: str
    phone: Optional[str]
    program_type: str
    status: str
    created_at: str
    updated_at: str
    notes: str
    metadata: Dict[str, Any]
    is_active: bool
    program_duration_days: int
    
    @classmethod
    def from_entity(cls, client: Client) -> "ClientDTO":
        """Create DTO from domain entity"""
        return cls(
            id=str(client.id),
            name=client.name,
            email=str(client.email),
            phone=str(client.phone) if client.phone else None,
            program_type=client.program_type.value,
            status=client.status.value,
            created_at=client.created_at.isoformat(),
            updated_at=client.updated_at.isoformat(),
            notes=client.notes,
            metadata=client.metadata,
            is_active=client.is_active(),
            program_duration_days=client.get_program_duration()
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "program_type": self.program_type,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "notes": self.notes,
            "metadata": self.metadata,
            "is_active": self.is_active,
            "program_duration_days": self.program_duration_days
        }


@dataclass
class ClientCreateDTO:
    """DTO for creating a new client"""
    
    name: str
    email: str
    program_type: str
    phone: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    
    def validate(self) -> None:
        """Validate DTO data"""
        if not self.name or not self.name.strip():
            raise ValueError("Name is required")
        
        if not self.email or not self.email.strip():
            raise ValueError("Email is required")
        
        if not self.program_type:
            raise ValueError("Program type is required")
        
        valid_program_types = ["PRIME", "LONGEVITY", "HYBRID"]
        if self.program_type not in valid_program_types:
            raise ValueError(f"Program type must be one of: {valid_program_types}")
        
        if self.status:
            valid_statuses = ["active", "inactive", "paused", "trial", "cancelled"]
            if self.status not in valid_statuses:
                raise ValueError(f"Status must be one of: {valid_statuses}")


@dataclass  
class ClientUpdateDTO:
    """DTO for updating an existing client"""
    
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    program_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    
    def validate(self) -> None:
        """Validate DTO data"""
        if self.name is not None and (not self.name or not self.name.strip()):
            raise ValueError("Name cannot be empty")
        
        if self.email is not None and (not self.email or not self.email.strip()):
            raise ValueError("Email cannot be empty")
        
        if self.program_type is not None:
            valid_program_types = ["PRIME", "LONGEVITY", "HYBRID"]
            if self.program_type not in valid_program_types:
                raise ValueError(f"Program type must be one of: {valid_program_types}")
        
        if self.status is not None:
            valid_statuses = ["active", "inactive", "paused", "trial", "cancelled"]
            if self.status not in valid_statuses:
                raise ValueError(f"Status must be one of: {valid_statuses}")


@dataclass
class ClientSearchResultDTO:
    """DTO for client search results with pagination"""
    
    clients: List[ClientDTO]
    total_count: int
    limit: Optional[int]
    offset: int
    
    @property
    def has_more(self) -> bool:
        """Check if there are more results available"""
        if self.limit is None:
            return False
        return self.offset + len(self.clients) < self.total_count
    
    @property
    def current_page(self) -> int:
        """Calculate current page number (1-based)"""
        if self.limit is None or self.limit == 0:
            return 1
        return (self.offset // self.limit) + 1
    
    @property
    def total_pages(self) -> int:
        """Calculate total number of pages"""
        if self.limit is None or self.limit == 0:
            return 1
        return (self.total_count + self.limit - 1) // self.limit
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with metadata"""
        return {
            "clients": [client.to_dict() for client in self.clients],
            "pagination": {
                "total_count": self.total_count,
                "limit": self.limit,
                "offset": self.offset,
                "current_page": self.current_page,
                "total_pages": self.total_pages,
                "has_more": self.has_more
            }
        }


@dataclass
class ClientSummaryDTO:
    """Lightweight DTO for client summaries"""
    
    id: str
    name: str
    email: str
    program_type: str
    status: str
    is_active: bool
    
    @classmethod
    def from_entity(cls, client: Client) -> "ClientSummaryDTO":
        """Create summary DTO from domain entity"""
        return cls(
            id=str(client.id),
            name=client.name,
            email=str(client.email),
            program_type=client.program_type.value,
            status=client.status.value,
            is_active=client.is_active()
        )