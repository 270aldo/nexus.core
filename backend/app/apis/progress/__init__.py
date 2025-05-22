from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, UUID4, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
from datetime import date, datetime, timedelta
from enum import Enum
from app.apis.shared import get_supabase_credentials, supabase_request

router = APIRouter()

# ======== Models ========

class RecordType(str, Enum):
    WEIGHT = "weight"
    MEASUREMENTS = "measurements"
    WORKOUT = "workout"
    FEEDBACK = "feedback"
    NUTRITION = "nutrition"
    BLOOD_WORK = "blood_work"
    SLEEP = "sleep"

class BodyMeasurements(BaseModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    arms: Optional[Dict[str, float]] = None  # {"left": x, "right": y}
    legs: Optional[Dict[str, float]] = None  # {"left": x, "right": y}
    neck: Optional[float] = None
    shoulders: Optional[float] = None
    custom: Optional[Dict[str, float]] = None

class Exercise(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None  # in seconds
    distance: Optional[float] = None  # in meters
    notes: Optional[str] = None
    completed: Optional[bool] = True

class WorkoutSet(BaseModel):
    exercises: List[Exercise]
    rest_between: Optional[int] = None  # in seconds
    completed: Optional[bool] = True
    notes: Optional[str] = None

class WorkoutData(BaseModel):
    name: Optional[str] = None
    program_id: Optional[str] = None
    duration: Optional[int] = None  # Total duration in minutes
    sets: List[WorkoutSet]
    intensity: Optional[int] = None  # 1-10 scale
    calories_burned: Optional[int] = None
    location: Optional[str] = None

class FeedbackData(BaseModel):
    energy_level: Optional[int] = None  # 1-10
    mood: Optional[int] = None  # 1-10
    stress_level: Optional[int] = None  # 1-10
    sleep_quality: Optional[int] = None  # 1-10
    soreness: Optional[Dict[str, int]] = None  # {"body_part": level (1-10)}
    motivation: Optional[int] = None  # 1-10
    rating: Optional[int] = None  # Overall rating 1-10
    notes: Optional[str] = None

# Request models
class MeasurementRequest(BaseModel):
    client_id: str
    date: date
    measurements: BodyMeasurements
    notes: Optional[str] = None

class WorkoutRequest(BaseModel):
    client_id: str
    date: date
    workout_data: WorkoutData
    notes: Optional[str] = None

class FeedbackRequest(BaseModel):
    client_id: str
    date: date
    feedback: FeedbackData
    notes: Optional[str] = None

class ProgressRecord(BaseModel):
    id: UUID4
    client_id: UUID4
    date: date
    record_type: RecordType
    data: Dict[str, Any]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class DateRange(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class ProgressHistoryResponse(BaseModel):
    records: List[ProgressRecord]
    total: int

class MetricSummary(BaseModel):
    metric: str
    values: List[Dict[str, Any]]
    start_value: Optional[float] = None
    current_value: Optional[float] = None
    change: Optional[float] = None
    change_percentage: Optional[float] = None

class ProgressSummaryResponse(BaseModel):
    metrics: List[MetricSummary]
    date_range: DateRange

# ======== Helper Functions ========

# ======== API Endpoints ========

@router.post("/progress/measurements", response_model=ProgressRecord)
def log_measurement(request: MeasurementRequest):
    """Log body measurements for a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Create progress record
        progress_data = {
            "client_id": request.client_id,
            "date": request.date.isoformat(),
            "record_type": RecordType.MEASUREMENTS,
            "data": request.measurements.dict(exclude_none=True),
            "notes": request.notes
        }
        
        result = supabase_request(
            "POST", 
            "/rest/v1/progress_records",
            data=progress_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error logging measurements: {str(e)}") from e

@router.post("/progress/workouts", response_model=ProgressRecord)
def log_workout(request: WorkoutRequest):
    """Log a completed workout for a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Create progress record
        progress_data = {
            "client_id": request.client_id,
            "date": request.date.isoformat(),
            "record_type": RecordType.WORKOUT,
            "data": request.workout_data.dict(exclude_none=True),
            "notes": request.notes
        }
        
        result = supabase_request(
            "POST", 
            "/rest/v1/progress_records",
            data=progress_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error logging workout: {str(e)}") from e

@router.post("/progress/feedback", response_model=ProgressRecord)
def log_subjective_feedback(request: FeedbackRequest):
    """Log subjective feedback from a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Create progress record
        progress_data = {
            "client_id": request.client_id,
            "date": request.date.isoformat(),
            "record_type": RecordType.FEEDBACK,
            "data": request.feedback.dict(exclude_none=True),
            "notes": request.notes
        }
        
        result = supabase_request(
            "POST", 
            "/rest/v1/progress_records",
            data=progress_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error logging feedback: {str(e)}") from e

@router.get("/progress/history/{client_id}", response_model=ProgressHistoryResponse)
def get_progress_history(
    client_id: str = Path(..., description="The ID of the client"),
    record_type: Optional[RecordType] = Query(None, description="Type of records to retrieve"),
    start_date: Optional[date] = Query(None, description="Start date for filtering records"),
    end_date: Optional[date] = Query(None, description="End date for filtering records"),
    limit: int = Query(20, description="Maximum number of records to return"),
    offset: int = Query(0, description="Number of records to skip")
):
    """Get progress history for a client with optional filtering"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Build filters
        filters = [f"client_id=eq.{client_id}"]
        
        if record_type:
            filters.append(f"record_type=eq.{record_type}")
        
        if start_date:
            filters.append(f"date=gte.{start_date.isoformat()}")
        
        if end_date:
            filters.append(f"date=lte.{end_date.isoformat()}")
        
        # Get count first
        count_path = f"/rest/v1/progress_records?{','.join(filters)}&select=count"
        count_result = supabase_request("GET", count_path)
        total = count_result[0].get("count", 0) if count_result and len(count_result) > 0 else 0
        
        # Get records
        path = f"/rest/v1/progress_records?{','.join(filters)}"
        params = {
            "select": "*",
            "order": "date.desc,created_at.desc",
            "limit": limit,
            "offset": offset
        }
        
        result = supabase_request("GET", path, params=params)
        
        return {
            "records": result,
            "total": total
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving progress history: {str(e)}") from e

@router.get("/progress/summary/{client_id}", response_model=ProgressSummaryResponse)
def get_progress_summary(
    client_id: str = Path(..., description="The ID of the client"),
    metrics: str = Query(..., description="Comma-separated list of metrics to summarize"),
    start_date: Optional[date] = Query(None, description="Start date for filtering records"),
    end_date: Optional[date] = Query(None, description="End date for filtering records")
):
    """Get summary of progress metrics for a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Parse metrics
        metric_list = [m.strip() for m in metrics.split(",") if m.strip()]
        if not metric_list:
            raise HTTPException(status_code=400, detail="No valid metrics provided")
        
        # Set default date range if not provided
        if not end_date:
            end_date = date.today()
        
        if not start_date:
            start_date = end_date - timedelta(days=90)  # Default to 90 days
        
        # Build filters
        filters = [f"client_id=eq.{client_id}", f"date=gte.{start_date.isoformat()}", f"date=lte.{end_date.isoformat()}"]
        
        # Get all records in date range
        path = f"/rest/v1/progress_records?{','.join(filters)}"
        params = {
            "select": "*",
            "order": "date.asc"
        }
        
        result = supabase_request("GET", path, params=params)
        
        # Process metrics
        metric_summaries = []
        for metric_name in metric_list:
            values = []
            start_value = None
            current_value = None
            
            # Parse metric path (e.g., "measurements.weight" or "feedback.energy_level")
            parts = metric_name.split('.')
            record_type = parts[0]
            metric_path = parts[1:] if len(parts) > 1 else []
            
            # Filter records by type
            filtered_records = [r for r in result if r["record_type"] == record_type]
            
            for record in filtered_records:
                data = record["data"]
                value = data
                
                # Navigate through the metric path
                for key in metric_path:
                    if isinstance(value, dict) and key in value:
                        value = value[key]
                    else:
                        value = None
                        break
                
                if value is not None:
                    entry = {
                        "date": record["date"],
                        "value": value
                    }
                    values.append(entry)
                    
                    if not start_value and len(values) == 1:
                        start_value = float(value) if isinstance(value, (int, float)) else None
                    
                    current_value = float(value) if isinstance(value, (int, float)) else None
            
            # Calculate change
            change = None
            change_percentage = None
            if start_value is not None and current_value is not None and start_value != 0:
                change = current_value - start_value
                change_percentage = (change / start_value) * 100
            
            metric_summaries.append({
                "metric": metric_name,
                "values": values,
                "start_value": start_value,
                "current_value": current_value,
                "change": change,
                "change_percentage": change_percentage
            })
        
        return {
            "metrics": metric_summaries,
            "date_range": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating progress summary: {str(e)}") from e
