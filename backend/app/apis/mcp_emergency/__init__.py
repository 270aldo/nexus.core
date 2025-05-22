from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import databutton as db
import json
import uuid
from datetime import datetime
from supabase import create_client

router = APIRouter(tags=["direct-mcp"])

class SimpleClient(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    type: Optional[str] = "PRIME"
    goals: Optional[List[str]] = None
    health_conditions: Optional[List[Dict[str, str]]] = None

@router.post("/add-client-direct2")
def add_client_direct2(client: SimpleClient):
    """Crea un cliente directo desde Claude Desktop - solución emergencia"""
    try:
        # Conexión directa a Supabase
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Generar datos
        client_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        # Asegurar tipo correcto
        client_type = "PRIME"
        if client.type and client.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = client.type.upper()
        
        # Crear cliente para insertar
        client_data = {
            "id": client_id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone or "",
            "type": client_type,
            "status": "active",
            "join_date": now,
            "goals": json.dumps(client.goals or []),
            "health_conditions": json.dumps(client.health_conditions or []),
            "initial_assessment": json.dumps({}),
            "payment_status": "active",
            "created_at": now,
            "updated_at": now
        }
        
        # Log detallado
        print(f"INSERCIÓN CLIENTE: {json.dumps(client_data)}")
        
        # Insertar directamente
        response = supabase.table("clients").insert(client_data).execute()
        print(f"RESPUESTA SUPABASE: {json.dumps(response.data if hasattr(response, 'data') else None)}")
        
        # Insertar notificación
        notification_data = {
            "id": str(uuid.uuid4()),
            "user_id": "admin",
            "title": f"Nuevo cliente: {client.name}",
            "message": f"Cliente creado desde Claude Desktop",
            "type": "client_created",
            "read": False,
            "created_at": now
        }
        
        # Intentar insertar notificación
        try:
            notif_response = supabase.table("notifications").insert(notification_data).execute()
            print(f"NOTIFICACIÓN CREADA: {notif_response.data if hasattr(notif_response, 'data') else None}")
        except Exception as notif_err:
            print(f"ERROR NOTIFICACIÓN: {str(notif_err)}")
        
        # Respuesta clara y sencilla
        return {
            "success": True,
            "message": f"Cliente {client.name} creado exitosamente con ID: {client_id}",
            "client_id": client_id,
            "name": client.name,
            "email": client.email
        }
    
    except Exception as e:
        error_message = str(e)
        print(f"ERROR GRAVE EN add_client_direct2: {error_message}")
        return {
            "success": False,
            "error": error_message,
            "message": f"Error al crear cliente: {error_message}"
        }