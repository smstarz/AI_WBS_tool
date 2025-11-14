@echo off
setlocal

cd /d "%~dp0"

chcp 65001 >nul

echo === WBS Gantt server ===
echo Working directory: %CD%
echo Node.js version:
node -v
echo ---------------------------

if defined PORT (
    echo Using custom PORT value: %PORT%
) else (
    echo No PORT env set. Defaulting to 5173.
)
echo ---------------------------

node server.js
set "EXIT_CODE=%ERRORLEVEL%"
echo ---------------------------

if "%EXIT_CODE%"=="0" (
    echo Server exited normally.
) else (
    echo Server exited with errors. Exit code: %EXIT_CODE%
)

echo.
pause

endlocal
exit /b %EXIT_CODE%
