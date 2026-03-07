from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from app.api.v1.api import api_router
from app.api.v1.endpoints.protected_demo import router as protected_demo_router
from app.ws.routes import router as ws_router
from app.stores.seed import seed_categories, seed_demo_data
from app.core.deps import get_current_user
from app.core.database import init_db
from app.utils.responses import error_response
from app.core.config import get_cors_origins
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Fyxion Backend",
    description="Home Services Backend API",
    version="2.0.0",
)

# CORS middleware - allow both frontends + configurable production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router)
app.include_router(protected_demo_router)
app.include_router(ws_router)

# Static files for local uploads fallback
try:
    Path("local_storage").mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="local_storage"), name="uploads")
except Exception as e:
    logger.warning(f"Could not mount static file directory: {str(e)}")

# Override default exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(
                code=exc.detail.get("code", "ERROR"),
                details=exc.detail.get("detail", str(exc.detail)),
            )
        )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(
            code="ERROR",
            details=str(exc.detail),
        )
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "2.0.0"}

@app.get("/aws-status")
async def aws_status():
    """Check status of all AWS services. Use this to verify credentials are working."""
    from app.core.config import settings
    from app.utils.s3_manager import s3_manager
    from app.utils.sns_manager import sns_manager
    from app.utils.dynamodb_manager import dynamodb_manager
    
    status = {
        "database": {
            "type": "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite (local)",
            "configured": "postgresql" in settings.DATABASE_URL or "postgres" in settings.DATABASE_URL,
        },
        "s3": {
            "enabled": settings.ENABLE_S3_UPLOAD,
            "bucket": settings.AWS_S3_BUCKET_NAME or "(not set)",
            "region": settings.AWS_REGION,
            "has_credentials": bool(settings.AWS_ACCESS_KEY_ID),
            "ready": s3_manager.enabled,
        },
        "sns": {
            "enabled": settings.ENABLE_SNS_ALERTS,
            "topic_arn": settings.AWS_SNS_TOPIC_ARN or "(not set)",
            "has_credentials": bool(settings.AWS_ACCESS_KEY_ID),
            "ready": sns_manager.enabled,
        },
        "cognito": {
            "user_pool_id": settings.COGNITO_USER_POOL_ID or "(not set)",
            "app_client_id": settings.COGNITO_APP_CLIENT_ID or "(not set)",
            "configured": bool(settings.COGNITO_USER_POOL_ID and settings.COGNITO_APP_CLIENT_ID),
        },
        "google": {
            "oauth_configured": bool(settings.GOOGLE_CLIENT_ID),
            "gemini_configured": bool(settings.GOOGLE_API_KEY),
            "maps_configured": bool(settings.GOOGLE_MAPS_API_KEY),
        },
    }
    
    # Test S3 connectivity if enabled
    if s3_manager.enabled:
        try:
            s3_manager.s3_client.head_bucket(Bucket=settings.AWS_S3_BUCKET_NAME)
            status["s3"]["connection"] = "✅ Connected"
        except Exception as e:
            status["s3"]["connection"] = f"❌ Error: {str(e)}"
    
    # Test SNS connectivity if enabled
    if sns_manager.enabled:
        try:
            sns_manager.sns_client.get_topic_attributes(TopicArn=settings.AWS_SNS_TOPIC_ARN)
            status["sns"]["connection"] = "✅ Connected"
        except Exception as e:
            status["sns"]["connection"] = f"❌ Error: {str(e)}"
    
    # Test DB connectivity
    try:
        from sqlalchemy import text
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status["database"]["connection"] = "✅ Connected"
    except Exception as e:
        status["database"]["connection"] = f"❌ Error: {str(e)}"
    
    # DynamoDB status
    status["dynamodb"] = {
        "enabled": settings.ENABLE_DYNAMODB,
        "table_prefix": settings.AWS_DYNAMODB_TABLE_PREFIX,
        "has_credentials": bool(settings.AWS_ACCESS_KEY_ID),
        **dynamodb_manager.health_check(),
    }
    
    return {"status": "ok", "services": status}

@app.get("/auth/google/callback")
async def google_callback_fallback(request: Request):
    """Fallback for stale Google OAuth redirect URIs."""
    query = request.url.query
    redirect_url = f"http://localhost:8000/api/v1/auth/google/callback"
    if query:
        redirect_url = f"{redirect_url}?{query}"
    return RedirectResponse(url=redirect_url)

@app.get("/api/v1/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info."""
    from app.utils.responses import success_response
    return success_response(
        data={
            "id": current_user["id"],
            "phone": current_user["phone"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "profile_complete": current_user["profile_complete"],
            "created_at": current_user["created_at"],
        },
        message="User retrieved successfully"
    )

@app.on_event("startup")
async def startup_event():
    """Initialize app at startup."""
    try:
        init_db()
        seed_categories()
        seed_demo_data()
        logger.info("✓ Database initialized successfully")
        
        # Initialize DynamoDB tables if enabled
        try:
            from app.utils.dynamodb_manager import dynamodb_manager
            if dynamodb_manager.enabled:
                dynamodb_manager.ensure_tables()
                logger.info("✓ DynamoDB tables initialized")
        except Exception as e:
            logger.warning(f"DynamoDB init skipped: {e}")
        
        logger.info("✓ App started successfully")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
