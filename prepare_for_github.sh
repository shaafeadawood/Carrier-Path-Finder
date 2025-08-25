#!/bin/bash
# This script prepares your project for GitHub by fixing common issues

echo "Career Path Finder - GitHub Preparation Script"
echo "============================================="
echo

# Create missing directories
echo "Creating missing directories..."
mkdir -p backend/models
mkdir -p backend/tests

# Create empty __init__.py files for proper Python package structure
echo "Creating Python package structure..."
touch backend/__init__.py
touch backend/api/__init__.py
touch backend/core/__init__.py
touch backend/models/__init__.py
touch backend/workflows/__init__.py
touch backend/tests/__init__.py

# Clean up cache files
echo "Cleaning up cache files..."
find . -name "__pycache__" -type d -exec rm -rf {} +
find . -name "*.pyc" -delete

# Fix main.py file
if [ -f "backend/main.py.fixed" ]; then
    echo "Updating main.py with fixed version..."
    mv backend/main.py.fixed backend/main.py
fi

echo
echo "Project structure has been fixed and is ready for GitHub!"
echo "To push to GitHub, run ./push_to_github.sh"
echo
