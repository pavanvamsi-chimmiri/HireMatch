@echo off
REM Instant local run for HireMatch HR Automation pack (Windows).
REM Usage: double-click start.bat   OR   start.bat --docker
REM Requires Python 3.11, 3.12, or 3.13 (not 3.14+).

setlocal EnableDelayedExpansion
cd /d "%~dp0"

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example
)

if /I "%~1"=="--docker" goto docker

set "PYTHON_BIN="
where py >nul 2>nul
if not errorlevel 1 (
  for %%V in (3.12 3.13 3.11) do (
    if not defined PYTHON_BIN (
      py -%%V -c "import sys" >nul 2>nul
      if not errorlevel 1 set "PYTHON_BIN=py -%%V"
    )
  )
)

if not defined PYTHON_BIN (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3.11-3.13 is required. Install from https://www.python.org/downloads/
    echo Do not use Python 3.14 yet.
    pause
    exit /b 1
  )
  set "PYTHON_BIN=python"
)

for /f "tokens=*" %%i in ('%PYTHON_BIN% -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set PY_VERSION=%%i
for /f "tokens=*" %%i in ('%PYTHON_BIN% -c "import sys; print(sys.version_info.minor)"') do set PY_MINOR=%%i

if !PY_MINOR! LSS 11 goto badpy
if !PY_MINOR! GEQ 14 goto badpy
goto makvenv

:badpy
echo Found Python %PY_VERSION%, but this pack needs 3.11, 3.12, or 3.13.
echo Install Python 3.12 from https://www.python.org/downloads/
echo Then delete api\.venv and run start.bat again.
pause
exit /b 1

:makvenv
echo Using Python %PY_VERSION%
cd api
if exist ".venv\Scripts\python.exe" (
  for /f "tokens=*" %%i in ('.venv\Scripts\python.exe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set VENV_VER=%%i
  if not "!VENV_VER!"=="%PY_VERSION%" (
    echo Recreating .venv for Python %PY_VERSION%...
    rmdir /s /q .venv
  )
)
if not exist ".venv" (
  echo Creating virtual environment...
  %PYTHON_BIN% -m venv .venv
)

call .venv\Scripts\activate.bat
python -m pip install -q --upgrade pip
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
