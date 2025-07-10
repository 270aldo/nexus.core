"""
Main FastAPI Application with Clean Architecture

This is the entry point for the NEXUS-CORE backend application,
configured with Clean Architecture principles.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import os

from .interfaces.api import clients, health, mcp, performance, optimized_clients
from .interfaces.dependencies import get_container
from .domain.exceptions import DomainException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    container = get_container()
    logger = container.logger()
    
    logger.info("🚀 NEXUS-CORE starting up...")
    
    # Health check on startup
    health_status = container.health_check()
    if health_status["container"] != "healthy":
        logger.error("❌ Application startup failed - unhealthy services")
        raise RuntimeError("Application startup failed")
    
    logger.info("✅ NEXUS-CORE started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 NEXUS-CORE shutting down...")


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    
    app = FastAPI(
        title="NEXUS-CORE API",
        description="NGX Performance & Longevity Central Control System",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan
    )
    
    # Configure middleware
    setup_middleware(app)
    
    # Configure exception handlers
    setup_exception_handlers(app)
    
    # Include routers
    setup_routes(app)
    
    return app


def setup_middleware(app: FastAPI) -> None:
    """Configure application middleware"""
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted host middleware (for production)
    if os.getenv("ENVIRONMENT") == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["api.ngxperformance.com", "*.ngxperformance.com"]
        )
    
    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        container = get_container()
        logger = container.logger()
        
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            client_host=request.client.host if request.client else None
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Request completed: {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time=process_time
        )
        
        return response


def setup_exception_handlers(app: FastAPI) -> None:
    """Configure exception handlers"""
    
    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException):
        """Handle domain exceptions"""
        container = get_container()
        logger = container.logger()
        
        logger.warning(
            f"Domain exception: {exc.message}",
            error_code=exc.error_code,
            details=exc.details,
            path=request.url.path
        )
        
        return JSONResponse(
            status_code=400,
            content={
                "error": "Domain Error",
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details
            }
        )
    
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        """Handle value errors"""
        container = get_container()
        logger = container.logger()
        
        logger.warning(f"Validation error: {str(exc)}", path=request.url.path)
        
        return JSONResponse(
            status_code=400,
            content={
                "error": "Validation Error",
                "message": str(exc)
            }
        )
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "HTTP Error",
                "message": exc.detail
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions"""
        container = get_container()
        logger = container.logger()
        
        logger.error(
            f"Unexpected error: {str(exc)}",
            error_type=type(exc).__name__,
            path=request.url.path,
            exc_info=True
        )
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred"
            }
        )


def setup_routes(app: FastAPI) -> None:
    """Configure application routes"""
    
    # Health check routes
    app.include_router(
        health.router,
        prefix="/health",
        tags=["Health"]
    )
    
    # Client management routes
    app.include_router(
        clients.router,
        prefix="/api/v1/clients",
        tags=["Clients"]
    )
    
    # MCP routes for Claude Desktop integration
    app.include_router(
        mcp.router,
        prefix="/api/v1/mcp",
        tags=["MCP"]
    )
    
    # Performance monitoring routes
    app.include_router(
        performance.router,
        prefix="/api/v1/performance",
        tags=["Performance"]
    )
    
    # Optimized client routes
    app.include_router(
        optimized_clients.router,
        prefix="/api/v1/optimized",
        tags=["Optimized Clients"]
    )
    
    # Root endpoint
    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint"""
        return {
            "service": "NEXUS-CORE",
            "version": "2.0.0",
            "description": "NGX Performance & Longevity Central Control System",
            "architecture": "Clean Architecture",
            "status": "healthy",
            "endpoints": {
                "health": "/health",
                "docs": "/docs",
                "clients": "/api/v1/clients",
                "mcp": "/api/v1/mcp",
                "performance": "/api/v1/performance",
                "optimized": "/api/v1/optimized"
            }
        }


# Create the application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    # Development server configuration
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )