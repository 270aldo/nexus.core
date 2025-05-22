from pydantic import BaseModel
import databutton as db
import requests
from fastapi import HTTPException

__all__ = ['DateRange', 'MCPResponse', 'get_supabase_credentials', 'supabase_request']

class DateRange(BaseModel):
    start_date: str
    end_date: str

class MCPResponse(BaseModel):
    result: dict
    metadata: dict = {}

# Function to get Supabase credentials
def get_supabase_credentials():
    """Get Supabase URL and API key from secrets"""
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
    """Make a request to the Supabase REST API
    
    Args:
        method (str): HTTP method (GET, POST, PUT, PATCH, DELETE)
        path (str): API path (without base URL)
        data (dict, optional): Data to send in the request body
        params (dict, optional): Query parameters
        
    Returns:
        dict or None: JSON response or None for 204 responses
        
    Raises:
        HTTPException: If there's an error with the request
    """
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
        
        raise HTTPException(status_code=500, detail=f"Supabase API error: {error_detail}")
