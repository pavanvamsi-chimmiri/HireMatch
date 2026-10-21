#!/usr/bin/env bash
# Build a downloadable zip anyone can unpack and run with ./start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
DIST="$REPO_ROOT/dist"
STAMP="$(date +%Y%m%d)"
NAME="hirematch-hr-automation-local-${STAMP}"
OUT_DIR="$DIST/$NAME"
ZIP="$DIST/${NAME}.zip"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a \
    --exclude '.venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '*.db' \
    --exclude '.env' \
    --exclude 'n8n_data' \
    --exclude '.DS_Store' \
    "$ROOT/" "$OUT_DIR/"
else
  # Portable fallback when rsync is unavailable
  python3 - <<PY
import shutil
from pathlib import Path
src = Path("$ROOT")
dst = Path("$OUT_DIR")
ignore = shutil.ignore_patterns(".venv", "__pycache__", "*.pyc", "*.db", ".env", "n8n_data", ".DS_Store")
shutil.copytree(src, dst, dirs_exist_ok=True, ignore=ignore)
PY
fi

# Friendly entry files at pack root
cp "$ROOT/start.sh" "$OUT_DIR/start.sh"
cp "$ROOT/start.bat" "$OUT_DIR/start.bat"
chmod +x "$OUT_DIR/start.sh" "$OUT_DIR/pack.sh" 2>/dev/null || true

cat > "$OUT_DIR/HOW_TO_RUN.txt" <<'EOF'
HireMatch HR Automation — Local Pack
====================================

Requirements: Python 3.11 / 3.12 / 3.13  (OR Docker Desktop)
IMPORTANT: Python 3.14 is NOT supported yet (pydantic-core build fails).

Quick start (no Docker)
-----------------------
macOS / Linux:
  1. Unzip this folder
  2. Open a terminal in this folder
  3. Run:  ./start.sh
  4. Open: http://localhost:8000

  If you only have Python 3.14 on Mac:
    brew install python@3.12
    rm -rf api/.venv
    ./start.sh

Windows:
  1. Unzip this folder
  2. Double-click start.bat
  3. Open: http://localhost:8000
  Install Python 3.12 from python.org if needed (not 3.14).

With Docker (API + n8n)
-----------------------
  ./start.sh --docker
  or: start.bat --docker

  Website: http://localhost:8000
  n8n:     http://localhost:5678

Optional: edit .env and set OPENAI_API_KEY for AI scoring.
Without a key, heuristic scoring still works offline.
EOF

mkdir -p "$DIST"
rm -f "$ZIP"
(
  cd "$DIST"
  if command -v zip >/dev/null 2>&1; then
    zip -qr "$ZIP" "$NAME"
  else
    python3 - <<PY
import shutil
shutil.make_archive("$DIST/$NAME", "zip", "$DIST", "$NAME")
PY
  fi
)

echo "Created: $ZIP"
ls -lh "$ZIP"
