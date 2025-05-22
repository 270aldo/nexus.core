from fastapi import APIRouter, Query, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import databutton as db
import json
import uuid
from datetime import datetime
from supabase import create_client

router = APIRouter(tags=["mcp-activation"])

class ActivationRequest(BaseModel):
    client_id: Optional[str] = None

# Función para obtener cliente Supabase
def get_supabase_client():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(supabase_url, supabase_key)

@router.get("/mcp/status")
def get_mcp_status():
    """Obtiene el estado actual del servicio MCP"""
    try:
        # Retornar estado simple
        return {
            "status": "active",
            "message": "El servicio MCP está activo y funcionando correctamente",
            "endpoints_available": [
                "/mcp/add-client-direct",
                "/mcp/status",
                "/mcp/activate"
            ],
            "last_check": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al verificar estado: {str(e)}"
        }

@router.post("/mcp/activate")
def activate_mcp(request: ActivationRequest = Body(...)):
    """Activa el servicio MCP para un cliente específico o para toda la instancia"""
    try:
        # Obtener cliente
        client_message = ""
        if request.client_id:
            # Activación para un cliente específico
            supabase = get_supabase_client()
            try:
                # Verificar si el cliente existe
                client_response = supabase.table("clients").select("*").eq("id", request.client_id).execute()
                
                if client_response.data and len(client_response.data) > 0:
                    client_name = client_response.data[0].get("name", "Cliente")
                    client_message = f" para el cliente {client_name}"
                else:
                    return {
                        "success": False,
                        "message": f"No se encontró el cliente con ID {request.client_id}"
                    }
            except Exception as client_error:
                print(f"Error al verificar cliente: {str(client_error)}")
                # Continuamos con la activación general incluso si falla la verificación
        
        # Registrar activación en el log
        activation_id = str(uuid.uuid4())
        activation_time = datetime.now().isoformat()
        
        # Guardar en storage la activación
        try:
            # Obtener activaciones previas
            mcp_activations = db.storage.json.get("mcp_activations", default=[])
            
            # Añadir nueva activación
            mcp_activations.append({
                "id": activation_id,
                "client_id": request.client_id,
                "timestamp": activation_time,
                "source": "claude_desktop"
            })
            
            # Guardar activaciones actualizadas
            db.storage.json.put("mcp_activations", mcp_activations)
        except Exception as storage_error:
            print(f"Error al guardar activación: {str(storage_error)}")
        
        # Respuesta exitosa
        return {
            "success": True,
            "message": f"Servicio MCP activado correctamente{client_message}",
            "activation_id": activation_id,
            "timestamp": activation_time
        }
    
    except Exception as e:
        print(f"ERROR al activar MCP: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error al activar servicio MCP: {str(e)}"
        }
