from pydantic import BaseModel, EmailStr, Field
from typing import Literal

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    role: Literal["Citizen", "Technician", "Admin"] = "Citizen"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
