install-backend:
	chmod +x backend/install.sh
	chmod +x backend/run.sh
	cd backend && ./install.sh

install-frontend:
	chmod +x frontend/install.sh
	chmod +x frontend/run.sh
	cd frontend && ./install.sh

install: install-backend install-frontend

run-backend:
	cd backend && ./run.sh

run-frontend:
        cd frontend && ./run.sh

format-python:
        black backend

lint-python:
        flake8

format-frontend:
        cd frontend && yarn run format

lint-frontend:
        cd frontend && yarn run lint

format: format-python format-frontend

lint: lint-python lint-frontend

.DEFAULT_GOAL := install
