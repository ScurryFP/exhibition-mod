@echo off
setlocal
cd /d "%~dp0"

echo Building install.exe for Windows players...
echo.

set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY where python >nul 2>&1 && set "PY=python"

if not defined PY (
    echo ERROR: Python 3 required to build install.exe.
    pause
    exit /b 1
)

%PY% -m pip install --upgrade pyinstaller
if errorlevel 1 exit /b 1

%PY% -m PyInstaller --onefile --console --name install --clean install.py
if errorlevel 1 exit /b 1

copy /y "dist\install.exe" "install.exe"
echo.
echo Created install.exe — include it in your mod ZIP for Windows players.
pause