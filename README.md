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

## Logging

The backend uses Python's built-in `logging` module. Log output is configured in
`backend/app/logger.py`. The log level can be changed with the environment
variable `LOG_LEVEL` (default: `INFO`).

In development, simply run:

```bash
make run-backend
```

Logs will appear in the terminal. In a production environment you can redirect
the output to a file:

```bash
LOG_LEVEL=INFO nohup backend/run.sh > backend.log 2>&1 &
```

Use tools like `tail -f backend.log` to inspect the logs.
