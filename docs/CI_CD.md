# CI/CD Pipeline

This repository uses **GitHub Actions** to lint, test and build the project.
The workflow file can be found at `.github/workflows/ci.yml`.

## Pull Requests

For every pull request the pipeline will:

1. Install Python dependencies and run `flake8` and `pytest` on the backend.
2. Install Node dependencies and run `eslint` on the frontend.
3. Build the frontend using Vite.
4. Upload the contents of `frontend/dist` as a build artifact.

## Main Branch

On pushes to `main` the same steps run. The uploaded artifact can be used as an
internal beta build.

## Running locally

- **Backend lint**: `flake8 backend`
- **Backend tests**: `pytest backend`
- **Frontend lint**: `cd frontend && yarn lint`
- **Frontend build**: `cd frontend && yarn build`
