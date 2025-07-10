"""
Client Repository Interface
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..entities import Client, ClientId, ClientStatus, ProgramType
from ..value_objects import Email


class IClientRepository(ABC):
    """
    Repository interface for Client aggregate.
    
    Defines the contract for client data persistence operations
    without coupling to specific database implementations.
    """
    
    @abstractmethod
    async def save(self, client: Client) -> None:
        """
        Save a client to the repository.
        
        Args:
            client: The client entity to save
            
        Raises:
            RepositoryException: If save operation fails
        """
        pass
    
    @abstractmethod
    async def find_by_id(self, client_id: ClientId) -> Optional[Client]:
        """
        Find a client by their ID.
        
        Args:
            client_id: The client identifier
            
        Returns:
            Client entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def find_by_email(self, email: Email) -> Optional[Client]:
        """
        Find a client by their email address.
        
        Args:
            email: The client email
            
        Returns:
            Client entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def find_all(
        self, 
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """
        Find all clients with optional pagination.
        
        Args:
            limit: Maximum number of clients to return
            offset: Number of clients to skip
            
        Returns:
            List of client entities
        """
        pass
    
    @abstractmethod
    async def find_by_status(
        self, 
        status: ClientStatus,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """
        Find clients by their status.
        
        Args:
            status: The client status to filter by
            limit: Maximum number of clients to return
            offset: Number of clients to skip
            
        Returns:
            List of client entities with the specified status
        """
        pass
    
    @abstractmethod
    async def find_by_program_type(
        self, 
        program_type: ProgramType,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """
        Find clients by their program type.
        
        Args:
            program_type: The program type to filter by
            limit: Maximum number of clients to return
            offset: Number of clients to skip
            
        Returns:
            List of client entities with the specified program type
        """
        pass
    
    @abstractmethod
    async def search(
        self, 
        query: str,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """
        Search clients by name or email.
        
        Args:
            query: Search query string
            limit: Maximum number of clients to return
            offset: Number of clients to skip
            
        Returns:
            List of client entities matching the search criteria
        """
        pass
    
    @abstractmethod
    async def count(self) -> int:
        """
        Count total number of clients.
        
        Returns:
            Total count of clients
        """
        pass
    
    @abstractmethod
    async def count_by_status(self, status: ClientStatus) -> int:
        """
        Count clients by status.
        
        Args:
            status: The client status to count
            
        Returns:
            Count of clients with the specified status
        """
        pass
    
    @abstractmethod
    async def count_by_program_type(self, program_type: ProgramType) -> int:
        """
        Count clients by program type.
        
        Args:
            program_type: The program type to count
            
        Returns:
            Count of clients with the specified program type
        """
        pass
    
    @abstractmethod
    async def find_created_between(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Client]:
        """
        Find clients created within a date range.
        
        Args:
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            List of clients created within the specified range
        """
        pass
    
    @abstractmethod
    async def delete(self, client_id: ClientId) -> bool:
        """
        Delete a client from the repository.
        
        Args:
            client_id: The client identifier
            
        Returns:
            True if client was deleted, False if not found
        """
        pass
    
    @abstractmethod
    async def exists(self, client_id: ClientId) -> bool:
        """
        Check if a client exists.
        
        Args:
            client_id: The client identifier
            
        Returns:
            True if client exists, False otherwise
        """
        pass
    
    @abstractmethod
    async def exists_by_email(self, email: Email) -> bool:
        """
        Check if a client with the given email exists.
        
        Args:
            email: The email to check
            
        Returns:
            True if client with email exists, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_analytics_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        program_type: Optional[ProgramType] = None
    ) -> Dict[str, Any]:
        """
        Get analytics data for clients.
        
        Args:
            start_date: Optional start date filter
            end_date: Optional end date filter
            program_type: Optional program type filter
            
        Returns:
            Dictionary containing analytics metrics
        """
        pass