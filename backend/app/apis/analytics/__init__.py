from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
from datetime import date, datetime, timedelta
from enum import Enum
import random

router = APIRouter()

# ======== Models ========

class DateRange(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class AdherenceMetrics(BaseModel):
    overall_adherence: float  # 0-1 scale
    training_adherence: float  # 0-1 scale
    nutrition_adherence: float  # 0-1 scale
    measurement_adherence: float  # 0-1 scale
    daily_breakdown: Optional[Dict[str, float]] = None  # {"2023-05-01": 0.9, ...}
    weekly_breakdown: Optional[Dict[str, float]] = None  # {"2023-W18": 0.85, ...}
    trend: Optional[float] = None  # positive or negative trend over period
    comparison_to_average: Optional[float] = None  # how client compares to average

class ProgramEffectivenessMetric(str, Enum):
    STRENGTH_GAIN = "strength_gain"
    MUSCLE_GAIN = "muscle_gain"
    FAT_LOSS = "fat_loss"
    PERFORMANCE_IMPROVEMENT = "performance_improvement"
    ADHERENCE = "adherence"
    SATISFACTION = "satisfaction"
    RETENTION = "retention"

class EffectivenessData(BaseModel):
    metric: str
    average_value: float
    median_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    distribution: Optional[Dict[str, int]] = None  # {"range1": count1, ...}
    benchmark_comparison: Optional[float] = None

class ProgramEffectiveness(BaseModel):
    program_id: str
    program_name: str
    program_type: str
    client_count: int
    completion_rate: float
    average_duration: float  # in weeks
    metrics: List[EffectivenessData]
    recommendations: Optional[List[str]] = None

class BusinessMetricsSegment(str, Enum):
    ALL = "all"
    PRIME = "prime"
    LONGEVITY = "longevity"
    NEW_CLIENTS = "new_clients"
    RETURNING_CLIENTS = "returning_clients"
    AGE_GROUP = "age_group"
    GENDER = "gender"

class BusinessMetric(BaseModel):
    name: str
    value: float
    previous_value: Optional[float] = None
    change: Optional[float] = None
    change_percentage: Optional[float] = None
    breakdown: Optional[Dict[str, float]] = None
    trend: Optional[List[Dict[str, Any]]] = None

class BusinessMetricsResponse(BaseModel):
    period: str
    comparison_period: Optional[str] = None
    segments: Dict[str, List[BusinessMetric]]

# ======== Helper Functions ========

# Function to get Supabase credentials
def get_supabase_credentials():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500, 
            detail="Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
        )
    
    return supabase_url, supabase_key

# Function to make requests to Supabase REST API
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

# Helper function to generate daily mock data for a date range
def generate_daily_mock_data(start_date, end_date, base_value=0.8, volatility=0.1):
    result = {}
    current_date = start_date
    current_value = base_value
    
    while current_date <= end_date:
        # Add some randomness but keep within bounds
        change = random.uniform(-volatility, volatility)
        current_value = max(0.0, min(1.0, current_value + change))
        
        # Add weekend effect (lower on weekends)
        if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            current_value = max(0.0, current_value - 0.15)
        
        result[current_date.isoformat()] = round(current_value, 2)
        current_date += timedelta(days=1)
    
    return result

# Helper function to generate weekly data from daily data
def generate_weekly_data(daily_data):
    weekly_data = {}
    
    for date_str, value in daily_data.items():
        date_obj = datetime.fromisoformat(date_str).date()
        # ISO week format: YYYY-Wnn
        week = f"{date_obj.isocalendar()[0]}-W{date_obj.isocalendar()[1]:02d}"
        
        if week not in weekly_data:
            weekly_data[week] = {"sum": value, "count": 1}
        else:
            weekly_data[week]["sum"] += value
            weekly_data[week]["count"] += 1
    
    # Calculate averages
    result = {}
    for week, data in weekly_data.items():
        result[week] = round(data["sum"] / data["count"], 2)
    
    return result

# ======== API Endpoints ========

@router.get("/analysis/client/{client_id}/adherence", response_model=AdherenceMetrics)
def get_client_adherence_metrics(
    client_id: str = Path(..., description="The ID of the client"),
    start_date: Optional[date] = Query(None, description="Start date for adherence metrics"),
    end_date: Optional[date] = Query(None, description="End date for adherence metrics")
):
    """Get adherence metrics for a client over a specified time period"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id,name",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Set default date range if not provided
        if not end_date:
            end_date = date.today()
        
        if not start_date:
            start_date = end_date - timedelta(days=90)  # Default to 90 days
        
        # In a real implementation, this would:
        # 1. Fetch workout logs, nutrition logs, and measurement records for the date range
        # 2. Compare scheduled vs completed items to calculate adherence
        # 3. Generate daily and weekly breakdowns
        
        # For the MVP, we'll generate mock data
        # Generate daily adherence data with some randomness
        training_daily = generate_daily_mock_data(start_date, end_date, 0.85, 0.1)
        nutrition_daily = generate_daily_mock_data(start_date, end_date, 0.75, 0.15)
        measurement_daily = generate_daily_mock_data(start_date, end_date, 0.7, 0.2)
        
        # Calculate overall daily adherence
        overall_daily = {}
        for date_str in training_daily.keys():
            overall_daily[date_str] = round((training_daily[date_str] + nutrition_daily[date_str] + measurement_daily[date_str]) / 3, 2)
        
        # Generate weekly breakdowns
        training_weekly = generate_weekly_data(training_daily)
        nutrition_weekly = generate_weekly_data(nutrition_daily)
        measurement_weekly = generate_weekly_data(measurement_daily)
        overall_weekly = generate_weekly_data(overall_daily)
        
        # Calculate average adherence
        avg_training = sum(training_daily.values()) / len(training_daily)
        avg_nutrition = sum(nutrition_daily.values()) / len(nutrition_daily)
        avg_measurement = sum(measurement_daily.values()) / len(measurement_daily)
        avg_overall = sum(overall_daily.values()) / len(overall_daily)
        
        # Calculate trend (using simple linear approach: last week vs first week)
        first_week = list(overall_weekly.keys())[0]
        last_week = list(overall_weekly.keys())[-1]
        trend = overall_weekly[last_week] - overall_weekly[first_week]
        
        # Mock comparison to average (positive means better than average)
        comparison = random.uniform(-0.15, 0.15)
        
        return {
            "overall_adherence": round(avg_overall, 2),
            "training_adherence": round(avg_training, 2),
            "nutrition_adherence": round(avg_nutrition, 2),
            "measurement_adherence": round(avg_measurement, 2),
            "daily_breakdown": overall_daily,
            "weekly_breakdown": overall_weekly,
            "trend": round(trend, 2),
            "comparison_to_average": round(comparison, 2)
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error calculating adherence metrics: {str(e)}") from e

@router.get("/analysis/program/{program_id}/effectiveness", response_model=ProgramEffectiveness)
def get_program_effectiveness(
    program_id: str = Path(..., description="The ID of the program"),
    metrics: Optional[str] = Query(None, description="Comma-separated list of metrics to analyze")
):
    """Get effectiveness metrics for a specific program"""
    try:
        # Verify program exists
        program_check = supabase_request(
            "GET", 
            f"/rest/v1/training_programs?id=eq.{program_id}&select=id,name,type,duration_weeks",
        )
        
        if not program_check or len(program_check) == 0:
            raise HTTPException(status_code=404, detail=f"Program with ID {program_id} not found")
        
        program = program_check[0]
        program_name = program.get("name", "Program")
        program_type = program.get("type", "strength")
        program_duration = program.get("duration_weeks", 8)
        
        # Parse requested metrics
        requested_metrics = []
        if metrics:
            requested_metrics = [metric.strip() for metric in metrics.split(",") if metric.strip()]
        
        # If no specific metrics requested, use all
        if not requested_metrics:
            requested_metrics = [metric.value for metric in ProgramEffectivenessMetric]
        
        # In a real implementation, this would:
        # 1. Fetch all clients who have been assigned this program
        # 2. Analyze their progress records to measure effectiveness for each metric
        # 3. Calculate statistical summaries
        
        # For the MVP, we'll generate mock data
        # Generate mock client count
        client_count = random.randint(15, 50)
        completion_rate = round(random.uniform(0.7, 0.95), 2)
        
        # Average duration might be slightly different from programmed duration due to extensions/early completions
        average_duration = round(program_duration * random.uniform(0.9, 1.1), 1)
        
        # Generate metrics data
        metrics_data = []
        
        # Mock data for different metrics
        mock_metrics = {
            ProgramEffectivenessMetric.STRENGTH_GAIN: {
                "average": round(random.uniform(0.1, 0.2), 2),  # 10-20% gain
                "median": round(random.uniform(0.08, 0.18), 2),
                "min": round(random.uniform(0.02, 0.05), 2),
                "max": round(random.uniform(0.25, 0.35), 2),
                "distribution": {
                    "0-5%": random.randint(1, 5),
                    "5-10%": random.randint(5, 15),
                    "10-15%": random.randint(10, 20),
                    "15-20%": random.randint(5, 15),
                    "20%+": random.randint(1, 10)
                },
                "benchmark": round(random.uniform(-0.05, 0.05), 2)
            },
            ProgramEffectivenessMetric.MUSCLE_GAIN: {
                "average": round(random.uniform(0.02, 0.05), 2),  # 2-5% gain
                "median": round(random.uniform(0.015, 0.045), 2),
                "min": round(random.uniform(0.0, 0.01), 2),
                "max": round(random.uniform(0.06, 0.08), 2),
                "distribution": {
                    "0-1%": random.randint(1, 5),
                    "1-2%": random.randint(5, 10),
                    "2-3%": random.randint(10, 15),
                    "3-4%": random.randint(5, 10),
                    "4%+": random.randint(1, 5)
                },
                "benchmark": round(random.uniform(-0.01, 0.01), 2)
            },
            ProgramEffectivenessMetric.FAT_LOSS: {
                "average": round(random.uniform(0.05, 0.1), 2),  # 5-10% loss
                "median": round(random.uniform(0.04, 0.09), 2),
                "min": round(random.uniform(0.01, 0.03), 2),
                "max": round(random.uniform(0.12, 0.18), 2),
                "distribution": {
                    "0-2%": random.randint(1, 5),
                    "2-5%": random.randint(5, 10),
                    "5-8%": random.randint(10, 15),
                    "8-12%": random.randint(5, 10),
                    "12%+": random.randint(1, 5)
                },
                "benchmark": round(random.uniform(-0.02, 0.02), 2)
            },
            ProgramEffectivenessMetric.PERFORMANCE_IMPROVEMENT: {
                "average": round(random.uniform(0.08, 0.15), 2),  # 8-15% improvement
                "median": round(random.uniform(0.07, 0.14), 2),
                "min": round(random.uniform(0.02, 0.05), 2),
                "max": round(random.uniform(0.18, 0.25), 2),
                "distribution": {
                    "0-5%": random.randint(1, 5),
                    "5-10%": random.randint(5, 15),
                    "10-15%": random.randint(10, 20),
                    "15-20%": random.randint(3, 10),
                    "20%+": random.randint(1, 5)
                },
                "benchmark": round(random.uniform(-0.03, 0.03), 2)
            },
            ProgramEffectivenessMetric.ADHERENCE: {
                "average": round(random.uniform(0.75, 0.9), 2),  # 75-90% adherence
                "median": round(random.uniform(0.73, 0.92), 2),
                "min": round(random.uniform(0.5, 0.6), 2),
                "max": round(random.uniform(0.95, 1.0), 2),
                "distribution": {
                    "<60%": random.randint(1, 3),
                    "60-70%": random.randint(2, 7),
                    "70-80%": random.randint(5, 15),
                    "80-90%": random.randint(10, 20),
                    "90%+": random.randint(5, 10)
                },
                "benchmark": round(random.uniform(-0.05, 0.05), 2)
            },
            ProgramEffectivenessMetric.SATISFACTION: {
                "average": round(random.uniform(7.5, 9.0), 1),  # 7.5-9.0 out of 10
                "median": round(random.uniform(7.0, 9.0), 1),
                "min": round(random.uniform(5.0, 6.0), 1),
                "max": round(random.uniform(9.5, 10.0), 1),
                "distribution": {
                    "<6": random.randint(1, 3),
                    "6-7": random.randint(2, 7),
                    "7-8": random.randint(5, 15),
                    "8-9": random.randint(10, 20),
                    "9+": random.randint(5, 10)
                },
                "benchmark": round(random.uniform(-0.5, 0.5), 1)
            },
            ProgramEffectivenessMetric.RETENTION: {
                "average": round(random.uniform(0.7, 0.85), 2),  # 70-85% retention
                "median": round(random.uniform(0.7, 0.85), 2),
                "min": 0,  # always 0% min
                "max": 1,  # always 100% max
                "distribution": {
                    "Completed and renewed": random.randint(int(client_count * 0.3), int(client_count * 0.5)),
                    "Completed, did not renew": random.randint(int(client_count * 0.2), int(client_count * 0.4)),
                    "Did not complete": random.randint(int(client_count * 0.1), int(client_count * 0.3))
                },
                "benchmark": round(random.uniform(-0.05, 0.05), 2)
            }
        }
        
        # Add requested metrics to the response
        for metric_name in requested_metrics:
            if metric_name in mock_metrics:
                metric_data = mock_metrics[metric_name]
                metrics_data.append({
                    "metric": metric_name,
                    "average_value": metric_data["average"],
                    "median_value": metric_data["median"],
                    "min_value": metric_data["min"],
                    "max_value": metric_data["max"],
                    "distribution": metric_data["distribution"],
                    "benchmark_comparison": metric_data["benchmark"]
                })
        
        # Generate recommendations based on metrics
        recommendations = [
            "Increase progression rate for upper body exercises to optimize strength gains",
            "Implement additional active recovery protocols to improve adherence in weeks 3-4",
            "Consider adding flexibility component to reduce injury risk and improve satisfaction",
            "Adjust nutrition guidelines to better support the program's energy demands"
        ]
        
        return {
            "program_id": program_id,
            "program_name": program_name,
            "program_type": program_type,
            "client_count": client_count,
            "completion_rate": completion_rate,
            "average_duration": average_duration,
            "metrics": metrics_data,
            "recommendations": recommendations
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error analyzing program effectiveness: {str(e)}") from e

@router.get("/analysis/business/metrics", response_model=BusinessMetricsResponse)
def generate_business_metrics(
    start_date: Optional[date] = Query(None, description="Start date for metrics"),
    end_date: Optional[date] = Query(None, description="End date for metrics"),
    segments: Optional[str] = Query(None, description="Comma-separated list of segments to analyze")
):
    """Generate business metrics and KPIs for the specified date range and segments"""
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = date.today()
        
        if not start_date:
            start_date = end_date - timedelta(days=30)  # Default to 30 days
        
        # Calculate comparison period (previous period of same length)
        comparison_start = start_date - timedelta(days=(end_date - start_date).days)
        comparison_end = start_date - timedelta(days=1)
        
        # Parse requested segments
        requested_segments = []
        if segments:
            requested_segments = [segment.strip() for segment in segments.split(",") if segment.strip()]
        
        # If no specific segments requested, use ALL
        if not requested_segments:
            requested_segments = [BusinessMetricsSegment.ALL.value]
        
        # In a real implementation, this would:
        # 1. Query the database for relevant business metrics in the date range
        # 2. Segment the data according to the requested segments
        # 3. Calculate period-over-period changes
        
        # For the MVP, we'll generate mock data
        segment_metrics = {}
        
        # Generate trend data (daily values for the period)
        def generate_trend(base_value, volatility, days):
            trend = []
            value = base_value
            current_date = start_date
            
            for _ in range(days):
                value = max(0, value * (1 + random.uniform(-volatility, volatility)))
                trend.append({"date": current_date.isoformat(), "value": round(value, 2)})
                current_date += timedelta(days=1)
            
            return trend
        
        # Generate values with reasonable period-over-period changes
        def generate_metric_with_change(name, current_base, volatility=0.1, trend_volatility=0.03):
            # Add some random change for previous period (-5% to +15% difference)
            previous_base = current_base * (1 + random.uniform(-0.05, 0.15))
            change = current_base - previous_base
            change_percentage = (change / previous_base) * 100 if previous_base > 0 else 0
            
            days = (end_date - start_date).days + 1
            trend = generate_trend(current_base, trend_volatility, days)
            
            return {
                "name": name,
                "value": round(current_base, 2),
                "previous_value": round(previous_base, 2),
                "change": round(change, 2),
                "change_percentage": round(change_percentage, 2),
                "trend": trend
            }
        
        # Common metrics for all segments
        common_metrics = [
            generate_metric_with_change("Active Clients", random.randint(80, 120)),
            generate_metric_with_change("New Clients", random.randint(5, 15)),
            generate_metric_with_change("Retention Rate", random.uniform(0.75, 0.95)),
            generate_metric_with_change("Revenue", random.uniform(15000, 25000)),
            generate_metric_with_change("Average Revenue Per Client", random.uniform(150, 250)),
            generate_metric_with_change("Client Satisfaction", random.uniform(8.0, 9.5), 0.05)
        ]
        
        # Segment-specific metrics
        segment_specific = {
            BusinessMetricsSegment.PRIME.value: [
                generate_metric_with_change("PRIME Clients", random.randint(40, 70)),
                generate_metric_with_change("PRIME Revenue", random.uniform(10000, 15000)),
                generate_metric_with_change("PRIME Retention Rate", random.uniform(0.8, 0.95))
            ],
            BusinessMetricsSegment.LONGEVITY.value: [
                generate_metric_with_change("LONGEVITY Clients", random.randint(30, 60)),
                generate_metric_with_change("LONGEVITY Revenue", random.uniform(7000, 12000)),
                generate_metric_with_change("LONGEVITY Retention Rate", random.uniform(0.75, 0.9))
            ],
            BusinessMetricsSegment.NEW_CLIENTS.value: [
                generate_metric_with_change("Acquisition Cost", random.uniform(100, 200)),
                generate_metric_with_change("Conversion Rate", random.uniform(0.1, 0.25)),
                generate_metric_with_change("First Month Retention", random.uniform(0.7, 0.85))
            ],
            BusinessMetricsSegment.RETURNING_CLIENTS.value: [
                generate_metric_with_change("Average Client Age (months)", random.uniform(8, 14)),
                generate_metric_with_change("Upsell Rate", random.uniform(0.15, 0.3)),
                generate_metric_with_change("Referral Rate", random.uniform(0.05, 0.15))
            ],
            BusinessMetricsSegment.AGE_GROUP.value: {
                # Using a different structure for breakdown metrics
                "name": "Clients by Age Group",
                "value": 100,  # Total percentage
                "breakdown": {
                    "18-25": round(random.uniform(0.05, 0.15), 2),
                    "26-35": round(random.uniform(0.25, 0.35), 2),
                    "36-45": round(random.uniform(0.25, 0.35), 2),
                    "46-55": round(random.uniform(0.15, 0.25), 2),
                    "56+": round(random.uniform(0.05, 0.15), 2)
                }
            },
            BusinessMetricsSegment.GENDER.value: {
                # Using a different structure for breakdown metrics
                "name": "Clients by Gender",
                "value": 100,  # Total percentage
                "breakdown": {
                    "Male": round(random.uniform(0.4, 0.6), 2),
                    "Female": round(random.uniform(0.4, 0.6), 2),
                    "Other/Not Specified": round(random.uniform(0.01, 0.05), 2)
                }
            }
        }
        
        # Build response based on requested segments
        for segment in requested_segments:
            if segment == BusinessMetricsSegment.ALL.value:
                segment_metrics[segment] = common_metrics
            elif segment in segment_specific:
                if isinstance(segment_specific[segment], list):
                    segment_metrics[segment] = segment_specific[segment]
                else:
                    # Handle breakdown format
                    segment_metrics[segment] = [segment_specific[segment]]
        
        # Format date ranges for response
        period_str = f"{start_date.isoformat()} to {end_date.isoformat()}"
        comparison_str = f"{comparison_start.isoformat()} to {comparison_end.isoformat()}"
        
        return {
            "period": period_str,
            "comparison_period": comparison_str,
            "segments": segment_metrics
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating business metrics: {str(e)}") from e
