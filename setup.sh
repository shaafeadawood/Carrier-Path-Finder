#!/bin/bash
# This script initializes the database and updates the environment variables

echo "Starting Career Path Finder database setup..."

# Check if Python is installed
if ! command -v python &> /dev/null
then
    echo "Python could not be found. Please install Python 3.8 or newer."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null
then
    echo "pip could not be found. Please install pip."
    exit 1
fi

# Install required dependencies
echo "Installing required Python dependencies..."
pip install -r backend/requirements.txt

# Run the database setup script
echo "Initializing database tables..."
python setup_database.py

echo "Database setup completed successfully!"
echo 
echo "Next steps:"
echo "1. Run the backend API: python backend/main.py"
echo "2. Run the frontend: cd frontend && npm run dev"
echo 
echo "For more information, check the README.md file."
