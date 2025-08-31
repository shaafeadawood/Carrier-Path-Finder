"""
API module for Career Path Finder application.

This package contains all API endpoints for the application.
"""

# Import all API routers to make them available when importing from this package
from .admin_api import router as admin_router
from .auth_api import router as auth_router  
from .contact_api import router as contact_router
from .cv_parser import router as cv_parser_router
