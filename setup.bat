@echo off
setlocal
echo ══════════════════════════════════════════════════════════════════════════
echo   RECON COMMAND CENTER: WINDOWS INITIALIZATION
echo ══════════════════════════════════════════════════════════════════════════
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ERROR: Node.js is not installed. 
    echo Please install it from https://nodejs.org/ before continuing.
    pause
    exit /b 1
)

echo [+] Node.js detected. Installing neural dependencies...
call npm install

if not exist .env (
    echo [+] Creating .env from example...
    copy .env.example .env
    echo [!] ACTION REQUIRED: Please edit '.env' and add your GEMINI_API_KEY.
)

echo.
echo ══════════════════════════════════════════════════════════════════════════
echo   INSTALLATION COMPLETE. Run 'run.bat' to launch the center.
echo ══════════════════════════════════════════════════════════════════════════
pause
