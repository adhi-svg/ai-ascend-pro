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
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FieldFix Backend",
    description="Home Services Backend API",
    version="2.0.0",
)

# CORS middleware - allow both frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://0.0.0.0:5173",
        "http://0.0.0.0:5174"
    ],
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
        logger.info("✓ App started successfully")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
