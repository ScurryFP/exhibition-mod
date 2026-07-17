@echo off
setlocal
cd /d "%~dp0"

REM Double-click friendly: prefer pythonw so popups show without a scary console.
REM Fall back to console python if pythonw is missing.

set "PYW="
set "PY="

where py >nul 2>&1 && (
  py -3 -c "import sys" >nul 2>&1 && set "PY=py -3"
)
if not defined PY where python >nul 2>&1 && set "PY=python"
if not defined PY where python3 >nul 2>&1 && set "PY=python3"

where pyw >nul 2>&1 && set "PYW=pyw -3"
if not defined PYW where pythonw >nul 2>&1 && set "PYW=pythonw"

if not defined PY if not defined PYW (
    echo ERROR: Python 3 not found.
    echo Install Python 3 from https://www.python.org/downloads/
    echo During setup, enable "tcl/tk" / tkinter if asked.
    pause
    exit /b 1
)

if defined PYW (
  %PYW% "%~dp0uninstall.py" %*
  set "EC=%ERRORLEVEL%"
) else (
  echo Exhibition Mod Uninstaller
  echo.
  %PY% "%~dp0uninstall.py" %*
  set "EC=%ERRORLEVEL%"
  echo.
  if %EC% neq 0 (
    echo Uninstall reported errors.
  ) else (
    echo Done.
  )
  pause
)

exit /b %EC%
