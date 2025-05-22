from fastapi import APIRouter, Query, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import databutton as db
import json
import uuid
from datetime import datetime
from supabase import create_client

router = APIRouter(tags=["mcp-direct"])

class SimpleClient(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    type: str = "PRIME"  # PRIME o LONGEVITY
    goals: Optional[List[str]] = None
    health_conditions: Optional[List[Dict[str, str]]] = None

# Función para obtener cliente Supabase
def get_supabase_client():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(supabase_url, supabase_key)

@router.post("/mcp/add-client-direct22")
def add_client_direct22(client: SimpleClient):
    """Crea un cliente directamente desde Claude Desktop - endpoint optimizado"""
    try:
        # Obtener cliente Supabase
        supabase = get_supabase_client()
        
        # ID único
        client_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        # Asegurar tipo correcto
        client_type = "PRIME"
        if client.type and client.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = client.type.upper()
        
        # Prepare goals in correct format for frontend
        goals_list = client.goals or ["Fitness general"]
        
        # Datos del cliente completos
        client_data = {
            "id": client_id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone or "",
            "type": client_type,
            "status": "active",
            "join_date": current_time,
            "goals": json.dumps(goals_list),
            "health_conditions": json.dumps(client.health_conditions or []),
            "initial_assessment": json.dumps({}),
            "payment_status": "active",
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Insertar cliente
        response = supabase.table("clients").insert(client_data).execute()
        
        # Crear notificación para alertar al usuario sobre la creación
        try:
            notification_data = {
                "user_id": "admin",
                "title": f"Nuevo cliente creado: {client.name}",
                "message": f"Se ha creado un nuevo cliente {client.name} desde Claude Desktop",
                "type": "client_created",
                "read": False,
                "created_at": current_time
            }
            supabase.table("notifications").insert(notification_data).execute()
            print(f"Notificación creada para el nuevo cliente {client.name}")
        except Exception as notif_err:
            print(f"Error al crear notificación: {str(notif_err)}")
        
        # Registrar en actividad si la tabla existe
        try:
            activity_data = {
                "id": str(uuid.uuid4()),
                "type": "client_created",
                "client_id": client_id,
                "details": f"Cliente {client.name} creado desde Claude Desktop",
                "created_at": current_time,
                "created_by": "claude-desktop"
            }
            supabase.table("activities").insert(activity_data).execute()
        except Exception as activity_error:
            print(f"Nota: no se pudo registrar actividad: {str(activity_error)}")
        
        print(f"Cliente creado correctamente con ID: {client_id} - Nombre: {client.name}")
        
        # Retornar éxito
        return {
            "success": True,
            "message": f"Cliente {client.name} creado exitosamente",
            "client_id": client_id,
            "client_name": client.name
        }
    
    except Exception as e:
        print(f"ERROR al crear cliente directo: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error al crear cliente: {str(e)}"
        }
