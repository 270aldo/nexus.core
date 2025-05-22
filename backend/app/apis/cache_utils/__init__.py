import time
from typing import Dict, Any, Callable, Optional
import threading
import json
import hashlib

# Simple in-memory cache with TTL
class SimpleCache:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: Dict[str, Any]) -> str:
        """Generate a unique cache key based on function name and arguments."""
        # Convert arguments to a string representation
        try:
            args_str = json.dumps(args, sort_keys=True)
            kwargs_str = json.dumps(kwargs, sort_keys=True)
            key_data = f"{func_name}:{args_str}:{kwargs_str}"
            return hashlib.md5(key_data.encode()).hexdigest()
        except:
            # If serialization fails, generate a unique key based on the function name and time
            return f"{func_name}:{time.time()}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if it exists and hasn't expired."""
        with self.lock:
            if key in self.cache:
                entry = self.cache[key]
                if entry["expiry"] > time.time() or entry["expiry"] == 0:
                    return entry["value"]
                else:
                    # Remove expired entry
                    del self.cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        """Set value in cache with a TTL (in seconds). Use ttl=0 for no expiration."""
        expiry = time.time() + ttl if ttl > 0 else 0
        with self.lock:
            self.cache[key] = {"value": value, "expiry": expiry}
    
    def delete(self, key: str) -> None:
        """Delete a specific key from cache."""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
    
    def clear(self) -> None:
        """Clear all cache entries."""
        with self.lock:
            self.cache.clear()

# Create a global cache instance
query_cache = SimpleCache()

# Decorator for caching function results
def cached(ttl: int = 300):
    """Decorator to cache function results with a TTL (in seconds).
    
    Args:
        ttl: Time to live in seconds. Default is 300 seconds (5 minutes).
             Use 0 for no expiration.
    
    Example usage:
        @cached(ttl=60)  # Cache results for 60 seconds
        def expensive_function(arg1, arg2, **kwargs):
            # Function implementation
    """
    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = query_cache._generate_key(func.__name__, args, kwargs)
            
            # Try to get from cache first
            cached_result = query_cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # If not in cache, call the function
            result = func(*args, **kwargs)
            
            # Cache the result
            query_cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Function to invalidate cache for a specific function
def invalidate_cache_for_function(func_name: str) -> None:
    """Invalidate all cache entries for a specific function."""
    with query_cache.lock:
        keys_to_delete = [key for key in query_cache.cache.keys() if key.startswith(func_name)]
        for key in keys_to_delete:
            del query_cache.cache[key]

# Function to get cache statistics
def get_cache_stats() -> Dict[str, Any]:
    """Get statistics about the current cache state."""
    with query_cache.lock:
        total_entries = len(query_cache.cache)
        active_entries = sum(1 for entry in query_cache.cache.values() if entry["expiry"] > time.time() or entry["expiry"] == 0)
        expired_entries = total_entries - active_entries
        
        # Group by function name prefix
        function_counts = {}
        for key in query_cache.cache.keys():
            func_name = key.split(":")[0] if ":" in key else "unknown"
            if func_name not in function_counts:
                function_counts[func_name] = 0
            function_counts[func_name] += 1
        
        return {
            "total_entries": total_entries,
            "active_entries": active_entries,
            "expired_entries": expired_entries,
            "function_counts": function_counts
        }
