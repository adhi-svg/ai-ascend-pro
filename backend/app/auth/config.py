from datetime import timedelta
from app.core.config import settings

# Core JWT settings for hackathon prototype auth
# Keep these names explicit so replacing verify_token() with Cognito later is straightforward.
SECRET_KEY: str = settings.SECRET_KEY
ALGORITHM: str = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES
DEFAULT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
