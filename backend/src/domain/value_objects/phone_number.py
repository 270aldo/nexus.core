"""
Phone Number Value Object
"""

import re
from dataclasses import dataclass
from typing import ClassVar, Optional

from ..exceptions import DomainException


@dataclass(frozen=True)
class PhoneNumber:
    """
    Phone number value object that handles validation and formatting
    """
    
    value: str
    country_code: Optional[str] = None
    
    # Phone number patterns
    _PHONE_PATTERN: ClassVar[re.Pattern] = re.compile(r'^[\+]?[1-9][\d\s\-\(\)]{7,15}$')
    _DIGITS_ONLY: ClassVar[re.Pattern] = re.compile(r'\D')
    
    def __post_init__(self):
        """Validate and normalize phone number"""
        if not self.value:
            raise DomainException("Phone number cannot be empty")
        
        if not isinstance(self.value, str):
            raise DomainException("Phone number must be a string")
        
        # Clean and normalize
        cleaned = self.value.strip()
        
        if not self._PHONE_PATTERN.match(cleaned):
            raise DomainException(f"Invalid phone number format: {self.value}")
        
        # Store normalized version
        object.__setattr__(self, 'value', cleaned)
    
    @property
    def digits_only(self) -> str:
        """Get phone number with digits only"""
        return self._DIGITS_ONLY.sub('', self.value)
    
    @property
    def formatted(self) -> str:
        """Get formatted phone number"""
        digits = self.digits_only
        
        # US/Canada format
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits.startswith('1'):
            return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        
        # International format
        return self.value
    
    def is_mobile(self) -> bool:
        """Heuristic to determine if this might be a mobile number"""
        digits = self.digits_only
        
        # US mobile prefixes (simplified)
        if len(digits) in [10, 11]:
            area_code = digits[-10:-7] if len(digits) == 11 else digits[:3]
            # This is a simplified check - in reality you'd use a proper database
            mobile_area_codes = {'201', '202', '203', '301', '302', '401'}
            return area_code in mobile_area_codes
        
        return False
    
    @classmethod
    def from_string(cls, phone_str: str, country_code: str = None) -> "PhoneNumber":
        """Create phone number from string"""
        return cls(value=phone_str, country_code=country_code)
    
    def __str__(self) -> str:
        return self.formatted
    
    def __repr__(self) -> str:
        return f"PhoneNumber('{self.value}')"