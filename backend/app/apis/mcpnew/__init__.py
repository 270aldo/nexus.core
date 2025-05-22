from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import date, datetime, timedelta
from uuid import UUID
import functools

# Create main MCP router with unique paths
router = APIRouter()

# Simple cache implementation for frequent queries
_cache = {}

def cache_result(ttl_seconds=300):
    """Cache decorator with time-to-live functionality for frequent queries"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key based on function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check if result is in cache and not expired
            if cache_key in _cache:
                result, timestamp = _cache[cache_key]
                if (datetime.now() - timestamp).total_seconds() < ttl_seconds:
                    return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            _cache[cache_key] = (result, datetime.now())
            
            return result
        return wrapper
    return decorator

# ======== Models ========

class ClientSearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search term for name or email")
    client_type: Optional[str] = Field(None, description="Filter by client type (PRIME or LONGEVITY)")
    limit: Optional[int] = Field(20, description="Maximum number of results to return")

class ClientDetailsRequest(BaseModel):
    client_id: str = Field(..., description="The ID of the client to retrieve")

class AddClientRequest(BaseModel):
    type: str = Field(..., description="Client type: PRIME or LONGEVITY")
    name: str = Field(..., description="Full name of the client")
    email: str = Field(..., description="Email address of the client")
    phone: Optional[str] = Field(None, description="Phone number of the client")
    birth_date: Optional[str] = Field(None, description="Birth date in YYYY-MM-DD format")
    status: Optional[str] = Field("active", description="Client status: active, paused, inactive")
    goals: Optional[List[str]] = Field(None, description="List of client goals")
    payment_status: Optional[str] = Field(None, description="Payment status of the client")

class ProgressHistoryRequest(BaseModel):
    client_id: str = Field(..., description="The ID of the client")
    record_type: Optional[str] = Field(None, description="Type of records to retrieve")
    days: Optional[int] = Field(30, description="Number of days of history to retrieve")

class AdherenceMetricsRequest(BaseModel):
    client_id: str = Field(..., description="The ID of the client to analyze")
    date_range: Optional[Dict[str, str]] = Field(None, description="Date range in format {start_date: YYYY-MM-DD, end_date: YYYY-MM-DD}")
    include_breakdowns: Optional[bool] = Field(False, description="Include detailed breakdown by category")

class ProgramEffectivenessRequest(BaseModel):
    program_id: str = Field(..., description="The ID of the program to analyze")
    metrics: Optional[List[str]] = Field(None, description="Specific metrics to analyze")

class BusinessMetricsRequest(BaseModel):
    date_range: Optional[Dict[str, str]] = Field(None, description="Date range in format {start_date: YYYY-MM-DD, end_date: YYYY-MM-DD}")
    segments: Optional[List[str]] = Field(None, description="Segments to analyze (client_type, revenue, retention)")

class AgentAnalysisRequest(BaseModel):
    client_id: str = Field(..., description="The ID of the client to analyze")
    analysis_type: str = Field(..., description="Type of analysis to perform")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Additional parameters for the analysis")

class ClientReportRequest(BaseModel):
    client_id: str = Field(..., description="The ID of the client to generate a report for")
    report_type: str = Field(..., description="Type of report to generate")
    date_range: Optional[Dict[str, str]] = Field(None, description="Date range for the report")

class TranslateProgramRequest(BaseModel):
    program_data: Dict[str, Any] = Field(..., description="Training program data to translate")
    complexity_level: Optional[str] = Field("standard", description="Complexity level of the natural language output")

# ======== Client Management Endpoints ========

@router.post("/mcp/clients/search", tags=["mcp"])
def mcpnew_search_clients(request: ClientSearchRequest):
    """
    Search for clients by name, email, type, or status.
    
    This endpoint allows searching across all clients in the system using various filters
    and criteria. It's useful for finding specific clients quickly or generating filtered
    lists of clients matching certain parameters.
    
    Args:
        request: A search request containing query terms and filters
        
    Returns:
        A list of clients matching the search criteria with basic profile information
        
    Example Claude Usage:
        "Find all PRIME clients that joined in the last month"
        "Search for clients named Smith"
        "List all active LONGEVITY clients"
    """
    try:
        # Mock clients data
        clients = [
            {"id": "abc123", "name": "John Doe", "email": "john@example.com", "type": "PRIME", "status": "active"},
            {"id": "def456", "name": "Jane Smith", "email": "jane@example.com", "type": "LONGEVITY", "status": "active"},
        ]
        
        # Apply filters
        if request.client_type:
            clients = [c for c in clients if c["type"] == request.client_type]
            
        return {
            "success": True,
            "data": {"clients": clients, "total": len(clients)},
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcp/clients/get", tags=["mcp"])
@cache_result(ttl_seconds=60)  # Cache client details for 1 minute
def mcpnew_get_client_details(request: ClientDetailsRequest):
    """
    Get detailed information about a specific client.
    
    This endpoint retrieves comprehensive client information including profile details,
    active programs, nutrition plans, and recent progress. It's the primary method to
    get a complete view of a client's current status.
    
    Args:
        request: A request containing the client's ID
        
    Returns:
        Comprehensive client profile data including active programs and plans
        
    Example Claude Usage:
        "Get all details for client with ID abc123"
        "Tell me about Jane Smith's profile"
        "What programs is Michael currently enrolled in?"
    """
    try:
        # Mock client data
        client = {
            "id": request.client_id,
            "name": "John Doe",
            "email": "john@example.com",
            "type": "PRIME",
            "status": "active",
            "goals": {"primary": "strength", "secondary": "fat_loss"},
            "active_programs": [{"id": "prog123", "name": "Hypertrophy Phase 1", "progress": 0.65}]
        }
        
        return {
            "success": True,
            "data": {"profile": client},
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving client details: {str(e)}")

@router.post("/mcp/clients/add", tags=["mcp"])
def mcpnew_add_client(request: AddClientRequest):
    """Add a new client to the system"""
    try:
        import databutton as db
        import requests
        import uuid
        import json
        from datetime import datetime
        
        # Obtener credenciales de servicio
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_service_key = db.secrets.get("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_service_key:
            raise HTTPException(
                status_code=500,
                detail="Credenciales de Supabase no encontradas"
            )
        
        # Preparar datos del cliente
        client_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        # Normalizar tipo
        client_type = request.type
        if request.type and request.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = request.type.upper()
        
        # Prepare goals in the correct format
        # Important: We need to store as string for Supabase, but in a format parseable by frontend
        goals_list = request.goals or ["Fitness general"]
        
        client_data = {
            "id": client_id,
            "type": client_type,
            "name": request.name,
            "email": request.email,
            "phone": request.phone or "",
            "birth_date": request.birth_date or "1980-01-01",
            "join_date": now,
            "status": request.status or "active",
            "goals": json.dumps(goals_list),
            "health_conditions": json.dumps([]),
            "initial_assessment": json.dumps({}),
            "payment_status": request.payment_status or "active",
            "created_at": now,
            "updated_at": now
        }
        
        # Configurar headers con clave de servicio
        headers = {
            "apikey": supabase_service_key,
            "Authorization": f"Bearer {supabase_service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Crear cliente directamente con la API de Supabase
        response = requests.post(
            f"{supabase_url}/rest/v1/clients",
            headers=headers,
            json=client_data
        )
        
        response.raise_for_status()
        
        # Obtener resultado
        result = response.json()
        client_data = result[0] if isinstance(result, list) else result
        
        # Insertar en actividad para reflejar en el centro de control
        notification_data = {
            "user_id": "admin",
            "title": f"Nuevo cliente creado: {request.name}",
            "message": f"Se ha creado un nuevo cliente {request.name} desde Claude Desktop",
            "type": "client_created",
            "read": False,
            "created_at": now
        }
        
        try:
            # Intentar registrar notificación
            notification_response = requests.post(
                f"{supabase_url}/rest/v1/notifications",
                headers=headers,
                json=notification_data
            )
            print(f"Notificación creada correctamente")
        except Exception as notif_err:
            print(f"Error al crear notificación: {str(notif_err)}")
        
        print(f"Cliente creado correctamente con ID: {client_id} - Nombre: {request.name}")
        return {
            "success": True,
            "data": {"client": client_data},
            "meta": {"message": "Client added successfully"}
        }
    except requests.exceptions.RequestException as e:
        error_detail = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_json = e.response.json()
                error_detail = error_json.get('message', str(e))
            except ValueError:
                error_detail = e.response.text or str(e)
        
        raise HTTPException(status_code=500, detail=f"Supabase API error: {error_detail}")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error adding client: {str(e)}")

@router.post("/mcp/progress-history", tags=["mcp"])
def mcpnew_get_progress_history(request: ProgressHistoryRequest):
    """
    Get client progress history with optional filtering.
    
    This endpoint retrieves a client's progress records over time, with the ability to filter
    by record type (weight, measurements, workouts, etc.) and time period. It's essential for
    tracking client progress and visualizing trends.
    
    Args:
        request: A request specifying the client ID, record type, and time period
        
    Returns:
        A chronological history of progress records with calculated summaries
        
    Example Claude Usage:
        "Show me John's weight history for the last 3 months"
        "Get all workout records for client abc123"
        "What progress has Sarah made on her measurements?"
    """
    try:
        # Mock progress data
        progress = {
            "records": [
                {"date": "2023-04-01", "type": "weight", "value": 84.2},
                {"date": "2023-03-15", "type": "weight", "value": 84.8},
                {"date": "2023-03-01", "type": "weight", "value": 85.5}
            ],
            "summary": {
                "weight": {"start": 85.5, "current": 84.2, "change": -1.3}
            }
        }
        
        # Filter by type if requested
        if request.record_type:
            progress["records"] = [r for r in progress["records"] if r["type"] == request.record_type]
            
        return {
            "success": True,
            "data": progress,
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ======== Analytics Endpoints ========

@router.post("/mcp/analytics/adherence2", tags=["mcp"])
@cache_result(ttl_seconds=300)  # Cache adherence metrics for 5 minutes
def mcpnew_get_client_adherence_metrics2(request: AdherenceMetricsRequest):
    """
    Get adherence metrics for a client.
    
    This endpoint analyzes a client's adherence to their training, nutrition, and recovery protocols.
    It provides both overall adherence scores and breakdowns by different categories and time periods,
    helping coaches identify areas where clients may need additional support or motivation.
    
    Args:
        request: A request specifying the client ID, date range, and breakdown options
        
    Returns:
        Adherence metrics with summaries, trends, and optional detailed breakdowns
        
    Example Claude Usage:
        "What's John's overall adherence rate?"
        "Show me Sarah's training compliance over the last month"
        "Which days of the week does Michael have the lowest nutrition adherence?"
    """
    try:
        # Mock adherence data
        adherence = {
            "summary": {
                "overall": 0.85,
                "training": 0.90,
                "nutrition": 0.82,
                "recovery": 0.78
            },
            "trend": [
                {"week": "2023-W12", "value": 0.82},
                {"week": "2023-W13", "value": 0.85},
                {"week": "2023-W14", "value": 0.87}
            ]
        }
        
        # Include breakdowns if requested
        if request.include_breakdowns:
            adherence["breakdowns"] = {
                "by_day": {
                    "monday": 0.92,
                    "tuesday": 0.88,
                    "wednesday": 0.90,
                    "thursday": 0.85,
                    "friday": 0.78,
                    "saturday": 0.82,
                    "sunday": 0.75
                }
            }
            
        return {
            "success": True,
            "data": adherence,
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcp/analytics/effectiveness2", tags=["mcp"])
@cache_result(ttl_seconds=600)  # Cache program effectiveness for 10 minutes
def mcpnew_get_program_effectiveness2(request: ProgramEffectivenessRequest):
    """
    Analyze the effectiveness of a training program.
    
    This endpoint evaluates how effective a specific training program has been across all clients
    who have used it. It measures various metrics like strength gains, body composition changes,
    adherence rates, and client satisfaction, providing valuable insights for program refinement.
    
    Args:
        request: A request specifying the program ID and metrics to analyze
        
    Returns:
        Effectiveness metrics with comparisons to previous programs and averages
        
    Example Claude Usage:
        "How effective is the Hypertrophy Block 2 program?"
        "What's the client satisfaction rate for the PRIME Strength program?"
        "Compare the effectiveness of the LONGEVITY Mobility program to average"
    """
    try:
        # Mock effectiveness data
        effectiveness = {
            "program_id": request.program_id,
            "metrics": {
                "strength_gain": 0.12,
                "adherence": 0.85,
                "satisfaction": 0.90,
                "injury_rate": 0.02
            },
            "comparisons": {
                "to_previous": 0.08,
                "to_average": 0.15
            }
        }
        
        # Filter metrics if requested
        if request.metrics:
            filtered_metrics = {}
            for metric in request.metrics:
                if metric in effectiveness["metrics"]:
                    filtered_metrics[metric] = effectiveness["metrics"][metric]
            effectiveness["metrics"] = filtered_metrics
            
        return {
            "success": True,
            "data": effectiveness,
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcp/analytics/business-metrics2", tags=["mcp"])
@cache_result(ttl_seconds=1800)  # Cache business metrics for 30 minutes
def mcpnew_generate_business_metrics2(request: BusinessMetricsRequest):
    """
    Generate business-level metrics and analytics.
    
    This endpoint provides high-level business metrics and insights across the entire NGX system,
    including client statistics, revenue data, program performance, and retention rates. It's
    valuable for business planning, marketing strategy, and overall performance monitoring.
    
    Args:
        request: A request specifying the date range and segments to analyze
        
    Returns:
        Comprehensive business metrics with optional segment breakdowns
        
    Example Claude Usage:
        "What are our overall business metrics for this quarter?"
        "Show me client retention rates by program type"
        "Generate revenue metrics for the PRIME program from January to March"
    """
    try:
        # Mock business metrics
        metrics = {
            "client_metrics": {
                "total": 128,
                "active": 112,
                "new_this_month": 8,
                "churn_rate": 0.02
            },
            "revenue_metrics": {
                "monthly_recurring": 25600,
                "average_per_client": 228.57,
                "growth_rate": 0.05
            },
            "program_metrics": {
                "total_active": 115,
                "average_satisfaction": 0.92,
                "most_popular": "Hypertrophy Block 2"
            }
        }
        
        # Filter by segments if requested
        filtered_metrics = {}
        if request.segments:
            for segment in request.segments:
                if segment == "client_type":
                    filtered_metrics["client_type_breakdown"] = {
                        "PRIME": 75,
                        "LONGEVITY": 53
                    }
                elif segment == "revenue":
                    filtered_metrics["revenue"] = metrics["revenue_metrics"]
                elif segment == "retention":
                    filtered_metrics["retention"] = {
                        "30_day": 0.96,
                        "60_day": 0.92,
                        "90_day": 0.88
                    }
            if filtered_metrics:
                metrics = filtered_metrics
            
        return {
            "success": True,
            "data": metrics,
            "meta": {
                "date_range": {
                    "start": request.date_range["start_date"] if request.date_range else None,
                    "end": request.date_range["end_date"] if request.date_range else None,
                },
                "segments_requested": request.segments
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating business metrics: {str(e)}")

# ======== Agent Endpoints ========

@router.get("/mcp/agent/status", tags=["mcp"])
@cache_result(ttl_seconds=300)  # Cache status for 5 minutes
def mcpnew_get_agent_system_status():
    """
    Get the current status of the agent system.
    
    This endpoint provides information about the AI agent system's current operational status,
    available models, capabilities, and recent updates. It's useful for monitoring the system's
    health and understanding what AI capabilities are currently available.
    
    Returns:
        The current operational status of the agent system and its capabilities
        
    Example Claude Usage:
        "Check if the agent system is operational"
        "What AI models are currently active in NGX?"
        "What are the current capabilities of the NGX AI system?"
    """
    try:
        status = {
            "status": "operational",
            "active_models": ["Claude 3 Opus", "GPT-4o", "NGX-proprietary-models"],
            "capabilities": [
                "program_analysis", 
                "natural_language_translation",
                "adherence_prediction",
                "personalized_recommendations",
                "client_reporting"
            ],
            "last_update": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "data": status,
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcp/agent/analysis", tags=["mcp"])
def mcpnew_run_agent_analysis(request: AgentAnalysisRequest):
    """
    Run specialized agent analysis on client data.
    
    This endpoint leverages AI to perform in-depth analysis on client data, generating insights,
    predictions, and recommendations. The analysis type parameter allows for different types of
    analyses including progress prediction, program optimization, and more.
    
    Args:
        request: A request specifying the client ID, analysis type, and parameters
        
    Returns:
        AI-generated analysis results with insights and recommendations
        
    Example Claude Usage:
        "Predict John's progress for the next 4 weeks"
        "Optimize Sarah's current training program"
        "Analyze client adherence patterns for Michael"
    """
    try:
        # Mock analysis results based on analysis type
        results = {}
        
        if request.analysis_type == "progress_prediction":
            results = {
                "prediction": {
                    "weight": {"in_4_weeks": 82.5, "confidence": 0.85},
                    "strength": {"bench_press_1rm": 105.0, "confidence": 0.75}
                },
                "recommendations": [
                    "Increase protein intake to 1.8g per kg of bodyweight",
                    "Add one more heavy bench press session per week"
                ]
            }
        elif request.analysis_type == "program_optimization":
            results = {
                "current_efficiency": 0.82,
                "potential_efficiency": 0.91,
                "suggested_changes": [
                    "Reorder exercises to prioritize compound movements",
                    "Adjust rest periods to 90-120 seconds for hypertrophy focus"
                ]
            }
        else:
            results = {"message": f"Analysis type '{request.analysis_type}' completed successfully"}
            
        return {
            "success": True,
            "data": results,
            "meta": {
                "analysis_type": request.analysis_type,
                "client_id": request.client_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running agent analysis: {str(e)}")

@router.post("/mcp/agent/report", tags=["mcp"])
def mcpnew_generate_client_report(request: ClientReportRequest):
    """
    Generate a comprehensive client report.
    
    This endpoint creates detailed reports for clients based on their historical data and current
    status. Different report types are available including quarterly progress reports, nutrition
    analysis, and program effectiveness reports. These reports provide valuable insights and
    recommendations for both coaches and clients.
    
    Args:
        request: A request specifying the client ID, report type, and date range
        
    Returns:
        A comprehensive client report with summaries, metrics, and recommendations
        
    Example Claude Usage:
        "Generate a quarterly progress report for John"
        "Create a nutrition analysis report for Sarah"
        "Prepare a comprehensive fitness report for Michael from January to March"
    """
    try:
        # Mock report data based on report type
        report = {}
        
        if request.report_type == "quarterly_progress":
            report = {
                "summary": "Client has made significant progress in the last quarter, achieving 85% of their strength goals and 70% of body composition goals.",
                "metrics": {
                    "strength_improvement": 0.12,
                    "body_composition_improvement": 0.08,
                    "adherence": 0.85
                },
                "highlights": [
                    "Bench press 1RM increased from 90kg to 102kg",
                    "Body fat reduced from 22% to 18%",
                    "Consistent attendance at 87% of scheduled sessions"
                ],
                "recommendations": [
                    "Increase focus on posterior chain development",
                    "Consider adding one HIIT session per week for metabolic conditioning",
                    "Maintain current protein intake levels"
                ]
            }
        elif request.report_type == "nutrition_analysis":
            report = {
                "summary": "Client's nutrition is generally well-structured but lacking in micronutrient variety.",
                "macronutrients": {
                    "protein": {"target": 180, "actual": 165, "adherence": 0.92},
                    "carbs": {"target": 250, "actual": 285, "adherence": 0.86},
                    "fat": {"target": 70, "actual": 80, "adherence": 0.88}
                },
                "recommendations": [
                    "Increase vegetable variety to 5+ different colors weekly",
                    "Consider omega-3 supplementation",
                    "Adjust meal timing to include pre-workout nutrition"
                ]
            }
        else:
            report = {"message": f"Report type '{request.report_type}' generated successfully"}
            
        return {
            "success": True,
            "data": report,
            "meta": {
                "report_type": request.report_type,
                "client_id": request.client_id,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mcp/agent/translate-program", tags=["mcp"])
def mcpnew_translate_program_to_natural_language(request: TranslateProgramRequest):
    """
    Translate technical program data into natural language.
    
    This endpoint converts technical training program data into clear, natural language descriptions
    that clients can easily understand. The complexity level parameter allows for different levels
    of detail and technical terminology in the output, from simple explanations to detailed
    professional descriptions.
    
    Args:
        request: A request containing the program data and desired complexity level
        
    Returns:
        A natural language translation of the technical program data
        
    Example Claude Usage:
        "Translate John's strength program into simple language"
        "Create a detailed explanation of Sarah's hypertrophy program"
        "Convert Michael's training plan to client-friendly language"
    """
    try:
        # Example program translation based on complexity level
        complexity = request.complexity_level or "standard"
        program_name = request.program_data.get("name", "Training Program")
        
        translation = ""
        
        if complexity == "simple":
            translation = f"{program_name} is a training program that will help you build strength and muscle. It includes workouts 3-4 times per week with progressive overload to ensure continuous improvement."
        elif complexity == "detailed":
            translation = f"{program_name} is a periodized resistance training protocol designed to optimize hypertrophy and strength outcomes through strategic implementation of volume and intensity manipulation. The program incorporates compound and isolation movements with specific set and repetition schemes to maximize mechanical tension, metabolic stress, and muscle damage - the three primary mechanisms of muscle growth. Training frequency is distributed to allow for optimal recovery while maintaining sufficient training stimulus across all major muscle groups."
        else: # standard
            translation = f"{program_name} is a structured training program focusing on progressive overload across major muscle groups. It balances workout volume and intensity to promote optimal muscle growth and strength development while allowing adequate recovery. The program includes both compound and isolation exercises to ensure comprehensive development."
            
        return {
            "success": True,
            "data": {
                "original_program": program_name,
                "translation": translation,
                "complexity_level": complexity
            },
            "meta": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
