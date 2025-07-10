# NEXUS-CORE Backend Makefile
# Development and testing automation

.PHONY: help install install-dev test test-unit test-integration test-e2e \
        test-cov lint format type-check clean run dev

help: ## Show this help message
	@echo "NEXUS-CORE Backend Development Commands"
	@echo "======================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install production dependencies
	uv pip install -e .

install-dev: ## Install development dependencies
	uv pip install -e ".[dev,lint]"

test: ## Run all tests
	pytest

test-unit: ## Run unit tests only
	pytest tests/unit/ -v

test-integration: ## Run integration tests only
	pytest tests/integration/ -v -m integration

test-e2e: ## Run end-to-end tests only
	pytest tests/e2e/ -v -m e2e

test-cov: ## Run tests with coverage report
	pytest --cov=src --cov-report=html --cov-report=term-missing

test-fast: ## Run tests excluding slow tests
	pytest -v -m "not slow"

lint: ## Run linting tools
	flake8 src tests
	isort --check-only src tests
	black --check src tests

format: ## Format code
	isort src tests
	black src tests

type-check: ## Run type checking
	mypy src

clean: ## Clean up temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .coverage htmlcov/ .pytest_cache/

run: ## Run the application in production mode
	uvicorn src.main:app --host 0.0.0.0 --port 8000

dev: ## Run the application in development mode
	uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# MCP specific commands
test-mcp: ## Test MCP server functionality
	pytest tests/e2e/test_mcp_integration.py -v

validate-config: ## Validate configuration files
	@echo "Validating pyproject.toml..."
	python -c "import tomli; tomli.load(open('pyproject-testing.toml', 'rb'))"
	@echo "✅ Configuration is valid"

# Database commands (when ready)
db-migrate: ## Run database migrations
	@echo "Database migrations not implemented yet"

db-reset: ## Reset database
	@echo "Database reset not implemented yet"

# Quality gates
quality-check: lint type-check test-fast ## Run all quality checks (fast)

ci-check: lint type-check test ## Run all CI checks (comprehensive)

# Development workflow
setup: install-dev ## Setup development environment
	@echo "🚀 Development environment ready!"
	@echo "Run 'make dev' to start the development server"
	@echo "Run 'make test' to run tests"

# Docker commands (future)
docker-build: ## Build Docker image
	@echo "Docker build not implemented yet"

docker-run: ## Run Docker container
	@echo "Docker run not implemented yet"