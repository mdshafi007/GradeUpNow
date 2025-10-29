@echo off
REM GradeUpNow Deployment Pre-Check Script (Windows)
REM Run this before deploying to catch common issues

echo =======================================
echo    GradeUpNow Deployment Pre-Check
echo =======================================
echo.

set ISSUES=0

REM Check 1: Node version
echo [*] Checking Node.js version...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Install from https://nodejs.org
    set /a ISSUES+=1
) else (
    node -v
    echo [OK] Node.js installed
)
echo.

REM Check 2: Backend files
echo [*] Checking backend files...
if exist "backend\package.json" (
    echo [OK] backend\package.json exists
) else (
    echo [X] backend\package.json missing
    set /a ISSUES+=1
)

if exist "backend\server.js" (
    echo [OK] backend\server.js exists
) else (
    echo [X] backend\server.js missing
    set /a ISSUES+=1
)

if exist "backend\railway.json" (
    echo [OK] backend\railway.json exists
) else (
    echo [X] backend\railway.json missing
    set /a ISSUES+=1
)
echo.

REM Check 3: Backend dependencies
echo [*] Checking backend dependencies...
if exist "backend\node_modules" (
    echo [OK] Backend dependencies installed
) else (
    echo [!] Backend dependencies not installed
    echo     Run: cd backend ^&^& npm install
    set /a ISSUES+=1
)
echo.

REM Check 4: Backend .env
echo [*] Checking backend .env file...
if exist "backend\.env" (
    echo [OK] backend\.env file exists
    findstr /C:"MONGODB_URI" backend\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MONGODB_URI is set
    ) else (
        echo [X] MONGODB_URI is missing
        set /a ISSUES+=1
    )
    
    findstr /C:"JWT_SECRET" backend\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] JWT_SECRET is set
    ) else (
        echo [X] JWT_SECRET is missing
        set /a ISSUES+=1
    )
) else (
    echo [X] backend\.env file missing
    echo     Copy from backend\.env.example
    set /a ISSUES+=1
)
echo.

REM Check 5: Frontend files
echo [*] Checking frontend files...
if exist "GradeUpNow\package.json" (
    echo [OK] GradeUpNow\package.json exists
) else (
    echo [X] GradeUpNow\package.json missing
    set /a ISSUES+=1
)

if exist "GradeUpNow\vercel.json" (
    echo [OK] GradeUpNow\vercel.json exists
) else (
    echo [X] GradeUpNow\vercel.json missing
    set /a ISSUES+=1
)
echo.

REM Check 6: Frontend dependencies
echo [*] Checking frontend dependencies...
if exist "GradeUpNow\node_modules" (
    echo [OK] Frontend dependencies installed
) else (
    echo [!] Frontend dependencies not installed
    echo     Run: cd GradeUpNow ^&^& npm install
    set /a ISSUES+=1
)
echo.

REM Check 7: CORS configuration
echo [*] Checking CORS configuration...
findstr /C:"gradeupnow.app" backend\server.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Production domains in CORS config
) else (
    echo [X] Production domains missing from CORS
    set /a ISSUES+=1
)
echo.

REM Check 8: Git repository
echo [*] Checking Git repository...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    git rev-parse --git-dir >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Git repository initialized
        git branch --show-current
    ) else (
        echo [!] Not a git repository
        echo     Run: git init
    )
) else (
    echo [!] Git not installed
    echo     Install from https://git-scm.com
)
echo.

REM Summary
echo =======================================
if %ISSUES% equ 0 (
    echo [SUCCESS] All checks passed! Ready to deploy.
    echo.
    echo Next steps:
    echo 1. Commit changes: git add . ^&^& git commit -m "Ready for deployment"
    echo 2. Push to GitHub: git push origin main
    echo 3. Deploy backend on Railway: https://railway.app
    echo 4. Deploy frontend on Vercel: https://vercel.com
    echo 5. Follow DEPLOYMENT_GUIDE.md for detailed steps
    echo.
) else (
    echo [FAILED] Found %ISSUES% issue(s). Fix them before deploying.
    echo See DEPLOYMENT_GUIDE.md for help.
    exit /b 1
)

pause
