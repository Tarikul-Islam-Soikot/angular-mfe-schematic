@echo off
echo ========================================
echo Angular MFE Schematic Setup and Run
echo ========================================
echo.

REM Uninstall existing schematic
echo [1/7] Uninstalling existing schematic...
call npm uninstall -g angular-mfe-schematic 2>nul
echo.

REM Build the schematic
echo [2/7] Building schematic...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

REM Link the schematic
echo [3/7] Linking schematic...
call npm link
echo.

REM Clean up old test projects
echo [4/7] Cleaning up old projects...
if exist test-mfe rmdir /s /q test-mfe
if exist test-platform rmdir /s /q test-platform
echo.

REM Generate MFE
echo [5/7] Generating MFE application...
call schematics angular-mfe-schematic:mfe --name=test-mfe --port=4201 --dry-run=false
cd test-mfe
call npm install
cd ..
echo.

REM Generate Platform
echo [6/7] Generating Platform application...
call schematics angular-mfe-schematic:platform --name=test-platform --port=4200 --dry-run=false
cd test-platform
call npm install
cd ..
echo.

REM Start both applications
echo [7/7] Starting applications...
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
pause
