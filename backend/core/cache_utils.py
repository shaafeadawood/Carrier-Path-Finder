"""
Simple caching mechanism for CV parsing results to avoid redundant API calls.
"""
import os
import json
import hashlib
from datetime import datetime, timedelta

CACHE_DIR = "cache"
CACHE_EXPIRY_DAYS = 7

def ensure_cache_dir():
    """Ensure the cache directory exists."""
    if not os.path.exists(CACHE_DIR):
        os.makedirs(CACHE_DIR)

def get_cache_key(text):
    """Generate a unique cache key for the text content."""
    return hashlib.md5(text.encode()).hexdigest()

def get_from_cache(key):
    """Retrieve cached data if it exists and is not expired."""
    ensure_cache_dir()
    cache_file = os.path.join(CACHE_DIR, f"{key}.json")
    
    if not os.path.exists(cache_file):
        return None
        
    # Check if cache is expired
    mod_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
    if datetime.now() - mod_time > timedelta(days=CACHE_EXPIRY_DAYS):
        # Cache expired
        return None
        
    try:
        with open(cache_file, 'r') as f:
            return json.load(f)
    except:
        return None

def save_to_cache(key, data):
    """Save data to cache."""
    ensure_cache_dir()
    cache_file = os.path.join(CACHE_DIR, f"{key}.json")
    
    try:
        with open(cache_file, 'w') as f:
            json.dump(data, f)
        return True
    except:
        return False