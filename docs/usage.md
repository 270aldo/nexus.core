# Usage Guide

This guide explains common use cases and how to get the project running from scratch.

## Running the project

1. **Install dependencies** using the provided Makefile:
   ```bash
   make
   ```
   This installs the Python backend environment and the Node.js dependencies for the frontend.

2. **Start the backend and frontend** in separate terminals:
   ```bash
   make run-backend
   make run-frontend
   ```
   - Backend available at <http://localhost:8000>.
   - Frontend (Vite dev server) available at <http://localhost:5173> and proxies API requests to the backend.

3. Visit the frontend URL in your browser. Any API requests will be served by the FastAPI backend.

## Main use cases

- Provide a React interface that interacts with the FastAPI API for dynamic content.
- Authenticate requests using Firebase tokens through the provided middleware.
- Extend the API by adding routers under `backend/app/apis`.

## Standards and good practices

- **Python**: follow PEP8 style conventions. Keep dependencies managed via `uv` and list them in `requirements.txt`.
- **TypeScript**: use ESLint and Prettier (see `frontend/README.md` for extending the lint rules). Keep components typed and avoid `any`.
- **Version control**: use concise commits and keep `.gitignore` patterns in each subproject to avoid committing virtual environments or build artifacts.
- **Environment variables**: store secrets in a `.env` file and do not commit it to version control.

For further reference on the project structure see the [Architecture Overview](architecture.md).
