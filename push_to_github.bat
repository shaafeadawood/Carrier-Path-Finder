@echo off
REM This script helps push your project to GitHub for Windows users

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Git is not installed. Please install git first.
    exit /b 1
)

REM Check if repository is already initialized
if not exist ".git" (
    echo Initializing git repository...
    git init
)

REM Check if remote origin exists
git remote | findstr "origin" >nul
if %ERRORLEVEL% neq 0 (
    set /p repo_url="Please enter your GitHub repository URL (e.g., https://github.com/username/repository.git): "
    git remote add origin %repo_url%
    echo Added remote repository: %repo_url%
) else (
    echo Remote repository already configured.
    git remote -v
)

REM Clean up unnecessary files
echo Cleaning up unnecessary files...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
del /s /q *.pyc
del /s /q .DS_Store
if exist backend\cache rd /s /q backend\cache
mkdir backend\cache

REM Stage changes
echo Staging changes...
git add .

REM Commit changes
set /p commit_message="Enter commit message: "
git commit -m "%commit_message%"

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

echo Done! Your code has been pushed to GitHub.
