@echo off
echo ========================================
echo Starting Applications in Correct Order
echo ========================================
echo.

echo Step 1: Starting MFE on port 4201...
echo Please wait for "Compiled successfully" message
echo.
start "MFE (Port 4201)" cmd /k "cd /d c:\Projects\my-schematic\my-mfe && npm start"

echo.
echo Waiting 30 seconds for MFE to compile...
timeout /t 30 /nobreak

echo.
echo Step 2: Starting Platform on port 4200...
start "Platform (Port 4200)" cmd /k "cd /d c:\Projects\my-schematic\my-platform && npm start"

echo.
echo ========================================
echo ✅ Both applications are starting
echo ========================================
echo.
echo IMPORTANT:
echo 1. Wait for MFE window to show "Compiled successfully"
echo 2. Then wait for Platform window to show "Compiled successfully"
echo 3. Open http://localhost:4200
echo.
echo If you see 404 errors, the MFE may not be ready yet.
echo Wait a bit longer and refresh the browser.
echo.
pause
