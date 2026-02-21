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

REM Step 3: Force clean old projects
echo [3/6] Force cleaning old projects...
REM Kill processes on ports 4200 and 4201
echo Killing processes on ports 4200 and 4201...
netstat -ano | findstr :4200 | findstr LISTENING > temp_4200.txt 2>nul
if exist temp_4200.txt (
    for /f "tokens=5" %%a in (temp_4200.txt) do taskkill /f /pid %%a 2>nul
    del temp_4200.txt
)
netstat -ano | findstr :4201 | findstr LISTENING > temp_4201.txt 2>nul
if exist temp_4201.txt (
    for /f "tokens=5" %%a in (temp_4201.txt) do taskkill /f /pid %%a 2>nul
    del temp_4201.txt
)
timeout /t 2 /nobreak >nul

REM Force remove directories
cd ..
if exist test-platform (
    echo Removing existing test-platform...
    attrib -r -h -s test-platform\*.* /s /d 2>nul
    rmdir /s /q test-platform 2>nul
)
if exist test-mfe (
    echo Removing existing test-mfe...
    attrib -r -h -s test-mfe\*.* /s /d 2>nul
    rmdir /s /q test-mfe 2>nul
)
cd my-schematic
echo.

REM Step 4: Generate Platform (force overwrite)
echo [4/6] Generating Platform...
cd ..
call schematics angular-mfe-schematic:platform --name=test-platform --port=4200 --dry-run=false --force
if exist test-platform (
    cd test-platform
    call npm install
    cd ..
    echo Platform generated successfully!
) else (
    echo Platform generation failed!
)
cd my-schematic
echo.

REM Step 5: Generate MFE (force overwrite)
echo [5/6] Generating MFE...
cd ..
call schematics angular-mfe-schematic:mfe --name=test-mfe --port=4201 --dry-run=false --force
if exist test-mfe (
    cd test-mfe
    call npm install
    cd ..
    echo MFE generated successfully!
) else (
    echo MFE generation failed!
)
cd my-schematic
echo.

REM Step 6: Start applications
echo [6/6] Starting applications...
if exist ..\test-mfe (
    start "MFE - Port 4201" cmd /k "cd /d %~dp0..\test-mfe && npm start"
    timeout /t 5 /nobreak >nul
)
if exist ..\test-platform (
    start "Platform - Port 4200" cmd /k "cd /d %~dp0..\test-platform && npm start"
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo MFE: http://localhost:4201
echo Platform: http://localhost:4200
echo.
pause
