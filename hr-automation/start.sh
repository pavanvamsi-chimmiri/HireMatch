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

# Prefer 3.12 / 3.13 / 3.11 — Python 3.14+ cannot build our pinned pydantic-core yet.
pick_python() {
  local candidate
  for candidate in python3.12 python3.13 python3.11; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  # Homebrew paths on Apple Silicon / Intel
  for candidate in \
    /opt/homebrew/bin/python3.12 \
    /opt/homebrew/bin/python3.13 \
    /opt/homebrew/bin/python3.11 \
    /usr/local/bin/python3.12 \
    /usr/local/bin/python3.13 \
    /usr/local/bin/python3.11; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  if command -v python3 >/dev/null 2>&1; then
    echo "python3"
    return 0
  fi
  if command -v python >/dev/null 2>&1; then
    echo "python"
    return 0
  fi
  return 1
}

if ! PYTHON_BIN="$(pick_python)"; then
  echo "Python 3.11–3.13 is required."
  echo "On Mac (Homebrew):  brew install python@3.12"
  echo "Then re-run:        ./start.sh"
  exit 1
fi

PY_VERSION="$("$PYTHON_BIN" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
PY_MAJOR="$("$PYTHON_BIN" -c 'import sys; print(sys.version_info.major)')"
PY_MINOR="$("$PYTHON_BIN" -c 'import sys; print(sys.version_info.minor)')"

if [[ "$PY_MAJOR" -ne 3 ]] || [[ "$PY_MINOR" -lt 11 ]] || [[ "$PY_MINOR" -ge 14 ]]; then
  echo "Found $PYTHON_BIN ($PY_VERSION), but this pack needs Python 3.11, 3.12, or 3.13."
  echo "Python 3.14 is too new for pydantic-core wheels used here."
  echo ""
  echo "Fix on Mac:"
  echo "  brew install python@3.12"
  echo "  rm -rf api/.venv"
  echo "  ./start.sh"
  echo ""
  echo "Or use Docker:"
  echo "  ./start.sh --docker"
  exit 1
fi

echo "Using $PYTHON_BIN ($PY_VERSION)"

cd "$ROOT/api"

# Recreate venv if missing or built with a different/unsupported Python
NEED_VENV=0
if [[ ! -x .venv/bin/python ]]; then
  NEED_VENV=1
else
  VENV_VER="$(.venv/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || echo "")"
  if [[ "$VENV_VER" != "$PY_VERSION" ]]; then
    echo "Existing .venv is Python $VENV_VER; recreating with $PY_VERSION..."
    NEED_VENV=1
  fi
fi

if [[ "$NEED_VENV" -eq 1 ]]; then
  rm -rf .venv
  echo "Creating virtual environment..."
  "$PYTHON_BIN" -m venv .venv
fi

# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install -q --upgrade pip
pip install -q -r requirements.txt

export PYTHONPATH="$ROOT/api"
echo ""
echo "Starting local website at http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Press Ctrl+C to stop"
echo ""
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
