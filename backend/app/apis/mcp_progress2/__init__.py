# DESACTIVADO TEMPORALMENTE PARA EVITAR ERRORES
# from fastapi import APIRouter, HTTPException
# from pydantic.v1 import BaseModel
# from typing import List, Dict, Any, Optional
# from datetime import date, datetime
# import json
# import databutton as db

# # Importamos la versión centralizada
# from ..supabase_client import get_supabase, handle_supabase_response

# router = APIRouter(tags=["Progress-Tracking"])

# # ------ Models ------

# class MeasurementData(BaseModel):
#     weight: Optional[float] = None
#     height: Optional[float] = None
#     body_fat: Optional[float] = None
#     waist: Optional[float] = None
#     chest: Optional[float] = None
#     arms: Optional[float] = None
#     legs: Optional[float] = None
#     other_metrics: Optional[Dict[str, float]] = None

# class WorkoutData(BaseModel):
#     program_id: Optional[str] = None
#     exercises: List[Dict[str, Any]]
#     duration: Optional[int] = None  # en minutos
#     intensity: Optional[int] = None  # escala 1-10
#     calories_burned: Optional[int] = None

# class FeedbackData(BaseModel):
#     energy_level: Optional[int] = None  # escala 1-10
#     motivation: Optional[int] = None  # escala 1-10
#     sleep_quality: Optional[int] = None  # escala 1-10
#     stress_level: Optional[int] = None  # escala 1-10
#     soreness: Optional[int] = None  # escala 1-10
#     recovery: Optional[int] = None  # escala 1-10
#     comments: Optional[str] = None

# # Peticiones
# class MeasurementReq(BaseModel):
#     client_id: str
#     date: date = date.today()
#     notes: Optional[str] = None
#     measurements: MeasurementData

# class WorkoutReq(BaseModel):
#     client_id: str
#     date: date = date.today()
#     notes: Optional[str] = None
#     workout_data: WorkoutData

# class FeedbackReq(BaseModel):
#     client_id: str
#     date: date = date.today()
#     notes: Optional[str] = None
#     feedback: FeedbackData

# # Respuestas
# class ProgressResp(BaseModel):
#     success: bool
#     record_id: str
#     message: str

# class ProgressHistoryReq(BaseModel):
#     client_id: str
#     record_type: str  # measurement, workout, feedback
#     date_from: Optional[date] = None
#     date_to: Optional[date] = None
#     limit: Optional[int] = 10

# class ProgressHistoryResp(BaseModel):
#     records: List[Dict[str, Any]]
#     total_count: int

# class ProgressSummaryReq(BaseModel):
#     client_id: str
#     metrics: List[str]  # metrics to include in summary
#     date_from: Optional[date] = None
#     date_to: Optional[date] = None

# class ProgressSummaryResp(BaseModel):
#     summary: Dict[str, Any]
#     period_start: date
#     period_end: date

# # ------ Endpoints ------

# @router.post("/log-measurement2", response_model=ProgressResp)
# def log_measurement2(request: MeasurementReq) -> ProgressResp:
#     """Log client measurements such as weight, body fat percentage, and other anthropometric data"""
#     try:
#         supabase = get_supabase()
        
#         # Use current date if not provided
#         current_date = request.date if request.date else date.today()
        
#         # Prepare the data for insertion
#         progress_data = {
#             "client_id": request.client_id,
#             "date": current_date.isoformat(),
#             "record_type": "measurement",
#             "data": request.measurements.model_dump(exclude_none=True),
#             "notes": request.notes
#         }
        
#         # Insert the record
#         result = supabase.table("progress_records").insert(progress_data).execute()
        
#         # Extract the ID of the newly created record
#         if result.data and len(result.data) > 0:
#             record_id = result.data[0]["id"]
#             return ProgressResp(
#                 success=True,
#                 record_id=record_id,
#                 message="Measurement data logged successfully"
#             )
#         else:
#             raise HTTPException(status_code=500, detail="Failed to insert progress record")
            
#     except Exception as e:
#         # Handle the error and raise with proper context
#         print(f"Error logging measurement: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error logging measurement: {str(e)}") from e

# @router.post("/log-workout2", response_model=ProgressResp)
# def log_workout2(request: WorkoutReq) -> ProgressResp:
#     """Log workout data including exercises performed, duration, intensity, and other metrics"""
#     try:
#         supabase = get_supabase()
        
#         # Use current date if not provided
#         current_date = request.date if request.date else date.today()
        
#         # Prepare the data for insertion
#         progress_data = {
#             "client_id": request.client_id,
#             "date": current_date.isoformat(),
#             "record_type": "workout",
#             "data": request.workout_data.model_dump(exclude_none=True),
#             "notes": request.notes
#         }
        
#         # Insert the record
#         result = supabase.table("progress_records").insert(progress_data).execute()
        
#         # Extract the ID of the newly created record
#         if result.data and len(result.data) > 0:
#             record_id = result.data[0]["id"]
#             return ProgressResp(
#                 success=True,
#                 record_id=record_id,
#                 message="Workout data logged successfully"
#             )
#         else:
#             raise HTTPException(status_code=500, detail="Failed to insert progress record")
            
#     except Exception as e:
#         # Handle the error and raise with proper context
#         print(f"Error logging workout: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error logging workout: {str(e)}") from e

# @router.post("/log-feedback2", response_model=ProgressResp)
# def log_subjective_feedback2(request: FeedbackReq) -> ProgressResp:
#     """Log subjective client feedback including energy levels, recovery, and general wellness metrics"""
#     try:
#         supabase = get_supabase()
        
#         # Use current date if not provided
#         current_date = request.date if request.date else date.today()
        
#         # Prepare the data for insertion
#         progress_data = {
#             "client_id": request.client_id,
#             "date": current_date.isoformat(),
#             "record_type": "feedback",
#             "data": request.feedback.model_dump(exclude_none=True),
#             "notes": request.notes
#         }
        
#         # Insert the record
#         result = supabase.table("progress_records").insert(progress_data).execute()
        
#         # Extract the ID of the newly created record
#         if result.data and len(result.data) > 0:
#             record_id = result.data[0]["id"]
#             return ProgressResp(
#                 success=True,
#                 record_id=record_id,
#                 message="Feedback data logged successfully"
#             )
#         else:
#             raise HTTPException(status_code=500, detail="Failed to insert progress record")
            
#     except Exception as e:
#         # Handle the error and raise with proper context
#         print(f"Error logging feedback: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error logging feedback: {str(e)}") from e

# @router.post("/progress-history2", response_model=ProgressHistoryResp)
# def get_progress_history2(request: ProgressHistoryReq) -> ProgressHistoryResp:
#     """Retrieve a client's progress history for a specific record type within a date range"""
#     try:
#         supabase = get_supabase()
        
#         # Start building the query
#         query = supabase.table("progress_records") \
#             .select("*") \
#             .eq("client_id", request.client_id) \
#             .eq("record_type", request.record_type) \
#             .order("date", desc=True)
        
#         # Add date range filters if provided
#         if request.date_from:
#             query = query.gte("date", request.date_from.isoformat())
#         if request.date_to:
#             query = query.lte("date", request.date_to.isoformat())
        
#         # Add limit if provided
#         if request.limit:
#             query = query.limit(request.limit)
        
#         # Execute the query
#         result = query.execute()
        
#         # Count total records for this client and record type
#         count_query = supabase.table("progress_records") \
#             .select("id", count="exact") \
#             .eq("client_id", request.client_id) \
#             .eq("record_type", request.record_type)
            
#         if request.date_from:
#             count_query = count_query.gte("date", request.date_from.isoformat())
#         if request.date_to:
#             count_query = count_query.lte("date", request.date_to.isoformat())
            
#         count_result = count_query.execute()
#         total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        
#         return ProgressHistoryResp(
#             records=result.data,
#             total_count=total_count
#         )
            
#     except Exception as e:
#         # Handle the error and raise with proper context
#         print(f"Error retrieving progress history: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error retrieving progress history: {str(e)}") from e

# @router.post("/progress-summary2", response_model=ProgressSummaryResp)
# def get_progress_summary2(request: ProgressSummaryReq) -> ProgressSummaryResp:
#     """Generate a summary of client progress for specified metrics over a time period"""
#     try:
#         supabase = get_supabase()
        
#         # Determine date range
#         date_to = request.date_to if request.date_to else date.today()
#         date_from = request.date_from if request.date_from else date(date_to.year, 1, 1)  # Default to beginning of year
        
#         # Initialize summary dictionary
#         summary = {}
        
#         # For each requested metric, fetch relevant data and compute summary
#         for metric in request.metrics:
#             if metric == "weight" or metric == "body_fat":
#                 # Get all measurement records within date range
#                 result = supabase.table("progress_records") \
#                     .select("*") \
#                     .eq("client_id", request.client_id) \
#                     .eq("record_type", "measurement") \
#                     .gte("date", date_from.isoformat()) \
#                     .lte("date", date_to.isoformat()) \
#                     .order("date") \
#                     .execute()
                
#                 if result.data:
#                     # Extract the specific metric values
#                     values = []
#                     dates = []
#                     for record in result.data:
#                         data = record.get("data", {})
#                         if isinstance(data, str):
#                             try:
#                                 data = json.loads(data)
#                             except json.JSONDecodeError:
#                                 continue  # Skip invalid JSON
#                         value = data.get(metric)
#                         if value is not None:
#                             values.append(value)
#                             dates.append(record["date"])
                    
#                     if values:
#                         summary[metric] = {
#                             "values": values,
#                             "dates": dates,
#                             "current": values[-1],
#                             "initial": values[0],
#                             "change": values[-1] - values[0],
#                             "change_percent": (values[-1] - values[0]) / values[0] * 100 if values[0] != 0 else 0
#                         }
            
#             elif metric == "workout_frequency":
#                 # Count workout records within date range
#                 result = supabase.table("progress_records") \
#                     .select("*", count="exact") \
#                     .eq("client_id", request.client_id) \
#                     .eq("record_type", "workout") \
#                     .gte("date", date_from.isoformat()) \
#                     .lte("date", date_to.isoformat()) \
#                     .execute()
                
#                 total_days = (date_to - date_from).days + 1
#                 workout_count = result.count if hasattr(result, 'count') else len(result.data)
                
#                 summary["workout_frequency"] = {
#                     "total_workouts": workout_count,
#                     "total_days": total_days,
#                     "workouts_per_week": (workout_count / total_days) * 7
#                 }
            
#             # Add more metric handlers as needed
        
#         return ProgressSummaryResp(
#             summary=summary,
#             period_start=date_from,
#             period_end=date_to
#         )
            
#     except Exception as e:
#         # Handle the error and raise with proper context
#         print(f"Error generating progress summary: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error generating progress summary: {str(e)}") from e