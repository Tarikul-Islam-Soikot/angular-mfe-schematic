@echo off
echo ========================================
echo Angular MFE Schematic - Quick Start
echo ========================================
echo.

REM Uninstall existing schematic
echo [1/6] Uninstalling existing schematic...
call npm uninstall -g angular-mfe-schematic 2>nul
echo.

REM Install from GitHub
echo [2/6] Installing schematic from GitHub...
call npm install -g github:Tarikul-Islam-Soikot/angular-mfe-schematic
if %errorlevel% neq 0 (
    echo Installation failed!
    pause
    exit /b 1
)
echo.

REM Clean up old test projects
echo [3/6] Cleaning up old projects...
if exist test-mfe rmdir /s /q test-mfe
if exist test-platform rmdir /s /q test-platform
echo.

REM Generate MFE
echo [4/6] Generating MFE application...
call schematics angular-mfe-schematic:mfe --name=test-mfe --port=4201 --dry-run=false
cd test-mfe
call npm install
cd ..
echo.

REM Generate Platform
echo [5/6] Generating Platform application...
call schematics angular-mfe-schematic:platform --name=test-platform --port=4200 --dry-run=false
cd test-platform
call npm install
cd ..
echo.

REM Start both applications
echo [6/6] Starting applications...
echo Starting MFE on port 4201...
start "MFE - Port 4201" cmd /k "cd /d %cd%\test-mfe && npm start"
timeout /t 5 /nobreak >nul
echo Starting Platform on port 4200...
start "Platform - Port 4200" cmd /k "cd /d %cd%\test-platform && npm start"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo MFE running at: http://localhost:4201
echo Platform running at: http://localhost:4200
echo.
echo Press any key to exit...
pause >nul
