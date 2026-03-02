from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    # JWT (primary settings)
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # JWT backward-compatible aliases (used by legacy modules)
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: Optional[str] = None
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"  # Default to SQLite for local dev
    
    # AWS Cognito
    COGNITO_REGION: str = "us-east-1"
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    COGNITO_JWKS_URL: Optional[str] = None  # Auto-generated if not provided
    
    # Google OAuth (legacy - will be federated through Cognito)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Google Gemini AI
    GOOGLE_API_KEY: str = ""
    
    # Facebook OAuth
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""
    
    # Frontend URLs
    FRONTEND_URL: str = "http://localhost:5173"
    TECHNICIAN_FRONTEND_URL: str = "http://localhost:5174"
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = ""
    AWS_SNS_TOPIC_ARN: str = ""
    
    # Feature Flags
    ENABLE_S3_UPLOAD: bool = False
    ENABLE_SNS_ALERTS: bool = False
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        case_sensitive=True,
        extra="ignore",
    )

    def model_post_init(self, __context):
        if not self.JWT_SECRET:
            self.JWT_SECRET = self.SECRET_KEY
        if not self.JWT_ALGORITHM:
            self.JWT_ALGORITHM = self.ALGORITHM

settings = Settings()

# Auto-generate JWKS URL if not provided
if settings.COGNITO_USER_POOL_ID and not settings.COGNITO_JWKS_URL:
    settings.COGNITO_JWKS_URL = (
        f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
        f"{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    )

print(f"[CONFIG] Database URL configured: {bool(settings.DATABASE_URL and 'sqlite' not in settings.DATABASE_URL)}")
print(f"[CONFIG] AWS Cognito configured: {bool(settings.COGNITO_USER_POOL_ID and settings.COGNITO_APP_CLIENT_ID)}")
print(f"[CONFIG] Google Client ID loaded: {bool(settings.GOOGLE_CLIENT_ID)}")
print(f"[CONFIG] AWS S3 enabled: {settings.ENABLE_S3_UPLOAD}")
print(f"[CONFIG] AWS SNS enabled: {settings.ENABLE_SNS_ALERTS}")

