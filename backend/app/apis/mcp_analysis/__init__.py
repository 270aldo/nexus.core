from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import date, datetime, timedelta
import json
import databutton as db
from supabase import create_client, Client

# Initialize Supabase client
def get_supabase() -> Client:
    url = db.secrets.get("SUPABASE_URL")
    service_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(url, service_key)

router = APIRouter(tags=["MCP-Analysis"])

# ------ Models ------

class DateRange(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None

class ClientAdherenceRequest(BaseModel):
    client_id: str
    date_range: Optional[DateRange] = None

class ClientAdherenceResponse(BaseModel):
    workout_adherence: Dict[str, Any]
    nutrition_adherence: Dict[str, Any]
    communication_response: Dict[str, Any]
    overall_score: float
    trend: Optional[str] = None
    recommendations: List[str]

class ProgramEffectivenessRequest(BaseModel):
    program_id: str
    metrics: Optional[List[str]] = None

class ProgramEffectivenessResponse(BaseModel):
    program_details: Dict[str, Any]
    effectiveness_metrics: Dict[str, Any]
    client_outcomes: Dict[str, Any]
    recommendations: List[str]

class BusinessMetricsRequest(BaseModel):
    date_range: Optional[DateRange] = None
    segments: Optional[List[str]] = None  # PRIME, LONGEVITY, or specific client segments

class BusinessMetricsResponse(BaseModel):
    client_metrics: Dict[str, Any]
    program_metrics: Dict[str, Any]
    financial_metrics: Dict[str, Any]
    retention_metrics: Dict[str, Any]

# ------ Endpoints ------

@router.post("/mcp/client-adherence", response_model=ClientAdherenceResponse)
def mcpnew_get_client_adherence_metrics(request: ClientAdherenceRequest) -> ClientAdherenceResponse:
    """Calculate client adherence metrics for workout, nutrition, and communication"""
    try:
        supabase = get_supabase()
        
        # Determine date range
        date_to = request.date_range.date_to if request.date_range and request.date_range.date_to else date.today()
        date_from = request.date_range.date_from if request.date_range and request.date_range.date_from else date_to - timedelta(days=30)  # Default to last 30 days
        
        # Verify client exists
        client_result = supabase.table("clients") \
            .select("*") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Get client's active program
        program_result = supabase.table("client_programs") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        # Get client's active nutrition plan
        nutrition_result = supabase.table("client_nutrition") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        # Get workout logs for date range
        workout_logs = supabase.table("progress_records") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("record_type", "workout") \
            .gte("date", date_from.isoformat()) \
            .lte("date", date_to.isoformat()) \
            .execute()
        
        # Calculate total days in period
        total_days = (date_to - date_from).days + 1
        
        # Initialize metrics
        workout_adherence = {
            "total_workouts_logged": len(workout_logs.data),
            "scheduled_workouts": 0,
            "adherence_rate": 0.0,
            "streak": 0,
            "detailed_logs": []
        }
        
        nutrition_adherence = {
            "total_nutrition_logs": 0,
            "adherence_rate": 0.0,
            "consistent_meal_tracking": False,
            "nutrition_compliance": 0.0,
            "detailed_logs": []
        }
        
        communication_response = {
            "messages_received": 0,
            "messages_responded": 0,
            "response_rate": 0.0,
            "average_response_time": 0.0,
            "missed_check_ins": 0
        }
        
        # Calculate workout adherence
        if program_result.data and len(program_result.data) > 0:
            # In a real implementation, we would calculate based on the program schedule
            # For this demo, we'll assume 3 workouts per week
            weeks_in_period = total_days / 7
            scheduled_workouts = int(weeks_in_period * 3)
            workout_adherence["scheduled_workouts"] = scheduled_workouts
            workout_adherence["adherence_rate"] = min(1.0, len(workout_logs.data) / max(1, scheduled_workouts)) * 100
        
            # Convert workout logs to detailed format
            for log in workout_logs.data:
                data = log.get("data", {})
                if isinstance(data, str):
                    data = json.loads(data)
                
                workout_adherence["detailed_logs"].append({
                    "date": log.get("date"),
                    "completed": True,
                    "intensity": data.get("intensity", 0),
                    "duration": data.get("duration", 0),
                    "exercises_completed": len(data.get("exercises", []))
                })
        
        # Get nutrition logs for date range
        nutrition_logs = supabase.table("progress_records") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("record_type", "nutrition") \
            .gte("date", date_from.isoformat()) \
            .lte("date", date_to.isoformat()) \
            .execute()
        
        # Calculate nutrition adherence
        nutrition_adherence["total_nutrition_logs"] = len(nutrition_logs.data)
        nutrition_adherence["adherence_rate"] = min(1.0, len(nutrition_logs.data) / total_days) * 100
        
        # Determine if client is consistent with meal tracking
        nutrition_adherence["consistent_meal_tracking"] = len(nutrition_logs.data) >= total_days * 0.7  # 70% threshold
        
        # For nutrition compliance, we'd need to analyze the logs against the plan
        # This is simplified for demo purposes
        nutrition_adherence["nutrition_compliance"] = 85.0  # Placeholder value
        
        # Convert nutrition logs to detailed format
        for log in nutrition_logs.data:
            data = log.get("data", {})
            if isinstance(data, str):
                data = json.loads(data)
            
            nutrition_adherence["detailed_logs"].append({
                "date": log.get("date"),
                "completed": True,
                "meals_tracked": len(data.get("meals", [])),
                "calories": data.get("total_calories", 0),
                "hydration": data.get("hydration", 0)
            })
        
        # Get communication logs for date range
        comm_logs = supabase.table("communication_logs") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .gte("sent_at", date_from.isoformat()) \
            .lte("sent_at", date_to.isoformat()) \
            .execute()
        
        # Calculate communication metrics
        communication_response["messages_received"] = len(comm_logs.data)
        
        # Count messages with 'read' or 'responded' status
        responded_messages = [log for log in comm_logs.data if log.get("status") in ["read", "responded"]]
        communication_response["messages_responded"] = len(responded_messages)
        
        if communication_response["messages_received"] > 0:
            communication_response["response_rate"] = (communication_response["messages_responded"] / communication_response["messages_received"]) * 100
        
        # Calculate overall adherence score
        overall_score = (
            workout_adherence["adherence_rate"] * 0.4 +
            nutrition_adherence["adherence_rate"] * 0.4 +
            communication_response["response_rate"] * 0.2
        )
        
        # Generate trend (comparing to previous period would require more data)
        trend = "stable"  # Placeholder
        
        # Generate recommendations based on metrics
        recommendations = []
        
        if workout_adherence["adherence_rate"] < 70:
            recommendations.append("Increase workout frequency to meet program goals")
        
        if nutrition_adherence["adherence_rate"] < 70:
            recommendations.append("Improve meal tracking consistency for better nutrition outcomes")
        
        if communication_response["response_rate"] < 70:
            recommendations.append("Respond to coach messages promptly for better support")
        
        if len(recommendations) == 0:
            recommendations.append("Continue with current program - excellent adherence!")
        
        return ClientAdherenceResponse(
            workout_adherence=workout_adherence,
            nutrition_adherence=nutrition_adherence,
            communication_response=communication_response,
            overall_score=overall_score,
            trend=trend,
            recommendations=recommendations
        )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating client adherence metrics: {str(e)}")

@router.post("/mcp/program-effectiveness", response_model=ProgramEffectivenessResponse)
def mcpnew_get_program_effectiveness(request: ProgramEffectivenessRequest) -> ProgramEffectivenessResponse:
    """Calculate effectiveness metrics for a specific training program"""
    try:
        supabase = get_supabase()
        
        # Get program details
        program_result = supabase.table("training_programs") \
            .select("*") \
            .eq("id", request.program_id) \
            .execute()
        
        if not program_result.data or len(program_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Program with ID {request.program_id} not found")
        
        program_data = program_result.data[0]
        
        # Get all clients who used this program
        client_programs = supabase.table("client_programs") \
            .select("*, clients(*)")\
            .eq("program_id", request.program_id) \
            .execute()
        
        # Calculate metrics
        total_clients = len(client_programs.data)
        completed_clients = len([cp for cp in client_programs.data if cp.get("status") == "completed"])
        active_clients = len([cp for cp in client_programs.data if cp.get("status") == "active"])
        
        completion_rate = (completed_clients / total_clients) * 100 if total_clients > 0 else 0
        
        # Prepare metrics to return
        program_details = {
            "id": program_data.get("id"),
            "name": program_data.get("name"),
            "type": program_data.get("type"),
            "duration_weeks": program_data.get("duration_weeks"),
            "target_level": program_data.get("target_level")
        }
        
        effectiveness_metrics = {
            "total_clients": total_clients,
            "completed_clients": completed_clients,
            "active_clients": active_clients,
            "dropped_clients": total_clients - (completed_clients + active_clients),
            "completion_rate": completion_rate,
            "average_adherence": 0,  # Will calculate below if clients exist
            "average_satisfaction": 0,  # Would need satisfaction data
            "average_results": {}  # Will calculate based on client progress
        }
        
        client_outcomes = {
            "success_stories": [],
            "challenges": [],
            "result_distribution": {}
        }
        
        # If we have clients, calculate more detailed metrics
        if total_clients > 0:
            # Collect client IDs
            client_ids = [cp.get("client_id") for cp in client_programs.data]
            
            # Get progress records for these clients
            progress_records = supabase.table("progress_records") \
                .select("*") \
                .in_("client_id", client_ids) \
                .execute()
            
            # Calculate adherence from workout logs
            workout_logs = [record for record in progress_records.data if record.get("record_type") == "workout"]
            client_workout_counts = {}
            
            for log in workout_logs:
                client_id = log.get("client_id")
                client_workout_counts[client_id] = client_workout_counts.get(client_id, 0) + 1
            
            # Assuming 3 workouts per week for program duration
            expected_workouts_per_client = program_data.get("duration_weeks", 4) * 3
            
            # Calculate average adherence
            adherence_rates = []
            for client_id, workout_count in client_workout_counts.items():
                adherence_rate = min(1.0, workout_count / expected_workouts_per_client) * 100
                adherence_rates.append(adherence_rate)
            
            if adherence_rates:
                effectiveness_metrics["average_adherence"] = sum(adherence_rates) / len(adherence_rates)
            
            # Calculate result distribution based on measurement records
            measurement_logs = [record for record in progress_records.data if record.get("record_type") == "measurement"]
            
            # Group by client
            client_measurements = {}
            for log in measurement_logs:
                client_id = log.get("client_id")
                if client_id not in client_measurements:
                    client_measurements[client_id] = []
                client_measurements[client_id].append(log)
            
            # Calculate results for each client
            weight_changes = []
            strength_changes = []
            
            for client_id, measurements in client_measurements.items():
                # Sort by date
                measurements.sort(key=lambda x: x.get("date", ""))
                
                if len(measurements) >= 2:
                    first_measurement = measurements[0]
                    last_measurement = measurements[-1]
                    
                    # Parse data JSON if needed
                    first_data = first_measurement.get("data", {})
                    last_data = last_measurement.get("data", {})
                    
                    if isinstance(first_data, str):
                        first_data = json.loads(first_data)
                    if isinstance(last_data, str):
                        last_data = json.loads(last_data)
                    
                    # Calculate weight change
                    if "weight" in first_data and "weight" in last_data:
                        weight_change = last_data["weight"] - first_data["weight"]
                        weight_changes.append(weight_change)
                    
                    # For strength change, we'd need to analyze workout performance
                    # This is simplified for demo
                    strength_changes.append(5)  # Placeholder value
            
            # Calculate result distribution
            if weight_changes:
                client_outcomes["result_distribution"]["weight_change"] = {
                    "average": sum(weight_changes) / len(weight_changes),
                    "min": min(weight_changes),
                    "max": max(weight_changes)
                }
            
            if strength_changes:
                client_outcomes["result_distribution"]["strength_gain"] = {
                    "average": sum(strength_changes) / len(strength_changes),
                    "min": min(strength_changes),
                    "max": max(strength_changes)
                }
        
        # Generate recommendations based on metrics
        recommendations = []
        
        if effectiveness_metrics["completion_rate"] < 70:
            recommendations.append("Improve program retention by adjusting difficulty progression")
        
        if effectiveness_metrics["average_adherence"] < 70:
            recommendations.append("Enhance workout variety to improve client engagement")
        
        if "weight_change" in client_outcomes["result_distribution"] and \
           abs(client_outcomes["result_distribution"]["weight_change"]["average"]) < 2:
            recommendations.append("Optimize nutrition guidance to improve weight management results")
        
        if len(recommendations) == 0:
            recommendations.append("Program is performing well. Consider expanding to more clients.")
        
        return ProgramEffectivenessResponse(
            program_details=program_details,
            effectiveness_metrics=effectiveness_metrics,
            client_outcomes=client_outcomes,
            recommendations=recommendations
        )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating program effectiveness: {str(e)}")

@router.post("/mcp/business-metrics", response_model=BusinessMetricsResponse)
def mcpnew_generate_business_metrics(request: BusinessMetricsRequest) -> BusinessMetricsResponse:
    """Generate business metrics and KPIs for the specified date range and segments"""
    try:
        supabase = get_supabase()
        
        # Determine date range
        date_to = request.date_range.date_to if request.date_range and request.date_range.date_to else date.today()
        date_from = request.date_range.date_from if request.date_range and request.date_range.date_from else date(date_to.year, date_to.month, 1)  # Default to current month
        
        # Build client query
        client_query = supabase.table("clients").select("*")
        
        # Add segment filter if provided
        if request.segments and len(request.segments) > 0:
            client_query = client_query.in_("type", request.segments)
        
        # Get all clients
        all_clients_result = client_query.execute()
        all_clients = all_clients_result.data
        
        # Get clients who joined in the date range
        new_clients_result = client_query.gte("join_date", date_from.isoformat()).lte("join_date", date_to.isoformat()).execute()
        new_clients = new_clients_result.data
        
        # Get active clients
        active_clients_result = client_query.eq("status", "active").execute()
        active_clients = active_clients_result.data
        
        # Get programs assigned in date range
        program_query = supabase.table("client_programs").select("*")
        
        if request.segments and len(request.segments) > 0:
            program_query = program_query.in_("program_type", request.segments)
        
        programs_result = program_query.gte("start_date", date_from.isoformat()).lte("start_date", date_to.isoformat()).execute()
        assigned_programs = programs_result.data
        
        # Calculate client metrics
        total_clients = len(all_clients)
        new_client_count = len(new_clients)
        active_client_count = len(active_clients)
        inactive_client_count = len([c for c in all_clients if c.get("status") == "inactive"])
        
        # Segment clients by type
        prime_clients = len([c for c in all_clients if c.get("type") == "PRIME"])
        longevity_clients = len([c for c in all_clients if c.get("type") == "LONGEVITY"])
        
        # Calculate retention rate (simplified)
        retention_rate = (active_client_count / total_clients) * 100 if total_clients > 0 else 0
        
        # Calculate program metrics
        total_programs_assigned = len(assigned_programs)
        program_types = {}
        for program in assigned_programs:
            program_type = program.get("program_type")
            if program_type:
                program_types[program_type] = program_types.get(program_type, 0) + 1
        
        # Calculate financial metrics (simplified - would need real financial data)
        average_revenue_per_client = 150  # Placeholder
        estimated_monthly_revenue = active_client_count * average_revenue_per_client
        
        # Build response
        client_metrics = {
            "total_clients": total_clients,
            "new_clients": new_client_count,
            "active_clients": active_client_count,
            "inactive_clients": inactive_client_count,
            "prime_clients": prime_clients,
            "longevity_clients": longevity_clients,
            "client_growth_rate": (new_client_count / total_clients) * 100 if total_clients > 0 else 0
        }
        
        program_metrics = {
            "total_programs_assigned": total_programs_assigned,
            "program_types": program_types,
            "average_program_duration": 8,  # Placeholder - would calculate from actual data
            "most_popular_programs": list(sorted(program_types.items(), key=lambda x: x[1], reverse=True))[:3] if program_types else []
        }
        
        financial_metrics = {
            "estimated_monthly_revenue": estimated_monthly_revenue,
            "average_revenue_per_client": average_revenue_per_client,
            "revenue_by_segment": {
                "PRIME": prime_clients * average_revenue_per_client,
                "LONGEVITY": longevity_clients * average_revenue_per_client
            }
        }
        
        retention_metrics = {
            "overall_retention_rate": retention_rate,
            "average_client_lifetime": 12,  # Placeholder - months
            "churn_rate": 100 - retention_rate
        }
        
        return BusinessMetricsResponse(
            client_metrics=client_metrics,
            program_metrics=program_metrics,
            financial_metrics=financial_metrics,
            retention_metrics=retention_metrics
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating business metrics: {str(e)}")
