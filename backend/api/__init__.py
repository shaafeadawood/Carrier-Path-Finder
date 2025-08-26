# API module for Career Path Finder backend
# Contains all API endpoint definitions

# Make API modules importable
from api.cv_parser import add_cv_routes
from api.roadmap_api import add_roadmap_routes
from api.contact_api import add_contact_routes
from api.recommendation_api import add_recommendation_routes
from api.admin_api import add_admin_routes
from api.auth_api import add_auth_routes
