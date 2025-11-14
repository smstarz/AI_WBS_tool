@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%"

set "SERVER_PORT=5173"
set "SERVER_HOST=http://127.0.0.1:%SERVER_PORT%"

where node >nul 2>nul
if errorlevel 1 (
    echo [Error] Node.js binary not found. Install from https://nodejs.org/ then retry.
    pause
    popd
    endlocal
    exit /b 1
)

set "PORT=%SERVER_PORT%"

echo Launching Node.js server in a new console window...
start "WBS Gantt Server" cmd /K ""%SCRIPT_DIR%run_server_inner.bat""

timeout /t 2 >nul
echo Opening browser window...
start "" "%SERVER_HOST%"

popd
endlocal
exit /b 0
