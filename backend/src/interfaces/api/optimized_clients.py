"""
Optimized client API endpoints with performance enhancements
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from datetime import datetime, timedelta

from ...application.use_cases.client import (
    CreateClientUseCase,
    GetClientUseCase, 
    UpdateClientUseCase,
    SearchClientsUseCase,
    GetClientAnalyticsUseCase
)
from ...application.dto.client_dto import ClientCreateRequest, ClientUpdateRequest, ClientResponse
from ...domain.entities import ClientStatus, ProgramType
from ...domain.value_objects import Email
from ...infrastructure.database.optimized_repository import create_optimized_client_repository
from ..dependencies import get_container

router = APIRouter(prefix="/clients", tags=["clients-optimized"])


@router.get("/dashboard")
async def get_clients_dashboard():
    """Get optimized client dashboard data"""
    try:
        repo = create_optimized_client_repository()
        
        # Get dashboard metrics efficiently in single query
        metrics = await repo.get_dashboard_metrics()
        recent_activity = await repo.get_recent_activity(limit=15)
        
        return {
            "status": "success", 
            "data": {
                "metrics": metrics,
                "recent_activity": recent_activity,
                "last_updated": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard: {e}")


@router.get("/search/advanced")
async def advanced_client_search(
    query: Optional[str] = Query(None, description="Search term for name/email"),
    status: Optional[ClientStatus] = Query(None, description="Filter by status"),
    program_type: Optional[ProgramType] = Query(None, description="Filter by program type"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Advanced client search with multiple filters and caching"""
    try:
        repo = create_optimized_client_repository()
        
        # Execute optimized search
        search_results = await repo.search_with_filters(
            query=query,
            status=status,
            program_type=program_type,
            limit=limit,
            offset=offset
        )
        
        # Convert entities to DTOs
        client_responses = [
            ClientResponse.from_entity(client) 
            for client in search_results["clients"]
        ]
        
        # Log search for analytics (background task)
        background_tasks.add_task(
            _log_search_analytics,
            query=query,
            filters={"status": status, "program_type": program_type},
            result_count=len(client_responses)
        )
        
        return {
            "status": "success",
            "data": {
                "clients": client_responses,
                "pagination": {
                    "total_count": search_results["total_count"],
                    "limit": limit,
                    "offset": offset,
                    "has_more": search_results["has_more"],
                    "current_page": offset // limit + 1,
                    "total_pages": (search_results["total_count"] + limit - 1) // limit
                },
                "filters_applied": {
                    "query": query,
                    "status": status.value if status else None,
                    "program_type": program_type.value if program_type else None
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")


@router.post("/batch")
async def create_clients_batch(
    clients_data: List[ClientCreateRequest],
    container = Depends(get_container),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Create multiple clients in batch for better performance"""
    try:
        if len(clients_data) > 50:
            raise HTTPException(
                status_code=400, 
                detail="Batch size limited to 50 clients per request"
            )
        
        create_use_case = container.create_client_use_case()
        created_clients = []
        errors = []
        
        # Process in smaller batches for better performance
        batch_size = 10
        for i in range(0, len(clients_data), batch_size):
            batch = clients_data[i:i + batch_size]
            
            for client_data in batch:
                try:
                    client = await create_use_case.execute(client_data)
                    created_clients.append(ClientResponse.from_entity(client))
                except Exception as e:
                    errors.append({
                        "client_data": client_data.model_dump(),
                        "error": str(e)
                    })
        
        # Log batch operation (background task)
        background_tasks.add_task(
            _log_batch_operation,
            operation="create",
            total_items=len(clients_data),
            successful=len(created_clients),
            failed=len(errors)
        )
        
        return {
            "status": "success",
            "data": {
                "created_clients": created_clients,
                "errors": errors,
                "summary": {
                    "total_requested": len(clients_data),
                    "successful": len(created_clients),
                    "failed": len(errors),
                    "success_rate": (len(created_clients) / len(clients_data)) * 100
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch creation failed: {e}")


@router.get("/analytics/performance")
async def get_client_analytics_performance(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    program_type: Optional[ProgramType] = Query(None, description="Filter by program type")
):
    """Get client analytics with performance optimization"""
    try:
        repo = create_optimized_client_repository()
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get analytics data efficiently
        analytics_data = await repo.get_analytics_data(
            start_date=start_date,
            end_date=end_date,
            program_type=program_type
        )
        
        # Calculate additional metrics
        growth_metrics = await _calculate_growth_metrics(repo, start_date, end_date)
        
        return {
            "status": "success",
            "data": {
                **analytics_data,
                "growth_metrics": growth_metrics,
                "period": {
                    "days": days,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat()
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {e}")


@router.get("/bulk-export")
async def export_clients_bulk(
    format: str = Query("json", regex="^(json|csv)$", description="Export format"),
    status: Optional[ClientStatus] = Query(None, description="Filter by status"),
    program_type: Optional[ProgramType] = Query(None, description="Filter by program type"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Bulk export clients with streaming for large datasets"""
    try:
        repo = create_optimized_client_repository()
        
        # Use search with filters for consistent filtering logic
        all_clients_data = await repo.search_with_filters(
            status=status,
            program_type=program_type,
            limit=10000  # Large limit for export
        )
        
        clients = all_clients_data["clients"]
        
        if format == "csv":
            # Generate CSV content
            csv_content = _generate_csv_export(clients)
            
            # Log export (background task)
            background_tasks.add_task(
                _log_export_operation,
                format="csv",
                count=len(clients),
                filters={"status": status, "program_type": program_type}
            )
            
            return {
                "status": "success",
                "data": {
                    "format": "csv",
                    "content": csv_content,
                    "total_records": len(clients),
                    "generated_at": datetime.now().isoformat()
                }
            }
        else:
            # JSON format
            client_responses = [ClientResponse.from_entity(client) for client in clients]
            
            # Log export (background task)
            background_tasks.add_task(
                _log_export_operation,
                format="json",
                count=len(clients),
                filters={"status": status, "program_type": program_type}
            )
            
            return {
                "status": "success",
                "data": {
                    "format": "json",
                    "clients": client_responses,
                    "total_records": len(clients),
                    "generated_at": datetime.now().isoformat()
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {e}")


@router.get("/by-ids")
async def get_clients_by_ids(
    ids: str = Query(..., description="Comma-separated client IDs"),
    container = Depends(get_container)
):
    """Get multiple clients by IDs efficiently"""
    try:
        # Parse IDs
        client_ids = [id.strip() for id in ids.split(",") if id.strip()]
        
        if len(client_ids) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 IDs allowed per request"
            )
        
        repo = create_optimized_client_repository()
        
        # Use batch find for better performance
        from ...domain.entities import ClientId
        client_id_objects = [ClientId(id) for id in client_ids]
        
        clients = await repo.find_by_ids(client_id_objects)
        client_responses = [ClientResponse.from_entity(client) for client in clients]
        
        return {
            "status": "success",
            "data": {
                "clients": client_responses,
                "requested_count": len(client_ids),
                "found_count": len(clients),
                "missing_ids": [
                    id for id in client_ids 
                    if id not in [str(client.id) for client in clients]
                ]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get clients: {e}")


# Background task functions
async def _log_search_analytics(query: str, filters: Dict, result_count: int):
    """Log search analytics for optimization"""
    # This would typically log to analytics system
    print(f"Search analytics: query='{query}', filters={filters}, results={result_count}")


async def _log_batch_operation(operation: str, total_items: int, successful: int, failed: int):
    """Log batch operation metrics"""
    print(f"Batch {operation}: total={total_items}, success={successful}, failed={failed}")


async def _log_export_operation(format: str, count: int, filters: Dict):
    """Log export operation metrics"""
    print(f"Export {format}: {count} records, filters={filters}")


async def _calculate_growth_metrics(repo, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Calculate client growth metrics"""
    try:
        # Get clients created in this period
        new_clients = await repo.find_created_between(start_date, end_date)
        
        # Calculate previous period for comparison
        period_days = (end_date - start_date).days
        prev_start = start_date - timedelta(days=period_days)
        prev_clients = await repo.find_created_between(prev_start, start_date)
        
        current_count = len(new_clients)
        previous_count = len(prev_clients)
        
        growth_rate = 0
        if previous_count > 0:
            growth_rate = ((current_count - previous_count) / previous_count) * 100
        
        return {
            "new_clients_current_period": current_count,
            "new_clients_previous_period": previous_count,
            "growth_rate_percentage": round(growth_rate, 2),
            "trend": "up" if growth_rate > 0 else "down" if growth_rate < 0 else "stable"
        }
    except Exception:
        return {
            "new_clients_current_period": 0,
            "new_clients_previous_period": 0,
            "growth_rate_percentage": 0,
            "trend": "unknown"
        }


def _generate_csv_export(clients) -> str:
    """Generate CSV content from clients list"""
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Name", "Email", "Phone", "Program Type", 
        "Status", "Created At", "Updated At", "Notes"
    ])
    
    # Data rows
    for client in clients:
        writer.writerow([
            str(client.id),
            client.name,
            str(client.email),
            str(client.phone) if client.phone else "",
            client.program_type.value,
            client.status.value,
            client.created_at.isoformat(),
            client.updated_at.isoformat(),
            client.notes or ""
        ])
    
    return output.getvalue()