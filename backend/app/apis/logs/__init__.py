from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date, timedelta
import databutton as db
import requests
import json
import re
import hashlib
import time

router = APIRouter()

# Cache system
class CacheManager:
    def __init__(self, max_size=100, ttl_seconds=300):
        self.cache = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.access_times = {}
    
    def get(self, key):
        """Get a value from cache if it exists and is not expired"""
        if key in self.cache:
            entry_time, value = self.cache[key]
            current_time = time.time()
            
            # Check if entry is expired
            if current_time - entry_time > self.ttl_seconds:
                # Remove expired entry
                del self.cache[key]
                if key in self.access_times:
                    del self.access_times[key]
                return None
            
            # Update access time
            self.access_times[key] = current_time
            return value
        return None
    
    def put(self, key, value):
        """Add a value to cache with the current timestamp"""
        current_time = time.time()
        
        # If cache is full, remove least recently used item
        if len(self.cache) >= self.max_size and key not in self.cache:
            self._evict_lru()
        
        self.cache[key] = (current_time, value)
        self.access_times[key] = current_time
    
    def _evict_lru(self):
        """Remove least recently used item from cache"""
        if not self.access_times:
            return
        
        # Find key with oldest access time
        lru_key = min(self.access_times.items(), key=lambda x: x[1])[0]
        
        # Remove from cache and access times
        if lru_key in self.cache:
            del self.cache[lru_key]
        del self.access_times[lru_key]
    
    def invalidate(self, key_prefix=None):
        """Invalidate cache entries that start with the given prefix"""
        if key_prefix is None:
            # Clear all cache
            self.cache.clear()
            self.access_times.clear()
            return
        
        # Find keys that match the prefix
        keys_to_remove = [k for k in self.cache.keys() if k.startswith(key_prefix)]
        
        # Remove matching keys
        for key in keys_to_remove:
            if key in self.cache:
                del self.cache[key]
            if key in self.access_times:
                del self.access_times[key]

# Initialize cache with 1 hour TTL for logs (they don't change that often)
log_cache = CacheManager(max_size=100, ttl_seconds=3600)

# Models
class ActivityLogRequest(BaseModel):
    limit: int = Field(10, ge=1, le=100)
    offset: int = Field(0, ge=0)
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    user_id: Optional[str] = None
    action: Optional[str] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None

class ActivityLogEntry(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    user_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime
    created_at: datetime

# Helper Functions
def get_supabase_credentials():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500, 
            detail="Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY secrets."
        )
    
    return supabase_url, supabase_key

def supabase_request(method, path, data=None, params=None):
    url, key = get_supabase_credentials()
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    full_url = f"{url}{path}"
    
    try:
        if method.lower() == "get":
            response = requests.get(full_url, headers=headers, params=params)
        elif method.lower() == "post":
            response = requests.post(full_url, headers=headers, json=data)
        elif method.lower() == "put":
            response = requests.put(full_url, headers=headers, json=data)
        elif method.lower() == "patch":
            response = requests.patch(full_url, headers=headers, json=data)
        elif method.lower() == "delete":
            response = requests.delete(full_url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        
        if response.status_code != 204:  # No content
            return response.json()
        return None
    except requests.exceptions.RequestException as e:
        error_detail = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_json = e.response.json()
                error_detail = error_json.get('message', str(e))
            except ValueError:
                error_detail = e.response.text or str(e)
        
        raise HTTPException(status_code=500, detail=f"Supabase API error: {error_detail}") from e

def generate_cache_key(prefix, params):
    """Generate a cache key based on the request parameters"""
    # Convert params to a sorted string representation to ensure consistent keys
    params_str = json.dumps(params, sort_keys=True, default=str)
    # Create hash for the parameters
    hash_obj = hashlib.md5(params_str.encode())
    hash_key = hash_obj.hexdigest()
    return f"{prefix}:{hash_key}"

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# API Endpoints
@router.post("/logs/activity", tags=["logs"])
async def log_activity(data: dict):
    """Log an activity in the system
    
    This endpoint records system activities like user actions, data changes, and system events.
    It provides a standardized way to log activities across the application for audit purposes.
    
    Args:
        data: A dictionary containing activity details including action, entity type, and metadata
        
    Returns:
        The created activity log entry with its ID
        
    Example Claude Usage:
        "Log that user X updated client Y's nutrition plan"
        "Record a system maintenance event"
        "Track when a program was assigned to a client"
    """
    try:
        required_fields = ["action", "entity_type"]
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Add timestamp if not provided
        if "timestamp" not in data:
            data["timestamp"] = datetime.now().isoformat()
        
        result = supabase_request("POST", "/rest/v1/activity_logs", data=data)
        
        # Invalidate cache for any activity logs queries
        log_cache.invalidate("activity_logs")
        
        return {
            "success": True,
            "data": result[0] if result and isinstance(result, list) else result,
            "message": "Activity logged successfully"
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error logging activity: {str(e)}") from e

@router.post("/logs/get", tags=["logs"])
async def get_activity_logs(request: ActivityLogRequest):
    """Get activity logs with filtering and pagination
    
    This endpoint retrieves activity logs with flexible filtering options including entity type,
    user ID, action type, and date ranges. Results are paginated for performance, and provide
    detailed information on all system activities for audit and monitoring purposes.
    
    Args:
        request: A request defining filters, pagination, and sorting options for logs
        
    Returns:
        A paginated list of activity logs matching the criteria
        
    Example Claude Usage:
        "Show me all client updates from last week"
        "Get system activities for user X"
        "List all deletion actions in chronological order"
        "Which user made the most recent changes to nutrition plans?"
    """
    try:
        # Convert request to dict for cache key generation
        request_dict = request.dict()
        cache_key = generate_cache_key("activity_logs", request_dict)
        
        # Check cache first
        cached_result = log_cache.get(cache_key)
        if cached_result:
            # Add cache info to response
            cached_result["cache_hit"] = True
            return cached_result
        
        # Build filters
        filters = []
        
        if request.entity_type:
            filters.append(f"entity_type=eq.{request.entity_type}")
        
        if request.entity_id:
            filters.append(f"entity_id=eq.{request.entity_id}")
        
        if request.user_id:
            filters.append(f"user_id=eq.{request.user_id}")
        
        if request.action:
            filters.append(f"action=eq.{request.action}")
        
        if request.from_date:
            filters.append(f"timestamp=gte.{request.from_date.isoformat()}")
        
        if request.to_date:
            filters.append(f"timestamp=lte.{request.to_date.isoformat()}")
        
        filter_str = "&".join(filters) if filters else ""
        
        # First get count
        count_path = f"/rest/v1/activity_logs?{filter_str}&select=count"
        count_result = supabase_request("GET", count_path)
        count = count_result[0].get("count", 0) if count_result and len(count_result) > 0 else 0
        
        # Then get paginated data
        path = f"/rest/v1/activity_logs?{filter_str}"
        params = {
            "select": "*",
            "order": "timestamp.desc",
            "limit": request.limit,
            "offset": request.offset
        }
        
        result = supabase_request("GET", path, params=params)
        
        # Prepare response
        response = {
            "success": True,
            "data": result,
            "count": count,
            "limit": request.limit,
            "offset": request.offset,
            "cache_hit": False
        }
        
        # Cache the result
        log_cache.put(cache_key, response)
        
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving activity logs: {str(e)}") from e

