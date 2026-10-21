#!/usr/bin/env bash
# Instant local run for HireMatch HR Automation pack.
# Usage:
#   ./start.sh           # Python venv + local web UI (no Docker)
#   ./start.sh --docker  # API + n8n via Docker Compose
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

MODE="venv"
if [[ "${1:-}" == "--docker" ]]; then
  MODE="docker"
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example (optional: add OPENAI_API_KEY)."
fi

if [[ "$MODE" == "docker" ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. Install Docker Desktop, or run: ./start.sh"
    exit 1
  fi
  echo "Starting API + n8n with Docker Compose..."
  docker compose up --build -d
  echo ""
  echo "Ready:"
  echo "  Local website:  http://localhost:8000"
  echo "  API docs:       http://localhost:8000/docs"
  echo "  n8n:            http://localhost:5678"
  echo ""
  echo "Stop with: docker compose down"
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
  echo "Python 3 is required. Install Python 3.11+ and retry."
  exit 1
fi

PYTHON_BIN="$(command -v python3 || command -v python)"
cd "$ROOT/api"

if [[ ! -d .venv ]]; then
  echo "Creating virtual environment..."
  "$PYTHON_BIN" -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

export PYTHONPATH="$ROOT/api"
echo ""
echo "Starting local website at http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Press Ctrl+C to stop"
echo ""
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
