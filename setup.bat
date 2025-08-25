@echo off
REM This script initializes the database and updates the environment variables

echo Starting Career Path Finder database setup...

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python could not be found. Please install Python 3.8 or newer.
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pip could not be found. Please install pip.
    exit /b 1
)

REM Install required dependencies
echo Installing required Python dependencies...
pip install -r backend/requirements.txt

REM Run the database setup script
echo Initializing database tables...
python setup_database.py

echo Database setup completed successfully!
echo.
echo Next steps:
echo 1. Run the backend API: python backend/main.py
echo 2. Run the frontend: cd frontend ^&^& npm run dev
echo.
echo For more information, check the README.md file.

pause
