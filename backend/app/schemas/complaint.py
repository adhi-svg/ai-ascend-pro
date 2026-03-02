from pydantic import BaseModel
from typing import Optional

class ComplaintCreate(BaseModel):
    booking_id: Optional[str] = None
    title: str
    description: str

class ComplaintResponse(BaseModel):
    id: str
    user_id: str
    booking_id: Optional[str] = None
    title: str
    description: str
    status: str
    created_at: str
