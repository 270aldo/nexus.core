from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
from datetime import date, datetime, timedelta
from enum import Enum

router = APIRouter()

# ======== Models ========

class AnalysisType(str, Enum):
    PROGRESS = "progress"
    ADHERENCE = "adherence"
    PROGRAM_FIT = "program_fit"
    NUTRITION_COMPLIANCE = "nutrition_compliance"
    RECOVERY = "recovery"
    PERFORMANCE = "performance"

class ReportType(str, Enum):
    PROGRESS_SUMMARY = "progress_summary"
    ADHERENCE_REPORT = "adherence_report"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    NUTRITION_SUMMARY = "nutrition_summary"
    QUARTERLY_REVIEW = "quarterly_review"
    HEALTH_ASSESSMENT = "health_assessment"

class ComplexityLevel(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    DETAILED = "detailed"
    TECHNICAL = "technical"
    CLIENT_FACING = "client_facing"

class SystemStatus(BaseModel):
    status: str
    version: str
    last_updated: datetime
    available_models: List[str]
    current_model: str
    available_analyses: List[str]
    available_reports: List[str]
    usage_metrics: Optional[Dict[str, Any]] = None

class AnalysisParameters(BaseModel):
    date_range: Optional[Dict[str, str]] = None
    metrics: Optional[List[str]] = None
    comparison_baseline: Optional[str] = None
    detail_level: Optional[int] = None
    custom_parameters: Optional[Dict[str, Any]] = None

class AnalysisRequest(BaseModel):
    client_id: str
    analysis_type: AnalysisType
    parameters: Optional[AnalysisParameters] = None

class AnalysisResult(BaseModel):
    client_id: str
    analysis_type: str
    timestamp: datetime
    summary: str
    insights: List[str]
    recommendations: List[str]
    data_points: Optional[Dict[str, Any]] = None
    visualizations: Optional[List[Dict[str, Any]]] = None

class ReportRequest(BaseModel):
    client_id: str
    report_type: ReportType
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    include_sections: Optional[List[str]] = None
    exclude_sections: Optional[List[str]] = None
    custom_parameters: Optional[Dict[str, Any]] = None

class ReportSection(BaseModel):
    title: str
    content: str
    data: Optional[Dict[str, Any]] = None
    charts: Optional[List[Dict[str, Any]]] = None

class ClientReport(BaseModel):
    client_id: str
    report_type: str
    generated_at: datetime
    period: str
    overview: str
    sections: List[ReportSection]
    recommendations: List[str]
    notes: Optional[str] = None

class TranslationRequest(BaseModel):
    program_data: Dict[str, Any]
    complexity_level: ComplexityLevel = ComplexityLevel.STANDARD

class TranslationResponse(BaseModel):
    natural_language: str
    sections: Optional[Dict[str, str]] = None
    summary: Optional[str] = None

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

# ======== API Endpoints ========

@router.get("/agent/system-status", response_model=SystemStatus)
def get_agent_system_status():
    """Get the current status of the agent system - moved from /agent/status to avoid conflict with MCP endpoint"""
    try:
        # In a real implementation, this would check the status of various AI services
        # and provide actual metrics. For the MVP, we'll return a mock response.
        return {
            "status": "operational",
            "version": "1.0.0",
            "last_updated": datetime.now() - timedelta(days=2),
            "available_models": ["gpt-4", "gpt-3.5-turbo", "claude-2"],
            "current_model": "gpt-4",
            "available_analyses": [type.value for type in AnalysisType],
            "available_reports": [type.value for type in ReportType],
            "available_endpoints": [
                "/mcp/clients/search - Search for clients matching criteria",
                "/mcp/clients/get - Get detailed information about a client",
                "/mcp/progress/history - Get client progress history and metrics"
            ],
            "usage_metrics": {
                "analyses_run": 128,
                "reports_generated": 42,
                "translations_performed": 56,
                "avg_response_time": 2.3  # seconds
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving agent system status: {str(e)}") from e

@router.post("/agent/analyze", response_model=AnalysisResult)
def run_agent_analysis(request: AnalysisRequest):
    """Run an AI analysis on client data"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id,name,type",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client = client_check[0]
        
        # In a real implementation, this would:
        # 1. Fetch relevant client data based on analysis_type
        # 2. Process the data and run ML/AI analysis
        # 3. Return structured insights
        
        # For the MVP, we'll return mock responses based on analysis type
        mock_responses = {
            AnalysisType.PROGRESS: {
                "summary": f"The client has shown consistent progress over the past 4 weeks, with strength increasing by approximately 12% and body composition improving with a 2.3% reduction in body fat.",
                "insights": [
                    "Upper body strength is improving faster than lower body",
                    "Recovery metrics indicate potential for increased training volume",
                    "Weekend adherence is lower than weekday adherence"
                ],
                "recommendations": [
                    "Increase lower body training frequency to 3x per week",
                    "Add 5-10% to current resistance loads for upper body exercises",
                    "Consider adding recovery protocols on Thursdays"
                ],
                "data_points": {
                    "strength_change": 0.12,
                    "bodycomp_change": -0.023,
                    "adherence_rate": 0.85
                }
            },
            AnalysisType.ADHERENCE: {
                "summary": f"Overall adherence rate of 78% over the past 30 days, with nutrition plan adherence at 65% and training program adherence at 85%.",
                "insights": [
                    "Highest adherence on Mondays and Tuesdays",
                    "Significant drop in adherence on weekends and holidays",
                    "Meal prep correlates strongly with improved nutrition adherence"
                ],
                "recommendations": [
                    "Schedule check-ins on Fridays to prepare for weekend",
                    "Simplify weekend nutrition requirements",
                    "Provide alternative home workout options for weekends"
                ],
                "data_points": {
                    "overall_adherence": 0.78,
                    "nutrition_adherence": 0.65,
                    "training_adherence": 0.85,
                    "weekday_vs_weekend": 0.32  # difference in adherence rate
                }
            },
            AnalysisType.PROGRAM_FIT: {
                "summary": f"The current program aligns with 82% of the client's goals and constraints, with some modifications recommended for optimal results.",
                "insights": [
                    "Current volume matches client recovery capacity well",
                    "Exercise selection could better target specific goals",
                    "Program intensity matches client's experience level appropriately"
                ],
                "recommendations": [
                    "Replace leg press with front squats for better quad development",
                    "Add direct core work 2x per week",
                    "Consider periodizing intensity over 4-week cycles"
                ],
                "data_points": {
                    "program_alignment": 0.82,
                    "recovery_match": 0.9,
                    "exercise_selection_match": 0.75,
                    "intensity_match": 0.88
                }
            },
            AnalysisType.NUTRITION_COMPLIANCE: {
                "summary": f"Nutrition plan compliance is at 72%, with protein targets consistently met but carbohydrate timing and vegetable intake below targets.",
                "insights": [
                    "Protein intake consistently meets or exceeds targets",
                    "Vegetable intake averages 2 servings vs. 5 serving target",
                    "Carbohydrate intake is appropriately timed around training 65% of the time",
                    "Weekend alcohol consumption impacts recovery metrics"
                ],
                "recommendations": [
                    "Add vegetable preparation to weekly meal prep routine",
                    "Implement carbohydrate timing reminders via app",
                    "Create social situation strategies for alcohol moderation"
                ],
                "data_points": {
                    "overall_compliance": 0.72,
                    "protein_compliance": 0.95,
                    "vegetable_compliance": 0.4,
                    "carb_timing_compliance": 0.65
                }
            },
            AnalysisType.RECOVERY: {
                "summary": f"Recovery metrics indicate moderate fatigue accumulation with sleep quality as the primary limiting factor.",
                "insights": [
                    "Sleep duration averages 6.2 hours vs. recommended 7-8 hours",
                    "HRV trending downward over past 14 days",
                    "Subjective energy scores lowest on Wednesdays and Thursdays"
                ],
                "recommendations": [
                    "Implement 30-minute bedtime wind-down routine",
                    "Reduce training volume by 15% for next 10 days",
                    "Add dedicated recovery session on Thursdays"
                ],
                "data_points": {
                    "sleep_quality": 0.68,
                    "hrv_trend": -0.15,  # 15% reduction
                    "subjective_energy": 6.4,  # out of 10
                    "readiness_score": 7.2  # out of 10
                }
            },
            AnalysisType.PERFORMANCE: {
                "summary": f"Performance metrics show 8% improvement in strength and 12% improvement in work capacity over the past 8 weeks.",
                "insights": [
                    "Upper body pressing strength increased 15%",
                    "Lower body strength increased 6%",
                    "Endurance metrics improved 12% across all tests",
                    "Power output in interval sessions increased 9%"
                ],
                "recommendations": [
                    "Focus on lower body strength development in next training block",
                    "Maintain current endurance protocol as it's producing results",
                    "Retest benchmark lifts at end of 4-week cycle"
                ],
                "data_points": {
                    "strength_improvement": 0.08,
                    "upper_body_strength": 0.15,
                    "lower_body_strength": 0.06,
                    "endurance_improvement": 0.12,
                    "power_output": 0.09
                }
            }
        }
        
        response_data = mock_responses.get(request.analysis_type, mock_responses[AnalysisType.PROGRESS])
        
        return {
            "client_id": request.client_id,
            "analysis_type": request.analysis_type,
            "timestamp": datetime.now(),
            **response_data
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error running analysis: {str(e)}") from e

@router.post("/agent/reports", response_model=ClientReport)
def generate_client_report(request: ReportRequest):
    """Generate a comprehensive client report"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{request.client_id}&select=id,name,type",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        client = client_check[0]
        client_name = client.get("name", "Client")
        client_type = client.get("type", "PRIME")
        
        # Set default date range if not provided
        end_date = request.end_date or date.today()
        start_date = request.start_date or (end_date - timedelta(days=90))  # Default to 90 days
        
        # In a real implementation, this would:
        # 1. Fetch all relevant client data for the period
        # 2. Analyze the data and generate structured reports
        # 3. Format the report into appropriate sections
        
        # For the MVP, we'll return mock responses based on report type
        mock_section_generators = {
            ReportType.PROGRESS_SUMMARY: [
                {
                    "title": "Overall Progress Summary",
                    "content": f"{client_name} has made consistent progress over the reporting period. Body composition has improved with a reduction in body fat percentage and an increase in lean mass. Strength metrics show improvement across all major lifts, with particular progress in upper body pushing movements."
                },
                {
                    "title": "Body Composition Changes",
                    "content": "Starting metrics: 18% body fat, 160 lbs lean mass\nCurrent metrics: 15.7% body fat, 164 lbs lean mass\n\nThis represents a 2.3% reduction in body fat percentage and a gain of 4 lbs of lean mass over the period.",
                    "charts": [
                        {"type": "line", "title": "Body Fat Percentage", "data_key": "body_fat_trend"}
                    ]
                },
                {
                    "title": "Strength Development",
                    "content": "Major lift progress:\n- Squat: 225 lbs → 255 lbs (+13%)\n- Bench Press: 185 lbs → 215 lbs (+16%)\n- Deadlift: 275 lbs → 315 lbs (+15%)\n- Overhead Press: 115 lbs → 135 lbs (+17%)",
                    "charts": [
                        {"type": "bar", "title": "Strength Changes", "data_key": "strength_changes"}
                    ]
                }
            ],
            ReportType.ADHERENCE_REPORT: [
                {
                    "title": "Program Adherence Overview",
                    "content": f"During this period, {client_name} maintained an overall adherence rate of 79% to the prescribed program. Training adherence was strong at 87%, while nutrition plan adherence was moderate at 68%.",
                    "charts": [
                        {"type": "gauge", "title": "Overall Adherence", "data_key": "adherence_gauge"}
                    ]
                },
                {
                    "title": "Adherence Patterns",
                    "content": "Weekday vs Weekend: Adherence was significantly higher on weekdays (86%) compared to weekends (63%)\n\nNutrition Specifics: Protein targets were consistently met (92%), while vegetable intake (54%) and carbohydrate management (65%) showed room for improvement."
                },
                {
                    "title": "Improvement Strategies",
                    "content": "Based on the adherence data, the following strategies are recommended:\n\n1. Weekend meal preparation routines\n2. Simplified weekend workout options\n3. Daily vegetable intake reminders\n4. Smart carbohydrate timing around workouts"
                }
            ],
            ReportType.PERFORMANCE_ANALYSIS: [
                {
                    "title": "Performance Metrics Overview",
                    "content": f"This analysis examines {client_name}'s performance development across strength, power, endurance, and technical execution metrics."
                },
                {
                    "title": "Strength Metrics",
                    "content": "Absolute strength has increased by 15% overall, with upper body development outpacing lower body. Relative strength (strength-to-weight ratio) has improved by 18% due to concurrent improvements in body composition.",
                    "charts": [
                        {"type": "radar", "title": "Strength Profile", "data_key": "strength_radar"}
                    ]
                },
                {
                    "title": "Work Capacity",
                    "content": "Work capacity shows significant improvement, with a 22% increase in training volume tolerance and a 15% improvement in recovery between sessions. Heart rate recovery has improved from 32 bpm to 38 bpm at the 1-minute mark post-exertion."
                },
                {
                    "title": "Technical Execution",
                    "content": "Movement quality scores have improved across all compound lifts. Particular improvement noted in squat mechanics, with resolution of previous knee valgus issues and improved depth consistency."
                }
            ],
            ReportType.NUTRITION_SUMMARY: [
                {
                    "title": "Nutrition Plan Overview",
                    "content": f"{client_name} has been following a {client_type} nutrition protocol focused on body recomposition with carbohydrate cycling around training sessions."
                },
                {
                    "title": "Macronutrient Adherence",
                    "content": "Average daily intake:\n- Protein: 175g (98% of target)\n- Carbohydrates: 220g (85% of target)\n- Fat: 70g (105% of target)\n- Fiber: 25g (83% of target)",
                    "charts": [
                        {"type": "bar", "title": "Macronutrient Adherence", "data_key": "macro_adherence"}
                    ]
                },
                {
                    "title": "Meal Timing and Distribution",
                    "content": "Meal timing compliance was 72%, with most variance occurring on weekends. Pre and post-workout nutrition protocols were followed consistently (88%), showing good discipline around training sessions."
                },
                {
                    "title": "Hydration Status",
                    "content": "Daily water intake averaged 2.8 liters vs the target of 3.5 liters. Hydration status correlates with performance metrics, with decreased performance noted on days with lower hydration compliance."
                }
            ],
            ReportType.QUARTERLY_REVIEW: [
                {
                    "title": "Quarterly Progress Overview",
                    "content": f"This report summarizes {client_name}'s progress over the past quarter (90 days) in the {client_type} program. Overall, significant progress has been made toward the established goals, with key improvements in body composition, performance metrics, and lifestyle adherence."
                },
                {
                    "title": "Goal Achievement Status",
                    "content": "Primary Goals:\n1. Reduce body fat by 3% - ACHIEVED (3.2% reduction)\n2. Increase maximum strength by 10% - PARTIALLY ACHIEVED (8.5% increase)\n3. Improve work capacity by 15% - ACHIEVED (17% increase)\n4. Establish consistent nutrition protocol - ACHIEVED\n\nThese results represent excellent progress and put us on track for the annual targets.",
                    "charts": [
                        {"type": "progress", "title": "Goal Progress", "data_key": "goal_progress"}
                    ]
                },
                {
                    "title": "Program Adjustments",
                    "content": "Based on the analysis of this quarter's data, the following program adjustments are recommended for the next phase:\n\n1. Increase lower body training frequency to address strength imbalances\n2. Implement more structured recovery protocols between high-intensity sessions\n3. Adjust carbohydrate intake to better support training volume\n4. Add specific mobility work targeting hip and shoulder limitations"
                },
                {
                    "title": "Next Quarter Projections",
                    "content": "With the recommended adjustments and continued adherence, we project the following outcomes for next quarter:\n\n- Additional 1.5-2% reduction in body fat\n- 5-7% increase in overall strength\n- Improved recovery metrics and readiness scores\n- Enhanced technical execution on complex movement patterns"
                }
            ],
            ReportType.HEALTH_ASSESSMENT: [
                {
                    "title": "Health Markers Overview",
                    "content": f"This assessment reviews {client_name}'s current health status based on available biomarkers, subjective indicators, and performance metrics. Overall health status is rated as GOOD with several areas of excellence and a few areas for improvement."
                },
                {
                    "title": "Cardiovascular Health",
                    "content": "Resting heart rate has decreased from 68 bpm to 62 bpm over the period. Heart rate recovery has improved by 18%, indicating enhanced cardiac efficiency. Blood pressure remains within optimal range at 118/72.",
                    "charts": [
                        {"type": "line", "title": "Resting Heart Rate Trend", "data_key": "hr_trend"}
                    ]
                },
                {
                    "title": "Metabolic Health",
                    "content": "Glucose management appears optimal based on subjective markers. Fasting periods are well-tolerated with stable energy. Metabolic flexibility has improved as evidenced by improved performance in both glycolytic and oxidative energy system work."
                },
                {
                    "title": "Recovery & Stress Management",
                    "content": "Sleep quality scores average 7.2/10, with duration averaging 7.1 hours. Stress management protocols have been implemented with moderate consistency. HRV trends show improvement, though with notable fluctuations during high-stress work periods.",
                    "charts": [
                        {"type": "line", "title": "HRV Trend", "data_key": "hrv_trend"}
                    ]
                },
                {
                    "title": "Recommendations",
                    "content": "Based on this health assessment, we recommend:\n\n1. Continued emphasis on sleep quality optimization\n2. Implementation of daily stress management practices\n3. Increased focus on nutrition consistency on travel days\n4. Consider comprehensive blood panel to establish baseline biomarkers"
                }
            ]
        }
        
        # Get sections for the requested report type
        sections = mock_section_generators.get(request.report_type, mock_section_generators[ReportType.PROGRESS_SUMMARY])
        
        # Filter sections based on include/exclude parameters
        if request.include_sections and len(request.include_sections) > 0:
            section_titles = [section["title"] for section in sections]
            filtered_sections = []
            for title in request.include_sections:
                if title in section_titles:
                    index = section_titles.index(title)
                    filtered_sections.append(sections[index])
            sections = filtered_sections
        
        if request.exclude_sections and len(request.exclude_sections) > 0:
            sections = [section for section in sections if section["title"] not in request.exclude_sections]
        
        # Generate recommendations based on report type
        recommendations = [
            "Continue current training split with increased focus on recovery protocols",
            "Implement progressive overload on main compound lifts at a rate of 2.5-5% every two weeks",
            "Increase protein intake to 1.8g per pound of lean body mass for improved recovery",
            "Add specific mobility work targeting identified limitations in hip and ankle mobility"
        ]
        
        # Generate period string
        period = f"{start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}"
        
        # Create overview based on report type
        overview = f"This {request.report_type.replace('_', ' ')} covers the period from {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')} for {client_name}. The report analyzes progress, adherence, and performance metrics to provide actionable insights and recommendations."
        
        return {
            "client_id": request.client_id,
            "report_type": request.report_type.value,
            "generated_at": datetime.now(),
            "period": period,
            "overview": overview,
            "sections": sections,
            "recommendations": recommendations,
            "notes": request.custom_parameters.get("notes", None) if request.custom_parameters else None
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating client report: {str(e)}") from e

@router.post("/agent/translate", response_model=TranslationResponse)
def translate_program_to_natural_language(request: TranslationRequest):
    """Translate structured program data into natural language descriptions"""
    try:
        program_data = request.program_data
        complexity = request.complexity_level
        
        # In a real implementation, this would use an LLM to generate natural language
        # descriptions of the program data at various levels of complexity
        
        # Check that program_data contains required fields
        if not isinstance(program_data, dict) or not program_data.get("name"):
            raise HTTPException(status_code=400, detail="Invalid program data format")
        
        program_name = program_data.get("name", "Training Program")
        program_type = program_data.get("type", "strength")
        program_duration = program_data.get("duration_weeks", 8)
        program_frequency = program_data.get("frequency_per_week", 4)
        
        # Mock translations for different complexity levels
        translations = {
            ComplexityLevel.BASIC: {
                "full": f"This is an {program_duration}-week {program_type} program called '{program_name}'. You'll train {program_frequency} times per week, focusing on building strength and muscle. The program includes a mix of compound exercises like squats and deadlifts, along with targeted accessory work.",
                "sections": {
                    "overview": f"The '{program_name}' program is designed to help you get stronger and build muscle over {program_duration} weeks.",
                    "schedule": f"You'll train {program_frequency} days per week, with workouts taking about 45-60 minutes each.",
                    "exercises": "The program includes main lifts like squats, bench press, and deadlifts, plus assistance exercises for all major muscle groups."
                }
            },
            ComplexityLevel.STANDARD: {
                "full": f"'{program_name}' is a {program_duration}-week periodized {program_type} program scheduled for {program_frequency} sessions per week. The program employs progressive overload principles with a focus on compound movements and strategic accessory work to target specific muscle groups. Each training week includes varying intensities and volumes to optimize adaptation and recovery. The program is designed to improve maximal strength while building muscle mass through hypertrophy-specific protocols on designated days.",
                "sections": {
                    "overview": f"The '{program_name}' program follows a {program_duration}-week periodized structure designed to systematically improve strength and muscle mass.",
                    "methodology": "The program uses progressive overload with planned deload periods to maximize adaptation while managing fatigue.",
                    "structure": f"Training occurs {program_frequency} times weekly with rotating focus on strength, hypertrophy, and technical development.",
                    "progression": "Weight increases are programmed on a weekly basis for main lifts, while assistance work follows a repetition progression scheme."
                }
            },
            ComplexityLevel.DETAILED: {
                "full": f"'{program_name}' is a {program_duration}-week mesocycle utilizing undulating periodization within a {program_type} framework. The program implements {program_frequency} training sessions weekly with varying neurological demands and recovery profiles. Primary movement patterns (squat, hinge, press, pull) are trained with specific intensity and volume prescriptions following a wave loading pattern. Accessory movements target specific hypertrophy outcomes while addressing individual mobility limitations and muscular imbalances. The program incorporates scientific principles of specificity, progressive overload, fatigue management, and phase potentiation to optimize neuromuscular adaptations while minimizing redundant training stimulus.",
                "sections": {
                    "overview": f"'{program_name}' utilizes a {program_duration}-week mesocycle structure with careful load and volume management to elicit specific adaptations.",
                    "periodization": "The program follows an undulating periodization model with daily and weekly fluctuations in intensity and volume.",
                    "exercise_selection": "Exercises are selected based on biomechanical efficiency, stimulus-to-fatigue ratio, and specificity to target adaptations.",
                    "progression_model": "The program employs wave loading with intensification phases followed by strategic deloads to manage fatigue.",
                    "autoregulation": "RPE-based autoregulation is implemented on key lifts to accommodate daily readiness fluctuations.",
                    "special_considerations": "Exercise technique is prioritized over absolute loading, with specific technical cues provided for each movement pattern."
                }
            },
            ComplexityLevel.TECHNICAL: {
                "full": f"'{program_name}' represents a {program_duration}-week mesocycle within a broader macrocycle, employing concurrent training methodology with primary emphasis on {program_type} development. The program utilizes daily undulating periodization (DUP) across {program_frequency} weekly sessions, each with specific neuromuscular demands categorized by CNS intensity, time under tension, and mechanical tension parameters. Exercises are selected and sequenced to optimize the stimulus-recovery-adaptation (SRA) curve while managing interference effects between competing adaptations. Loading parameters follow a non-linear progression model with autoregulatory features based on performance metrics and readiness indicators. Specific attention is given to rate of force development (RFD) on designated days, while accumulating sufficient training volume to drive morphological adaptations on hypertrophy-focused sessions.",
                "sections": {
                    "theoretical_framework": f"'{program_name}' is built on the conjugate method adapted for {program_type} with concurrent training principles to develop multiple fitness qualities simultaneously.",
                    "periodization_structure": "Daily undulating periodization manages training stress with strategic variation in multiple loading parameters (intensity, volume, density, exercise selection).",
                    "intensity_techniques": "The program implements planned overreaching phases followed by supercompensation periods to maximize adaptive response.",
                    "volume_landmarks": "Weekly volume landmarks include 10-20 sets per muscle group with intensity-dependent distribution across the mesocycle.",
                    "progressive_overload": "Progressive tension overload is prioritized through specific progression schemes including wave loading, ascending sets, and repetition ranges corresponding to fiber type recruitment patterns.",
                    "recovery_management": "Recovery is managed through strategic deloading, exercise rotation, and careful attention to the SRA curve for different movement patterns and muscle groups."
                }
            },
            ComplexityLevel.CLIENT_FACING: {
                "full": f"Your new '{program_name}' program is designed specifically to help you achieve your goals over the next {program_duration} weeks. You'll be training {program_frequency} times per week, with each workout carefully structured to challenge you appropriately while ensuring proper recovery.\n\nThe program focuses on {program_type} development through proven exercise techniques that will help you build strength and improve body composition efficiently. Each workout includes a strategic warm-up, main strength work, and targeted exercises chosen specifically for your goals and current fitness level.\n\nAs you progress through the program, you'll notice gradual increases in weights and/or repetitions - this planned progression is key to your success. The structure ensures that you're always challenging your body while managing fatigue appropriately.\n\nWeekly check-ins will help us track your progress and make any necessary adjustments to optimize your results. Remember to log your workouts and nutrition in the app so we can monitor your progress together.",
                "sections": {
                    "introduction": f"Your '{program_name}' program is custom-designed based on your assessment results and goals. Over the next {program_duration} weeks, we'll work together to make significant progress.",
                    "what_to_expect": f"You'll train {program_frequency} days per week, with each session taking approximately 45-60 minutes to complete. The workouts progressively challenge you while ensuring proper recovery.",
                    "how_to_track": "After each workout, log your weights, reps and how you felt in the app. This information is crucial for making appropriate adjustments to your program.",
                    "nutrition_support": "Your training program is supported by your nutrition guidelines. Together, they create a comprehensive approach to reaching your goals.",
                    "success_tips": "Consistency is your most powerful tool for success. Focus on technique over weight, prioritize your recovery, and trust the process - even when progress isn't immediately visible."
                }
            }
        }
        
        translation_data = translations.get(complexity, translations[ComplexityLevel.STANDARD])
        
        return {
            "natural_language": translation_data["full"],
            "sections": translation_data["sections"],
            "summary": f"This {program_duration}-week {program_type} program is designed for {program_frequency} weekly sessions."
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error translating program: {str(e)}") from e
