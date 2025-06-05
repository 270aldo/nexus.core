# Databutton app

This project consists of a FastAPI backend server and a React + TypeScript frontend application exported from Databutton.

## Stack

- React+Typescript frontend with `yarn` as package manager.
- Python FastAPI server with `uv` as package manager.

## Quickstart

1. Install dependencies:

```bash
make
```

2. Start the backend and frontend servers in separate terminals:

```bash
make run-backend
make run-frontend
```

## Gotchas

The backend server runs on port 8000 and the frontend development server runs on port 5173. The frontend Vite server proxies API requests to the backend on port 8000.

Visit <http://localhost:5173> to view the application.

## Dependency Management

Lock files `backend/uv.lock` and `frontend/yarn.lock` pin exact dependency
versions. Regenerate them periodically with:

```bash
cd backend && uv lock
cd ../frontend && yarn install
```

Commit the updated lock files to keep environments reproducible.
