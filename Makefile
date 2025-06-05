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

test-backend:
	cd backend && pytest

test-frontend:
	cd frontend && yarn test --watchAll=false

test: test-backend test-frontend

.DEFAULT_GOAL := install
