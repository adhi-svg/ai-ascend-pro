from fastapi import APIRouter, Depends, status, HTTPException, Query
from datetime import timedelta
from app.core.security import create_access_token
from app.core.config import settings
from app.core.deps import get_current_user as deps_get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AuthUser, GoogleCodeExchangeRequest
from app.utils.responses import success_response, error_response
import requests
from app.core.database import get_db
from app.models import User, Technician, UserRoleEnum, TechnicianStatusEnum
from sqlalchemy.orm import Session
import json

router = APIRouter(prefix="/auth", tags=["Auth"])

def _exchange_google_code_for_user(code: str, redirect_uri: str) -> dict:
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Starting OAuth code exchange, redirect_uri: {redirect_uri}")
    
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    logger.info(f"Requesting token from Google with redirect_uri: {redirect_uri}")
    
    response = requests.post(token_url, data=token_data)
    
    logger.info(f"Google token response status: {response.status_code}")
    
    if response.status_code != 200:
        logger.error(f"Failed to get token from Google: {response.text}")
        raise Exception(f"Failed to exchange code for token: {response.text}")

    token_response = response.json()
    logger.info(f"Token exchange successful")
    
    access_token = token_response.get("access_token")
    if not access_token:
        logger.error(f"No access_token in Google response: {token_response}")
        raise Exception("No access token returned from Google")

    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    user_info_response = requests.get(user_info_url, headers=headers)

    logger.info(f"Google user info response status: {user_info_response.status_code}")
    
    if user_info_response.status_code != 200:
        logger.error(f"Failed to get user info from Google: {user_info_response.text}")
        raise Exception(f"Failed to get user info: {user_info_response.text}")

    user_data = user_info_response.json()
    logger.info(f"Got user data from Google: {user_data.get('email')}")
    
    return user_data

@router.post("/register", response_model=dict)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (customer or technician)."""
    # Validate role
    role_map = {"customer": UserRoleEnum.CUSTOMER, "technician": UserRoleEnum.TECHNICIAN}
    if req.role.lower() not in role_map:
        return error_response(
            code="INVALID_ROLE",
            details="Role must be 'customer' or 'technician'",
            message="Invalid role provided"
        )
    
    # Check if phone already exists
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        return error_response(
            code="DUPLICATE_PHONE",
            details="Phone number already registered",
            message="This phone number is already in use"
        )
    
    from app.core.security import hash_password
    
    # Create user
    new_user = User(
        phone=req.phone,
        password_hash=hash_password(req.password) if req.password else None,
        name=req.name,
        email=req.email,
        role=role_map[req.role.lower()]
    )
    db.add(new_user)
    db.flush() # Get user ID
    
    # If technician, create technician profile with all provided details
    if req.role.lower() == "technician":
        # Store metadata in documents as JSON for simplicity in this schema
        docs = {
            "aadhaar_number": req.aadhaar_number,
            "aadhaar_front_url": req.aadhaar_front_url,
            "aadhaar_back_url": req.aadhaar_back_url,
            "selfie_url": req.selfie_url,
            "base_visit_fee": req.base_visit_fee,
        }
        
        new_tech = Technician(
            user_id=new_user.id,
            status=TechnicianStatusEnum.PENDING,
            skills=json.dumps([req.skill]) if req.skill else "[]",
            experience=req.experience, # Assuming we add this to model or docs
            radius_km=req.radius_km, # Assuming we add this to model or docs
            shop_available=req.has_shop or False,
            shop_name=req.shop_name,
            shop_address=req.shop_address,
            shop_location_text=req.shop_location,
            profile_image_url=req.profile_photo_url,
            documents=json.dumps(docs)
        )
        db.add(new_tech)
    
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": new_user.id, "role": new_user.role.value},
        expires_delta=access_token_expires
    )
    
    return success_response(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "phone": new_user.phone,
                "name": new_user.name,
                "role": new_user.role.value,
            }
        },
        message="User registered successfully"
    )

@router.post("/login", response_model=dict)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with phone and password."""
    user = db.query(User).filter(User.phone == req.phone).first()
    
    from app.core.security import verify_password
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        return error_response(
            code="INVALID_CREDENTIALS",
            details="Invalid phone or password",
            message="Login failed"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return success_response(
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "phone": user.phone,
                "name": user.name,
                "role": user.role.value,
            }
        },
        message="Login successful"
    )

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth login."""
    if not settings.GOOGLE_CLIENT_ID:
        return error_response(
            code="OAUTH_CONFIG_ERROR",
            details="Google OAuth not configured",
            message="Google OAuth credentials are missing"
        )
    
    # Use frontend URL for callback - the frontend will exchange the code with the backend
    redirect_uri = f"{settings.FRONTEND_URL}/auth/callback"
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20profile%20email"
    )
    
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[OAUTH] Google login URL generated with redirect_uri: {redirect_uri}")
    
    return success_response(
        data={"auth_url": google_auth_url},
        message="Google OAuth URL generated"
    )

@router.get("/google/callback")
async def google_callback(code: str = Query(...), db: Session = Depends(get_db)):
    """Google OAuth callback endpoint."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Google callback received with code: {code[:20]}...")
    
    if not code:
        logger.error("No authorization code provided")
        return error_response(
            code="MISSING_CODE",
            details="Authorization code is missing",
            message="Invalid callback request"
        )
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        logger.error("Google credentials not configured")
        return error_response(
            code="OAUTH_CONFIG_ERROR",
            details="Google OAuth not configured",
            message="Google OAuth credentials are missing"
        )
    
    try:
        logger.info("Exchanging code for Google token...")
        user_info = _exchange_google_code_for_user(
            code=code,
            redirect_uri="http://localhost:8000/api/v1/auth/google/callback",
        )
        logger.info(f"User info received: {user_info.get('email')}")

        existing_user = db.query(User).filter(User.email == user_info["email"]).first()
        if not existing_user:
            logger.info(f"Creating new user for email: {user_info['email']}")
            existing_user = User(
                phone=f"google_{user_info['id']}",
                password_hash=None,
                name=user_info.get("name", ""),
                email=user_info["email"],
                role=UserRoleEnum.CUSTOMER
            )
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)
        else:
            logger.info(f"User already exists: {existing_user.id}")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": existing_user.id, "role": existing_user.role.value},
            expires_delta=access_token_expires
        )
        logger.info(f"JWT token created for user: {existing_user.id}")

        return success_response(
            data={
                "access_token": jwt_token,
                "token_type": "bearer",
                "user": {
                    "id": existing_user["id"],
                    "phone": existing_user["phone"],
                    "name": existing_user["name"],
                    "email": existing_user["email"],
                    "role": existing_user["role"],
                }
            },
            message="Google login successful"
        )

    except Exception as e:
        logger.error(f"OAuth error: {str(e)}", exc_info=True)
        return error_response(
            code="OAUTH_ERROR",
            details=str(e),
            message="Failed to authenticate with Google"
        )

@router.post("/google/exchange", response_model=dict)
async def google_exchange(req: GoogleCodeExchangeRequest, db: Session = Depends(get_db)):
    """Exchange Google OAuth code for a local session."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("Google exchange request received")
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        logger.error("Google credentials not configured")
        return error_response(
            code="OAUTH_CONFIG_ERROR",
            details="Google OAuth not configured",
            message="Google OAuth credentials are missing"
        )

    try:
        logger.info(f"Exchanging code with redirect_uri: {settings.FRONTEND_URL}/auth/callback")
        user_info = _exchange_google_code_for_user(
            code=req.code,
            redirect_uri=f"{settings.FRONTEND_URL}/auth/callback",
        )
        
        logger.info(f"Got user info from Google: {user_info.get('email')}")

        existing_user = db.query(User).filter(User.email == user_info["email"]).first()
        if not existing_user:
            logger.info(f"Creating new user for: {user_info['email']}")
            existing_user = User(
                phone=f"google_{user_info['id']}",
                password_hash=None,
                name=user_info.get("name", ""),
                email=user_info["email"],
                role=UserRoleEnum.CUSTOMER
            )
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)
            logger.info(f"New user created with id: {existing_user.id}")
        else:
            logger.info(f"Existing user found: {existing_user.id}")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": existing_user.id, "role": existing_user.role.value},
            expires_delta=access_token_expires
        )
        
        logger.info(f"JWT token created, returning user: {existing_user.email}")

        return success_response(
            data={
                "access_token": jwt_token,
                "token_type": "bearer",
                "user": {
                    "id": existing_user["id"],
                    "phone": existing_user["phone"],
                    "name": existing_user["name"],
                    "email": existing_user["email"],
                    "role": existing_user["role"],
                }
            },
            message="Google login successful"
        )
    except Exception as e:
        logger.error(f"Google exchange error: {str(e)}", exc_info=True)
        return error_response(
            code="OAUTH_ERROR",
            details=str(e),
            message="Failed to authenticate with Google"
        )

@router.post("/facebook/login")
async def facebook_login(token: str = Query(...)):
    """Verify Facebook OAuth token."""
    if not token:
        return error_response(
            code="MISSING_TOKEN",
            details="Facebook token is required",
            message="Invalid request"
        )
    
    if not settings.FACEBOOK_APP_ID or not settings.FACEBOOK_APP_SECRET:
        return error_response(
            code="OAUTH_CONFIG_ERROR",
            details="Facebook OAuth not configured",
            message="Facebook OAuth credentials are missing"
        )
    
    try:
        # Verify token with Facebook
        verify_url = (
            f"https://graph.facebook.com/debug_token?"
            f"input_token={token}&"
            f"access_token={settings.FACEBOOK_APP_ID}|{settings.FACEBOOK_APP_SECRET}"
        )
        
        verify_response = requests.get(verify_url)
        verify_data = verify_response.json()
        
        if not verify_data.get("data", {}).get("is_valid"):
            return error_response(
                code="INVALID_TOKEN",
                details="Facebook token is invalid",
                message="Token verification failed"
            )
        
        # Get user info from Facebook
        user_info_url = f"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={token}"
        user_info_response = requests.get(user_info_url)
        user_info = user_info_response.json()
        
        # Check if user exists, if not create one
        existing_user = user_store.get_by_email(user_info.get("email", f"fb_{user_info['id']}@facebook.com"))
        if not existing_user:
            existing_user = user_store.create(
                phone=f"facebook_{user_info['id']}",
                password="",  # Empty for OAuth users
                name=user_info.get("name", ""),
                email=user_info.get("email", f"fb_{user_info['id']}@facebook.com"),
                role="customer"
            )
        
        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            data={"sub": existing_user["id"], "role": existing_user["role"]},
            expires_delta=access_token_expires
        )
        
        return success_response(
            data={
                "access_token": jwt_token,
                "token_type": "bearer",
                "user": {
                    "id": existing_user["id"],
                    "email": existing_user["email"],
                    "name": existing_user["name"],
                    "role": existing_user["role"],
                }
            },
            message="Facebook login successful"
        )
        
    except Exception as e:
        return error_response(
            code="OAUTH_ERROR",
            details=str(e),
            message="Failed to authenticate with Facebook"
        )

@router.get("/me", response_model=dict)
async def get_current_user(current_user: dict = Depends(deps_get_current_user)):
    """Get current authenticated user info."""
    if not current_user:
        return error_response(
            code="UNAUTHORIZED",
            details="Authentication required",
            message="Please provide a valid token"
        )
    
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
