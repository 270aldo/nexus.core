"""
Performance-optimized repository implementations
"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from .supabase import SupabaseClientRepository, SupabaseConnection
from .performance import (
    with_performance_monitoring, 
    OptimizedSupabaseConnection,
    connection_pool
)
from ...domain.entities import Client, ClientId, ClientStatus, ProgramType
from ...domain.value_objects import Email
from ...domain.exceptions import DomainException


class OptimizedClientRepository(SupabaseClientRepository):
    """
    Performance-optimized client repository with:
    - Query caching
    - Connection pooling  
    - Performance monitoring
    - Batch operations
    - Retry logic
    """
    
    def __init__(self, connection: OptimizedSupabaseConnection = None):
        if connection is None:
            connection = OptimizedSupabaseConnection()
        super().__init__(connection)
    
    @with_performance_monitoring("clients", "save")
    async def save(self, client: Client) -> None:
        """Save client with performance monitoring"""
        return await super().save(client)
    
    @with_performance_monitoring("clients", "find_by_id")
    async def find_by_id(self, client_id: ClientId) -> Optional[Client]:
        """Find client by ID with caching"""
        return await super().find_by_id(client_id)
    
    @with_performance_monitoring("clients", "find_by_email")
    async def find_by_email(self, email: Email) -> Optional[Client]:
        """Find client by email with caching"""
        return await super().find_by_email(email)
    
    @with_performance_monitoring("clients", "find_all")
    async def find_all(
        self, 
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find all clients with pagination and caching"""
        return await super().find_all(limit, offset)
    
    @with_performance_monitoring("clients", "find_by_status")
    async def find_by_status(
        self, 
        status: ClientStatus,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find clients by status with caching"""
        return await super().find_by_status(status, limit, offset)
    
    @with_performance_monitoring("clients", "find_by_program_type")
    async def find_by_program_type(
        self, 
        program_type: ProgramType,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Find clients by program type with caching"""
        return await super().find_by_program_type(program_type, limit, offset)
    
    @with_performance_monitoring("clients", "search")
    async def search(
        self, 
        query: str,
        limit: Optional[int] = None, 
        offset: Optional[int] = None
    ) -> List[Client]:
        """Search clients with caching"""
        return await super().search(query, limit, offset)
    
    @with_performance_monitoring("clients", "count")
    async def count(self) -> int:
        """Count total clients with caching"""
        return await super().count()
    
    @with_performance_monitoring("clients", "count_by_status")
    async def count_by_status(self, status: ClientStatus) -> int:
        """Count clients by status with caching"""
        return await super().count_by_status(status)
    
    @with_performance_monitoring("clients", "count_by_program_type")
    async def count_by_program_type(self, program_type: ProgramType) -> int:
        """Count clients by program type with caching"""
        return await super().count_by_program_type(program_type)
    
    @with_performance_monitoring("clients", "delete")
    async def delete(self, client_id: ClientId) -> bool:
        """Delete client with performance monitoring"""
        return await super().delete(client_id)
    
    @with_performance_monitoring("clients", "analytics")
    async def get_analytics_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        program_type: Optional[ProgramType] = None
    ) -> Dict[str, Any]:
        """Get analytics data with caching"""
        return await super().get_analytics_data(start_date, end_date, program_type)
    
    # Enhanced methods with batch operations
    async def save_batch(self, clients: List[Client]) -> None:
        """Save multiple clients in batch"""
        if not clients:
            return
        
        async with connection_pool.get_connection() as conn:
            try:
                # Prepare batch data
                batch_data = [self._entity_to_dict(client) for client in clients]
                
                # Execute batch upsert
                response = self._client.table(self._table_name).upsert(batch_data).execute()
                
                if not response.data or len(response.data) != len(clients):
                    raise DomainException("Batch save operation failed")
                    
            except Exception as e:
                raise DomainException(f"Database error during batch save: {e}")
    
    async def find_by_ids(self, client_ids: List[ClientId]) -> List[Client]:
        """Find multiple clients by IDs efficiently"""
        if not client_ids:
            return []
        
        try:
            id_strings = [str(client_id) for client_id in client_ids]
            
            response = self._client.table(self._table_name)\
                .select("*")\
                .in_("id", id_strings)\
                .execute()
            
            return [self._dict_to_entity(data) for data in response.data]
            
        except Exception as e:
            raise DomainException(f"Database error while finding clients by IDs: {e}")
    
    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get optimized dashboard metrics with single query"""
        try:
            # Use Supabase RPC for aggregated queries
            response = self._client.rpc('get_client_dashboard_metrics').execute()
            
            if response.data:
                return response.data[0]
            
            # Fallback to multiple queries if RPC not available
            total_clients = await self.count()
            active_clients = await self.count_by_status(ClientStatus.ACTIVE)
            prime_clients = await self.count_by_program_type(ProgramType.PRIME)
            longevity_clients = await self.count_by_program_type(ProgramType.LONGEVITY)
            
            active_rate = (active_clients / total_clients * 100) if total_clients > 0 else 0
            
            return {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "prime_clients": prime_clients,
                "longevity_clients": longevity_clients,
                "active_rate": round(active_rate, 2),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            raise DomainException(f"Database error while getting dashboard metrics: {e}")
    
    async def get_recent_activity(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent client activity efficiently"""
        try:
            # Get recently updated clients
            response = self._client.table(self._table_name)\
                .select("id, name, status, updated_at, program_type")\
                .order("updated_at", desc=True)\
                .limit(limit)\
                .execute()
            
            activities = []
            for client_data in response.data:
                activities.append({
                    "client_id": client_data["id"],
                    "client_name": client_data["name"],
                    "activity_type": "profile_updated",
                    "program_type": client_data["program_type"],
                    "status": client_data["status"],
                    "timestamp": client_data["updated_at"]
                })
            
            return activities
            
        except Exception as e:
            raise DomainException(f"Database error while getting recent activity: {e}")
    
    async def search_with_filters(
        self, 
        query: str = None,
        status: ClientStatus = None,
        program_type: ProgramType = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Advanced search with multiple filters"""
        try:
            # Build dynamic query
            db_query = self._client.table(self._table_name).select("*")
            
            # Apply filters
            if query:
                db_query = db_query.or_(f"name.ilike.%{query}%,email.ilike.%{query}%")
            
            if status:
                db_query = db_query.eq("status", status.value)
            
            if program_type:
                db_query = db_query.eq("program_type", program_type.value)
            
            # Add pagination
            if offset:
                db_query = db_query.range(offset, offset + limit - 1)
            else:
                db_query = db_query.limit(limit)
            
            # Execute query
            response = db_query.execute()
            clients = [self._dict_to_entity(data) for data in response.data]
            
            # Get total count for pagination
            count_query = self._client.table(self._table_name).select("id", count="exact")
            
            if query:
                count_query = count_query.or_(f"name.ilike.%{query}%,email.ilike.%{query}%")
            if status:
                count_query = count_query.eq("status", status.value)
            if program_type:
                count_query = count_query.eq("program_type", program_type.value)
            
            count_response = count_query.execute()
            total_count = count_response.count
            
            return {
                "clients": clients,
                "total_count": total_count,
                "page_size": limit,
                "offset": offset,
                "has_more": offset + len(clients) < total_count
            }
            
        except Exception as e:
            raise DomainException(f"Database error during advanced search: {e}")


# Database schema optimization SQL
DATABASE_OPTIMIZATIONS = """
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_program_type ON clients(program_type);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_clients_status_program_type ON clients(status, program_type);
CREATE INDEX IF NOT EXISTS idx_clients_status_created_at ON clients(status, created_at);

-- Full-text search index for name and email
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || email));

-- RPC function for dashboard metrics
CREATE OR REPLACE FUNCTION get_client_dashboard_metrics()
RETURNS TABLE(
    total_clients bigint,
    active_clients bigint,
    prime_clients bigint,
    longevity_clients bigint,
    active_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE status = 'active') as active_clients,
        COUNT(*) FILTER (WHERE program_type = 'PRIME') as prime_clients,
        COUNT(*) FILTER (WHERE program_type = 'LONGEVITY') as longevity_clients,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'active')::numeric / 
             NULLIF(COUNT(*), 0) * 100), 2
        ) as active_rate
    FROM clients;
END;
$$ LANGUAGE plpgsql;

-- Analyze tables for query optimization
ANALYZE clients;
"""


async def apply_database_optimizations():
    """Apply database schema optimizations"""
    connection = OptimizedSupabaseConnection()
    
    try:
        # Split and execute each statement
        statements = [s.strip() for s in DATABASE_OPTIMIZATIONS.split(';') if s.strip()]
        
        for statement in statements:
            if statement:
                # Note: Supabase client doesn't support direct SQL execution
                # This would need to be run via Supabase dashboard or CLI
                print(f"Optimization SQL: {statement[:50]}...")
        
        print("Database optimizations prepared (apply via Supabase dashboard)")
        
    except Exception as e:
        raise DomainException(f"Error preparing database optimizations: {e}")


# Export optimized instances
def create_optimized_client_repository() -> OptimizedClientRepository:
    """Factory function for optimized client repository"""
    return OptimizedClientRepository()