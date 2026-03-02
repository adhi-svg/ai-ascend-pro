from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TechnicianUpdate(BaseModel):
    skills: Optional[List[str]] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    shop_available: Optional[bool] = None

class TechnicianResponse(BaseModel):
    id: str
    user_id: str
    skills: List[str]
    rating: float
    total_jobs: int
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    shop_available: bool
    is_online: bool
    name: Optional[str] = None
    phone: str
    created_at: str

class TechnicianApplicationSchema(BaseModel):
    """Schema for technician application and profile."""
    id: str
    user_id: str
    status: str  # pending, approved, rejected, suspended
    skills: Optional[str] = None
    category_id: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float
    rating_count: int
    completed_jobs: int
    cancelled_jobs: int
    completion_rate: float
    cancellation_rate: float
    is_online: bool
    is_busy: bool
    is_available: bool
    profile_image_url: Optional[str] = None
    documents: Optional[str] = None
    performance_score: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TechnicianSchema(BaseModel):
    """Detailed technician profile schema."""
    id: str
    user_id: str
    status: str
    skills: Optional[str] = None
    category_id: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float
    rating_count: int
    total_jobs: int
    completed_jobs: int
    cancelled_jobs: int
    completion_rate: float
    cancellation_rate: float
    is_online: bool
    is_busy: bool
    is_available: bool
    shop_available: bool
    profile_image_url: Optional[str] = None
    documents: Optional[str] = None
    performance_score: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

