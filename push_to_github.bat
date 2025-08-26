#!/bin/bash
# This script helps push your project to GitHub

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git first."
    exit 1
fi

# Check if repository is already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo "Please enter your GitHub repository URL (e.g., https://github.com/username/repository.git):"
    read repo_url
    git remote add origin "$repo_url"
    echo "Added remote repository: $repo_url"
else
    echo "Remote repository already configured."
    git remote -v
fi

# Clean up unnecessary files
echo "Cleaning up unnecessary files..."
find . -name "__pycache__" -type d -exec rm -rf {} +
find . -name "*.pyc" -delete
find . -name ".DS_Store" -delete
rm -rf backend/cache/*

# Stage changes
echo "Staging changes..."
git add .

# Commit changes
echo "Enter commit message:"
read commit_message
git commit -m "$commit_message"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Your code has been pushed to GitHub."