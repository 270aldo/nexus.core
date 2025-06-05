from supabase import create_client
import databutton as db
from functools import lru_cache
import time

# Cache for Supabase connections
_supabase_cache = {}
_cache_timeout = 300  # 5 minutes


def get_supabase(service_key=True):
    """Return a Supabase client configured with the credentials.

    Args:
        service_key (bool): If ``True`` use the service key. Otherwise use the
        anonymous key.

    Returns:
        Client: Configured Supabase client
    """
    key_type = "service" if service_key else "anon"

    # Check if there is a valid cached connection
    cache_key = f"supabase_{key_type}"
    if cache_key in _supabase_cache:
        cached_data = _supabase_cache[cache_key]
        if time.time() - cached_data["timestamp"] < _cache_timeout:
            return cached_data["client"]

    # If no valid cache exists create a new connection
    supabase_url = db.secrets.get("SUPABASE_URL")
    if service_key:
        supabase_key = db.secrets.get("SUPABASE_SERVICE_KEY")
    else:
        supabase_key = db.secrets.get("SUPABASE_ANON_KEY")

    # Create and cache the client
    client = create_client(supabase_url, supabase_key)
    _supabase_cache[cache_key] = {"client": client, "timestamp": time.time()}

    return client


# Alias for backwards compatibility
def get_supabase_client():
    """Alias for ``get_supabase(service_key=True)`` for compatibility."""
    return get_supabase(service_key=True)


def get_supabase_anon_client():
    """Alias for ``get_supabase(service_key=False)`` for compatibility."""
    return get_supabase(service_key=False)


@lru_cache(maxsize=64)
def handle_supabase_response(response):
    """Handle a Supabase response and process it to a standard format.

    This function is decorated with ``lru_cache`` to improve performance when
    identical responses are processed repeatedly.

    Args:
        response: Supabase response

    Returns:
        dict: Processed response in a standard format
    """
    if hasattr(response, "error") and response.error is not None:
        return {"success": False, "error": str(response.error), "data": None}

    return {"success": True, "data": response.data, "error": None}
