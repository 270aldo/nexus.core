from fastapi import APIRouter
import databutton as db

router = APIRouter()

@router.get("/supabase-config")
def get_supabase_config():
    """Get Supabase configuration for the frontend"""
    return {
        "supabaseUrl": db.secrets.get("SUPABASE_URL"),
        "supabaseAnonKey": db.secrets.get("SUPABASE_ANON_KEY")
    }
