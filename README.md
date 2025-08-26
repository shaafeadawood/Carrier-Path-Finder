# Career Path Finder

A comprehensive web application to help users find their ideal career path, improve their CV, and develop personalized learning plans based on their skills and interests.

## Features

- **User Authentication**: Secure login, signup, and password reset functionality
- **CV Management**: Upload, create, and enhance your CV with AI-powered suggestions
- **Skills Gap Analysis**: Identify skills you need to develop for your target roles
- **Job Recommendations**: Get personalized job recommendations based on your profile
- **Learning Plans**: Create customized learning plans to achieve your career goals
- **Admin Dashboard**: Manage users, contact messages, and system settings

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm 7+
- Supabase account with project

### Environment Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/career-path-finder.git
   cd career-path-finder
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ADMIN_CREATE_KEY=your_secret_key_for_admin_creation
   GEMINI_API_KEY=your_gemini_api_key
   SMTP_SERVER=your_smtp_server
   SMTP_PORT=587
   SMTP_USERNAME=your_email
   SMTP_PASSWORD=your_email_password
   SMTP_FROM_EMAIL=noreply@yourwebsite.com
   ```

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Initialize the database:
   ```bash
   python setup_database.py
   ```
   
   Or use the provided scripts:
   ```bash
   # On Windows:
   ./setup.bat
   
   # On Linux/Mac:
   ./setup.sh
   ```

4. Start the backend server:
   ```bash
   python backend/main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install NPM dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:5173`

### Admin Access

To create an admin user:

1. Register a regular user account through the application
2. Use the admin creation endpoint:
   ```
   POST /api/admin/create
   {
     "email": "admin@example.com",
     "admin_key": "your_admin_create_key"
   }
   ```

## Folder Structure

```
career-path-finder/
├── backend/               # Python backend code
│   ├── api/               # API endpoints
│   ├── migrations/        # Database migrations
│   └── utils/             # Utility functions
├── frontend/              # React frontend code
│   ├── public/            # Static assets
│   └── src/               # React source files
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Page components
│       └── utils/         # Utility functions
└── setup_database.py      # Database initialization script
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.