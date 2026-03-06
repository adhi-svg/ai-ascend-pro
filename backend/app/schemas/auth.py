from pydantic import BaseModel, Field
from typing import Optional

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    password: str
    role: str = Field(..., description="'customer' or 'technician'")
    # Extra technician fields (optional)
    skill: Optional[str] = None
    experience: Optional[str] = None
    radius_km: Optional[str] = None
    base_visit_fee: Optional[str] = None
    has_shop: Optional[bool] = False
    shop_name: Optional[str] = None
    shop_address: Optional[str] = None
    shop_location: Optional[str] = None
    aadhaar_number: Optional[str] = None
    profile_photo_url: Optional[str] = None
    aadhaar_front_url: Optional[str] = None
    aadhaar_back_url: Optional[str] = None
    selfie_url: Optional[str] = None

class LoginRequest(BaseModel):
    phone: str
    password: str

class GoogleCodeExchangeRequest(BaseModel):
    code: str

class AuthUser(BaseModel):
    id: str
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: str
    profile_complete: bool
    created_at: str
