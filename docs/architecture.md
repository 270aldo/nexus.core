# Architecture Overview

This document describes the high level architecture of the project and the typical flow between the components.

## System Diagram

```mermaid
graph LR
    subgraph Client
        A[Browser]
    end
    subgraph Frontend
        B[React + Vite]
    end
    subgraph Backend
        C[FastAPI]
    end
    A --> B
    B -- "HTTP/JSON" --> C
```

The React application communicates with the FastAPI backend using JSON over HTTP. During development the Vite dev server proxies API requests to the backend.

## Request Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React
    participant Backend as FastAPI

    User->>Frontend: Navigate / interact
    Frontend->>Backend: API request with auth token
    Backend->>Backend: Validate token and handle logic
    Backend-->>Frontend: JSON response
    Frontend-->>User: Update UI
```

## Key Components

- **Frontend**: Located in `frontend/`, built with React and TypeScript.
- **Backend**: Located in `backend/`, built with FastAPI. Authentication is handled using middleware based on Firebase tokens.
- **Makefile**: Provides commands for installing dependencies and running each part.

Further details on running the project and conventions can be found in the main [README](../README.md).
