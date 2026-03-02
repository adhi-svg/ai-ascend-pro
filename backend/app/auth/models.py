from pydantic import BaseModel, EmailStr
from typing import Literal

class User(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
    role: Literal["Citizen", "Technician", "Admin"] = "Citizen"
    is_active: bool = True
