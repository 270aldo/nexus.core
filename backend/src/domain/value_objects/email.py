"""
Email Value Object
"""

import re
from dataclasses import dataclass
from typing import ClassVar

from ..exceptions import DomainException


@dataclass(frozen=True)
class Email:
    """
    Email value object that ensures email format validity
    """
    
    value: str
    
    # Email regex pattern
    _EMAIL_PATTERN: ClassVar[re.Pattern] = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def __post_init__(self):
        """Validate email format on creation"""
        if not self.value:
            raise DomainException("Email cannot be empty")
        
        if not isinstance(self.value, str):
            raise DomainException("Email must be a string")
        
        # Normalize email (lowercase)
        normalized = self.value.strip().lower()
        object.__setattr__(self, 'value', normalized)
        
        if not self._EMAIL_PATTERN.match(self.value):
            raise DomainException(f"Invalid email format: {self.value}")
        
        if len(self.value) > 254:  # RFC 5321 limit
            raise DomainException("Email too long (max 254 characters)")
    
    @property
    def domain(self) -> str:
        """Get the domain part of the email"""
        return self.value.split('@')[1]
    
    @property
    def local_part(self) -> str:
        """Get the local part of the email"""
        return self.value.split('@')[0]
    
    def is_business_email(self) -> bool:
        """Check if this appears to be a business email"""
        common_personal_domains = {
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'aol.com', 'protonmail.com'
        }
        return self.domain not in common_personal_domains
    
    def __str__(self) -> str:
        return self.value
    
    def __repr__(self) -> str:
        return f"Email('{self.value}')"