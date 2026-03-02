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
