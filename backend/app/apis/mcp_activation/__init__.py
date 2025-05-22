from fastapi import APIRouter, HTTPException
from app.apis.mcp_system import get_mcp_status, activate_mcp, MCPActivationRequest
from typing import Optional

router = APIRouter(tags=["mcp-setup"])

@router.get("/get_mcp_status")
def get_mcp_status_endpoint():
    """Redirige a la implementación principal en mcp_system"""
    # Redirigir a la implementación en mcp_system
    return get_mcp_status()

@router.post("/activate_mcp")
def activate_mcp_endpoint(request: MCPActivationRequest):
    """Activa el MCP para Claude Desktop"""
    return activate_mcp(request)