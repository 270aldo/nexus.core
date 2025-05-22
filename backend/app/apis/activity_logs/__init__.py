from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import databutton as db
import uuid
import json
from ..supabase_client import get_supabase_client

# Alias para mantener compatibilidad
def get_supabase(service_key=True):
    return get_supabase_client()

# Create API router
router = APIRouter()


class ActivityLogEntry(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    action: str
    entity_type: str  # 'client', 'program', 'nutrition', etc.
    entity_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class LogActivityRequest(BaseModel):
    action: str = Field(..., description="The action performed (e.g., 'create', 'update', 'delete', 'view')")
    entity_type: str = Field(..., description="The type of entity affected (e.g., 'client', 'program', 'nutrition')")
    entity_id: Optional[str] = Field(None, description="The ID of the entity affected")
    user_id: Optional[str] = Field(None, description="The ID of the user who performed the action")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details about the activity")


class GetActivityLogsRequest(BaseModel):
    entity_type: Optional[str] = Field(None, description="Filter logs by entity type")
    entity_id: Optional[str] = Field(None, description="Filter logs by entity ID")
    user_id: Optional[str] = Field(None, description="Filter logs by user ID")
    action: Optional[str] = Field(None, description="Filter logs by action")
    from_date: Optional[datetime] = Field(None, description="Filter logs from this date")
    to_date: Optional[datetime] = Field(None, description="Filter logs to this date")
    limit: Optional[int] = Field(10, description="Limit the number of logs returned")
    offset: Optional[int] = Field(0, description="Offset for pagination")


@router.post("/log_activity", tags=["system"], operation_id="record_system_activity")
def record_system_activity(request: LogActivityRequest):
    """Log a new activity in the system.
    
    This endpoint records user actions within the system, creating an audit trail of all important operations.
    The logs are cached for efficient retrieval and optimized for performance.
    
    Examples of activities that can be logged:
    - Client creation/update/deletion
    - Program assignments
    - Measurement logging
    - System configuration changes
    
    Returns the created activity log entry with its generated ID.
    """
    try:
        supabase = get_supabase()
        
        # Prepare the activity log data
        activity_data = {
            "id": str(uuid.uuid4()),
            "action": request.action,
            "entity_type": request.entity_type,
            "entity_id": request.entity_id,
            "user_id": request.user_id,
            "details": request.details,
            "timestamp": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        # Initialize schema with Supabase
        result = supabase_request(
            "POST", 
            f"/rest/v1/activity_logs",
            data={"id": str(uuid.uuid4()), "created_at": "now()", **activity_data}
        )
        
        if not result or not result.get('data'):
            raise HTTPException(status_code=500, detail="Failed to log activity")
        
        return {
            "success": True,
            "data": response.data[0],
            "message": "Activity logged successfully"
        }
    except Exception as e:
        print(f"Error logging activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error logging activity: {str(e)}") from e


@router.post("/get_activity_logs", tags=["system", "mcp"], operation_id="retrieve_system_activities")
def retrieve_system_activities(request: GetActivityLogsRequest):
    """Retrieve activity logs with optional filtering.
    
    This endpoint allows querying the activity logs with various filters such as entity type,
    entity ID, user ID, action, and date range.
    
    The logs provide visibility into all actions taken within the system, creating an audit trail
    that helps with troubleshooting, compliance, and understanding user behavior.
    
    Returns a paginated list of activity logs ordered by timestamp (newest first).
    """
    try:
        supabase = get_supabase()
        
        # Start building the query
        query = supabase.table("activity_logs").select("*")
        
        # Apply filters if provided
        if request.entity_type:
            query = query.eq("entity_type", request.entity_type)
        
        if request.entity_id:
            query = query.eq("entity_id", request.entity_id)
        
        if request.user_id:
            query = query.eq("user_id", request.user_id)
        
        if request.action:
            query = query.eq("action", request.action)
        
        if request.from_date:
            query = query.gte("timestamp", request.from_date.isoformat())
        
        if request.to_date:
            query = query.lte("timestamp", request.to_date.isoformat())
        
        # Order by timestamp (newest first)
        query = query.order("timestamp", options={"ascending": False})
        
        # Apply pagination
        query = query.range(request.offset, request.offset + request.limit - 1)
        
        # Execute the query
        response = query.execute()
        
        if not hasattr(response, 'data'):
            return {
                "success": False,
                "data": [],
                "message": "Failed to retrieve activity logs"
            }
        
        return {
            "success": True,
            "data": response.data,
            "count": len(response.data),
            "offset": request.offset,
            "limit": request.limit
        }
    except Exception as e:
        print(f"Error retrieving activity logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving activity logs: {str(e)}") from e


@router.post("/initialize_activity_logs_table", tags=["system"])
def initialize_activity_logs_table():
    """Initialize the activity_logs table in the database.
    
    This endpoint creates the activity_logs table if it doesn't exist already.
    It's typically called during the initial setup of the system.
    """
    try:
        supabase = get_supabase(service_key=True)
        
        # SQL to create the activity_logs table
        sql = """
        CREATE TABLE IF NOT EXISTS activity_logs (
            id UUID PRIMARY KEY,
            user_id UUID,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id UUID,
            details JSONB,
            timestamp TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
        
        -- Enable Row Level Security
        ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy that allows all authenticated users to read activity logs
        DROP POLICY IF EXISTS activity_logs_select_policy ON activity_logs;
        CREATE POLICY activity_logs_select_policy ON activity_logs
            FOR SELECT USING (auth.role() = 'authenticated');
        
        -- Create a policy that allows all authenticated users to insert activity logs
        DROP POLICY IF EXISTS activity_logs_insert_policy ON activity_logs;
        CREATE POLICY activity_logs_insert_policy ON activity_logs
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        """
        
        print("Initializing activity logs table...")
        result = supabase.rpc('pgmoon', {"query": sql}).execute()
        print("Activity logs table initialized successfully")
        
        return {
            "success": True,
            "message": "Activity logs table initialized successfully"
        }
    except Exception as e:
        print(f"Error initializing activity logs table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing activity logs table: {str(e)}") from e