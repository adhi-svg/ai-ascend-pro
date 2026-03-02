from pydantic import BaseModel
from typing import Optional, Any

class LocationUpdate(BaseModel):
    booking_id: str
    lat: float
    lng: float

class LocationResponse(BaseModel):
    booking_id: str
    technician_id: str
    technician_name: Optional[str] = None
    latitude: float
    longitude: float
    updated_at: str
