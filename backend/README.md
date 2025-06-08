# Backend Server for NexusCore

This directory contains the Python FastAPI backend server for the NexusCore application.

## Overview

The backend is built using [FastAPI](https://fastapi.tiangolo.com/) and provides a series D RESTful APIs to support the NexusCore frontend application. It handles business logic, data storage (via Supabase), and integrations like the MCP connection to Claude Desktop.

Key features include:
- Client Management
- Program Management (details to be added)
- Activity Logging
- MCP Integration Endpoints

## Running the Backend

(Instructions on how to run the backend locally - to be filled in, typically involving `uvicorn main:app --reload` or similar, assuming from root `make run-backend`)

## Project Structure

- `app/`: Contains the core application logic.
  - `apis/`: Houses the different API modules. Each subdirectory typically represents a resource or a feature set.
    - `client_service/`: (Now acts as the primary Clients API, accessible via `/clients` prefix). Provides CRUD operations for managing clients.
    - `activity_logs/`: Handles logging of system and user activities.
    - `mcpnew/`: Consolidated module for MCP functionalities.
    - `(other API modules)...`
  - `auth/`: Authentication-related code.
  - `env.py`: Environment configuration (if used).
- `main.py`: The main FastAPI application entry point. It dynamically loads API routers.
- `routers.json`: Configuration for API routers, including their names and versions.
- `requirements.txt`: Python dependencies.
- `tests/`: Contains API and unit tests.

## APIs

The backend exposes several APIs. You can explore the interactive API documentation (Swagger UI) typically available at `/docs` when the server is running.

### Clients API

- **Prefix**: `/clients`
- **Source Module**: `app/apis/client_service/__init__.py`
- **Description**: Provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing NGX clients. This API is used by the frontend to manage client data, including personal details, program assignments (implicitly), and status.
- **Key Endpoints**:
    - `POST /clients`: Create a new client.
    - `GET /clients`: Search and retrieve a list of clients.
    - `GET /clients/{client_id}`: Get details of a specific client.
    - `PUT /clients/{client_id}`: Update an existing client.
    - `DELETE /clients/{client_id}`: Delete a client.
- **Authentication**: (Specify if authentication is typically required - based on `routers.json` and `main.py` logic, it seems auth is generally enabled unless `disableAuth` is true for a router).

(Sections for other major APIs like Program Management, MCP, Activity Logs should be added as they are clarified or developed.)

## Testing

Tests are located in the `tests/` directory and can be run using `pytest`.
(Add more specific instructions if available)
