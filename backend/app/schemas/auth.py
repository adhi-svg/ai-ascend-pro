from pydantic import BaseModel, Field, field_validator
from typing import Optional

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number (10-15 digits)")
    name: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
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

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        cleaned = v.strip().lstrip("+")
        if not cleaned.replace("-", "").replace(" ", "").isdigit():
            raise ValueError("Phone must contain only digits, spaces, hyphens, or leading +")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if v is not None and v.strip():
            if "@" not in v or "." not in v.split("@")[-1]:
                raise ValueError("Invalid email format")
        return v

class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=1)

class GoogleCodeExchangeRequest(BaseModel):
    code: str
    role: str = "customer"

class AuthUser(BaseModel):
    id: str
    phone: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: str
    profile_complete: bool
    created_at: str
