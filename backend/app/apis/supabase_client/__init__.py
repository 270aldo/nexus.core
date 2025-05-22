from supabase import create_client
import databutton as db
from functools import lru_cache
import time

# Caché para conexiones Supabase
_supabase_cache = {}
_cache_timeout = 300  # 5 minutos

def get_supabase(service_key=True):
    """Retorna un cliente de Supabase configurado con las credenciales.
    
    Args:
        service_key (bool): Si es True, usa la clave de servicio. Si es False, usa la clave anónima.
        
    Returns:
        Client: Cliente de Supabase configurado
    """
    key_type = "service" if service_key else "anon"
    
    # Verificar si hay una conexión en caché válida
    cache_key = f"supabase_{key_type}"
    if cache_key in _supabase_cache:
        cached_data = _supabase_cache[cache_key]
        if time.time() - cached_data["timestamp"] < _cache_timeout:
            return cached_data["client"]
    
    # Si no hay caché válida, crear nueva conexión
    supabase_url = db.secrets.get("SUPABASE_URL")
    if service_key:
        supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    else:
        supabase_key = db.secrets.get("SUPABASE_ANON_KEY")
    
    # Crear y cachear el cliente
    client = create_client(supabase_url, supabase_key)
    _supabase_cache[cache_key] = {
        "client": client,
        "timestamp": time.time()
    }
    
    return client

# Alias para compatibilidad con código existente
def get_supabase_client():
    """Alias de get_supabase(service_key=True) para mantener compatibilidad."""
    return get_supabase(service_key=True)

def get_supabase_anon_client():
    """Alias de get_supabase(service_key=False) para mantener compatibilidad."""
    return get_supabase(service_key=False)

@lru_cache(maxsize=64)
def handle_supabase_response(response):
    """Maneja la respuesta de Supabase y la procesa a un formato estándar.
    
    Esta función está decorada con lru_cache para mejorar el rendimiento
    cuando se procesan respuestas idénticas repetidamente.
    
    Args:
        response: Respuesta de Supabase
        
    Returns:
        dict: Respuesta procesada en formato estándar
    """
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
