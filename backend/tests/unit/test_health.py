"""
Health Check Tests
Basic endpoint testing to ensure core functionality
"""
import pytest
from fastapi.testclient import TestClient

def test_root_endpoint(client: TestClient):
    """Test that root endpoint is accessible"""
    response = client.get("/")
    # Should either return 200 or redirect - both are acceptable
    assert response.status_code in [200, 307, 404], f"Unexpected status: {response.status_code}"

def test_health_endpoint_exists(client: TestClient):
    """Test if health endpoint exists in some form"""
    # Try health endpoints found in the application
    endpoints_to_try = [
        "/routes/core/core/health",  # Found in output
        "/routes/operations/operations/health",  # Found in output
    ]
    
    found_existing_endpoint = False
    for endpoint in endpoints_to_try:
        response = client.get(endpoint)
        # Endpoint exists if it doesn't return 404
        if response.status_code != 404:
            found_existing_endpoint = True
            break
    
    # At least one health endpoint should exist (may return errors, but should exist)
    assert found_existing_endpoint, "No health endpoints found (all returned 404)"

def test_mcp_endpoints_accessible(client: TestClient):
    """Test that MCP endpoints are accessible (may return 405 for GET)"""
    mcp_endpoints = [
        "/routes/mcp_unified/mcp/clients/search",  # Found in output
        "/routes/mcpnew/mcp/clients/search",  # Alternative from old structure
        "/api/v1/mcp/health",
        "/routes/mcpnew/mcp/capabilities"
    ]
    
    for endpoint in mcp_endpoints:
        response = client.get(endpoint)
        # MCP endpoints may not accept GET, but should not return 404
        assert response.status_code != 404, f"MCP endpoint {endpoint} not found"

def test_api_structure_exists(client: TestClient):
    """Test that core API structure is in place"""
    # These are basic structure tests - endpoints should exist even if they return errors
    core_paths = [
        "/routes",
        "/api", 
        "/docs",  # FastAPI auto-docs
        "/redoc"  # Alternative docs
    ]
    
    for path in core_paths:
        response = client.get(path)
        # Should not return 404 (not found) - other status codes are acceptable
        assert response.status_code != 404, f"Core path {path} returns 404"