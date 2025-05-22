from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import databutton as db
import json
import uuid
from datetime import datetime

# Importamos el cliente de Supabase
from app.apis.utils import get_supabase_client

router = APIRouter(prefix="/claude-mcp", tags=["mcp"])

class SimpleClientRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    type: Optional[str] = "PRIME" # PRIME o LONGEVITY
    goals: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    
@router.post("/create-client")
def create_client_simple(client: SimpleClientRequest):
    """Endpoint simplificado para crear clientes desde Claude Desktop"""
    try:
        # Obtener cliente de Supabase
        supabase = get_supabase_client()
        
        # Validar el tipo de cliente
        client_type = "PRIME"
        if client.type and client.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = client.type.upper()
            
        # Preparar datos del cliente
        client_data = {
            "id": str(uuid.uuid4()),
            "name": client.name,
            "email": client.email,
            "phone": client.phone or "",
            "type": client_type,
            "status": "active",
            "join_date": datetime.now().isoformat(),
            "goals": json.dumps(client.goals) if client.goals else json.dumps([]),
            "health_conditions": json.dumps(client.health_conditions) if client.health_conditions else json.dumps([]),
            "initial_assessment": json.dumps({})
        }
        
        # Insertamos el cliente en Supabase
        response = supabase.table("clients").insert(client_data).execute()
        
        # Verificamos si hubo error
        if response.data is None or len(response.data) == 0:
            return {
                "success": False,
                "message": "No se pudo crear el cliente",
                "error": str(response.error) if hasattr(response, 'error') else "Error desconocido"
            }
        
        return {
            "success": True,
            "message": f"Cliente {client.name} creado exitosamente",
            "client_id": response.data[0]["id"] if response.data and len(response.data) > 0 else None
        }
        
    except Exception as e:
        print(f"Error al crear cliente: {str(e)}")
        return {
            "success": False,
            "message": "Error al crear cliente",
            "error": str(e)
        }

@router.get("/status")
def get_claude_mcp_status():
    """Verificar el estado de la integración MCP con Claude Desktop"""
    return {
        "success": True,
        "message": "Integración MCP para Claude Desktop activa",
        "endpoints": [
            "/claude-mcp/create-client",
            "/claude-mcp/status"
        ],
        "timestamp": datetime.now().isoformat()
    }
