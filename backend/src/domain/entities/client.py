"""
Client Entity - Core business logic for NGX clients
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from ..value_objects import Email, PhoneNumber
from ..exceptions import DomainException


class ClientStatus(Enum):
    """Client status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"
    TRIAL = "trial"
    CANCELLED = "cancelled"


class ProgramType(Enum):
    """Program type enumeration"""
    PRIME = "PRIME"
    LONGEVITY = "LONGEVITY"
    HYBRID = "HYBRID"


@dataclass(frozen=True)
class ClientId:
    """Client identifier value object"""
    value: UUID = field(default_factory=uuid4)
    
    def __str__(self) -> str:
        return str(self.value)


@dataclass
class Client:
    """
    Client aggregate root representing an NGX client
    
    This entity encapsulates all business logic related to client management,
    including program assignment, status changes, and progress tracking.
    """
    
    # Identity
    id: ClientId
    
    # Basic Information
    name: str
    email: Email
    program_type: ProgramType
    
    # Optional fields with defaults
    phone: Optional[PhoneNumber] = None
    status: ClientStatus = ClientStatus.TRIAL
    notes: str = ""
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate entity after creation"""
        self._validate()
    
    def _validate(self) -> None:
        """Validate business rules"""
        if not self.name or len(self.name.strip()) < 2:
            raise DomainException("Client name must be at least 2 characters")
        
        if not isinstance(self.email, Email):
            raise DomainException("Valid email is required")
    
    def activate(self) -> None:
        """Activate the client"""
        if self.status == ClientStatus.CANCELLED:
            raise DomainException("Cannot activate a cancelled client")
        
        self.status = ClientStatus.ACTIVE
        self.updated_at = datetime.utcnow()
    
    def deactivate(self) -> None:
        """Deactivate the client"""
        if self.status == ClientStatus.CANCELLED:
            raise DomainException("Cannot deactivate a cancelled client")
        
        self.status = ClientStatus.INACTIVE
        self.updated_at = datetime.utcnow()
    
    def pause(self) -> None:
        """Pause the client's program"""
        if self.status != ClientStatus.ACTIVE:
            raise DomainException("Can only pause active clients")
        
        self.status = ClientStatus.PAUSED
        self.updated_at = datetime.utcnow()
    
    def resume(self) -> None:
        """Resume the client's program"""
        if self.status != ClientStatus.PAUSED:
            raise DomainException("Can only resume paused clients")
        
        self.status = ClientStatus.ACTIVE
        self.updated_at = datetime.utcnow()
    
    def cancel(self) -> None:
        """Cancel the client permanently"""
        self.status = ClientStatus.CANCELLED
        self.updated_at = datetime.utcnow()
    
    def change_program_type(self, new_program_type: ProgramType) -> None:
        """Change the client's program type"""
        if self.status == ClientStatus.CANCELLED:
            raise DomainException("Cannot change program for cancelled client")
        
        if new_program_type == self.program_type:
            return  # No change needed
        
        self.program_type = new_program_type
        self.updated_at = datetime.utcnow()
    
    def update_contact_info(self, email: Email = None, phone: PhoneNumber = None) -> None:
        """Update client contact information"""
        if email is not None:
            self.email = email
        
        if phone is not None:
            self.phone = phone
        
        self.updated_at = datetime.utcnow()
    
    def add_note(self, note: str) -> None:
        """Add a note to the client"""
        if note.strip():
            timestamp = datetime.utcnow().isoformat()
            new_note = f"[{timestamp}] {note.strip()}"
            
            if self.notes:
                self.notes += f"\n{new_note}"
            else:
                self.notes = new_note
            
            self.updated_at = datetime.utcnow()
    
    def update_metadata(self, key: str, value: Any) -> None:
        """Update metadata field"""
        self.metadata[key] = value
        self.updated_at = datetime.utcnow()
    
    def is_active(self) -> bool:
        """Check if client is active"""
        return self.status == ClientStatus.ACTIVE
    
    def is_eligible_for_program_change(self) -> bool:
        """Check if client can change programs"""
        return self.status in [ClientStatus.ACTIVE, ClientStatus.PAUSED, ClientStatus.TRIAL]
    
    def get_program_duration(self) -> int:
        """Get program duration in days"""
        return (datetime.utcnow() - self.created_at).days
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            "id": str(self.id),
            "name": self.name,
            "email": str(self.email),
            "phone": str(self.phone) if self.phone else None,
            "program_type": self.program_type.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata,
            "notes": self.notes,
            "is_active": self.is_active(),
            "program_duration_days": self.get_program_duration()
        }
    
    @classmethod
    def create(
        cls,
        name: str,
        email: Email,
        program_type: ProgramType,
        phone: Optional[PhoneNumber] = None,
        status: ClientStatus = ClientStatus.TRIAL
    ) -> "Client":
        """Factory method to create a new client"""
        return cls(
            id=ClientId(),
            name=name.strip(),
            email=email,
            phone=phone,
            program_type=program_type,
            status=status
        )
    
    def __str__(self) -> str:
        return f"Client({self.name}, {self.email}, {self.program_type.value})"
    
    def __repr__(self) -> str:
        return (f"Client(id={self.id}, name='{self.name}', "
                f"email='{self.email}', program_type={self.program_type.value}, "
                f"status={self.status.value})")