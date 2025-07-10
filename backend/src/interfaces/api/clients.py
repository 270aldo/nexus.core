"""
Client Management API Controller

REST endpoints for client management operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ...application.use_cases.client import (
    CreateClientUseCase,
    GetClientUseCase,
    SearchClientsUseCase,
    UpdateClientUseCase
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
    get_update_client_use_case
)

router = APIRouter()

@router.post("/", response_model=ClientDTO)
async def create_client(
    client_data: ClientCreateDTO,
    use_case: CreateClientUseCase = Depends(get_create_client_use_case)
) -> ClientDTO:
    """Create a new client"""
    try:
        return await use_case.execute(client_data)
    except DomainException as e:
        raise HTTPException(status_code=400, detail=e.message)

@router.get("/{client_id}", response_model=ClientDTO)
async def get_client(
    client_id: str,
    use_case: GetClientUseCase = Depends(get_get_client_use_case)
) -> ClientDTO:
    """Get client by ID"""
    try:
        return await use_case.execute(client_id)
    except ClientNotFound:
        raise HTTPException(status_code=404, detail="Client not found")

@router.post("/search")
async def search_clients(
    filters: ClientSearchFiltersDTO,
    use_case: SearchClientsUseCase = Depends(get_search_clients_use_case)
):
    """Search clients with filters"""
    try:
        return await use_case.execute(filters)
    except DomainException as e:
        raise HTTPException(status_code=400, detail=e.message)

@router.put("/{client_id}", response_model=ClientDTO) 
async def update_client(
    client_id: str,
    client_data: ClientUpdateDTO,
    use_case: UpdateClientUseCase = Depends(get_update_client_use_case)
) -> ClientDTO:
    """Update client"""
    try:
        return await use_case.execute(client_id, client_data)
    except ClientNotFound:
        raise HTTPException(status_code=404, detail="Client not found")
    except DomainException as e:
        raise HTTPException(status_code=400, detail=e.message)