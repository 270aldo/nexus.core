from datetime import datetime
import databutton as db
import uuid
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from supabase import create_client

# Storage keys
MCP_ACTIVATIONS_KEY = "mcp_activations"
MCP_SETTINGS_KEY = "mcp_settings"
MCP_LOGS_KEY = "mcp_access_logs"

# Models for API
class MCPActivationRequest(BaseModel):
    name: Optional[str] = "Claude Desktop"
    api_key: Optional[str] = None
    client_id: Optional[str] = None

# Utility functions
def get_supabase_client():
    """Get a Supabase client instance"""
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    return create_client(supabase_url, supabase_key)

def get_mcp_settings():
    """Get MCP settings from storage"""
    return db.storage.json.get(MCP_SETTINGS_KEY, default={
        "auth_required": False,
        "allowed_clients": [],
        "active": False,
        "deployment_url": "https://ngxmealplannerpro.databutton.app/nexus-core",
        "documentation_url": "",
        "last_updated": datetime.now().isoformat()
    })

def save_mcp_settings(settings):
    """Save MCP settings to storage"""
    settings["last_updated"] = datetime.now().isoformat()
    db.storage.json.put(MCP_SETTINGS_KEY, settings)
    return settings

def log_mcp_access(endpoint, client_id=None, api_key=None, ip_address=None, success=True, error_message=None):
    """Log MCP access for auditing purposes"""
    # Get existing logs
    logs = db.storage.json.get(MCP_LOGS_KEY, default=[])
    
    # Create new log entry
    log_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "endpoint": endpoint,
        "client_id": client_id,
        "api_key": "[REDACTED]" if api_key else None,
        "ip_address": ip_address,
        "success": success,
        "error_message": error_message
    }
    
    # Add to logs and maintain a reasonable size (keep last 1000 entries)
    logs.append(log_entry)
    if len(logs) > 1000:
        logs = logs[-1000:]
    
    # Save updated logs
    db.storage.json.put(MCP_LOGS_KEY, logs)
    return log_entry

def get_available_mcp_tools():
    """Get list of all available MCP tools"""
    return [
        # 1. Central Customer Management
        "get_client_by_id",
        "search_clients",
        "add_client",
        "update_client",
        
        # 2. Progress Monitoring
        "log_measurement",
        "log_workout",
        "log_subjective_feedback",
        "get_progress_history",
        "get_progress_summary",
        
        # 3. Training Program Management
        "get_training_templates",
        "get_training_program",
        "get_client_active_program",
        "assign_program_to_client",
        "update_client_program",
        "get_exercise_details",
        
        # 4. Nutrition Management
        "get_nutrition_templates",
        "get_nutrition_plan",
        "get_client_active_nutrition",
        "assign_nutrition_plan",
        "update_client_nutrition",
        "lookup_food_nutrition",
        "create_nutrition_plan",
        
        # 5. Agentic Intelligent System
        "get_agent_system_status",
        "run_agent_analysis",
        "generate_client_report",
        "translate_program_to_natural_language",
        
        # 6. Communication and Monitoring
        "send_templated_message",
        "schedule_client_reminder",
        "get_communication_history",
        
        # 7. Analysis and Reports
        "get_client_adherence_metrics",
        "get_program_effectiveness",
        "generate_business_metrics"
    ]

def get_tool_category(tool_name):
    """Determina la categoría de una herramienta MCP basada en su nombre"""
    # Mapa de herramientas a categorías
    tool_categories = {
        # 1. Central Customer Management
        "get_client_by_id": "clients",
        "search_clients": "clients",
        "add_client": "clients",
        "update_client": "clients",
        
        # 2. Progress Monitoring
        "log_measurement": "progress",
        "log_workout": "progress",
        "log_subjective_feedback": "progress",
        "get_progress_history": "progress",
        "get_progress_summary": "progress",
        
        # 3. Training Program Management
        "get_training_templates": "training",
        "get_training_program": "training",
        "get_client_active_program": "training",
        "assign_program_to_client": "training",
        "update_client_program": "training",
        "get_exercise_details": "training",
        
        # 4. Nutrition Management
        "get_nutrition_templates": "nutrition",
        "get_nutrition_plan": "nutrition",
        "get_client_active_nutrition": "nutrition",
        "assign_nutrition_plan": "nutrition",
        "update_client_nutrition": "nutrition",
        "lookup_food_nutrition": "nutrition",
        "create_nutrition_plan": "nutrition",
        
        # 5. Agentic Intelligent System
        "get_agent_system_status": "agent",
        "run_agent_analysis": "agent",
        "generate_client_report": "agent",
        "translate_program_to_natural_language": "agent",
        
        # 6. Communication and Monitoring
        "send_templated_message": "communication",
        "schedule_client_reminder": "communication",
        "get_communication_history": "communication",
        
        # 7. Analysis and Reports
        "get_client_adherence_metrics": "analysis",
        "get_program_effectiveness": "analysis",
        "generate_business_metrics": "analysis"
    }
    
    return tool_categories.get(tool_name, "unknown")

# Funciones principales que serán exportadas
def get_mcp_status():
    """Obtiene el estado actual del servicio MCP para Claude Desktop"""
    try:
        # Get settings
        settings = get_mcp_settings()
        
        # Get activations
        activations = db.storage.json.get(MCP_ACTIVATIONS_KEY, default=[])
        is_active = len(activations) > 0 or settings.get("active", False)
        
        # Get deployment URL
        deployment_url = settings.get("deployment_url", "https://ngxmealplannerpro.databutton.app/nexus-core")
        
        # Log this access
        log_mcp_access("get_mcp_status")
        
        return {
            "active": is_active,
            "deployment_url": deployment_url,
            "available_tools": get_available_mcp_tools(),
            "last_check": datetime.now().isoformat(),
            "message": "MCP activado y disponible" if is_active else "MCP no está activado",
            "auth_required": settings.get("auth_required", False)
        }
    except Exception as e:
        error_msg = f"Error verificando estado MCP: {str(e)}"
        print(error_msg)
        log_mcp_access("get_mcp_status", success=False, error_message=error_msg)
        return {
            "active": False,
            "deployment_url": "",
            "available_tools": [],
            "last_check": datetime.now().isoformat(),
            "message": error_msg,
            "auth_required": False
        }

def activate_mcp(request: MCPActivationRequest):
    """Activa y registra el MCP para Claude Desktop"""
    try:
        # Check if client exists if client_id provided
        client_message = ""
        if request.client_id:
            # Try to verify if client exists
            try:
                supabase = get_supabase_client()
                client_response = supabase.table("clients").select("*").eq("id", request.client_id).execute()
                
                if client_response.data and len(client_response.data) > 0:
                    client_name = client_response.data[0].get("name", "Cliente")
                    client_message = f" para el cliente {client_name}"
                else:
                    log_mcp_access("activate_mcp", client_id=request.client_id, api_key=request.api_key, 
                                  success=False, error_message=f"Cliente no encontrado: {request.client_id}")
                    return {
                        "success": False,
                        "message": f"No se encontró el cliente con ID {request.client_id}"
                    }
            except Exception as client_error:
                print(f"Error al verificar cliente: {str(client_error)}")
                # Continue with general activation even if client verification fails
        
        # Generate new activation
        activation_id = str(uuid.uuid4())
        new_activation = {
            "id": activation_id,
            "name": request.name or "Claude Desktop",
            "timestamp": datetime.now().isoformat(),
            "client_id": request.client_id,
            "api_key": request.api_key or "direct-access",
            "source": "claude_desktop"
        }
        
        # Get existing activations
        activations = db.storage.json.get(MCP_ACTIVATIONS_KEY, default=[])
        
        # Add new activation
        activations.append(new_activation)
        
        # Save updated list
        db.storage.json.put(MCP_ACTIVATIONS_KEY, activations)
        
        # Update settings
        settings = get_mcp_settings()
        settings["active"] = True
        save_mcp_settings(settings)
        
        # Generate MCP URL with activation ID for better security
        mcp_url = f"{settings.get('deployment_url', 'https://ngxmealplannerpro.databutton.app/nexus-core')}/mcp/{activation_id}"
        
        # Log successful activation
        log_mcp_access("activate_mcp", client_id=request.client_id, api_key=request.api_key, success=True)
        
        # Debug info
        print(f"MCP activado: {new_activation['name']} | ID: {activation_id}")
        
        return {
            "success": True,
            "message": f"MCP activado exitosamente{client_message}",
            "activation_id": activation_id,
            "timestamp": new_activation["timestamp"],
            "status": "active",
            "data": {
                "mcp_url": mcp_url,
                "auth_token": request.api_key or "direct-access",
                "instructions": {
                    "claude_desktop": [
                        "1. Abre Claude Desktop en tu computador",
                        "2. Navega a Configuración > Conexiones",
                        "3. Haz click en 'Añadir conexión'",
                        "4. Ingresa la URL y el token de autenticación mostrados abajo",
                        "5. Ahora podrás acceder a tus datos de NGX directamente desde Claude"
                    ]
                }
            }
        }
    except Exception as e:
        error_msg = f"Error activando MCP: {str(e)}"
        print(error_msg)
        log_mcp_access("activate_mcp", client_id=request.client_id, api_key=request.api_key, 
                      success=False, error_message=error_msg)
        return {
            "success": False,
            "message": error_msg
        }