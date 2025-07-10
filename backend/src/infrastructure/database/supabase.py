"""
Supabase Database Implementation
"""

import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from supabase import create_client, Client as SupabaseClient

from ...domain.repositories import IClientRepository
from ...domain.entities import Client, ClientId, ClientStatus, ProgramType
from ...domain.value_objects import Email, PhoneNumber
from ...domain.exceptions import ClientNotFound, DomainException


class SupabaseConnection:
    """Supabase database connection manager"""
    
    def __init__(self, url: str = None, key: str = None):
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Supabase URL and Service Key are required")
        
        self._client: Optional[SupabaseClient] = None
    
    @property
    def client(self) -> SupabaseClient:
        """Get or create Supabase client"""
        if self._client is None:
            self._client = create_client(self.url, self.key)
        return self._client
    
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            # Simple query to test connection
            response = self.client.table("clients").select("id").limit(1).execute()
            return True
        except Exception:
            return False


class SupabaseClientRepository(IClientRepository):
    """
    Supabase implementation of client repository.
    
    Handles persistence of Client entities using Supabase/PostgreSQL.
    """
    
    def __init__(self, connection: SupabaseConnection):
        self._connection = connection
        self._table_name = "clients"
    
    @property
    def _client(self) -> SupabaseClient:
        """Get Supabase client"""
        return self._connection.client
    
    def _entity_to_dict(self, client: Client) -> Dict[str, Any]:
        """Convert Client entity to database dictionary"""
        return {
            "id": str(client.id),
            "name": client.name,
            "email": str(client.email),
            "phone": str(client.phone) if client.phone else None,
            "program_type": client.program_type.value,
            "status": client.status.value,
            "created_at": client.created_at.isoformat(),
            "updated_at": client.updated_at.isoformat(),
            "notes": client.notes,
            "metadata": client.metadata
        }
    
    def _dict_to_entity(self, data: Dict[str, Any]) -> Client:
        """Convert database dictionary to Client entity"""
        try:
            client_id = ClientId(data["id"])
            email = Email(data["email"])
            phone = PhoneNumber(data["phone"]) if data.get("phone") else None
            program_type = ProgramType(data["program_type"])
            status = ClientStatus(data["status"])
            
            # Parse dates
            created_at = datetime.fromisoformat(data["created_at"])
            updated_at = datetime.fromisoformat(data["updated_at"])
            
            return Client(
                id=client_id,
                name=data["name"],
                email=email,
                phone=phone,
                program_type=program_type,
                status=status,
                created_at=created_at,
                updated_at=updated_at,
                notes=data.get("notes", ""),
                metadata=data.get("metadata", {})
            )
        except Exception as e:
            raise DomainException(f"Failed to convert database record to entity: {e}")
    
    async def save(self, client: Client) -> None:
        """Save client to database"""
        try:
            data = self._entity_to_dict(client)
            
            # Use upsert to handle both create and update
            response = self._client.table(self._table_name).upsert(data).execute()
            
            if not response.data:
                raise DomainException(f"Failed to save client: {client.id}")
                
        except Exception as e:
            raise DomainException(f"Database error while saving client: {e}")
    
    async def find_by_id(self, client_id: ClientId) -> Optional[Client]:
        """Find client by ID"""
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("id", str(client_id))\
                .execute()
            
            if not response.data:
                return None
            
            return self._dict_to_entity(response.data[0])
            
        except Exception as e:
            raise DomainException(f"Database error while finding client by ID: {e}")
    
    async def find_by_email(self, email: Email) -> Optional[Client]:
        """Find client by email"""
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("email", str(email))\
                .execute()
            
            if not response.data:
                return None
            
            return self._dict_to_entity(response.data[0])
            
        except Exception as e:
            raise DomainException(f"Database error while finding client by email: {e}")
    
    async def find_all(
        self, 
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find all clients with pagination"""
        try:
            query = self._client.table(self._table_name).select("*")
            
            if offset:
                query = query.range(offset, offset + (limit or 1000) - 1)
            elif limit:
                query = query.limit(limit)
            
            response = query.execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while finding all clients: {e}")
    
    async def find_by_status(
        self, 
        status: ClientStatus,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find clients by status"""
        try:
            query = self._client.table(self._table_name)\
                .select("*")\
                .eq("status", status.value)
            
            if offset:
                query = query.range(offset, offset + (limit or 1000) - 1)
            elif limit:
                query = query.limit(limit)
            
            response = query.execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while finding clients by status: {e}")
    
    async def find_by_program_type(
        self, 
        program_type: ProgramType,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find clients by program type"""
        try:
            query = self._client.table(self._table_name)\
                .select("*")\
                .eq("program_type", program_type.value)
            
            if offset:
                query = query.range(offset, offset + (limit or 1000) - 1)
            elif limit:
                query = query.limit(limit)
            
            response = query.execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while finding clients by program type: {e}")
    
    async def search(
        self, 
        query: str,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Search clients by name or email"""
        try:
            # Use Supabase text search
            search_query = self._client.table(self._table_name)\
                .select("*")\
                .or_(f"name.ilike.%{query}%,email.ilike.%{query}%")
            
            if offset:
                search_query = search_query.range(offset, offset + (limit or 1000) - 1)
            elif limit:
                search_query = search_query.limit(limit)
            
            response = search_query.execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while searching clients: {e}")
    
    async def count(self) -> int:
        """Count total clients"""
        try:
            response = self._client.table(self._table_name)\
                .select("id", count="exact")\
                .execute()
            
            return response.count
            
        except Exception as e:
            raise DomainException(f"Database error while counting clients: {e}")
    
    async def count_by_status(self, status: ClientStatus) -> int:
        """Count clients by status"""
        try:
            response = self._client.table(self._table_name)\
                .select("id", count="exact")\
                .eq("status", status.value)\
                .execute()
            
            return response.count
            
        except Exception as e:
            raise DomainException(f"Database error while counting clients by status: {e}")
    
    async def count_by_program_type(self, program_type: ProgramType) -> int:
        """Count clients by program type"""
        try:
            response = self._client.table(self._table_name)\
                .select("id", count="exact")\
                .eq("program_type", program_type.value)\
                .execute()
            
            return response.count
            
        except Exception as e:
            raise DomainException(f"Database error while counting clients by program type: {e}")
    
    async def find_created_between(
        self, 
        start_date: datetime, 
        end_date: datetime
    ) -> List[Client]:
        """Find clients created within date range"""
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .gte("created_at", start_date.isoformat())\
                .lte("created_at", end_date.isoformat())\
                .execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while finding clients by date range: {e}")
    
    async def delete(self, client_id: ClientId) -> bool:
        """Delete client"""
        try:
            response = self._client.table(self._table_name)\
                .delete()\
                .eq("id", str(client_id))\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DomainException(f"Database error while deleting client: {e}")
    
    async def exists(self, client_id: ClientId) -> bool:
        """Check if client exists"""
        try:
            response = self._client.table(self._table_name)\
                .select("id")\
                .eq("id", str(client_id))\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DomainException(f"Database error while checking client existence: {e}")
    
    async def exists_by_email(self, email: Email) -> bool:
        """Check if client with email exists"""
        try:
            response = self._client.table(self._table_name)\
                .select("id")\
                .eq("email", str(email))\
                .execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DomainException(f"Database error while checking email existence: {e}")
    
    async def get_analytics_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        program_type: Optional[ProgramType] = None
    ) -> Dict[str, Any]:
        """Get analytics data for clients"""
        try:
            # Build base query
            query = self._client.table(self._table_name).select("*")
            
            # Apply filters
            if start_date:
                query = query.gte("created_at", start_date.isoformat())
            if end_date:
                query = query.lte("created_at", end_date.isoformat())
            if program_type:
                query = query.eq("program_type", program_type.value)
            
            response = query.execute()
            clients_data = response.data
            
            # Calculate analytics
            total_clients = len(clients_data)
            
            # Group by status
            status_counts = {}
            for client in clients_data:
                status = client["status"]
                status_counts[status] = status_counts.get(status, 0) + 1
            
            # Group by program type  
            program_type_counts = {}
            for client in clients_data:
                ptype = client["program_type"]
                program_type_counts[ptype] = program_type_counts.get(ptype, 0) + 1
            
            # Calculate active rate
            active_clients = status_counts.get("active", 0)
            active_rate = (active_clients / total_clients * 100) if total_clients > 0 else 0
            
            return {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "active_rate": round(active_rate, 2),
                "status_distribution": status_counts,
                "program_type_distribution": program_type_counts,
                "period_summary": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None,
                    "program_type_filter": program_type.value if program_type else None
                }
            }
            
        except Exception as e:
            raise DomainException(f"Database error while getting analytics data: {e}")