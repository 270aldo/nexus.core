from fastapi import APIRouter, HTTPException, Query, Path, Body
from pydantic import BaseModel, UUID4, Field
from typing import List, Optional, Dict, Any, Union
import databutton as db
import requests
import json
import uuid
from datetime import date, datetime, timedelta
from enum import Enum
from app.apis.utils import get_supabase_client, handle_supabase_response, sanitize_storage_key

router = APIRouter(prefix="/nutrition")

# ======== Models ========

class PlanType(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"
    PERFORMANCE = "performance"
    HEALTH = "health"
    CUSTOM = "custom"

class MacroTarget(BaseModel):
    protein: float  # grams
    carbs: float    # grams
    fat: float      # grams
    fiber: Optional[float] = None  # grams
    calories: Optional[float] = None

class NutrientTarget(BaseModel):
    daily_macros: MacroTarget
    meal_distribution: Optional[Dict[str, float]] = None  # {'breakfast': 0.3, 'lunch': 0.4, 'dinner': 0.3}
    meal_timing: Optional[Dict[str, str]] = None  # {'breakfast': '08:00', 'lunch': '13:00', 'dinner': '19:00'}
    water_intake: Optional[float] = None  # liters
    supplements: Optional[List[Dict[str, Any]]] = None

class NutritionGuideline(BaseModel):
    allowed_foods: Optional[List[str]] = None
    restricted_foods: Optional[List[str]] = None
    food_substitutions: Optional[Dict[str, List[str]]] = None
    notes: Optional[str] = None

class MealTemplate(BaseModel):
    name: str
    description: Optional[str] = None
    protein_sources: List[str]
    carb_sources: List[str]
    fat_sources: List[str]
    vegetables: Optional[List[str]] = None
    fruits: Optional[List[str]] = None
    spices: Optional[List[str]] = None
    recipe: Optional[str] = None
    macro_estimate: Optional[MacroTarget] = None

class DailyPlan(BaseModel):
    day_type: str  # e.g., "training_day", "rest_day", "low_carb_day"
    meals: Dict[str, MealTemplate]  # {'breakfast': meal1, 'lunch': meal2, 'dinner': meal3}
    nutrient_targets: Optional[NutrientTarget] = None
    notes: Optional[str] = None

class NutritionPlan(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    type: PlanType
    duration_weeks: int
    nutrient_targets: NutrientTarget
    daily_plans: Dict[str, DailyPlan]  # {'training_day': plan1, 'rest_day': plan2}
    guidelines: Optional[NutritionGuideline] = None
    author: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientNutrition(BaseModel):
    id: Optional[str] = None
    client_id: str
    plan_id: str
    start_date: date
    end_date: Optional[date] = None
    status: str = "active"  # active, completed, cancelled
    adjustments: Optional[Dict[str, Any]] = None
    adherence: Optional[int] = None  # Percentage adherence
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ClientNutritionUpdate(BaseModel):
    status: Optional[str] = None
    adjustments: Optional[Dict[str, Any]] = None
    adherence: Optional[int] = None
    notes: Optional[str] = None
    end_date: Optional[date] = None

class NutritionPlanAssignment(BaseModel):
    client_id: str
    plan_id: str
    start_date: date
    adjustments: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class FoodNutrition(BaseModel):
    name: str
    serving_size: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None
    vitamins: Optional[Dict[str, float]] = None
    minerals: Optional[Dict[str, float]] = None
    source: Optional[str] = None

class FoodNutritionResponse(BaseModel):
    name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    serving_size: str
    nutrients: Dict[str, float]

class MacroDistribution(BaseModel):
    protein: int
    carbs: int
    fat: int

class MealStructure(BaseModel):
    meal_name: str
    time: str
    description: str
    suggested_foods: List[str]

class NutritionPlanCreate(BaseModel):
    name: str
    type: str
    description: str
    duration_weeks: int
    target_goals: List[str]
    macros: MacroDistribution
    meal_structure: List[MealStructure]

class NutritionTemplateResponse(BaseModel):
    plans: List[NutritionPlan]
    total: int

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

@router.get("/nutrition/templates", response_model=NutritionTemplateResponse)
def get_nutrition_templates(
    plan_type: Optional[PlanType] = Query(None, description="Type of nutrition plan to filter by"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of templates to return"),
    offset: int = Query(0, ge=0, description="Number of templates to skip")
):
    """Get nutrition plan templates with optional filtering"""
    try:
        # Build filters
        filters = []
        
        if plan_type:
            filters.append(f"type=eq.{plan_type}")
        
        filter_str = "&".join(filters) if filters else ""
        path = f"/rest/v1/nutrition_plans?{filter_str}"
        
        # Get count first
        count_path = f"{path}&select=count"
        count_result = supabase_request("GET", count_path)
        total = count_result[0].get("count", 0) if count_result and len(count_result) > 0 else 0
        
        # Get plans
        params = {
            "select": "*",
            "order": "created_at.desc",
            "limit": limit,
            "offset": offset
        }
        
        result = supabase_request("GET", path, params=params)
        
        return {
            "plans": result,
            "total": total
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving nutrition templates: {str(e)}") from e

@router.get("/nutrition/plans/{plan_id}", response_model=NutritionPlan)
def get_nutrition_plan(plan_id: str = Path(..., description="The ID of the nutrition plan")):
    """Get a specific nutrition plan by ID"""
    try:
        result = supabase_request(
            "GET", 
            f"/rest/v1/nutrition_plans?id=eq.{plan_id}&select=*",
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail=f"Nutrition plan with ID {plan_id} not found")
        
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving nutrition plan: {str(e)}") from e

@router.get("/nutrition/clients/{client_id}/plan", response_model=Union[ClientNutrition, Dict[str, None]])
def get_client_active_nutrition(client_id: str = Path(..., description="The ID of the client")):
    """Get a client's active nutrition plan"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Get active plan
        result = supabase_request(
            "GET", 
            f"/rest/v1/client_nutrition?client_id=eq.{client_id}&status=eq.active&select=*&order=start_date.desc&limit=1",
        )
        
        if not result or len(result) == 0:
            return {"client_id": client_id, "plan_id": None}
        
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error retrieving client nutrition plan: {str(e)}") from e

@router.post("/nutrition/clients/plan", response_model=ClientNutrition, status_code=201)
def assign_nutrition_plan(assignment: NutritionPlanAssignment):
    """Assign a nutrition plan to a client"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{assignment.client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {assignment.client_id} not found")
        
        # Verify plan exists
        plan_check = supabase_request(
            "GET", 
            f"/rest/v1/nutrition_plans?id=eq.{assignment.plan_id}&select=id,duration_weeks",
        )
        
        if not plan_check or len(plan_check) == 0:
            raise HTTPException(status_code=404, detail=f"Nutrition plan with ID {assignment.plan_id} not found")
        
        # Calculate end date based on plan duration
        duration_weeks = plan_check[0].get("duration_weeks", 4)  # Default to 4 weeks if not specified
        start_date = assignment.start_date
        end_date = None
        if start_date:
            # Calculate end date (start_date + duration_weeks * 7 days - 1)
            end_date = start_date + timedelta(days=(duration_weeks * 7) - 1)
        
        # Mark any existing active plans as completed
        existing_plans = supabase_request(
            "GET", 
            f"/rest/v1/client_nutrition?client_id=eq.{assignment.client_id}&status=eq.active&select=id",
        )
        
        if existing_plans and len(existing_plans) > 0:
            for plan in existing_plans:
                supabase_request(
                    "PATCH", 
                    f"/rest/v1/client_nutrition?id=eq.{plan['id']}",
                    data={"status": "completed"}
                )
        
        # Create new client nutrition plan
        client_plan_data = {
            "client_id": assignment.client_id,
            "plan_id": assignment.plan_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat() if end_date else None,
            "status": "active",
            "adherence": 0,
            "adjustments": assignment.adjustments,
            "notes": assignment.notes
        }
        
        result = supabase_request(
            "POST", 
            "/rest/v1/client_nutrition",
            data=client_plan_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error assigning nutrition plan to client: {str(e)}") from e

@router.patch("/nutrition/clients/{client_id}/plan", response_model=ClientNutrition)
def update_client_nutrition(
    client_id: str = Path(..., description="The ID of the client"),
    updates: ClientNutritionUpdate = Body(...)
):
    """Update a client's active nutrition plan"""
    try:
        # Verify client exists
        client_check = supabase_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=id",
        )
        
        if not client_check or len(client_check) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
        
        # Get active plan
        active_plan = supabase_request(
            "GET", 
            f"/rest/v1/client_nutrition?client_id=eq.{client_id}&status=eq.active&select=*&order=start_date.desc&limit=1",
        )
        
        if not active_plan or len(active_plan) == 0:
            raise HTTPException(status_code=404, detail=f"No active nutrition plan found for client with ID {client_id}")
        
        plan_id = active_plan[0].get("id")
        
        # Prepare update data
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        # Update the plan
        result = supabase_request(
            "PATCH", 
            f"/rest/v1/client_nutrition?id=eq.{plan_id}",
            data=update_data
        )
        
        # Get updated plan
        updated_plan = supabase_request(
            "GET", 
            f"/rest/v1/client_nutrition?id=eq.{plan_id}&select=*",
        )
        
        if not updated_plan or len(updated_plan) == 0:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated nutrition plan")
        
        return updated_plan[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating client nutrition plan: {str(e)}") from e

# Models for enhanced food search
class FoodSearchRequest(BaseModel):
    query: str
    limit: int = 10
    category: str = None

class FoodSearchResponse(BaseModel):
    results: List[FoodNutritionResponse]
    count: int

@router.post("/food/search", response_model=FoodSearchResponse)
def advanced_food_search(request: FoodSearchRequest) -> FoodSearchResponse:
    """Search for nutrition information for multiple food items matching query criteria
    
    This endpoint provides advanced food search functionality, returning multiple matching results.
    
    Parameters:
    - query: Search text to find matching foods
    - limit: Maximum number of results to return (default: 10)
    - category: Optional food category filter
    
    Returns a list of matching food items with their complete nutritional information.
    
    Example for Claude Desktop MCP:
    ```
    You can use this tool to search for nutrition information about foods. For example:
    - "Search for chicken breast information"
    - "Get nutrition facts for almonds"
    - "Find macros for greek yogurt and berries"
    ```
    """
    try:
        results = []
        query = request.query.lower()
        limit = min(request.limit, 20)  # Cap at 20 max results
        
        # Try to use USDA API if available
        try:
            api_key = db.secrets.get("USDA_API_KEY")
            
            if api_key:
                # Search for foods
                search_url = f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={query}&pageSize={limit}"
                if request.category:
                    search_url += f"&foodCategory={request.category}"
                    
                response = requests.get(search_url)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('foods') and len(data['foods']) > 0:
                        for food in data['foods'][:limit]:
                            food_id = food.get('fdcId')
                            
                            # Simple extraction from search results without detailed API call
                            nutrients = {}
                            for nutrient in food.get('foodNutrients', []):
                                if 'nutrientName' in nutrient and 'value' in nutrient:
                                    nutrient_name = nutrient['nutrientName'].lower().replace(' ', '_')
                                    nutrients[nutrient_name] = nutrient['value']
                            
                            # Extract macros
                            protein = next((n['value'] for n in food.get('foodNutrients', []) 
                                          if n.get('nutrientName') == 'Protein'), 0)
                            carbs = next((n['value'] for n in food.get('foodNutrients', []) 
                                         if n.get('nutrientName') == 'Carbohydrate, by difference'), 0)
                            fat = next((n['value'] for n in food.get('foodNutrients', []) 
                                      if n.get('nutrientName') == 'Total lipid (fat)'), 0)
                            calories = next((n['value'] for n in food.get('foodNutrients', []) 
                                          if n.get('nutrientName') == 'Energy'), 0)
                            
                            results.append(FoodNutritionResponse(
                                name=food.get('description', 'Unknown Food'),
                                calories=int(calories) if calories else 0,
                                protein=float(protein) if protein else 0,
                                carbs=float(carbs) if carbs else 0,
                                fat=float(fat) if fat else 0,
                                serving_size=f"{food.get('servingSize', 100)}g",
                                nutrients=nutrients
                            ))
                            
                        if results:
                            return FoodSearchResponse(results=results, count=len(results))
                
            # If we reach here, API request failed or returned no results
            # Fall back to mock data
            raise Exception("Using mock data")
                
        except Exception as e:
            print(f"API lookup failed, using mock data: {str(e)}")
        
        # Enhanced mock data with more foods and detailed nutrition info
        mock_data = {
            "chicken": {
                "name": "Chicken Breast, cooked",
                "calories": 165,
                "protein": 31.0,
                "carbs": 0.0,
                "fat": 3.6,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_b6": 0.6,
                    "vitamin_b12": 0.3,
                    "niacin": 13.7,
                    "selenium": 27.6,
                    "phosphorus": 200.0,
                    "potassium": 255.0,
                    "magnesium": 29.0
                }
            },
            "beef": {
                "name": "Beef, ground, 85% lean",
                "calories": 218,
                "protein": 24.0,
                "carbs": 0.0,
                "fat": 13.0,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_b12": 2.7,
                    "zinc": 6.3,
                    "iron": 2.6,
                    "selenium": 28.4,
                    "niacin": 5.9,
                    "vitamin_b6": 0.4,
                    "phosphorus": 211.0
                }
            },
            "salmon": {
                "name": "Atlantic Salmon, cooked",
                "calories": 208,
                "protein": 20.4,
                "carbs": 0.0,
                "fat": 13.4,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_d": 11.0,
                    "vitamin_b12": 3.2,
                    "omega_3": 2.2,
                    "selenium": 36.5,
                    "vitamin_b6": 0.8,
                    "phosphorus": 240.0,
                    "potassium": 366.0
                }
            },
            "tuna": {
                "name": "Tuna, light, canned in water",
                "calories": 116,
                "protein": 25.5,
                "carbs": 0.0,
                "fat": 0.8,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_d": 1.7,
                    "selenium": 65.7,
                    "vitamin_b12": 2.4,
                    "niacin": 11.3,
                    "vitamin_b6": 0.3,
                    "magnesium": 28.0
                }
            }
        }
        
        # Filter mock data based on query
        filtered_results = []
        for key, data in mock_data.items():
            if query in key.lower() or query in data['name'].lower():
                filtered_results.append(FoodNutritionResponse(**data))
        
        # Limit results
        filtered_results = filtered_results[:limit]
        
        return FoodSearchResponse(results=filtered_results, count=len(filtered_results))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching for food nutrition: {str(e)}")


@router.get("/food/{food_name}")
def lookup_food_nutrition(food_name: str) -> FoodNutritionResponse:
    """Look up nutrition information for a specific food item
    
    This endpoint retrieves detailed nutritional information for a single food item.
    Consider using the /food/search endpoint for more advanced search capabilities.
    
    Parameters:
    - food_name: Name of the food to look up
    
    Returns complete nutritional information for the matched food item.
    """
    try:
        # For now, try to use an external API if available
        # If not, fall back to mock data
        try:
            # Use USDA FoodData Central API
            # This requires a free API key from https://fdc.nal.usda.gov/api-key-signup.html
            api_key = db.secrets.get("USDA_API_KEY")
            
            if api_key:
                # Search for the food
                search_url = f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={food_name}&pageSize=1"
                response = requests.get(search_url)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('foods') and len(data['foods']) > 0:
                        food = data['foods'][0]
                        food_id = food.get('fdcId')
                        
                        # Get detailed nutrient information
                        detail_url = f"https://api.nal.usda.gov/fdc/v1/food/{food_id}?api_key={api_key}"
                        detail_response = requests.get(detail_url)
                        
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            nutrients = {}
                            
                            # Extract nutrients
                            for nutrient in detail_data.get('foodNutrients', []):
                                nutrient_name = nutrient.get('nutrient', {}).get('name', '').lower().replace(' ', '_')
                                amount = nutrient.get('amount', 0)
                                
                                if nutrient_name and amount:
                                    nutrients[nutrient_name] = amount
                            
                            # Find macros
                            protein = next((n['amount'] for n in detail_data.get('foodNutrients', []) 
                                          if n.get('nutrient', {}).get('name') == 'Protein'), 0)
                            carbs = next((n['amount'] for n in detail_data.get('foodNutrients', []) 
                                         if n.get('nutrient', {}).get('name') == 'Carbohydrate, by difference'), 0)
                            fat = next((n['amount'] for n in detail_data.get('foodNutrients', []) 
                                      if n.get('nutrient', {}).get('name') == 'Total lipid (fat)'), 0)
                            calories = next((n['amount'] for n in detail_data.get('foodNutrients', []) 
                                          if n.get('nutrient', {}).get('name') == 'Energy'), 0)
                            
                            return FoodNutritionResponse(
                                name=food.get('description', food_name.title()),
                                calories=int(calories),
                                protein=float(protein),
                                carbs=float(carbs),
                                fat=float(fat),
                                serving_size=f"{food.get('servingSize', 100)}g",
                                nutrients=nutrients
                            )
            
            # If we reach here, either no API key or the API request failed
            # Fall back to mock data
            raise Exception("Using mock data")
                
        except Exception as e:
            print(f"API lookup failed, using mock data: {str(e)}")
            # Fall back to mock data
            pass
            
        # Advanced mock data based on food name
        mock_data = {
            "chicken breast": {
                "name": "Chicken Breast",
                "calories": 165,
                "protein": 31.0,
                "carbs": 0.0,
                "fat": 3.6,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_a": 14.5,
                    "vitamin_c": 0.0,
                    "calcium": 15.0,
                    "iron": 1.0,
                    "fiber": 0.0,
                    "sodium": 74.0,
                    "potassium": 256.0,
                    "magnesium": 29.0,
                    "zinc": 1.0,
                    "selenium": 24.0
                }
            },
            "salmon": {
                "name": "Atlantic Salmon",
                "calories": 208,
                "protein": 20.4,
                "carbs": 0.0,
                "fat": 13.4,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_d": 11.0,
                    "vitamin_b12": 3.2,
                    "omega_3": 2.2,
                    "selenium": 36.5,
                    "vitamin_b6": 0.8,
                    "phosphorus": 240.0,
                    "iodine": 13.0
                }
            },
            "brown rice": {
                "name": "Brown Rice",
                "calories": 112,
                "protein": 2.6,
                "carbs": 23.5,
                "fat": 0.9,
                "serving_size": "100g cooked",
                "nutrients": {
                    "fiber": 1.8,
                    "manganese": 1.1,
                    "selenium": 19.1,
                    "magnesium": 44.0,
                    "phosphorus": 83.0,
                    "vitamin_b6": 0.1,
                    "niacin": 2.6
                }
            },
            "sweet potato": {
                "name": "Sweet Potato",
                "calories": 86,
                "protein": 1.6,
                "carbs": 20.1,
                "fat": 0.1,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_a": 14187.0,
                    "vitamin_c": 2.4,
                    "manganese": 0.3,
                    "potassium": 337.0,
                    "fiber": 3.0,
                    "vitamin_b6": 0.2
                }
            },
            "broccoli": {
                "name": "Broccoli",
                "calories": 34,
                "protein": 2.8,
                "carbs": 7.0,
                "fat": 0.4,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_c": 89.2,
                    "vitamin_k": 102.0,
                    "folate": 63.0,
                    "vitamin_a": 623.0,
                    "manganese": 0.2,
                    "fiber": 2.6,
                    "potassium": 316.0
                }
            },
            "egg": {
                "name": "Whole Egg",
                "calories": 143,
                "protein": 12.6,
                "carbs": 0.7,
                "fat": 9.5,
                "serving_size": "100g (2 large eggs)",
                "nutrients": {
                    "vitamin_a": 487.0,
                    "vitamin_d": 87.0,
                    "vitamin_b12": 1.1,
                    "folate": 47.0,
                    "riboflavin": 0.5,
                    "phosphorus": 198.0,
                    "selenium": 30.7,
                    "choline": 294.0
                }
            },
            "oatmeal": {
                "name": "Oatmeal",
                "calories": 68,
                "protein": 2.4,
                "carbs": 12.0,
                "fat": 1.4,
                "serving_size": "100g cooked",
                "nutrients": {
                    "manganese": 0.6,
                    "phosphorus": 77.0,
                    "magnesium": 19.0,
                    "copper": 0.1,
                    "iron": 0.7,
                    "zinc": 0.6,
                    "folate": 14.0,
                    "vitamin_b1": 0.1,
                    "fiber": 1.7
                }
            },
            "spinach": {
                "name": "Spinach",
                "calories": 23,
                "protein": 2.9,
                "carbs": 3.6,
                "fat": 0.4,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_a": 9377.0,
                    "vitamin_c": 28.1,
                    "vitamin_k": 483.0,
                    "folate": 194.0,
                    "manganese": 0.9,
                    "magnesium": 79.0,
                    "iron": 2.7,
                    "potassium": 558.0
                }
            },
            "apple": {
                "name": "Apple",
                "calories": 52,
                "protein": 0.3,
                "carbs": 13.8,
                "fat": 0.2,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_c": 4.6,
                    "potassium": 107.0,
                    "fiber": 2.4,
                    "vitamin_k": 2.2
                }
            },
            "avocado": {
                "name": "Avocado",
                "calories": 160,
                "protein": 2.0,
                "carbs": 8.5,
                "fat": 14.7,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_k": 21.0,
                    "folate": 81.0,
                    "vitamin_c": 10.0,
                    "potassium": 485.0,
                    "vitamin_b5": 1.4,
                    "vitamin_b6": 0.3,
                    "vitamin_e": 2.1,
                    "fiber": 6.7
                }
            },
            "banana": {
                "name": "Banana",
                "calories": 89,
                "protein": 1.1,
                "carbs": 22.8,
                "fat": 0.3,
                "serving_size": "100g",
                "nutrients": {
                    "vitamin_c": 8.7,
                    "potassium": 358.0,
                    "vitamin_b6": 0.4,
                    "manganese": 0.3,
                    "fiber": 2.6
                }
            }
        }
        
        # Find the best match or return default data
        for key, data in mock_data.items():
            if key in food_name.lower():
                return FoodNutritionResponse(**data)
        
        # Default mock data if no specific match
        return FoodNutritionResponse(
            name=food_name.title(),
            calories=100,
            protein=5.0,
            carbs=15.0,
            fat=2.0,
            serving_size="100g",
            nutrients={
                "vitamin_a": 14.5,
                "vitamin_c": 8.7,
                "calcium": 12.3,
                "iron": 5.6,
                "fiber": 2.1
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error looking up food nutrition: {str(e)}")

@router.post("/plans")
def create_nutrition_plan(plan: NutritionPlanCreate):
    """Create a new nutrition plan"""
    try:
        supabase = get_supabase_client()
        
        # Generate a new UUID for the plan
        plan_id = str(uuid.uuid4())
        
        # Prepare the plan data for insertion
        plan_data = {
            "id": plan_id,
            "name": plan.name,
            "type": plan.type,
            "description": plan.description,
            "duration_weeks": plan.duration_weeks,
            "target_goals": plan.target_goals,
            "macros": {
                "protein": plan.macros.protein,
                "carbs": plan.macros.carbs,
                "fat": plan.macros.fat
            },
            "meal_structure": [meal.dict() for meal in plan.meal_structure],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert the plan into the database
        response = supabase.table("nutrition_plans").insert(plan_data).execute()
        
        # Handle the response
        result = handle_supabase_response(response)
        
        # Return the created plan with its ID
        return {"id": plan_id, "plan": plan_data}
    except Exception as e:
        # Log the error for debugging
        print(f"Error creating nutrition plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating nutrition plan: {str(e)}") from e
