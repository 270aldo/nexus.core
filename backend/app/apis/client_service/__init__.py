from fastapi import APIRouter, HTTPException, Path, Query, Body
from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
import requests
import databutton as db
import json
import uuid

router = APIRouter(prefix="/client-service", tags=["client-service"])

# Helper functions for direct Supabase access with admin rights
def get_supabase_admin_credentials():
    try:
        supabase_url = db.secrets.get("SUPABASE_URL")
        # Necesitamos la clave de servicio con permisos de admin para saltarnos las RLS
        supabase_service_key = db.secrets.get("SUPABASE_SERVICE_KEY", None)
        
        if not supabase_url:
            raise ValueError("SUPABASE_URL not found")
            
        # Caer en anon_key si no hay service_key
        if not supabase_service_key:
            supabase_service_key = db.secrets.get("SUPABASE_ANON_KEY")
            print("WARNING: Using anon key instead of service key. This may limit access due to RLS policies.")
        
        return supabase_url, supabase_service_key
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Supabase credentials: {str(e)}"
        )

def supabase_admin_request(method, path, data=None, params=None):
    url, key = get_supabase_admin_credentials()
    
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

# Client models
class ClientCreate(BaseModel):
    type: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    birth_date: Optional[str] = None  # ISO format YYYY-MM-DD
    status: Optional[str] = "active"
    goals: Optional[List[str]] = None
    payment_status: Optional[str] = None

# API Endpoints for Admin Service
@router.post("/clients", status_code=201)
def create_client_admin(client: ClientCreate):
    """Create a new client with admin privileges to bypass RLS"""
    try:
        # Generate UUID for the client
        client_id = str(uuid.uuid4())
        
        # Prepare client data
        client_data = client.model_dump()
        client_data["id"] = client_id
        client_data["join_date"] = date.today().isoformat()
        
        # Create the client
        result = supabase_admin_request(
            "POST", 
            "/rest/v1/clients",
            data=client_data
        )
        
        return result[0] if isinstance(result, list) else result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error creating client: {str(e)}")

@router.get("/clients")
def search_clients_admin(q: Optional[str] = None, limit: int = 10, offset: int = 0):
    """Search clients with admin privileges"""
    try:
        # Build filters
        filters = []
        if q:
            filters.append(f"or=(name.ilike.%{q}%,email.ilike.%{q}%)")
        
        filter_query = ",".join(filters)
        path = f"/rest/v1/clients?select=*{f'&{filter_query}' if filter_query else ''}"
        
        # Add pagination
        params = {}
        params["limit"] = limit
        params["offset"] = offset
        params["order"] = "created_at.desc"
        
        # Get total count first
        count_params = {"select": "count"}
        count_result = supabase_admin_request("GET", f"/rest/v1/clients?{filter_query}", params=count_params)
        total_count = 0
        if count_result and len(count_result) > 0:
            total_count = count_result[0].get("count", 0)
        
        # Get the data
        result = supabase_admin_request("GET", path, params=params)
        
        return {
            "clients": result,
            "total": total_count
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error searching clients: {str(e)}")

@router.get("/clients/{client_id}")
def get_client_by_id_admin(client_id: str = Path(..., description="The ID of the client to get")):
    """Get a client by ID with admin privileges"""
    try:
        result = supabase_admin_request(
            "GET", 
            f"/rest/v1/clients?id=eq.{client_id}&select=*",
        )
        
        if not result or len(result) == 0:
            raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found")
            
        return result[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error getting client: {str(e)}")
