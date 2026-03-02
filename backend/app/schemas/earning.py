from pydantic import BaseModel
from typing import Optional, List

class EarningResponse(BaseModel):
    id: str
    technician_id: str
    booking_id: str
    amount: float
    payout_date: Optional[str] = None
    created_at: str

class BookingRecord(BaseModel):
    booking_id: str
    status: str
    amount: Optional[float] = None
    rating: Optional[int] = None
    created_at: str

class AnalyticsResponse(BaseModel):
    total_earnings: float
    total_jobs_completed: int
    avg_rating: float
    range: str
    last_10_bookings: List[BookingRecord]
