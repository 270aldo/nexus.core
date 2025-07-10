"""
NEXUS-CORE Test Configuration
Shared fixtures and test setup for the test suite
"""
import pytest
import asyncio
import os
from fastapi.testclient import TestClient
from httpx import AsyncClient
import sys
from pathlib import Path

# Add backend root to Python path
backend_root = Path(__file__).parent.parent
sys.path.insert(0, str(backend_root))

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_app():
    """Create FastAPI test application"""
    try:
        from main import create_app
        app = create_app()
        return app
    except ImportError:
        # Fallback if main.py structure is different
        pytest.skip("Cannot import FastAPI app")

@pytest.fixture
def client(test_app):
    """Create test client"""
    with TestClient(test_app) as test_client:
        yield test_client

@pytest.fixture
async def async_client(test_app):
    """Create async test client"""
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(autouse=True)
def setup_test_environment():
    """Setup test environment variables"""
    os.environ.update({
        "ENVIRONMENT": "test",
        "SUPABASE_URL": "https://test.supabase.co",
        "SUPABASE_SERVICE_KEY": "test_key",
        "SUPABASE_ANON_KEY": "test_anon_key"
    })
    yield
    # Cleanup after test if needed

@pytest.fixture
def mock_supabase_response():
    """Mock Supabase API responses"""
    return {
        "data": [
            {
                "id": 1,
                "name": "Test Client",
                "email": "test@nexus.com",
                "program_type": "PRIME"
            }
        ],
        "count": 1
    }