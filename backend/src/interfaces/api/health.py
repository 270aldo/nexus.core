"""
Health Check API Endpoints
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any

from ..dependencies import get_health_status

router = APIRouter()


@router.get("/")
async def health_check(
    health_status: Dict[str, Any] = Depends(get_health_status)
) -> Dict[str, Any]:
    """
    Application health check endpoint.
    
    Returns the current health status of all application services
    including database connectivity, logging, and other dependencies.
    """
    return {
        "status": "healthy" if health_status["container"] == "healthy" else "unhealthy",
        "timestamp": "2025-06-27T14:20:26.000000Z",
        "version": "2.0.0",
        "architecture": "Clean Architecture",
        "services": health_status.get("services", {}),
        "container_status": health_status["container"]
    }


@router.get("/readiness")
async def readiness_check(
    health_status: Dict[str, Any] = Depends(get_health_status)
) -> Dict[str, Any]:
    """
    Readiness probe for Kubernetes/container orchestration.
    
    Returns whether the application is ready to serve traffic.
    """
    is_ready = health_status["container"] == "healthy"
    
    return {
        "ready": is_ready,
        "timestamp": "2025-06-27T14:20:26.000000Z",
        "details": health_status
    }


@router.get("/liveness")
async def liveness_check() -> Dict[str, Any]:
    """
    Liveness probe for Kubernetes/container orchestration.
    
    Returns whether the application is alive and running.
    """
    return {
        "alive": True,
        "timestamp": "2025-06-27T14:20:26.000000Z",
        "service": "NEXUS-CORE",
        "version": "2.0.0"
    }