from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.core.database import get_db
from app.models import Technician, Booking, BookingStatusEnum
from app.schemas.common import LocationUpdate
from app.utils.responses import success_response, error_response
from sqlalchemy.orm import Session
from datetime import datetime

router = APIRouter(tags=["Tracking"])

@router.post("/technicians/me/location", response_model=dict)
async def update_location(
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """REST fallback for location updates (technician only)."""
    if current_user["role"] != "technician":
        return error_response(code="FORBIDDEN", details="Only technicians can update location")
    
    # Get technician record
    tech = db.query(Technician).filter(Technician.user_id == current_user["id"]).first()
    if not tech:
        return error_response(code="NOT_FOUND", details="Technician profile not found")
    
    # Validate booking exists
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    # Validate technician is assigned to this booking (technician_id in model is user_id)
    if booking.technician_id != current_user["id"]:
        return error_response(code="FORBIDDEN", details="You are not assigned to this booking")
    
    # Update technician location in technician record
    tech.latitude = payload.lat
    tech.longitude = payload.lng
    
    # Update technician location in booking record for real-time tracking
    booking.technician_latitude = payload.lat
    booking.technician_longitude = payload.lng
    
    db.commit()
    
    return success_response(
        data={
            "technician_id": tech.id,
            "booking_id": payload.booking_id,
            "latitude": payload.lat,
            "longitude": payload.lng,
            "updated_at": datetime.utcnow().isoformat()
        },
        message="Location updated successfully"
    )

@router.get("/bookings/{booking_id}/location", response_model=dict)
async def get_booking_location(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get last known technician location for a booking (customer only)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    # Only booking's customer can view
    if booking.customer_id != current_user["id"]:
        return error_response(code="FORBIDDEN", details="You can only view location for your own bookings")
    
    if not booking.technician_latitude or not booking.technician_longitude:
        return error_response(code="NO_LOCATION", details="Location not available")
    
    return success_response(
        data={
            "booking_id": booking.id,
            "latitude": booking.technician_latitude,
            "longitude": booking.technician_longitude,
            "updated_at": booking.updated_at.isoformat()
        },
        message="Location retrieved successfully"
    )

