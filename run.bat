@echo off
setlocal
echo ══════════════════════════════════════════════════════════════════════════
echo   RECON COMMAND CENTER: LAUNCHING HUD
echo ══════════════════════════════════════════════════════════════════════════
echo.

if not exist .env (
    echo [!] ERROR: .env file is missing. 
    echo Please run 'setup.bat' first.
    pause
    exit /b 1
)

echo [+] Initializing Neural Link...
npm run dev

pause
