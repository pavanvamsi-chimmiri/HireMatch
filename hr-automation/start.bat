@echo off
REM Instant local run for HireMatch HR Automation pack (Windows).
REM Usage: double-click start.bat   OR   start.bat --docker

setlocal
cd /d "%~dp0"

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example
)

if /I "%~1"=="--docker" goto docker

where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required. Install from https://www.python.org/downloads/
  pause
  exit /b 1
)

cd api
if not exist ".venv" (
  echo Creating virtual environment...
  python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo.
echo Starting local website at http://localhost:8000
echo   API docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
goto end

:docker
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is not installed. Run start.bat without --docker instead.
  pause
  exit /b 1
)
echo Starting API + n8n with Docker Compose...
docker compose up --build -d
echo.
echo Ready:
echo   Local website:  http://localhost:8000
echo   API docs:       http://localhost:8000/docs
echo   n8n:            http://localhost:5678
echo.
echo Stop with: docker compose down
pause

:end
endlocal
