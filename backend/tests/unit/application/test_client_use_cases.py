"""
Unit tests for Client use cases
"""

import pytest
from unittest.mock import Mock, AsyncMock
from datetime import datetime

from src.application.use_cases.client import (
    CreateClientUseCase,
    GetClientUseCase,
    SearchClientsUseCase,
    UpdateClientUseCase,
    GetClientAnalyticsUseCase
)
from src.application.dto.client_dto import (
    ClientCreateDTO,
    ClientUpdateDTO,
    ClientSearchFiltersDTO,
    ClientDTO
)
from src.domain.entities.client import Client, ClientId, ClientStatus, ProgramType
from src.domain.value_objects import Email, PhoneNumber
from src.domain.exceptions import ClientNotFound


class TestCreateClientUseCase:
    """Test CreateClientUseCase"""
    
    @pytest.fixture
    def mock_repository(self):
        """Mock client repository"""
        return Mock()
    
    @pytest.fixture
    def mock_event_publisher(self):
        """Mock event publisher"""
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_repository, mock_event_publisher):
        """Create use case instance"""
        return CreateClientUseCase(mock_repository, mock_event_publisher)
    
    @pytest.fixture
    def create_dto(self):
        """Valid create DTO"""
        return ClientCreateDTO(
            name="John Doe",
            email="john@example.com",
            program_type="PRIME"
        )
    
    @pytest.mark.asyncio
    async def test_create_client_success(self, use_case, mock_repository, mock_event_publisher, create_dto):
        """Test successful client creation"""
        # Arrange
        mock_repository.exists_by_email = AsyncMock(return_value=False)
        mock_repository.save = AsyncMock()
        mock_event_publisher.publish = AsyncMock()
        
        # Act
        result = await use_case.execute(create_dto)
        
        # Assert
        assert isinstance(result, ClientDTO)
        assert result.name == "John Doe"
        assert result.email == "john@example.com"
        assert result.program_type == "PRIME"
        assert result.status == "TRIAL"
        
        mock_repository.exists_by_email.assert_called_once()
        mock_repository.save.assert_called_once()
        mock_event_publisher.publish.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_client_duplicate_email(self, use_case, mock_repository, create_dto):
        """Test creating client with duplicate email"""
        # Arrange
        mock_repository.exists_by_email = AsyncMock(return_value=True)
        
        # Act & Assert
        with pytest.raises(Exception):  # Should raise domain exception
            await use_case.execute(create_dto)


class TestGetClientUseCase:
    """Test GetClientUseCase"""
    
    @pytest.fixture
    def mock_repository(self):
        """Mock client repository"""
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_repository):
        """Create use case instance"""
        return GetClientUseCase(mock_repository)
    
    @pytest.mark.asyncio
    async def test_get_client_success(self, use_case, mock_repository):
        """Test successful client retrieval"""
        # Arrange
        client_id = "test-id"
        mock_client = Client(
            id=ClientId(),
            name="John Doe",
            email=Email("john@example.com"),
            program_type=ProgramType.PRIME
        )
        mock_repository.get_by_id = AsyncMock(return_value=mock_client)
        
        # Act
        result = await use_case.execute(client_id)
        
        # Assert
        assert isinstance(result, ClientDTO)
        assert result.name == "John Doe"
        mock_repository.get_by_id.assert_called_once_with(client_id)
    
    @pytest.mark.asyncio
    async def test_get_client_not_found(self, use_case, mock_repository):
        """Test client not found"""
        # Arrange
        client_id = "non-existent"
        mock_repository.get_by_id = AsyncMock(side_effect=ClientNotFound(client_id))
        
        # Act & Assert
        with pytest.raises(ClientNotFound):
            await use_case.execute(client_id)


class TestSearchClientsUseCase:
    """Test SearchClientsUseCase"""
    
    @pytest.fixture
    def mock_repository(self):
        """Mock client repository"""
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_repository):
        """Create use case instance"""
        return SearchClientsUseCase(mock_repository)
    
    @pytest.fixture
    def search_filters(self):
        """Search filters DTO"""
        return ClientSearchFiltersDTO(
            query="John",
            program_type="PRIME",
            limit=10,
            page=1
        )
    
    @pytest.mark.asyncio
    async def test_search_clients_success(self, use_case, mock_repository, search_filters):
        """Test successful client search"""
        # Arrange
        mock_clients = [
            Client(
                id=ClientId(),
                name="John Doe",
                email=Email("john@example.com"),
                program_type=ProgramType.PRIME
            )
        ]
        mock_repository.search = AsyncMock(return_value=(mock_clients, 1))
        
        # Act
        result = await use_case.execute(search_filters)
        
        # Assert
        assert len(result.clients) == 1
        assert result.clients[0].name == "John Doe"
        assert result.pagination.total == 1
        mock_repository.search.assert_called_once()


class TestUpdateClientUseCase:
    """Test UpdateClientUseCase"""
    
    @pytest.fixture
    def mock_repository(self):
        """Mock client repository"""
        return Mock()
    
    @pytest.fixture
    def mock_event_publisher(self):
        """Mock event publisher"""
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_repository, mock_event_publisher):
        """Create use case instance"""
        return UpdateClientUseCase(mock_repository, mock_event_publisher)
    
    @pytest.fixture
    def update_dto(self):
        """Valid update DTO"""
        return ClientUpdateDTO(
            name="John Updated",
            status="ACTIVE"
        )
    
    @pytest.mark.asyncio
    async def test_update_client_success(self, use_case, mock_repository, mock_event_publisher, update_dto):
        """Test successful client update"""
        # Arrange
        client_id = "test-id"
        mock_client = Client(
            id=ClientId(),
            name="John Doe",
            email=Email("john@example.com"),
            program_type=ProgramType.PRIME
        )
        mock_repository.get_by_id = AsyncMock(return_value=mock_client)
        mock_repository.save = AsyncMock()
        mock_event_publisher.publish = AsyncMock()
        
        # Act
        result = await use_case.execute(client_id, update_dto)
        
        # Assert
        assert isinstance(result, ClientDTO)
        assert result.name == "John Updated"
        assert result.status == "ACTIVE"
        
        mock_repository.get_by_id.assert_called_once_with(client_id)
        mock_repository.save.assert_called_once()
        mock_event_publisher.publish.assert_called_once()


class TestGetClientAnalyticsUseCase:
    """Test GetClientAnalyticsUseCase"""
    
    @pytest.fixture
    def mock_repository(self):
        """Mock client repository"""
        return Mock()
    
    @pytest.fixture
    def use_case(self, mock_repository):
        """Create use case instance"""
        return GetClientAnalyticsUseCase(mock_repository)
    
    @pytest.mark.asyncio
    async def test_get_analytics_success(self, use_case, mock_repository):
        """Test successful analytics retrieval"""
        # Arrange
        client_id = "test-id"
        mock_analytics = {
            "adherence_rate": 0.85,
            "completed_workouts": 17,
            "total_workouts": 20,
            "progress_score": 4.2
        }
        mock_repository.get_analytics = AsyncMock(return_value=mock_analytics)
        
        # Act
        result = await use_case.execute(client_id)
        
        # Assert
        assert result.adherence_rate == 0.85
        assert result.completed_workouts == 17
        assert result.total_workouts == 20
        assert result.progress_score == 4.2
        
        mock_repository.get_analytics.assert_called_once_with(client_id)