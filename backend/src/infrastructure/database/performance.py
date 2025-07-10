"""
Database Performance Optimization Layer
"""

import asyncio
import time
from typing import Any, Dict, List, Optional, Callable, TypeVar, Generic
from dataclasses import dataclass
from datetime import datetime, timedelta
from functools import wraps
from contextlib import asynccontextmanager
import logging

from .supabase import SupabaseConnection

T = TypeVar('T')

@dataclass
class QueryMetrics:
    """Metrics for database query performance"""
    query_type: str
    table_name: str
    execution_time: float
    row_count: Optional[int]
    cache_hit: bool
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "query_type": self.query_type,
            "table_name": self.table_name,
            "execution_time": self.execution_time,
            "row_count": self.row_count,
            "cache_hit": self.cache_hit,
            "timestamp": self.timestamp.isoformat()
        }


class QueryCache:
    """In-memory cache for database queries with TTL"""
    
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._default_ttl = default_ttl
        self._logger = logging.getLogger(__name__)
    
    def _generate_key(self, table: str, query: str, params: Dict[str, Any]) -> str:
        """Generate cache key from query parameters"""
        import hashlib
        query_string = f"{table}:{query}:{str(sorted(params.items()))}"
        return hashlib.md5(query_string.encode()).hexdigest()
    
    def get(self, table: str, query: str, params: Dict[str, Any]) -> Optional[Any]:
        """Get cached result if not expired"""
        key = self._generate_key(table, query, params)
        
        if key in self._cache:
            cached_item = self._cache[key]
            if datetime.now() < cached_item['expires_at']:
                self._logger.debug(f"Cache hit for key: {key[:8]}...")
                return cached_item['data']
            else:
                # Remove expired item
                del self._cache[key]
                self._logger.debug(f"Cache expired for key: {key[:8]}...")
        
        return None
    
    def set(self, table: str, query: str, params: Dict[str, Any], data: Any, ttl: Optional[int] = None) -> None:
        """Cache query result with TTL"""
        key = self._generate_key(table, query, params)
        expires_at = datetime.now() + timedelta(seconds=ttl or self._default_ttl)
        
        self._cache[key] = {
            'data': data,
            'expires_at': expires_at,
            'created_at': datetime.now()
        }
        
        self._logger.debug(f"Cached result for key: {key[:8]}...")
    
    def invalidate_table(self, table: str) -> None:
        """Invalidate all cache entries for a table"""
        keys_to_remove = []
        for key, item in self._cache.items():
            if key.startswith(f"{table}:"):
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self._cache[key]
        
        self._logger.info(f"Invalidated {len(keys_to_remove)} cache entries for table: {table}")
    
    def clear(self) -> None:
        """Clear all cache entries"""
        count = len(self._cache)
        self._cache.clear()
        self._logger.info(f"Cleared {count} cache entries")
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        now = datetime.now()
        active_entries = sum(1 for item in self._cache.values() if now < item['expires_at'])
        
        return {
            "total_entries": len(self._cache),
            "active_entries": active_entries,
            "expired_entries": len(self._cache) - active_entries,
            "cache_size_mb": len(str(self._cache)) / (1024 * 1024)
        }


class ConnectionPool:
    """Connection pool for Supabase connections"""
    
    def __init__(self, max_connections: int = 10, connection_timeout: int = 30):
        self._max_connections = max_connections
        self._connection_timeout = connection_timeout
        self._pool: List[SupabaseConnection] = []
        self._active_connections: int = 0
        self._lock = asyncio.Lock()
        self._logger = logging.getLogger(__name__)
    
    async def acquire(self) -> SupabaseConnection:
        """Acquire connection from pool"""
        async with self._lock:
            if self._pool:
                connection = self._pool.pop()
                self._active_connections += 1
                self._logger.debug(f"Acquired connection from pool. Active: {self._active_connections}")
                return connection
            
            if self._active_connections < self._max_connections:
                connection = SupabaseConnection()
                self._active_connections += 1
                self._logger.debug(f"Created new connection. Active: {self._active_connections}")
                return connection
            
            # Wait for connection to become available
            self._logger.warning("Connection pool exhausted, waiting...")
            await asyncio.sleep(0.1)
            return await self.acquire()
    
    async def release(self, connection: SupabaseConnection) -> None:
        """Release connection back to pool"""
        async with self._lock:
            if len(self._pool) < self._max_connections:
                self._pool.append(connection)
            
            self._active_connections -= 1
            self._logger.debug(f"Released connection to pool. Active: {self._active_connections}")
    
    @asynccontextmanager
    async def get_connection(self):
        """Context manager for connection handling"""
        connection = await self.acquire()
        try:
            yield connection
        finally:
            await self.release(connection)
    
    def stats(self) -> Dict[str, Any]:
        """Get pool statistics"""
        return {
            "max_connections": self._max_connections,
            "active_connections": self._active_connections,
            "available_connections": len(self._pool),
            "pool_utilization": (self._active_connections / self._max_connections) * 100
        }


class PerformanceMonitor:
    """Performance monitoring for database operations"""
    
    def __init__(self, max_metrics: int = 1000):
        self._metrics: List[QueryMetrics] = []
        self._max_metrics = max_metrics
        self._logger = logging.getLogger(__name__)
    
    def record_query(self, metrics: QueryMetrics) -> None:
        """Record query metrics"""
        self._metrics.append(metrics)
        
        # Keep only recent metrics
        if len(self._metrics) > self._max_metrics:
            self._metrics = self._metrics[-self._max_metrics:]
        
        # Log slow queries
        if metrics.execution_time > 1.0:  # > 1 second
            self._logger.warning(
                f"Slow query detected: {metrics.query_type} on {metrics.table_name} "
                f"took {metrics.execution_time:.2f}s"
            )
    
    def get_stats(self, minutes: int = 60) -> Dict[str, Any]:
        """Get performance statistics for the last N minutes"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        recent_metrics = [m for m in self._metrics if m.timestamp > cutoff_time]
        
        if not recent_metrics:
            return {"message": "No metrics available for the specified time period"}
        
        # Calculate statistics
        total_queries = len(recent_metrics)
        total_time = sum(m.execution_time for m in recent_metrics)
        avg_time = total_time / total_queries
        cache_hits = sum(1 for m in recent_metrics if m.cache_hit)
        cache_hit_rate = (cache_hits / total_queries) * 100
        
        # Query type distribution
        query_types = {}
        for metric in recent_metrics:
            query_types[metric.query_type] = query_types.get(metric.query_type, 0) + 1
        
        # Table access distribution
        table_access = {}
        for metric in recent_metrics:
            table_access[metric.table_name] = table_access.get(metric.table_name, 0) + 1
        
        # Slowest queries
        slowest_queries = sorted(recent_metrics, key=lambda m: m.execution_time, reverse=True)[:5]
        
        return {
            "period_minutes": minutes,
            "total_queries": total_queries,
            "total_execution_time": round(total_time, 2),
            "average_execution_time": round(avg_time, 3),
            "cache_hit_rate": round(cache_hit_rate, 2),
            "query_type_distribution": query_types,
            "table_access_distribution": table_access,
            "slowest_queries": [
                {
                    "query_type": m.query_type,
                    "table": m.table_name,
                    "execution_time": round(m.execution_time, 3),
                    "timestamp": m.timestamp.isoformat()
                }
                for m in slowest_queries
            ]
        }


# Global instances
query_cache = QueryCache()
connection_pool = ConnectionPool()
performance_monitor = PerformanceMonitor()


def with_performance_monitoring(table_name: str, query_type: str):
    """Decorator to add performance monitoring to database methods"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            cache_hit = False
            
            try:
                # Check cache for read operations
                if query_type in ['select', 'find', 'search', 'count']:
                    cache_key_params = {
                        'args': str(args[1:]),  # Skip self
                        'kwargs': str(kwargs)
                    }
                    cached_result = query_cache.get(table_name, query_type, cache_key_params)
                    
                    if cached_result is not None:
                        cache_hit = True
                        execution_time = time.time() - start_time
                        
                        metrics = QueryMetrics(
                            query_type=query_type,
                            table_name=table_name,
                            execution_time=execution_time,
                            row_count=len(cached_result) if isinstance(cached_result, list) else 1,
                            cache_hit=True,
                            timestamp=datetime.now()
                        )
                        performance_monitor.record_query(metrics)
                        
                        return cached_result
                
                # Execute the actual function
                result = await func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # Cache the result for read operations
                if query_type in ['select', 'find', 'search', 'count'] and result is not None:
                    cache_key_params = {
                        'args': str(args[1:]),
                        'kwargs': str(kwargs)
                    }
                    # Use shorter TTL for frequently changing data
                    ttl = 60 if query_type == 'count' else 300
                    query_cache.set(table_name, query_type, cache_key_params, result, ttl)
                
                # Invalidate cache for write operations
                if query_type in ['insert', 'update', 'delete', 'save', 'upsert']:
                    query_cache.invalidate_table(table_name)
                
                # Record metrics
                row_count = None
                if isinstance(result, list):
                    row_count = len(result)
                elif isinstance(result, (int, bool)):
                    row_count = 1 if result else 0
                
                metrics = QueryMetrics(
                    query_type=query_type,
                    table_name=table_name,
                    execution_time=execution_time,
                    row_count=row_count,
                    cache_hit=cache_hit,
                    timestamp=datetime.now()
                )
                performance_monitor.record_query(metrics)
                
                return result
                
            except Exception as e:
                execution_time = time.time() - start_time
                
                # Record failed query metrics
                metrics = QueryMetrics(
                    query_type=f"{query_type}_error",
                    table_name=table_name,
                    execution_time=execution_time,
                    row_count=0,
                    cache_hit=cache_hit,
                    timestamp=datetime.now()
                )
                performance_monitor.record_query(metrics)
                
                raise
        
        return wrapper
    return decorator


class OptimizedSupabaseConnection(SupabaseConnection):
    """Optimized Supabase connection with performance enhancements"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._logger = logging.getLogger(__name__)
    
    @with_performance_monitoring("system", "health_check")
    async def health_check(self) -> bool:
        """Enhanced health check with performance monitoring"""
        return await super().health_check()
    
    async def execute_with_retry(
        self, 
        operation: Callable, 
        max_retries: int = 3, 
        delay: float = 1.0
    ) -> Any:
        """Execute database operation with retry logic"""
        last_exception = None
        
        for attempt in range(max_retries):
            try:
                return await operation()
            except Exception as e:
                last_exception = e
                self._logger.warning(
                    f"Database operation failed (attempt {attempt + 1}/{max_retries}): {e}"
                )
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(delay * (2 ** attempt))  # Exponential backoff
        
        raise last_exception
    
    async def batch_operation(self, operations: List[Callable]) -> List[Any]:
        """Execute multiple operations in batch"""
        if not operations:
            return []
        
        # Use connection pool for batch operations
        async with connection_pool.get_connection() as conn:
            tasks = [op() for op in operations]
            return await asyncio.gather(*tasks, return_exceptions=True)


# Performance analysis utilities
async def analyze_query_performance(table_name: str = None, minutes: int = 60) -> Dict[str, Any]:
    """Analyze query performance for optimization opportunities"""
    stats = performance_monitor.get_stats(minutes)
    
    if not stats or stats.get("total_queries", 0) == 0:
        return {"message": "No performance data available"}
    
    # Add optimization recommendations
    recommendations = []
    
    if stats["cache_hit_rate"] < 50:
        recommendations.append("Consider increasing cache TTL for read-heavy operations")
    
    if stats["average_execution_time"] > 0.5:
        recommendations.append("Consider adding database indexes for frequently queried columns")
    
    slow_queries = stats.get("slowest_queries", [])
    if slow_queries and slow_queries[0]["execution_time"] > 2.0:
        recommendations.append("Investigate and optimize slow queries")
    
    # Connection pool stats
    pool_stats = connection_pool.stats()
    if pool_stats["pool_utilization"] > 80:
        recommendations.append("Consider increasing connection pool size")
    
    # Cache stats
    cache_stats = query_cache.stats()
    
    return {
        **stats,
        "cache_statistics": cache_stats,
        "connection_pool_statistics": pool_stats,
        "optimization_recommendations": recommendations
    }


async def get_database_health() -> Dict[str, Any]:
    """Get comprehensive database health status"""
    connection = OptimizedSupabaseConnection()
    
    try:
        start_time = time.time()
        is_healthy = await connection.health_check()
        response_time = time.time() - start_time
        
        performance_stats = await analyze_query_performance(minutes=5)
        
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "response_time": round(response_time, 3),
            "timestamp": datetime.now().isoformat(),
            "performance_summary": {
                "recent_queries": performance_stats.get("total_queries", 0),
                "average_response_time": performance_stats.get("average_execution_time", 0),
                "cache_hit_rate": performance_stats.get("cache_hit_rate", 0)
            },
            "connection_pool": connection_pool.stats(),
            "cache_status": query_cache.stats()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }