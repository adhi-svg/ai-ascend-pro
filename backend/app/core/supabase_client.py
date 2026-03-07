"""Supabase client initialization and utilities."""
from supabase import create_client, Client
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client (only if credentials are provided)
supabase_client: Client | None = None

def get_supabase_client() -> Client | None:
    """
    Get or create Supabase client instance.
    Returns None if Supabase is not configured.
    """
    global supabase_client
    
    if supabase_client is not None:
        return supabase_client
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("Supabase not configured - missing URL or KEY")
        return None
    
    try:
        supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        logger.info(f"✓ Supabase client initialized: {settings.SUPABASE_URL}")
        return supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

def get_supabase_admin_client() -> Client | None:
    """
    Get Supabase client with service role key (admin access).
    Use this for backend operations that need elevated privileges.
    Returns None if service role key is not configured.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase admin client not configured - missing service role key")
        return None
    
    try:
        admin_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("✓ Supabase admin client initialized")
        return admin_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        return None

# Initialize on import if configured
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    get_supabase_client()
