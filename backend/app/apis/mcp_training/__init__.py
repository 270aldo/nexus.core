from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime
import json
import databutton as db
from supabase import create_client, Client

# Initialize Supabase client
def get_supabase() -> Client:
    url = db.secrets.get("SUPABASE_URL")
    service_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(url, service_key)

router = APIRouter(tags=["MCP-Training"])

# ------ Models ------

class Exercise(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    target_muscles: Optional[List[str]] = None
    equipment: Optional[List[str]] = None
    difficulty: Optional[str] = None
    video_url: Optional[str] = None
    instructions: Optional[List[str]] = None

class TrainingSet(BaseModel):
    set_number: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None  # in seconds
    distance: Optional[float] = None  # in meters
    rest: Optional[int] = None  # in seconds
    is_completed: Optional[bool] = False
    notes: Optional[str] = None

class ExerciseBlock(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: List[TrainingSet]
    notes: Optional[str] = None

class TrainingDay(BaseModel):
    day_number: int
    name: Optional[str] = None
    focus: Optional[str] = None
    exercises: List[ExerciseBlock]
    notes: Optional[str] = None

class TrainingWeek(BaseModel):
    week_number: int
    name: Optional[str] = None
    days: List[TrainingDay]
    notes: Optional[str] = None

class TrainingProgram(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    type: str  # PRIME or LONGEVITY
    duration_weeks: int
    target_level: Optional[str] = None
    weeks: List[TrainingWeek]
    tags: Optional[List[str]] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientProgram(BaseModel):
    id: Optional[str] = None
    client_id: str
    program_id: str
    start_date: date
    end_date: Optional[date] = None
    current_week: int = 1
    current_day: int = 1
    status: str = "active"  # active, completed, paused
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TrainingTemplatesRequest(BaseModel):
    program_type: Optional[str] = None  # PRIME or LONGEVITY
    limit: Optional[int] = 10

class TrainingTemplatesResponse(BaseModel):
    templates: List[TrainingProgram]
    total_count: int

class TrainingProgramRequest(BaseModel):
    program_id: str

class ClientProgramRequest(BaseModel):
    client_id: str

class AssignProgramRequest(BaseModel):
    client_id: str
    program_id: str
    start_date: date = Field(default_factory=lambda: date.today())
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class UpdateClientProgramRequest(BaseModel):
    client_id: str
    current_week: Optional[int] = None
    current_day: Optional[int] = None
    status: Optional[str] = None
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class ExerciseDetailsRequest(BaseModel):
    exercise_id: str

class ProgramResponse(BaseModel):
    success: bool
    message: str
    program_id: Optional[str] = None
    client_program_id: Optional[str] = None

# ------ Endpoints ------

@router.post("/mcp/training-templates", response_model=TrainingTemplatesResponse)
def mcpnew_get_training_templates(request: TrainingTemplatesRequest) -> TrainingTemplatesResponse:
    """Retrieve training program templates with optional filtering by program type.
    
    This endpoint allows you to fetch available training program templates from the database.
    Templates can be filtered by program type (PRIME or LONGEVITY) and limited in quantity.
    
    Parameters:
    - program_type: Optional filter for program type (PRIME or LONGEVITY)
    - limit: Maximum number of templates to return (default: 10)
    
    Returns a list of training program templates and the total count of matching templates.
    
    Example for Claude:
    ```
    To retrieve LONGEVITY training templates:
    {"program_type": "LONGEVITY", "limit": 5}
    
    To retrieve all templates (up to 10):
    {}
    ```
    """
    try:
        # Import cache utilities
        from app.apis.cache_utils import cached
        
        @cached(ttl=300)  # Cache for 5 minutes
        def get_templates(program_type, limit):
            supabase = get_supabase()
            
            # Start building the query
            query = supabase.table("training_programs").select("*")
            
            # Add program type filter if provided
            if program_type:
                query = query.eq("type", program_type)
            
            # Add limit if provided
            if limit:
                query = query.limit(limit)
            
            # Execute the query
            result = query.execute()
            
            # Count total templates
            count_query = supabase.table("training_programs").select("id", count="exact")
            if program_type:
                count_query = count_query.eq("type", program_type)
            count_result = count_query.execute()
            total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
            
            # Parse the templates
            templates = []
            for template_data in result.data:
                # Convert string fields to appropriate types if needed
                if isinstance(template_data.get("weeks"), str):
                    template_data["weeks"] = json.loads(template_data["weeks"])
                if isinstance(template_data.get("tags"), str):
                    template_data["tags"] = json.loads(template_data["tags"])
                
                templates.append(TrainingProgram(**template_data))
            
            return {
                "templates": templates,
                "total_count": total_count
            }
        
        # Get templates using cached function
        result = get_templates(request.program_type, request.limit)
        
        return TrainingTemplatesResponse(
            templates=result["templates"],
            total_count=result["total_count"]
        )
        supabase = get_supabase()
        
        # Start building the query
        query = supabase.table("training_programs").select("*")
        
        # Add program type filter if provided
        if request.program_type:
            query = query.eq("type", request.program_type)
        
        # Add limit if provided
        if request.limit:
            query = query.limit(request.limit)
        
        # Execute the query
        result = query.execute()
        
        # Count total templates
        count_query = supabase.table("training_programs").select("id", count="exact")
        if request.program_type:
            count_query = count_query.eq("type", request.program_type)
        count_result = count_query.execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        
        # Parse the templates
        templates = []
        for template_data in result.data:
            # Convert string fields to appropriate types if needed
            if isinstance(template_data.get("weeks"), str):
                template_data["weeks"] = json.loads(template_data["weeks"])
            if isinstance(template_data.get("tags"), str):
                template_data["tags"] = json.loads(template_data["tags"])
            
            templates.append(TrainingProgram(**template_data))
        
        return TrainingTemplatesResponse(
            templates=templates,
            total_count=total_count
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving training templates: {str(e)}")

@router.post("/mcp/training-program", response_model=TrainingProgram)
def mcpnew_get_training_program(request: TrainingProgramRequest) -> TrainingProgram:
    """Retrieve detailed information about a specific training program"""
    try:
        supabase = get_supabase()
        
        # Get the training program
        result = supabase.table("training_programs") \
            .select("*") \
            .eq("id", request.program_id) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Training program with ID {request.program_id} not found")
        
        program_data = result.data[0]
        
        # Convert string fields to appropriate types if needed
        if isinstance(program_data.get("weeks"), str):
            program_data["weeks"] = json.loads(program_data["weeks"])
        if isinstance(program_data.get("tags"), str):
            program_data["tags"] = json.loads(program_data["tags"])
        
        return TrainingProgram(**program_data)
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving training program: {str(e)}")

@router.post("/mcp/client-active-program", response_model=Dict[str, Any])
def mcpnew_get_client_active_program(request: ClientProgramRequest) -> Dict[str, Any]:
    """Retrieve the active training program assigned to a specific client"""
    try:
        supabase = get_supabase()
        
        # Get the client's active program
        client_program_result = supabase.table("client_programs") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if not client_program_result.data or len(client_program_result.data) == 0:
            return {"success": True, "has_active_program": False, "message": "No active training program found for this client"}
        
        client_program_data = client_program_result.data[0]
        program_id = client_program_data.get("program_id")
        
        # Get the training program details
        program_result = supabase.table("training_programs") \
            .select("*") \
            .eq("id", program_id) \
            .execute()
        
        if not program_result.data or len(program_result.data) == 0:
            return {
                "success": False, 
                "message": f"Client has an active program but program with ID {program_id} not found"
            }
        
        program_data = program_result.data[0]
        
        # Convert string fields to appropriate types if needed
        if isinstance(program_data.get("weeks"), str):
            program_data["weeks"] = json.loads(program_data["weeks"])
        if isinstance(program_data.get("tags"), str):
            program_data["tags"] = json.loads(program_data["tags"])
        if isinstance(client_program_data.get("adjustments"), str):
            client_program_data["adjustments"] = json.loads(client_program_data["adjustments"])
        
        # Return combined result
        return {
            "success": True,
            "has_active_program": True,
            "client_program": client_program_data,
            "program": program_data,
            "current_week": client_program_data.get("current_week", 1),
            "current_day": client_program_data.get("current_day", 1)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving client's active program: {str(e)}")

@router.post("/mcp/assign-program", response_model=ProgramResponse)
def mcpnew_assign_program_to_client(request: AssignProgramRequest) -> ProgramResponse:
    """Assign a training program to a client with optional adjustments"""
    try:
        supabase = get_supabase()
        
        # Check if program exists
        program_result = supabase.table("training_programs") \
            .select("id, duration_weeks") \
            .eq("id", request.program_id) \
            .execute()
        
        if not program_result.data or len(program_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Training program with ID {request.program_id} not found")
        
        program_duration_weeks = program_result.data[0].get("duration_weeks", 4)
        
        # Check if client exists
        client_result = supabase.table("clients") \
            .select("id") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Check if client already has an active program
        client_program_result = supabase.table("client_programs") \
            .select("id") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if client_program_result.data and len(client_program_result.data) > 0:
            # Update the existing program to inactive
            supabase.table("client_programs") \
                .update({"status": "completed"}) \
                .eq("id", client_program_result.data[0]["id"]) \
                .execute()
        
        # Calculate end date
        start_date = request.start_date
        end_date = date(start_date.year, start_date.month, start_date.day)
        for _ in range(program_duration_weeks * 7):
            end_date = date(end_date.year, end_date.month, end_date.day + 1)
        
        # Create client program
        client_program_data = {
            "client_id": request.client_id,
            "program_id": request.program_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "current_week": 1,
            "current_day": 1,
            "status": "active",
            "adjustments": request.adjustments,
            "notes": request.notes
        }
        
        # Insert the client program
        result = supabase.table("client_programs").insert(client_program_data).execute()
        
        # Extract the ID of the newly created client program
        if result.data and len(result.data) > 0:
            client_program_id = result.data[0]["id"]
            return ProgramResponse(
                success=True,
                message="Training program assigned to client successfully",
                program_id=request.program_id,
                client_program_id=client_program_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to assign program to client")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning program to client: {str(e)}")

@router.post("/mcp/update-client-program", response_model=ProgramResponse)
def mcpnew_update_client_program(request: UpdateClientProgramRequest) -> ProgramResponse:
    """Update a client's active training program with progress tracking and program adjustments"""
    try:
        supabase = get_supabase()
        
        # Get the client's active program
        client_program_result = supabase.table("client_programs") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if not client_program_result.data or len(client_program_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"No active training program found for client {request.client_id}")
        
        client_program_id = client_program_result.data[0]["id"]
        
        # Prepare update data
        update_data = {}
        if request.current_week is not None:
            update_data["current_week"] = request.current_week
        if request.current_day is not None:
            update_data["current_day"] = request.current_day
        if request.status is not None:
            update_data["status"] = request.status
        if request.adjustments is not None:
            update_data["adjustments"] = request.adjustments
        if request.notes is not None:
            update_data["notes"] = request.notes
        
        # Update the client program
        result = supabase.table("client_programs") \
            .update(update_data) \
            .eq("id", client_program_id) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return ProgramResponse(
                success=True,
                message="Client program updated successfully",
                client_program_id=client_program_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to update client program")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating client program: {str(e)}")

@router.post("/mcp/exercise-details", response_model=Exercise)
def mcpnew_get_exercise_details(request: ExerciseDetailsRequest) -> Exercise:
    """Retrieve detailed information about a specific exercise.
    
    This endpoint provides comprehensive details about a specific exercise including
    name, category, target muscles, equipment needed, difficulty level, instructions,
    and video URL if available.
    
    Parameters:
    - exercise_id: The unique identifier of the exercise
    
    Returns the complete exercise details including all available metadata.
    
    Example for Claude:
    ```
    To get details about a specific exercise:
    {"exercise_id": "12345"}
    ```
    """
    try:
        # Import cache utilities
        from app.apis.cache_utils import cached
        
        @cached(ttl=3600)  # Cache for 1 hour - exercises don't change often
        def get_exercise(exercise_id):
            supabase = get_supabase()
            
            # Get the exercise details
            result = supabase.table("exercises_library") \
                .select("*") \
                .eq("id", exercise_id) \
                .execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(status_code=404, detail=f"Exercise with ID {exercise_id} not found")
            
            exercise_data = result.data[0]
            
            # Convert string fields to appropriate types if needed
            if isinstance(exercise_data.get("target_muscles"), str):
                exercise_data["target_muscles"] = json.loads(exercise_data["target_muscles"])
            if isinstance(exercise_data.get("equipment"), str):
                exercise_data["equipment"] = json.loads(exercise_data["equipment"])
            if isinstance(exercise_data.get("instructions"), str):
                exercise_data["instructions"] = json.loads(exercise_data["instructions"])
            
            return Exercise(**exercise_data)
        
        # Use the cached function
        return get_exercise(request.exercise_id)
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exercise details: {str(e)}")
