"""
Unit tests for Client entity
"""

import pytest
from datetime import datetime
from unittest.mock import Mock

from src.domain.entities.client import Client, ClientId, ClientStatus, ProgramType
from src.domain.value_objects import Email, PhoneNumber
from src.domain.exceptions import DomainException


class TestClientEntity:
    """Test Client entity business logic"""
    
    @pytest.fixture
    def valid_client_data(self):
        """Valid client data for testing"""
        return {
            "id": ClientId(),
            "name": "John Doe",
            "email": Email("john@example.com"),
            "program_type": ProgramType.PRIME,
        }
    
    def test_client_creation(self, valid_client_data):
        """Test creating a valid client"""
        client = Client(**valid_client_data)
        
        assert client.name == "John Doe"
        assert client.email.value == "john@example.com"
        assert client.program_type == ProgramType.PRIME
        assert client.status == ClientStatus.TRIAL
        assert isinstance(client.created_at, datetime)
    
    def test_client_with_phone(self, valid_client_data):
        """Test creating client with phone number"""
        valid_client_data["phone"] = PhoneNumber("+1234567890")
        client = Client(**valid_client_data)
        
        assert client.phone.value == "+1234567890"
    
    def test_invalid_name_raises_exception(self, valid_client_data):
        """Test invalid name raises DomainException"""
        valid_client_data["name"] = "A"  # Too short
        
        with pytest.raises(DomainException) as exc_info:
            Client(**valid_client_data)
        assert "at least 2 characters" in str(exc_info.value)
    
    def test_empty_name_raises_exception(self, valid_client_data):
        """Test empty name raises DomainException"""
        valid_client_data["name"] = ""
        
        with pytest.raises(DomainException):
            Client(**valid_client_data)
    
    def test_client_activation(self, valid_client_data):
        """Test client activation"""
        client = Client(**valid_client_data)
        original_updated = client.updated_at
        
        client.activate()
        
        assert client.status == ClientStatus.ACTIVE
        assert client.updated_at > original_updated
    
    def test_cannot_activate_cancelled_client(self, valid_client_data):
        """Test cannot activate cancelled client"""
        client = Client(**valid_client_data)
        client.cancel()
        
        with pytest.raises(DomainException) as exc_info:
            client.activate()
        assert "Cannot activate a cancelled client" in str(exc_info.value)
    
    def test_client_deactivation(self, valid_client_data):
        """Test client deactivation"""
        client = Client(**valid_client_data)
        client.activate()
        
        client.deactivate()
        
        assert client.status == ClientStatus.INACTIVE
    
    def test_client_pause(self, valid_client_data):
        """Test client pause"""
        client = Client(**valid_client_data)
        client.activate()
        
        client.pause()
        
        assert client.status == ClientStatus.PAUSED
    
    def test_cannot_pause_inactive_client(self, valid_client_data):
        """Test cannot pause inactive client"""
        client = Client(**valid_client_data)
        # Client starts in TRIAL status
        
        with pytest.raises(DomainException) as exc_info:
            client.pause()
        assert "Can only pause active clients" in str(exc_info.value)
    
    def test_client_resume(self, valid_client_data):
        """Test client resume"""
        client = Client(**valid_client_data)
        client.activate()
        client.pause()
        
        client.resume()
        
        assert client.status == ClientStatus.ACTIVE
    
    def test_cannot_resume_non_paused_client(self, valid_client_data):
        """Test cannot resume non-paused client"""
        client = Client(**valid_client_data)
        client.activate()
        
        with pytest.raises(DomainException) as exc_info:
            client.resume()
        assert "Can only resume paused clients" in str(exc_info.value)
    
    def test_client_cancellation(self, valid_client_data):
        """Test client cancellation"""
        client = Client(**valid_client_data)
        
        client.cancel()
        
        assert client.status == ClientStatus.CANCELLED
    
    def test_program_type_change(self, valid_client_data):
        """Test changing program type"""
        client = Client(**valid_client_data)
        
        client.change_program_type(ProgramType.LONGEVITY)
        
        assert client.program_type == ProgramType.LONGEVITY
    
    def test_is_active_method(self, valid_client_data):
        """Test is_active method"""
        client = Client(**valid_client_data)
        
        assert not client.is_active()  # Starts as TRIAL
        
        client.activate()
        assert client.is_active()
        
        client.pause()
        assert not client.is_active()
    
    def test_client_notes(self, valid_client_data):
        """Test client notes functionality"""
        valid_client_data["notes"] = "Initial notes"
        client = Client(**valid_client_data)
        
        assert client.notes == "Initial notes"
        
        client.add_note("Additional note")
        assert "Additional note" in client.notes