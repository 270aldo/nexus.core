from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import json
import uuid
from datetime import datetime

# Import the Supabase client helper
from app.apis.utils import get_supabase_client

router = APIRouter(prefix="/claude-mcp", tags=["mcp"])


class SimpleClientRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    type: Optional[str] = "PRIME"  # PRIME or LONGEVITY
    goals: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None


@router.post("/create-client")
def create_client_simple(client: SimpleClientRequest):
    """Simplified endpoint to create clients from Claude Desktop."""
    try:
        # Get Supabase client
        supabase = get_supabase_client()

        # Validate client type
        client_type = "PRIME"
        if client.type and client.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = client.type.upper()

        # Prepare client data
        client_data = {
            "id": str(uuid.uuid4()),
            "name": client.name,
            "email": client.email,
            "phone": client.phone or "",
            "type": client_type,
            "status": "active",
            "join_date": datetime.now().isoformat(),
            "goals": json.dumps(client.goals) if client.goals else json.dumps([]),
            "health_conditions": (
                json.dumps(client.health_conditions)
                if client.health_conditions
                else json.dumps([])
            ),
            "initial_assessment": json.dumps({}),
        }

        # Insert client into Supabase
        response = supabase.table("clients").insert(client_data).execute()

        # Check if there was an error
        if response.data is None or len(response.data) == 0:
            return {
                "success": False,
                "message": "Client could not be created",
                "error": (
                    str(response.error)
                    if hasattr(response, "error")
                    else "Unknown error"
                ),
            }

        return {
            "success": True,
            "message": f"Client {client.name} created successfully",
            "client_id": (
                response.data[0]["id"]
                if response.data and len(response.data) > 0
                else None
            ),
        }

    except Exception as e:
        print(f"Error creating client: {str(e)}")
        return {"success": False, "message": "Error creating client", "error": str(e)}


@router.get("/status")
def get_claude_mcp_status():
    """Check the status of the MCP integration for Claude Desktop."""
    return {
        "success": True,
        "message": "MCP integration for Claude Desktop active",
        "endpoints": ["/claude-mcp/create-client", "/claude-mcp/status"],
        "timestamp": datetime.now().isoformat(),
    }
