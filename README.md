# Databutton app

This project consists of a FastAPI backend server and a React + TypeScript frontend application exported from Databutton.
Additional documentation including architecture diagrams is available under [docs/](docs/).

## Stack

- React+Typescript frontend with `yarn` as package manager.
- Python FastAPI server with `uv` as package manager.

## Quickstart

1. **Install dependencies** for both backend and frontend:

   ```bash
   make
   ```

2. **Run the servers** in separate terminals:

   ```bash
   make run-backend
   make run-frontend
   ```

## Gotchas

The backend server runs on port 8000 and the frontend development server runs on port 5173. The frontend Vite server proxies API requests to the backend on port 8000.

Visit <http://localhost:5173> to view the application.

For more details on the architecture and usage patterns see the [documentation](docs/).
