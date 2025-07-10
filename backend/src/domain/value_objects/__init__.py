"""
Value Objects for NEXUS-CORE Domain

Value objects are immutable objects that represent descriptive aspects
of the domain with no conceptual identity.
"""

from .email import Email
from .phone_number import PhoneNumber

__all__ = [
    "Email",
    "PhoneNumber",
]