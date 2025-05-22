import databutton as db
from supabase import create_client
from typing import Optional, List, Dict, Any
import json

def get_supabase_client():
    """Retorna un cliente de Supabase configurado con las credenciales"""
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    
    # Creamos y retornamos el cliente
    return create_client(supabase_url, supabase_key)

def sanitize_storage_key(key):
    """Sanitiza una clave de almacenamiento para usarla en storage"""
    import re
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

def handle_supabase_response(response):
    """Maneja la respuesta de Supabase y la procesa a un formato estándar"""
    if hasattr(response, "error") and response.error is not None:
        return {
            "success": False,
            "error": str(response.error),
            "data": None
        }
    
    return {
        "success": True,
        "data": response.data,
        "error": None
    }