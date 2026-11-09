# Makefile for SecureScope AI
# Windows users without make can use the docker-compose commands directly

.PHONY: test test-backend test-frontend lint lint-backend lint-frontend typecheck typecheck-backend help

help:
	@echo "Available targets:"
	@echo "  test            - Run all tests (backend + frontend)"
	@echo "  test-backend    - Run backend tests only"
	@echo "  test-frontend   - Run frontend tests only"
	@echo "  lint            - Run all linters"
	@echo "  lint-backend    - Run backend linter (ruff)"
	@echo "  lint-frontend   - Run frontend linter (eslint)"
	@echo "  typecheck       - Run all type checkers"
	@echo "  typecheck-backend - Run backend type checker (mypy)"
	@echo ""
	@echo "Windows alternative (run from project root):"
	@echo "  docker compose run --rm backend pytest"
	@echo "  docker compose run --rm frontend npm test"
	@echo "  docker compose run --rm backend ruff check ."
	@echo "  docker compose run --rm frontend npm run lint"
	@echo "  docker compose run --rm backend mypy app"

# Backend tests
test-backend:
	docker compose run --rm backend pytest -v

# Frontend tests
test-frontend:
	docker compose run --rm frontend npm test

# All tests
test: test-backend test-frontend

# Backend linting
lint-backend:
	docker compose run --rm backend ruff check .

# Frontend linting
lint-frontend:
	docker compose run --rm frontend npm run lint

# All linting
lint: lint-backend lint-frontend

# Backend type checking
typecheck-backend:
	docker compose run --rm backend mypy app

# All type checking (frontend uses tsc --noEmit via build)
typecheck: typecheck-backend

# Start full stack
up:
	docker compose up --build

# Start full stack detached
up-d:
	docker compose up --build -d

# Stop and remove volumes
down:
	docker compose down -v

# View logs
logs:
	docker compose logs -f

# Run backend shell
shell-backend:
	docker compose run --rm backend sh

# Run frontend shell
shell-frontend:
	docker compose run --rm frontend sh