@echo off
echo Building schematics and creating new MFE and Platform...
echo.

echo Step 1: Building schematics...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Creating new MFE (my-mfe on port 4201)...
call schematics .:mfe --name=my-mfe --port=4201 --dry-run=false
if errorlevel 1 (
    echo ❌ MFE creation failed
    pause
    exit /b 1
)

echo.
echo Step 3: Installing MFE dependencies...
cd my-mfe
call npm install
if errorlevel 1 (
    echo ❌ MFE npm install failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Step 4: Creating new Platform (my-platform on port 4200)...
call schematics .:platform --name=my-platform --port=4200 --dry-run=false
if errorlevel 1 (
    echo ❌ Platform creation failed
    pause
    exit /b 1
)

echo.
echo Step 5: Installing Platform dependencies...
cd my-platform
call npm install
if errorlevel 1 (
    echo ❌ Platform npm install failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Done! Created:
echo    - my-mfe (port 4201)
echo    - my-platform (port 4200)
echo.
pause
