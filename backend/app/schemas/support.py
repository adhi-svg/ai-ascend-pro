"""Support ticket schemas."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateSupportTicketSchema(BaseModel):
    """Schema for creating support ticket."""
    subject: str
    description: str
    category: Optional[str] = None
    priority: Optional[str] = "NORMAL"
    booking_id: Optional[str] = None


class SupportTicketSchema(BaseModel):
    """Support ticket response schema."""
    id: str
    user_id: str
    booking_id: Optional[str] = None
    subject: str
    description: str
    category: Optional[str] = None
    priority: str
    status: str  # open, in_progress, resolved, closed
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    assigned_admin_id: Optional[str] = None
    attachment_urls: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
