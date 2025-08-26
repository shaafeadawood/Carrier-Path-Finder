@echo off
REM This script prepares your project for GitHub by fixing common issues

echo Career Path Finder - GitHub Preparation Script
echo =============================================
echo.

REM Create missing directories
echo Creating missing directories...
if not exist "backend\models" mkdir backend\models
if not exist "backend\tests" mkdir backend\tests

REM Create empty __init__.py files for proper Python package structure
echo Creating Python package structure...
if not exist "backend\__init__.py" echo. > backend\__init__.py
if not exist "backend\api\__init__.py" echo. > backend\api\__init__.py
if not exist "backend\core\__init__.py" echo. > backend\core\__init__.py
if not exist "backend\models\__init__.py" echo. > backend\models\__init__.py
if not exist "backend\workflows\__init__.py" echo. > backend\workflows\__init__.py
if not exist "backend\tests\__init__.py" echo. > backend\tests\__init__.py

REM Clean up cache files
echo Cleaning up cache files...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
del /s /q *.pyc

REM Fix main.py file
if exist "backend\main.py.fixed" (
    echo Updating main.py with fixed version...
    move /y backend\main.py.fixed backend\main.py
)

echo.
echo Project structure has been fixed and is ready for GitHub!
echo To push to GitHub, run push_to_github.bat
echo.