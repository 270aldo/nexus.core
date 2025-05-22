# Este archivo se mantiene vacío para evitar duplicidad en IDs de operación
# Toda la funcionalidad MCP se ha consolidado en app.apis.mcpnew
from fastapi import APIRouter

router = APIRouter()

# Please note: The Agentic Intelligent System endpoints have been moved to:
# - mcpnew/__init__.py for simplified endpoints
# - Agent system endpoints under /mcp/agent/status, /mcp/agent/analysis, /mcp/agent/report, and /mcp/agent/translate-program
# This was done to avoid duplication of operation IDs and maintain a consistent API structure.
