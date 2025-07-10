"""
Unit tests for domain value objects
"""

import pytest
from src.domain.value_objects import Email, PhoneNumber
from src.domain.exceptions import DomainException


class TestEmail:
    """Test Email value object"""
    
    def test_valid_email_creation(self):
        """Test creating a valid email"""
        email = Email("test@example.com")
        assert email.value == "test@example.com"
    
    def test_email_normalization(self):
        """Test email normalization"""
        email = Email("  Test@Example.COM  ")
        assert email.value == "test@example.com"
    
    def test_invalid_email_raises_exception(self):
        """Test invalid email raises DomainException"""
        with pytest.raises(DomainException) as exc_info:
            Email("invalid-email")
        assert "Invalid email format" in str(exc_info.value)
    
    def test_empty_email_raises_exception(self):
        """Test empty email raises DomainException"""
        with pytest.raises(DomainException):
            Email("")
    
    def test_email_equality(self):
        """Test email equality"""
        email1 = Email("test@example.com")
        email2 = Email("test@example.com")
        email3 = Email("other@example.com")
        
        assert email1 == email2
        assert email1 != email3
    
    def test_email_str_representation(self):
        """Test email string representation"""
        email = Email("test@example.com")
        assert str(email) == "test@example.com"


class TestPhoneNumber:
    """Test PhoneNumber value object"""
    
    def test_valid_phone_creation(self):
        """Test creating a valid phone number"""
        phone = PhoneNumber("+1234567890")
        assert phone.value == "+1234567890"
    
    def test_phone_normalization(self):
        """Test phone number normalization"""
        phone = PhoneNumber("  (123) 456-7890  ")
        assert phone.value == "+11234567890"  # Assuming US format
    
    def test_invalid_phone_raises_exception(self):
        """Test invalid phone raises DomainException"""
        with pytest.raises(DomainException) as exc_info:
            PhoneNumber("123")  # Too short
        assert "Invalid phone number format" in str(exc_info.value)
    
    def test_phone_equality(self):
        """Test phone number equality"""
        phone1 = PhoneNumber("+1234567890")
        phone2 = PhoneNumber("+1234567890")
        phone3 = PhoneNumber("+9876543210")
        
        assert phone1 == phone2
        assert phone1 != phone3
    
    def test_phone_str_representation(self):
        """Test phone string representation"""
        phone = PhoneNumber("+1234567890")
        assert str(phone) == "+1234567890"