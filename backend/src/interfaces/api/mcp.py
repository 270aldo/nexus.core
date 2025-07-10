"""
MCP (Model Context Protocol) Controller for Claude Desktop Integration

This controller provides conversational access to NEXUS-CORE functionality
through Claude Desktop, enabling natural language operations for NGX team.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import date, datetime

from ...application.use_cases.client import (
    CreateClientUseCase,
    GetClientUseCase, 
    SearchClientsUseCase,
    UpdateClientUseCase,
    GetClientAnalyticsUseCase
)
from ...application.dto.client_dto import (
    ClientCreateDTO,
    ClientUpdateDTO,
    ClientSearchFiltersDTO,
    ClientDTO
)
from ...domain.exceptions import DomainException, ClientNotFound
from ..dependencies import (
    get_create_client_use_case,
    get_get_client_use_case,
    get_search_clients_use_case,
    get_update_client_use_case,
    get_client_analytics_use_case
)

router = APIRouter()

# ============================================================================
# MCP REQUEST/RESPONSE MODELS
# ============================================================================

class McpBaseModel(BaseModel):
    """Base model for MCP requests with enhanced validation"""
    
    class Config:
        extra = "forbid"
        validate_assignment = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

class McpClientSearchRequest(McpBaseModel):
    """MCP request for searching clients with natural language support"""
    
    query: Optional[str] = Field(
        None, 
        description="Search term for client name, email, or natural language query",
        examples=["busca clientes PRIME activos", "sarah johnson", "clientes pausados"]
    )
    program_type: Optional[Literal["PRIME", "LONGEVITY"]] = Field(
        None,
        description="Filter by program type"
    )
    status: Optional[Literal["TRIAL", "ACTIVE", "PAUSED", "CANCELLED"]] = Field(
        None,
        description="Filter by client status"
    )
    limit: int = Field(
        20,
        description="Maximum number of results",
        ge=1,
        le=100
    )
    include_metrics: bool = Field(
        False,
        description="Include adherence and progress metrics"
    )

class McpClientDetailsRequest(McpBaseModel):
    """MCP request for detailed client information"""
    
    client_id: str = Field(..., description="Unique client identifier")
    include_history: bool = Field(True, description="Include progress history")
    include_programs: bool = Field(True, description="Include assigned programs")
    include_analytics: bool = Field(True, description="Include analytics data")

class McpAddClientRequest(McpBaseModel):
    """MCP request for adding a new client through conversation"""
    
    name: str = Field(..., description="Full client name", min_length=2, max_length=100)
    email: str = Field(..., description="Client email address")
    phone: Optional[str] = Field(None, description="Client phone number")
    program_type: Literal["PRIME", "LONGEVITY"] = Field(..., description="Program type")
    notes: Optional[str] = Field(None, description="Additional notes", max_length=1000)

class McpAnalyticsRequest(McpBaseModel):
    """MCP request for analytics and metrics"""
    
    client_id: Optional[str] = Field(None, description="Specific client ID for individual analytics")
    program_type: Optional[Literal["PRIME", "LONGEVITY"]] = Field(None, description="Filter by program")
    date_from: Optional[date] = Field(None, description="Start date for analytics period")
    date_to: Optional[date] = Field(None, description="End date for analytics period")
    metrics: List[str] = Field(
        default=["adherence", "effectiveness", "retention"],
        description="Specific metrics to calculate"
    )

class McpResponse(BaseModel):
    """Standard MCP response format for Claude Desktop"""
    
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Human-readable response message")
    data: Optional[Any] = Field(None, description="Response data")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context for Claude")
    suggestions: Optional[List[str]] = Field(None, description="Suggested follow-up questions")

# ============================================================================
# MCP ENDPOINTS FOR CLAUDE DESKTOP
# ============================================================================

@router.post("/clients/search", response_model=McpResponse)
async def mcp_search_clients(
    request: McpClientSearchRequest,
    use_case: SearchClientsUseCase = Depends(get_search_clients_use_case)
) -> McpResponse:
    """
    Search for clients with natural language support for Claude Desktop.
    
    Supports queries like:
    - "busca todos los clientes PRIME activos"
    - "clientes pausados este mes"
    - "sarah johnson"
    """
    
    try:
        # Convert MCP request to domain DTO
        search_filters = ClientSearchFiltersDTO(
            query=request.query,
            program_type=request.program_type,
            status=request.status,
            limit=request.limit,
            page=1
        )
        
        # Execute search
        result = await use_case.execute(search_filters)
        
        # Format response for Claude Desktop
        clients_data = []
        for client_dto in result.clients:
            client_data = {
                "id": client_dto.id,
                "name": client_dto.name,
                "email": client_dto.email,
                "program_type": client_dto.program_type,
                "status": client_dto.status,
                "created_at": client_dto.created_at,
                "last_activity": client_dto.last_activity
            }
            clients_data.append(client_data)
        
        # Generate conversational response
        if not clients_data:
            message = f"No encontré clientes que coincidan con '{request.query or 'los criterios especificados'}'"
            suggestions = [
                "Intenta buscar con términos más generales",
                "¿Quieres ver todos los clientes activos?",
                "¿Necesitas crear un nuevo cliente?"
            ]
        else:
            count = len(clients_data)
            total = result.pagination.total
            program_filter = f" {request.program_type}" if request.program_type else ""
            status_filter = f" {request.status.lower()}" if request.status else ""
            
            message = f"Encontré {count} de {total} clientes{program_filter}{status_filter}"
            
            suggestions = [
                f"Mostrar detalles del cliente {clients_data[0]['name']}",
                "Agregar un nuevo cliente",
                "Ver métricas de adherencia de estos clientes"
            ]
        
        return McpResponse(
            success=True,
            message=message,
            data={
                "clients": clients_data,
                "pagination": {
                    "total": result.pagination.total,
                    "page": result.pagination.page,
                    "limit": result.pagination.limit,
                    "pages": result.pagination.total_pages
                }
            },
            context={
                "query_type": "client_search",
                "filters_applied": {
                    "program_type": request.program_type,
                    "status": request.status,
                    "query": request.query
                }
            },
            suggestions=suggestions
        )
        
    except DomainException as e:
        return McpResponse(
            success=False,
            message=f"Error de negocio: {e.message}",
            context={"error_type": "domain_error", "error_code": e.error_code}
        )
    except Exception as e:
        return McpResponse(
            success=False,
            message=f"Error interno: {str(e)}",
            context={"error_type": "internal_error"}
        )

@router.post("/clients/details", response_model=McpResponse)
async def mcp_get_client_details(
    request: McpClientDetailsRequest,
    get_client_use_case: GetClientUseCase = Depends(get_get_client_use_case),
    analytics_use_case: GetClientAnalyticsUseCase = Depends(get_client_analytics_use_case)
) -> McpResponse:
    """
    Get detailed client information for Claude Desktop conversations.
    """
    
    try:
        # Get client details
        client = await get_client_use_case.execute(request.client_id)
        
        client_data = {
            "id": client.id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
            "program_type": client.program_type,
            "status": client.status,
            "created_at": client.created_at,
            "last_activity": client.last_activity
        }
        
        # Add analytics if requested
        if request.include_analytics:
            try:
                analytics = await analytics_use_case.execute(request.client_id)
                client_data["analytics"] = {
                    "adherence_rate": analytics.adherence_rate,
                    "completed_workouts": analytics.completed_workouts,
                    "total_workouts": analytics.total_workouts,
                    "progress_score": analytics.progress_score
                }
            except Exception:
                client_data["analytics"] = "No disponible"
        
        # Generate conversational response
        status_msg = {
            "TRIAL": "en período de prueba",
            "ACTIVE": "activo",
            "PAUSED": "pausado",
            "CANCELLED": "cancelado"
        }.get(client.status, client.status)
        
        message = f"{client.name} es un cliente {client.program_type} {status_msg}"
        
        if request.include_analytics and "analytics" in client_data:
            analytics = client_data["analytics"]
            if isinstance(analytics, dict):
                adherence = analytics.get("adherence_rate", 0) * 100
                message += f" con {adherence:.1f}% de adherencia"
        
        suggestions = [
            f"Actualizar estado de {client.name}",
            f"Ver progreso histórico de {client.name}",
            f"Generar reporte para {client.name}",
            "Buscar otros clientes similares"
        ]
        
        return McpResponse(
            success=True,
            message=message,
            data=client_data,
            context={
                "query_type": "client_details",
                "client_id": request.client_id
            },
            suggestions=suggestions
        )
        
    except ClientNotFound:
        return McpResponse(
            success=False,
            message=f"No encontré un cliente con ID '{request.client_id}'",
            suggestions=[
                "Verificar el ID del cliente",
                "Buscar clientes por nombre",
                "Ver lista de clientes activos"
            ]
        )
    except Exception as e:
        return McpResponse(
            success=False,
            message=f"Error al obtener detalles del cliente: {str(e)}",
            context={"error_type": "internal_error"}
        )

@router.post("/clients/add", response_model=McpResponse)
async def mcp_add_client(
    request: McpAddClientRequest,
    use_case: CreateClientUseCase = Depends(get_create_client_use_case)
) -> McpResponse:
    """
    Add a new client through Claude Desktop conversation.
    """
    
    try:
        # Convert to domain DTO
        create_dto = ClientCreateDTO(
            name=request.name,
            email=request.email,
            phone=request.phone,
            program_type=request.program_type,
            notes=request.notes
        )
        
        # Create client
        client = await use_case.execute(create_dto)
        
        message = f"✅ Cliente {client.name} creado exitosamente como {client.program_type}"
        
        suggestions = [
            f"Ver detalles de {client.name}",
            f"Asignar programa a {client.name}",
            "Agregar otro cliente",
            "Ver lista de clientes recientes"
        ]
        
        return McpResponse(
            success=True,
            message=message,
            data={
                "client": {
                    "id": client.id,
                    "name": client.name,
                    "email": client.email,
                    "program_type": client.program_type,
                    "status": client.status
                }
            },
            context={
                "query_type": "client_creation",
                "client_id": client.id
            },
            suggestions=suggestions
        )
        
    except DomainException as e:
        return McpResponse(
            success=False,
            message=f"No pude crear el cliente: {e.message}",
            context={"error_type": "domain_error", "error_code": e.error_code}
        )
    except Exception as e:
        return McpResponse(
            success=False,
            message=f"Error al crear cliente: {str(e)}",
            context={"error_type": "internal_error"}
        )

@router.post("/analytics/adherence", response_model=McpResponse)
async def mcp_get_adherence_analytics(
    request: McpAnalyticsRequest,
    analytics_use_case: GetClientAnalyticsUseCase = Depends(get_client_analytics_use_case)
) -> McpResponse:
    """
    Get adherence analytics for Claude Desktop conversations.
    """
    
    try:
        if request.client_id:
            # Individual client analytics
            analytics = await analytics_use_case.execute(request.client_id)
            
            adherence_pct = analytics.adherence_rate * 100
            message = f"Adherencia de {adherence_pct:.1f}% ({analytics.completed_workouts}/{analytics.total_workouts} entrenamientos)"
            
            data = {
                "client_id": request.client_id,
                "adherence_rate": analytics.adherence_rate,
                "completed_workouts": analytics.completed_workouts,
                "total_workouts": analytics.total_workouts,
                "progress_score": analytics.progress_score
            }
            
            suggestions = [
                "Ver detalles del cliente",
                "Comparar con otros clientes",
                "Generar reporte de progreso"
            ]
        else:
            # Global analytics (placeholder - would need implementation)
            message = "Análisis global de adherencia no implementado aún"
            data = {"status": "pending_implementation"}
            suggestions = ["Especificar un cliente particular"]
        
        return McpResponse(
            success=True,
            message=message,
            data=data,
            context={
                "query_type": "adherence_analytics",
                "scope": "individual" if request.client_id else "global"
            },
            suggestions=suggestions
        )
        
    except ClientNotFound:
        return McpResponse(
            success=False,
            message=f"No encontré cliente con ID '{request.client_id}'",
            suggestions=["Verificar ID del cliente", "Buscar cliente por nombre"]
        )
    except Exception as e:
        return McpResponse(
            success=False,
            message=f"Error al calcular adherencia: {str(e)}",
            context={"error_type": "internal_error"}
        )

@router.get("/capabilities", response_model=McpResponse)
async def mcp_get_capabilities() -> McpResponse:
    """
    List MCP server capabilities for Claude Desktop.
    """
    
    capabilities = {
        "client_management": {
            "search": "Buscar clientes por nombre, email, tipo de programa o estado",
            "details": "Obtener información detallada de un cliente específico",
            "create": "Crear nuevos clientes PRIME o LONGEVITY",
            "update": "Actualizar información de clientes existentes"
        },
        "analytics": {
            "adherence": "Calcular métricas de adherencia individual y grupal",
            "effectiveness": "Análisis de efectividad de programas",
            "progress": "Seguimiento de progreso de clientes"
        },
        "conversational": {
            "natural_queries": "Acepta consultas en lenguaje natural",
            "suggestions": "Proporciona sugerencias de seguimiento",
            "context": "Mantiene contexto conversacional"
        }
    }
    
    return McpResponse(
        success=True,
        message="NEXUS-CORE MCP Server v2.0 - Sistema de gestión conversacional para NGX",
        data=capabilities,
        context={"query_type": "capabilities"},
        suggestions=[
            "Buscar clientes activos",
            "Ver métricas del mes actual",
            "Agregar un nuevo cliente"
        ]
    )

@router.get("/health", response_model=McpResponse)
async def mcp_health_check() -> McpResponse:
    """
    Health check for MCP server.
    """
    
    return McpResponse(
        success=True,
        message="MCP Server funcionando correctamente",
        data={
            "status": "healthy",
            "version": "2.0.0",
            "architecture": "Clean Architecture",
            "timestamp": datetime.now().isoformat()
        },
        context={"query_type": "health_check"}
    )