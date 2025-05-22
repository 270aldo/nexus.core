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

router = APIRouter(tags=["MCP-Nutrition"])

# ------ Models ------

class MacroNutrients(BaseModel):
    protein: float  # grams
    carbs: float  # grams
    fat: float  # grams
    fiber: Optional[float] = None  # grams

class MealFood(BaseModel):
    name: str
    amount: float  # grams or servings
    unit: str  # "g", "oz", "serving"
    calories: int
    macros: MacroNutrients
    notes: Optional[str] = None

class Meal(BaseModel):
    name: str
    time: Optional[str] = None
    foods: List[MealFood]
    total_calories: int
    total_macros: MacroNutrients
    notes: Optional[str] = None

class DailyNutritionPlan(BaseModel):
    day_number: int
    meals: List[Meal]
    total_calories: int
    total_macros: MacroNutrients
    hydration: Optional[int] = None  # ml
    supplements: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

class NutritionPlan(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    type: str  # PRIME or LONGEVITY
    daily_plans: List[DailyNutritionPlan]
    tags: Optional[List[str]] = None
    target_calories: Optional[int] = None
    target_macros: Optional[MacroNutrients] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientNutrition(BaseModel):
    id: Optional[str] = None
    client_id: str
    plan_id: str
    start_date: date
    end_date: Optional[date] = None
    current_day: int = 1
    status: str = "active"  # active, completed, paused
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class NutritionTemplatesRequest(BaseModel):
    plan_type: Optional[str] = None  # PRIME or LONGEVITY
    limit: Optional[int] = 10

class NutritionTemplatesResponse(BaseModel):
    templates: List[NutritionPlan]
    total_count: int

class NutritionPlanRequest(BaseModel):
    plan_id: str

class ClientNutritionRequest(BaseModel):
    client_id: str

class AssignNutritionRequest(BaseModel):
    client_id: str
    plan_id: str
    start_date: date = Field(default_factory=lambda: date.today())
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class UpdateClientNutritionRequest(BaseModel):
    client_id: str
    current_day: Optional[int] = None
    status: Optional[str] = None
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class FoodNutritionRequest(BaseModel):
    food_name: str

class FoodNutritionInfo(BaseModel):
    name: str
    calories: int
    serving_size: float
    serving_unit: str
    macros: MacroNutrients
    vitamins: Optional[Dict[str, float]] = None
    minerals: Optional[Dict[str, float]] = None

class FoodNutritionResponse(BaseModel):
    food: FoodNutritionInfo
    alternative_options: Optional[List[str]] = None

class NutritionResponse(BaseModel):
    success: bool
    message: str
    plan_id: Optional[str] = None
    client_nutrition_id: Optional[str] = None

# ------ Endpoints ------

@router.post("/mcp/nutrition-templates", response_model=NutritionTemplatesResponse)
def mcpnew_get_nutrition_templates(request: NutritionTemplatesRequest) -> NutritionTemplatesResponse:
    """Retrieve nutrition plan templates with optional filtering by plan type.
    
    This endpoint allows you to fetch available nutrition plan templates from the database.
    Templates can be filtered by plan type (PRIME or LONGEVITY) and limited in quantity.
    
    Parameters:
    - plan_type: Optional filter for program type (PRIME or LONGEVITY)
    - limit: Maximum number of templates to return (default: 10)
    
    Returns a list of nutrition plan templates and the total count of matching templates.
    
    Example for Claude:
    ```
    To retrieve PRIME nutrition templates:
    {"plan_type": "PRIME", "limit": 5}
    
    To retrieve all templates (up to 10):
    {}
    ```
    """
    try:
        # Import cache utilities
        from app.apis.cache_utils import cached
        
        @cached(ttl=300)  # Cache for 5 minutes
        def get_templates(plan_type, limit):
            supabase = get_supabase()
            
            # Start building the query
            query = supabase.table("nutrition_plans").select("*")
            
            # Add plan type filter if provided
            if plan_type:
                query = query.eq("type", plan_type)
            
            # Add limit if provided
            if limit:
                query = query.limit(limit)
            
            # Execute the query
            result = query.execute()
            
            # Count total templates
            count_query = supabase.table("nutrition_plans").select("id", count="exact")
            if plan_type:
                count_query = count_query.eq("type", plan_type)
            count_result = count_query.execute()
            total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
            
            # Parse the templates
            templates = []
            for template_data in result.data:
                # Convert string fields to appropriate types if needed
                if isinstance(template_data.get("daily_plans"), str):
                    template_data["daily_plans"] = json.loads(template_data["daily_plans"])
                if isinstance(template_data.get("tags"), str):
                    template_data["tags"] = json.loads(template_data["tags"])
                if isinstance(template_data.get("target_macros"), str):
                    template_data["target_macros"] = json.loads(template_data["target_macros"])
                
                templates.append(NutritionPlan(**template_data))
            
            return {
                "templates": templates,
                "total_count": total_count
            }
        
        # Get templates using cached function
        result = get_templates(request.plan_type, request.limit)
        
        return NutritionTemplatesResponse(
            templates=result["templates"],
            total_count=result["total_count"]
        )
        supabase = get_supabase()
        
        # Start building the query
        query = supabase.table("nutrition_plans").select("*")
        
        # Add plan type filter if provided
        if request.plan_type:
            query = query.eq("type", request.plan_type)
        
        # Add limit if provided
        if request.limit:
            query = query.limit(request.limit)
        
        # Execute the query
        result = query.execute()
        
        # Count total templates
        count_query = supabase.table("nutrition_plans").select("id", count="exact")
        if request.plan_type:
            count_query = count_query.eq("type", request.plan_type)
        count_result = count_query.execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
        
        # Parse the templates
        templates = []
        for template_data in result.data:
            # Convert string fields to appropriate types if needed
            if isinstance(template_data.get("daily_plans"), str):
                template_data["daily_plans"] = json.loads(template_data["daily_plans"])
            if isinstance(template_data.get("tags"), str):
                template_data["tags"] = json.loads(template_data["tags"])
            if isinstance(template_data.get("target_macros"), str):
                template_data["target_macros"] = json.loads(template_data["target_macros"])
            
            templates.append(NutritionPlan(**template_data))
        
        return NutritionTemplatesResponse(
            templates=templates,
            total_count=total_count
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving nutrition templates: {str(e)}")

@router.post("/mcp/nutrition-plan", response_model=NutritionPlan)
def mcpnew_get_nutrition_plan(request: NutritionPlanRequest) -> NutritionPlan:
    """Retrieve detailed information about a specific nutrition plan"""
    try:
        supabase = get_supabase()
        
        # Get the nutrition plan
        result = supabase.table("nutrition_plans") \
            .select("*") \
            .eq("id", request.plan_id) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Nutrition plan with ID {request.plan_id} not found")
        
        plan_data = result.data[0]
        
        # Convert string fields to appropriate types if needed
        if isinstance(plan_data.get("daily_plans"), str):
            plan_data["daily_plans"] = json.loads(plan_data["daily_plans"])
        if isinstance(plan_data.get("tags"), str):
            plan_data["tags"] = json.loads(plan_data["tags"])
        if isinstance(plan_data.get("target_macros"), str):
            plan_data["target_macros"] = json.loads(plan_data["target_macros"])
        
        return NutritionPlan(**plan_data)
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving nutrition plan: {str(e)}")

@router.post("/mcp/client-active-nutrition", response_model=Dict[str, Any])
def mcpnew_get_client_active_nutrition(request: ClientNutritionRequest) -> Dict[str, Any]:
    """Retrieve the active nutrition plan assigned to a specific client"""
    try:
        supabase = get_supabase()
        
        # Get the client's active nutrition plan
        client_nutrition_result = supabase.table("client_nutrition") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if not client_nutrition_result.data or len(client_nutrition_result.data) == 0:
            return {"success": True, "has_active_plan": False, "message": "No active nutrition plan found for this client"}
        
        client_nutrition_data = client_nutrition_result.data[0]
        plan_id = client_nutrition_data.get("plan_id")
        
        # Get the nutrition plan details
        plan_result = supabase.table("nutrition_plans") \
            .select("*") \
            .eq("id", plan_id) \
            .execute()
        
        if not plan_result.data or len(plan_result.data) == 0:
            return {
                "success": False, 
                "message": f"Client has an active nutrition plan but plan with ID {plan_id} not found"
            }
        
        plan_data = plan_result.data[0]
        
        # Convert string fields to appropriate types if needed
        if isinstance(plan_data.get("daily_plans"), str):
            plan_data["daily_plans"] = json.loads(plan_data["daily_plans"])
        if isinstance(plan_data.get("tags"), str):
            plan_data["tags"] = json.loads(plan_data["tags"])
        if isinstance(plan_data.get("target_macros"), str):
            plan_data["target_macros"] = json.loads(plan_data["target_macros"])
        if isinstance(client_nutrition_data.get("adjustments"), str):
            client_nutrition_data["adjustments"] = json.loads(client_nutrition_data["adjustments"])
        
        # Return combined result
        return {
            "success": True,
            "has_active_plan": True,
            "client_nutrition": client_nutrition_data,
            "plan": plan_data,
            "current_day": client_nutrition_data.get("current_day", 1)
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving client's active nutrition plan: {str(e)}")

@router.post("/mcp/assign-nutrition-plan", response_model=NutritionResponse)
def mcpnew_assign_nutrition_plan(request: AssignNutritionRequest) -> NutritionResponse:
    """Assign a nutrition plan to a client with optional adjustments"""
    try:
        supabase = get_supabase()
        
        # Check if plan exists
        plan_result = supabase.table("nutrition_plans") \
            .select("id") \
            .eq("id", request.plan_id) \
            .execute()
        
        if not plan_result.data or len(plan_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Nutrition plan with ID {request.plan_id} not found")
        
        # Check if client exists
        client_result = supabase.table("clients") \
            .select("id") \
            .eq("id", request.client_id) \
            .execute()
        
        if not client_result.data or len(client_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {request.client_id} not found")
        
        # Check if client already has an active nutrition plan
        client_nutrition_result = supabase.table("client_nutrition") \
            .select("id") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if client_nutrition_result.data and len(client_nutrition_result.data) > 0:
            # Update the existing plan to inactive
            supabase.table("client_nutrition") \
                .update({"status": "completed"}) \
                .eq("id", client_nutrition_result.data[0]["id"]) \
                .execute()
        
        # Calculate end date (default to 4 weeks)
        start_date = request.start_date
        end_date = date(start_date.year, start_date.month, start_date.day)
        for _ in range(28):  # 4 weeks
            end_date = date(end_date.year, end_date.month, end_date.day + 1)
        
        # Create client nutrition plan
        client_nutrition_data = {
            "client_id": request.client_id,
            "plan_id": request.plan_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "current_day": 1,
            "status": "active",
            "adjustments": request.adjustments,
            "notes": request.notes
        }
        
        # Insert the client nutrition plan
        result = supabase.table("client_nutrition").insert(client_nutrition_data).execute()
        
        # Extract the ID of the newly created client nutrition plan
        if result.data and len(result.data) > 0:
            client_nutrition_id = result.data[0]["id"]
            return NutritionResponse(
                success=True,
                message="Nutrition plan assigned to client successfully",
                plan_id=request.plan_id,
                client_nutrition_id=client_nutrition_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to assign nutrition plan to client")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error assigning nutrition plan to client: {str(e)}")

@router.post("/mcp/update-client-nutrition", response_model=NutritionResponse)
def mcpnew_update_client_nutrition(request: UpdateClientNutritionRequest) -> NutritionResponse:
    """Update a client's active nutrition plan with progress tracking and plan adjustments"""
    try:
        supabase = get_supabase()
        
        # Get the client's active nutrition plan
        client_nutrition_result = supabase.table("client_nutrition") \
            .select("*") \
            .eq("client_id", request.client_id) \
            .eq("status", "active") \
            .execute()
        
        if not client_nutrition_result.data or len(client_nutrition_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"No active nutrition plan found for client {request.client_id}")
        
        client_nutrition_id = client_nutrition_result.data[0]["id"]
        
        # Prepare update data
        update_data = {}
        if request.current_day is not None:
            update_data["current_day"] = request.current_day
        if request.status is not None:
            update_data["status"] = request.status
        if request.adjustments is not None:
            update_data["adjustments"] = request.adjustments
        if request.notes is not None:
            update_data["notes"] = request.notes
        
        # Update the client nutrition plan
        result = supabase.table("client_nutrition") \
            .update(update_data) \
            .eq("id", client_nutrition_id) \
            .execute()
        
        if result.data and len(result.data) > 0:
            return NutritionResponse(
                success=True,
                message="Client nutrition plan updated successfully",
                client_nutrition_id=client_nutrition_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to update client nutrition plan")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating client nutrition plan: {str(e)}")

@router.post("/mcp/lookup-food-nutrition", response_model=FoodNutritionResponse)
def mcpnew_lookup_food_nutrition(request: FoodNutritionRequest) -> FoodNutritionResponse:
    """Lookup nutritional information for a specific food item.
    
    Returns detailed nutritional information for a food item specified by name.
    This endpoint is optimized for MCP (Model Context Protocol) integration and provides
    comprehensive macro and micronutrient data.
    
    Parameters:
    - food_name: Name of the food to search for
    
    Returns a single food item with complete nutritional breakdown along with alternative
    options if the exact match is not found.
    
    Example for Claude:
    ```
    To lookup nutritional information for chicken breast:
    {"food_name": "chicken breast"}
    
    To lookup nutritional information for brown rice:
    {"food_name": "brown rice"}
    ```
    """
    try:
        # Import cache utilities
        from app.apis.cache_utils import cached
        
        @cached(ttl=3600)  # Cache for 1 hour
        def lookup_food(food_name):
            # For demonstration, we're using a static lookup since integrating with a real
            # food database API would require additional setup. In a production environment,
            # you would likely call an external API like USDA FoodData Central or similar.
            
            # For demonstration, we'll use the standard lookup endpoint to reuse functionality
            try:
                from app.apis.nutrition import lookup_food_nutrition
                return lookup_food_nutrition(food_name)
            except Exception:
                # If there's an error in the main lookup, use our local fallback database
                food_database = {
                "chicken breast": FoodNutritionInfo(
                    name="Chicken Breast (boneless, skinless)",
                    calories=165,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=31.0,
                        carbs=0.0,
                        fat=3.6,
                        fiber=0.0
                    ),
                    vitamins={"B6": 0.6, "B12": 0.3, "D": 0.1},
                    minerals={"iron": 1.0, "potassium": 256, "zinc": 1.0}
                ),
                "salmon": FoodNutritionInfo(
                    name="Atlantic Salmon (wild)",
                    calories=208,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=20.0,
                        carbs=0.0,
                        fat=13.0,
                        fiber=0.0
                    ),
                    vitamins={"B12": 2.6, "D": 11.0, "E": 1.1},
                    minerals={"selenium": 36.5, "potassium": 363, "magnesium": 29}
                ),
                "brown rice": FoodNutritionInfo(
                    name="Brown Rice (cooked)",
                    calories=112,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=2.6,
                        carbs=23.0,
                        fat=0.9,
                        fiber=1.8
                    ),
                    vitamins={"B1": 0.1, "B6": 0.1, "E": 0.1},
                    minerals={"magnesium": 43, "phosphorus": 83, "manganese": 1.1}
                ),
                "broccoli": FoodNutritionInfo(
                    name="Broccoli (raw)",
                    calories=34,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=2.8,
                        carbs=6.6,
                        fat=0.4,
                        fiber=2.6
                    ),
                    vitamins={"C": 89.2, "K": 101.6, "A": 31.0},
                    minerals={"potassium": 316, "calcium": 47, "manganese": 0.2}
                ),
                "avocado": FoodNutritionInfo(
                    name="Avocado",
                    calories=160,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=2.0,
                        carbs=8.5,
                        fat=14.7,
                        fiber=6.7
                    ),
                    vitamins={"K": 21.0, "E": 2.1, "C": 10.0},
                    minerals={"potassium": 485, "magnesium": 29, "copper": 0.2}
                ),
                "sweet potato": FoodNutritionInfo(
                    name="Sweet Potato (baked)",
                    calories=90,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=2.0,
                        carbs=20.7,
                        fat=0.2,
                        fiber=3.0
                    ),
                    vitamins={"A": 384.0, "C": 19.6, "B6": 0.3},
                    minerals={"potassium": 475, "manganese": 0.5, "copper": 0.2}
                ),
                "egg": FoodNutritionInfo(
                    name="Whole Egg",
                    calories=143,
                    serving_size=100,
                    serving_unit="g",
                    macros=MacroNutrients(
                        protein=12.6,
                        carbs=0.7,
                        fat=9.5,
                        fiber=0.0
                    ),
                    vitamins={"A": 160.0, "D": 2.0, "B12": 1.1},
                    minerals={"iron": 1.8, "phosphorus": 198, "selenium": 30.7}
                ),
            }
                
                # Normalize input for better matching
                food_name_normalized = food_name.lower().strip()
                
                # Try direct match
                if food_name_normalized in food_database:
                    return FoodNutritionResponse(
                        food=food_database[food_name_normalized],
                        alternative_options=None
                    )
                
                # Try partial match and find alternatives
                matches = []
                alternative_options = []
                
                for key, food_info in food_database.items():
                    if food_name_normalized in key or key in food_name_normalized:
                        matches.append((key, food_info))
                    else:
                        # Consider as alternative if not matched
                        alternative_options.append(food_info.name)
                
                if matches:
                    # Return the best match (first match)
                    return FoodNutritionResponse(
                        food=matches[0][1],
                        alternative_options=[m[1].name for m in matches[1:]] if len(matches) > 1 else alternative_options[:3]
                    )
                
                # No matches found
                raise HTTPException(status_code=404, detail=f"Food '{food_name}' not found in the database")
        
        # Use the cached function
        return lookup_food(request.food_name)
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up food nutrition: {str(e)}")

@router.post("/mcp/create-nutrition-plan", response_model=NutritionResponse)
def mcpnew_create_nutrition_plan(plan: NutritionPlan) -> NutritionResponse:
    """Create a new nutrition plan template"""
    try:
        supabase = get_supabase()
        
        # Prepare the plan data for insertion
        plan_data = plan.model_dump(exclude={"id", "created_at", "updated_at"})
        
        # Insert the plan
        result = supabase.table("nutrition_plans").insert(plan_data).execute()
        
        # Extract the ID of the newly created plan
        if result.data and len(result.data) > 0:
            plan_id = result.data[0]["id"]
            return NutritionResponse(
                success=True,
                message="Nutrition plan created successfully",
                plan_id=plan_id
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to create nutrition plan")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating nutrition plan: {str(e)}")
