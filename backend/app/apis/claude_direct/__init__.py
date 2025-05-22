from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import databutton as db
import json
import uuid
from datetime import datetime
from supabase import create_client
import requests

# Router sin tags ni prefijos para que Claude lo use directamente
router = APIRouter()

# API DESACTIVADA TEMPORALMENTE PARA RESOLVER CONFLICTOS DE OPERACIONES
# FAVOR DE USAR LAS NUEVAS VERSIONES DE ESTOS ENDPOINTS

# FUNCIONES BÁSICAS

# Función para conectar a Supabase
def get_supabase():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(supabase_url, supabase_key)

# MODELOS PARA LOS ENDPOINTS

class ClientRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    type: Optional[str] = "PRIME"
    status: Optional[str] = "active"
    goals: Optional[List[str]] = None
    health_conditions: Optional[List[Dict[str, Any]]] = None
    payment_status: Optional[str] = "active"

class ClientSearchParams(BaseModel):
    query: Optional[str] = None
    limit: Optional[int] = 10
    filters: Optional[Dict[str, Any]] = None

# ENDPOINTS DIRECTOS SIN PREFIJOS PARA CLAUDE

@router.post("/add_client")
def add_client(client: ClientRequest = Body(...)):
    """Adds a new client to the system"""
    try:
        # Conectar a Supabase
        supabase = get_supabase()
        
        # Generar ID y timestamp
        client_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        # Normalizar tipo
        client_type = "PRIME"
        if client.type and client.type.upper() in ["PRIME", "LONGEVITY"]:
            client_type = client.type.upper()
            
        # Crear objeto de cliente completo
        client_data = {
            "id": client_id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone or "",
            "type": client_type,
            "status": client.status or "active",
            "join_date": now,
            "goals": json.dumps(client.goals or ["Fitness general"]),
            "health_conditions": json.dumps(client.health_conditions or []),
            "initial_assessment": json.dumps({}),
            "birth_date": "1980-01-01",  # Valor por defecto
            "payment_status": client.payment_status or "active",
            "created_at": now,
            "updated_at": now
        }
        
        # Log completo para depuración
        print(f"INSERTANDO CLIENTE: {json.dumps(client_data)}")
        
        # Insertar cliente
        response = supabase.table("clients").insert(client_data).execute()
        
        if hasattr(response, 'data') and response.data:
            print(f"CLIENTE INSERTADO CON ÉXITO: {json.dumps(response.data[0])}")
        else:
            print(f"RESPUESTA VACÍA AL INSERTAR CLIENTE")
        
        # Crear notificación
        try:
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": "admin",
                "title": f"Nuevo cliente: {client.name}",
                "message": f"Cliente {client.name} creado desde Claude Desktop",
                "type": "client_created",
                "read": False,
                "created_at": now
            }
            notif_response = supabase.table("notifications").insert(notification_data).execute()
            print(f"NOTIFICACIÓN CREADA: {notif_response.data if hasattr(notif_response, 'data') else None}")
        except Exception as notif_err:
            print(f"ERROR AL CREAR NOTIFICACIÓN: {str(notif_err)}")
        
        # Respuesta directa para Claude
        return {
            "success": True,
            "message": f"Cliente {client.name} creado exitosamente",
            "client": {
                "id": client_id,
                "name": client.name,
                "email": client.email,
                "type": client_type
            }
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR EN add_client: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "message": f"Error al crear cliente: {error_msg}"
        }

@router.post("/search_clients")
def search_clients(params: ClientSearchParams = Body(...)):
    """Searches for clients matching the given criteria"""
    try:
        supabase = get_supabase()
        query = params.query
        limit = params.limit or 10
        
        print(f"BUSCANDO CLIENTES CON QUERY: {query}, LIMIT: {limit}")
        
        # Construir consulta
        request = supabase.table("clients").select("*")
        
        # Aplicar filtro por nombre o email si hay query
        if query and query.strip():
            request = request.or_(f"name.ilike.%{query}%,email.ilike.%{query}%")
            
        # Aplicar otros filtros
        if params.filters:
            if "type" in params.filters and params.filters["type"]:
                request = request.eq("type", params.filters["type"])
                
            if "status" in params.filters and params.filters["status"]:
                request = request.eq("status", params.filters["status"])
        
        # Aplicar límite y ejecutar
        response = request.limit(limit).execute()
        
        # Log para depuración
        if hasattr(response, 'data'):
            print(f"CLIENTES ENCONTRADOS: {len(response.data)}")
        else:
            print("RESPUESTA SIN DATOS")
            
        return {
            "success": True,
            "clients": response.data if hasattr(response, 'data') else [],
            "count": len(response.data) if hasattr(response, 'data') else 0
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR EN search_clients: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "message": f"Error al buscar clientes: {error_msg}",
            "clients": []
        }

@router.get("/get_client_by_id")
def get_client_by_id(client_id: str):
    """Gets client details by ID"""
    try:
        supabase = get_supabase()
        
        print(f"BUSCANDO CLIENTE CON ID: {client_id}")
        
        response = supabase.table("clients").select("*").eq("id", client_id).execute()
        
        if not hasattr(response, 'data') or not response.data or len(response.data) == 0:
            print(f"CLIENTE NO ENCONTRADO CON ID: {client_id}")
            return {
                "success": False,
                "error": "Cliente no encontrado",
                "message": f"No se encontró un cliente con ID: {client_id}"
            }
        
        client_data = response.data[0]
        print(f"CLIENTE ENCONTRADO: {json.dumps(client_data)}")
        
        # Parse JSON fields
        for field in ["goals", "health_conditions", "initial_assessment"]:
            if field in client_data and isinstance(client_data[field], str):
                try:
                    client_data[field] = json.loads(client_data[field])
                except:
                    client_data[field] = []
        
        return {
            "success": True,
            "client": client_data
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR EN get_client_by_id: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "message": f"Error al obtener cliente: {error_msg}"
        }

@router.post("/update_client")
def update_client(client_id: str, client: ClientRequest = Body(...)):
    """Updates an existing client's information"""
    try:
        supabase = get_supabase()
        
        print(f"ACTUALIZANDO CLIENTE CON ID: {client_id}")
        
        # Verificar que el cliente existe
        check = supabase.table("clients").select("id").eq("id", client_id).execute()
        if not hasattr(check, 'data') or not check.data or len(check.data) == 0:
            print(f"CLIENTE NO ENCONTRADO PARA ACTUALIZAR: {client_id}")
            return {
                "success": False,
                "error": "Cliente no encontrado",
                "message": f"No se encontró un cliente con ID: {client_id}"
            }
        
        # Preparar datos para actualizar
        now = datetime.now().isoformat()
        update_data = {
            "name": client.name,
            "email": client.email,
            "updated_at": now
        }
        
        # Añadir campos opcionales si están presentes
        if client.phone is not None:
            update_data["phone"] = client.phone
            
        if client.type is not None:
            client_type = client.type
            if client.type.upper() in ["PRIME", "LONGEVITY"]:
                client_type = client.type.upper()
            update_data["type"] = client_type
            
        if client.status is not None:
            update_data["status"] = client.status
            
        if client.payment_status is not None:
            update_data["payment_status"] = client.payment_status
            
        if client.goals is not None:
            update_data["goals"] = json.dumps(client.goals)
            
        if client.health_conditions is not None:
            update_data["health_conditions"] = json.dumps(client.health_conditions)
        
        print(f"DATOS DE ACTUALIZACIÓN: {json.dumps(update_data)}")
        
        # Ejecutar actualización
        response = supabase.table("clients").update(update_data).eq("id", client_id).execute()
        
        if not hasattr(response, 'data') or not response.data or len(response.data) == 0:
            print(f"ERROR AL ACTUALIZAR CLIENTE: {client_id}")
            return {
                "success": False,
                "error": "Error al actualizar cliente",
                "message": "No se pudo actualizar el cliente"
            }
        
        updated_client = response.data[0]
        print(f"CLIENTE ACTUALIZADO: {json.dumps(updated_client)}")
        
        # Crear notificación
        try:
            notification_data = {
                "id": str(uuid.uuid4()),
                "user_id": "admin",
                "title": f"Cliente actualizado: {client.name}",
                "message": f"Cliente {client.name} actualizado desde Claude Desktop",
                "type": "client_updated",
                "read": False,
                "created_at": now
            }
            supabase.table("notifications").insert(notification_data).execute()
        except Exception as notif_err:
            print(f"ERROR AL CREAR NOTIFICACIÓN DE ACTUALIZACIÓN: {str(notif_err)}")
        
        return {
            "success": True,
            "message": f"Cliente {client.name} actualizado exitosamente",
            "client": updated_client
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR EN update_client: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "message": f"Error al actualizar cliente: {error_msg}"
        }

# Para asegurar que el servicio de MCP esté funcionando
@router.get("/get_claude_mcp_status2")
def get_claude_mcp_status2():
    """Checks the status of Claude MCP tools"""
    try:
        # Herramientas disponibles
        tools = [
            "add_client",
            "search_clients",
            "get_client_by_id",
            "update_client"
        ]
        
        # Prueba básica de Supabase
        supabase = get_supabase()
        table_test = supabase.table("clients").select("count").limit(1).execute()
        db_status = hasattr(table_test, 'data')
        
        return {
            "success": True,
            "status": "active",
            "message": "Las herramientas MCP para Claude están funcionando",
            "available_tools": tools,
            "database_connected": db_status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        error_msg = str(e)
        print(f"ERROR VERIFICANDO ESTADO MCP: {error_msg}")
        return {
            "success": False,
            "status": "error",
            "message": f"Error verificando herramientas MCP: {error_msg}",
            "error": error_msg
        }
