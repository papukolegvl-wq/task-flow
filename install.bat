@echo off
echo ==========================================
echo      TaskFlow Installation & Setup
echo ==========================================

echo.
echo 1. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies. Please check your nodejs installation.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Creating Desktop Shortcut...
set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash if present
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

set "SHORTCUT_PATH=%USERPROFILE%\Desktop\TaskFlow.lnk"
set "TARGET_PATH=%SCRIPT_DIR%\start_app.bat"
set "ICON_PATH=%SCRIPT_DIR%\public\vite.svg"

:: Use PowerShell to create the shortcut
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_PATH%'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.IconLocation = '%ICON_PATH%'; $s.Save()"

if exist "%SHORTCUT_PATH%" (
    echo Shortcut created successfully on Desktop!
) else (
    echo Failed to create shortcut.
)

echo.
echo ==========================================
echo        Installation Complete!
echo ==========================================
echo.
echo Starting application now...
echo (You can future launch the app using the TaskFlow shortcut on your Desktop)
echo.

call npm run dev -- --open
pause
