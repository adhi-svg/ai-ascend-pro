from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    category_id: str
    address: Optional[str] = None
    notes: Optional[str] = None
    complaint_text: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_urgency: Optional[str] = None
    auto_assign: Optional[bool] = False

class BookingUpdateStatus(BaseModel):
    status: str  # ACCEPTED, ON_THE_WAY, IN_PROGRESS, COMPLETED, CANCELLED
    amount: Optional[float] = None

class BookingAssign(BaseModel):
    technician_id: Optional[str] = None
    auto_assign: Optional[bool] = False

class OTPVerify(BaseModel):
    otp_code: str

class BookingRating(BaseModel):
    rating: int  # 1-5
    feedback: Optional[str] = None

class BookingPayment(BaseModel):
    method: str
    amount: float

class BookingResponse(BaseModel):
    id: str
    customer_id: str
    technician_id: Optional[str] = None
    category_id: str
    status: str
    address: Optional[str] = None
    notes: Optional[str] = None
    scheduled_at: Optional[str] = None
    otp_code: Optional[str] = None
    payment_mode: Optional[str] = None
    amount: Optional[float] = None
    rating: Optional[int] = None
    feedback: Optional[str] = None
    created_at: str
    updated_at: str
