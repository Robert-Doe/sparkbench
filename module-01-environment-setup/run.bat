@echo off
REM Module 01 launcher for Windows.
REM Creates a venv on first run, installs deps, then starts the lab server.

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo.
echo Starting Module 01 lab...
echo Site A: http://127.0.0.1:5000
echo Site B: http://127.0.0.1:5001
echo Press Ctrl+C to stop.
echo.

python lab_server.py
