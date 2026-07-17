@echo off
setlocal
cd /d "%~dp0"

echo Exhibition Mod Installer
echo.

set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY where python >nul 2>&1 && set "PY=python"
if not defined PY where python3 >nul 2>&1 && set "PY=python3"

if not defined PY (
    echo ERROR: Python 3 not found.
    echo Install Python 3 from https://www.python.org/downloads/
    echo Or double-click install.exe if your mod package includes it.
    pause
    exit /b 1
)

%PY% "%~dp0install.py" %*
set "EC=%ERRORLEVEL%"
if %EC% neq 0 pause
exit /b %EC%