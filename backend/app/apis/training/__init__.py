from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, UUID4, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
from datetime import date, datetime
from enum import Enum
from app.apis.shared import get_supabase_credentials, supabase_request

router = APIRouter()

# ======== Models ========

class ProgramType(str, Enum):
    STRENGTH = "strength"
    HYPERTROPHY = "hypertrophy"
    ENDURANCE = "endurance"
    WEIGHT_LOSS = "weight_loss"
    MOBILITY = "mobility"
    REHABILITATION = "rehabilitation"
    CUSTOM = "custom"

class ExerciseDetails(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    muscle_groups: Optional[List[str]] = None
    equipment: Optional[List[str]] = None
    difficulty: Optional[int] = None  # 1-5 scale
    instructions: Optional[List[str]] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    substitutes: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class ProgramExercise(BaseModel):
    exercise_id: str
    sets: int
    reps: Optional[str] = None  # Can be "8-12" or specific number
    weight: Optional[str] = None  # Can be "body weight" or specific weights
    rest: Optional[int] = None  # in seconds
    tempo: Optional[str] = None  # e.g., "3-1-3" for eccentric-pause-concentric
    notes: Optional[str] = None
    superset_with: Optional[List[str]] = None  # List of exercise_ids

class ProgramWorkout(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[int] = None  # in minutes
    exercises: List[ProgramExercise]
    notes: Optional[str] = None
    order: Optional[int] = None

class TrainingProgram(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    type: ProgramType
    duration_weeks: int
    frequency_per_week: int
    target_audience: Optional[List[str]] = None
    difficulty: Optional[int] = None  # 1-5 scale
    workouts: List[ProgramWorkout]
    notes: Optional[str] = None
    author: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientProgram(BaseModel):
    id: Optional[str] = None
    client_id: str
    program_id: str
    start_date: date
    end_date: Optional[date] = None
    status: str = "active"  # active, completed, cancelled
    progress: Optional[int] = None  # Percentage completion
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientProgramUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    end_date: Optional[date] = None

class TrainingProgramAssignment(BaseModel):
    client_id: str
    program_id: str
    start_date: date
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class ProgramResponse(BaseModel):
    programs: List[TrainingProgram]
    total: int

# ======== Helper Functions ========

# ======== API Endpoints ========

@router.get("/training/templates", response_model=ProgramResponse)
def get_training_templates(
    program_type: Optional[ProgramType] = Query(None, description="Type of training program to filter by"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of templates to return"),
    offset: int = Query(0, ge=0, description="Number of templates to skip")
):
    """Get training program templates with optional filtering"""
    try:
        # Build filters
        filters = []
        
        if program_type:
            filters.append(f"type=eq.{program_type}")
        
        filter_str = "&".join(filters) if filters else ""
        path = f"/rest/v1/training_programs?{filter_str}"
        
        # Get count first
        count_path = f"{path}&select=count"
        count_result = supabase_request("GET", count_path)
        total = count_result[0].get("count", 0) if count_result and len(count_result) > 0 else 0
        
        # Get programs
        params = {
            "select": "*",
            "order": "created_at.desc",
            "limit": limit,
            "offset": offset
        }
        
        result = supabase_request("GET", path, params=params)
        
        return {
            "programs": result,
            "total": total
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving training templates: {str(e)}") from e

@router.get("/training/programs/{program_id}", response_model=TrainingProgram)
def get_training_program(program_id: str = Path(..., description="The ID of the training program")):
    """Get a specific training program by ID"""
    try:
        result = supabase_request(
            "GET", 
            f"/rest/v1/training_programs?id=eq.{program_id}&select=*",
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail=f"Training program with ID {program_id} not found")
        
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving training program: {str(e)}") from e

@router.get("/training/clients/{client_id}/program", response_model=Union[ClientProgram, Dict[str, None]])
def get_client_active_program(client_id: str = Path(..., description="The ID of the client")):
    """Get a client's active training program"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Get active program
        result = supabase_request(
            "GET", 
            f"/rest/v1/client_programs?client_id=eq.{client_id}&status=eq.active&select=*&order=start_date.desc&limit=1",
        )
        
        if not result or len(result) == 0:
            return {"client_id": client_id, "program_id": None}
        
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving client program: {str(e)}") from e

@router.post("/training/clients/program", response_model=ClientProgram, status_code=201)
def assign_program_to_client(assignment: TrainingProgramAssignment):
    """Assign a training program to a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{assignment.client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {assignment.client_id} not found")
        
        # Verify program exists
        program_check = supabase_request(
            "GET", 
            f"/rest/v1/training_programs?id=eq.{assignment.program_id}&select=id,duration_weeks",
        )
        
        if not program_check or len(program_check) == 0:
            raise HTTPException(status_code=404, detail=f"Training program with ID {assignment.program_id} not found")
        
        # Calculate end date based on program duration
        duration_weeks = program_check[0].get("duration_weeks", 4)  # Default to 4 weeks if not specified
        start_date = assignment.start_date
        end_date = None
        if start_date:
            # Calculate end date (start_date + duration_weeks * 7 days - 1)
            end_date = start_date + datetime.timedelta(days=(duration_weeks * 7) - 1)
        
        # Mark any existing active programs as completed
        existing_programs = supabase_request(
            "GET", 
            f"/rest/v1/client_programs?client_id=eq.{assignment.client_id}&status=eq.active&select=id",
        )
        
        if existing_programs and len(existing_programs) > 0:
            for program in existing_programs:
                supabase_request(
                    "PATCH", 
                    f"/rest/v1/client_programs?id=eq.{program['id']}",
                    data={"status": "completed"}
                )
        
        # Create new client program
        client_program_data = {
            "client_id": assignment.client_id,
            "program_id": assignment.program_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat() if end_date else None,
            "status": "active",
            "progress": 0,
            "adjustments": assignment.adjustments,
            "notes": assignment.notes
        }
        
        result = supabase_request(
            "POST", 
            "/rest/v1/client_programs",
            data=client_program_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error assigning program to client: {str(e)}") from e

@router.patch("/training/clients/{client_id}/program", response_model=ClientProgram)
def update_client_program(
    client_id: str = Path(..., description="The ID of the client"),
    updates: ClientProgramUpdate = Body(...)
):
    """Update a client's active training program"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Get active program
        active_program = supabase_request(
            "GET", 
            f"/rest/v1/client_programs?client_id=eq.{client_id}&status=eq.active&select=*&order=start_date.desc&limit=1",
        )
        
        if not active_program or len(active_program) == 0:
            raise HTTPException(status_code=404, detail=f"No active program found for client with ID {client_id}")
        
        program_id = active_program[0].get("id")
        
        # Prepare update data
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        # Update the program
        result = supabase_request(
            "PATCH", 
            f"/rest/v1/client_programs?id=eq.{program_id}",
            data=update_data
        )
        
        # Get updated program
        updated_program = supabase_request(
            "GET", 
            f"/rest/v1/client_programs?id=eq.{program_id}&select=*",
        )
        
        if not updated_program or len(updated_program) == 0:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated program")
        
        return updated_program[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating client program: {str(e)}") from e

@router.get("/training/exercises/{exercise_id}", response_model=ExerciseDetails)
def get_exercise_details(exercise_id: str = Path(..., description="The ID of the exercise")):
    """Get detailed information about a specific exercise"""
    try:
        result = supabase_request(
            "GET", 
            f"/rest/v1/exercises_library?id=eq.{exercise_id}&select=*",
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail=f"Exercise with ID {exercise_id} not found")
        
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving exercise details: {str(e)}") from e
