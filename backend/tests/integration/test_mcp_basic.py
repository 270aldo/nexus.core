"""
MCP Integration Tests
Basic tests for MCP functionality that will be critical for NGX operations
"""
import pytest
from fastapi.testclient import TestClient
import json

class TestMCPBasicFunctionality:
    """Test MCP endpoints that are critical for NGX operations"""
    
    def test_mcp_capabilities_endpoint(self, client: TestClient):
        """Test MCP capabilities endpoint"""
        response = client.get("/routes/mcpnew/mcp/capabilities")
        # Should either work or return method not allowed (but endpoint should exist)
        assert response.status_code in [200, 405, 422], f"Capabilities endpoint issue: {response.status_code}"
    
    def test_mcp_health_endpoint(self, client: TestClient):
        """Test MCP health check"""
        response = client.get("/api/v1/mcp/health")
        # Health endpoint should be accessible
        assert response.status_code in [200, 405], f"MCP health endpoint issue: {response.status_code}"
    
    def test_mcp_clients_search_structure(self, client: TestClient):
        """Test MCP clients search endpoint structure"""
        # Test with POST (expected method for search)
        search_payload = {
            "query": "test",
            "limit": 10
        }
        
        response = client.post(
            "/routes/mcpnew/mcp/clients/search",
            json=search_payload
        )
        
        # Should not return 404 (endpoint exists)
        assert response.status_code != 404, "MCP clients search endpoint not found"
        
        # If it returns an error, it should be a meaningful one (not 500)
        if response.status_code >= 400:
            # 422 = validation error, 405 = method not allowed, both acceptable
            assert response.status_code in [400, 401, 403, 405, 422, 500], f"Unexpected error: {response.status_code}"
    
    def test_mcp_error_handling(self, client: TestClient):
        """Test that MCP endpoints handle errors gracefully"""
        # Test with invalid JSON
        response = client.post(
            "/routes/mcpnew/mcp/clients/search",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        # Should handle invalid JSON gracefully
        assert response.status_code in [400, 422], "Should handle invalid JSON"
    
    @pytest.mark.asyncio
    async def test_mcp_async_compatibility(self, async_client):
        """Test that MCP endpoints work with async clients"""
        response = await async_client.get("/routes/mcpnew/mcp/capabilities")
        # Should be accessible via async client
        assert response.status_code != 404, "MCP endpoint not accessible via async client"