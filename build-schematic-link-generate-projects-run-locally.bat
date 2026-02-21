@echo off
echo ========================================
echo Local Development Setup
echo ========================================
echo.

REM Step 1: Build schematic
echo [1/6] Building schematic...
cd /d %~dp0
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

REM Step 2: Link schematic
echo [2/6] Linking schematic locally...
call npm link
echo.

REM Step 3: Clean old projects
echo [3/6] Cleaning old projects...
cd ..
if exist test-platform rmdir /s /q test-platform
if exist test-mfe rmdir /s /q test-mfe
echo.

REM Step 4: Generate Platform
echo [4/6] Generating Platform...
call schematics angular-mfe-schematic:platform --name=test-platform --port=4200 --dry-run=false
cd test-platform
call npm install
cd ..
echo.

REM Step 5: Generate MFE
echo [5/6] Generating MFE...
call schematics angular-mfe-schematic:mfe --name=test-mfe --port=4201 --dry-run=false
cd test-mfe
call npm install
cd ..
echo.

REM Step 6: Start applications
echo [6/6] Starting applications...
start "MFE - Port 4201" cmd /k "cd /d %cd%\test-mfe && npm start"
timeout /t 5 /nobreak >nul
start "Platform - Port 4200" cmd /k "cd /d %cd%\test-platform && npm start"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo MFE: http://localhost:4201
echo Platform: http://localhost:4200
echo.
pause
