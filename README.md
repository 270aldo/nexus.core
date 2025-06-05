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

## Security and configuration

1. Copy `.env.example` to `.env` and fill in the values required for your environment.
2. Never commit the `.env` file or any credentials to version control. The repository's `.gitignore` already excludes these files.
3. If sensitive keys were previously committed, rotate them before deployment.

The backend loads variables from `.env` at startup and the frontend uses Vite to read the same file. Keep API keys and tokens in that file locally or configure them in your deployment environment.
