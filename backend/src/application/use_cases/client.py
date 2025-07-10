"""
Client Use Cases - Application Business Logic
"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from ..dto import ClientDTO, ClientCreateDTO, ClientUpdateDTO, ClientSearchResultDTO
from ..interfaces import IClientRepository, IEventPublisher, ILogger
from ...domain.entities import Client, ClientId, ClientStatus, ProgramType
from ...domain.value_objects import Email, PhoneNumber
from ...domain.exceptions import ClientNotFound, ClientAlreadyExists, DomainException


class CreateClientUseCase:
    """
    Use case for creating a new client.
    
    Orchestrates the creation of a client entity, validation,
    persistence, and event publishing.
    """
    
    def __init__(
        self,
        client_repository: IClientRepository,
        event_publisher: IEventPublisher,
        logger: ILogger
    ):
        self._client_repository = client_repository
        self._event_publisher = event_publisher
        self._logger = logger
    
    async def execute(self, dto: ClientCreateDTO) -> ClientDTO:
        """
        Execute client creation use case.
        
        Args:
            dto: Client creation data
            
        Returns:
            Created client DTO
            
        Raises:
            ClientAlreadyExists: If client with email already exists
            DomainException: If validation fails
        """
        self._logger.info(f"Creating client with email: {dto.email}")
        
        # Check if client already exists
        email = Email(dto.email)
        if await self._client_repository.exists_by_email(email):
            raise ClientAlreadyExists(dto.email)
        
        # Create value objects
        phone = PhoneNumber(dto.phone) if dto.phone else None
        program_type = ProgramType(dto.program_type)
        status = ClientStatus(dto.status) if dto.status else ClientStatus.TRIAL
        
        # Create client entity
        client = Client.create(
            name=dto.name,
            email=email,
            program_type=program_type,
            phone=phone,
            status=status
        )
        
        # Add initial notes if provided
        if dto.notes:
            client.add_note(dto.notes)
        
        # Save to repository
        await self._client_repository.save(client)
        
        # Publish domain event
        await self._event_publisher.publish({
            "event_type": "ClientCreated",
            "client_id": str(client.id),
            "email": str(client.email),
            "program_type": client.program_type.value,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        self._logger.info(f"Client created successfully: {client.id}")
        
        return ClientDTO.from_entity(client)


class GetClientUseCase:
    """Use case for retrieving a client by ID"""
    
    def __init__(self, client_repository: IClientRepository):
        self._client_repository = client_repository
    
    async def execute(self, client_id: str) -> ClientDTO:
        """
        Get client by ID.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Client DTO
            
        Raises:
            ClientNotFound: If client doesn't exist
        """
        client_id_obj = ClientId(client_id)
        client = await self._client_repository.find_by_id(client_id_obj)
        
        if not client:
            raise ClientNotFound(client_id)
        
        return ClientDTO.from_entity(client)


class UpdateClientUseCase:
    """Use case for updating an existing client"""
    
    def __init__(
        self,
        client_repository: IClientRepository,
        event_publisher: IEventPublisher,
        logger: ILogger
    ):
        self._client_repository = client_repository
        self._event_publisher = event_publisher
        self._logger = logger
    
    async def execute(self, client_id: str, dto: ClientUpdateDTO) -> ClientDTO:
        """
        Update existing client.
        
        Args:
            client_id: Client identifier
            dto: Update data
            
        Returns:
            Updated client DTO
            
        Raises:
            ClientNotFound: If client doesn't exist
        """
        # Get existing client
        client_id_obj = ClientId(client_id)
        client = await self._client_repository.find_by_id(client_id_obj)
        
        if not client:
            raise ClientNotFound(client_id)
        
        # Update fields if provided
        if dto.name is not None:
            client.name = dto.name
            client.updated_at = datetime.utcnow()
        
        if dto.email is not None:
            new_email = Email(dto.email)
            # Check if email is already taken by another client
            existing_client = await self._client_repository.find_by_email(new_email)
            if existing_client and existing_client.id != client.id:
                raise ClientAlreadyExists(dto.email)
            client.update_contact_info(email=new_email)
        
        if dto.phone is not None:
            phone = PhoneNumber(dto.phone) if dto.phone else None
            client.update_contact_info(phone=phone)
        
        if dto.program_type is not None:
            client.change_program_type(ProgramType(dto.program_type))
        
        if dto.status is not None:
            new_status = ClientStatus(dto.status)
            if new_status != client.status:
                # Apply status change with business logic
                if new_status == ClientStatus.ACTIVE:
                    client.activate()
                elif new_status == ClientStatus.INACTIVE:
                    client.deactivate()
                elif new_status == ClientStatus.PAUSED:
                    client.pause()
                elif new_status == ClientStatus.CANCELLED:
                    client.cancel()
        
        if dto.notes:
            client.add_note(dto.notes)
        
        # Save changes
        await self._client_repository.save(client)
        
        # Publish event
        await self._event_publisher.publish({
            "event_type": "ClientUpdated",
            "client_id": str(client.id),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        self._logger.info(f"Client updated: {client.id}")
        
        return ClientDTO.from_entity(client)


class SearchClientsUseCase:
    """Use case for searching clients"""
    
    def __init__(self, client_repository: IClientRepository):
        self._client_repository = client_repository
    
    async def execute(
        self,
        query: Optional[str] = None,
        status: Optional[str] = None,
        program_type: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> ClientSearchResultDTO:
        """
        Search clients with filters.
        
        Args:
            query: Search query for name/email
            status: Filter by status
            program_type: Filter by program type
            limit: Maximum results
            offset: Results offset
            
        Returns:
            Search results with metadata
        """
        clients = []
        total_count = 0
        
        if query:
            # Text search
            clients = await self._client_repository.search(query, limit, offset)
            # For simplicity, using length as count - in real implementation,
            # you'd have a separate count query
            total_count = len(clients)
        elif status:
            # Filter by status
            status_enum = ClientStatus(status)
            clients = await self._client_repository.find_by_status(
                status_enum, limit, offset
            )
            total_count = await self._client_repository.count_by_status(status_enum)
        elif program_type:
            # Filter by program type
            program_type_enum = ProgramType(program_type)
            clients = await self._client_repository.find_by_program_type(
                program_type_enum, limit, offset
            )
            total_count = await self._client_repository.count_by_program_type(
                program_type_enum
            )
        else:
            # Get all clients
            clients = await self._client_repository.find_all(limit, offset)
            total_count = await self._client_repository.count()
        
        # Convert to DTOs
        client_dtos = [ClientDTO.from_entity(client) for client in clients]
        
        return ClientSearchResultDTO(
            clients=client_dtos,
            total_count=total_count,
            limit=limit,
            offset=offset or 0
        )


class GetClientAnalyticsUseCase:
    """Use case for getting client analytics"""
    
    def __init__(self, client_repository: IClientRepository):
        self._client_repository = client_repository
    
    async def execute(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        program_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get client analytics data.
        
        Args:
            start_date: Start date filter
            end_date: End date filter  
            program_type: Program type filter
            
        Returns:
            Analytics data dictionary
        """
        program_type_enum = ProgramType(program_type) if program_type else None
        
        analytics_data = await self._client_repository.get_analytics_data(
            start_date=start_date,
            end_date=end_date,
            program_type=program_type_enum
        )
        
        # Add computed metrics
        analytics_data.update({
            "generated_at": datetime.utcnow().isoformat(),
            "period": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "filters": {
                "program_type": program_type
            }
        })
        
        return analytics_data


class DeleteClientUseCase:
    """Use case for deleting a client"""
    
    def __init__(
        self,
        client_repository: IClientRepository,
        event_publisher: IEventPublisher,
        logger: ILogger
    ):
        self._client_repository = client_repository
        self._event_publisher = event_publisher
        self._logger = logger
    
    async def execute(self, client_id: str) -> bool:
        """
        Delete a client.
        
        Args:
            client_id: Client identifier
            
        Returns:
            True if deleted, False if not found
        """
        client_id_obj = ClientId(client_id)
        
        # Check if client exists first
        client = await self._client_repository.find_by_id(client_id_obj)
        if not client:
            return False
        
        # Delete client
        deleted = await self._client_repository.delete(client_id_obj)
        
        if deleted:
            # Publish event
            await self._event_publisher.publish({
                "event_type": "ClientDeleted",
                "client_id": client_id,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            self._logger.info(f"Client deleted: {client_id}")
        
        return deleted