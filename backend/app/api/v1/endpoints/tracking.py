from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.stores.technician_store import technician_store
from app.stores.booking_store import booking_store
from app.stores.tracking_store import tracking_store
from app.schemas.common import LocationUpdate
from app.utils.responses import success_response, error_response
from app.ws.manager import manager

router = APIRouter(tags=["Tracking"])

@router.post("/technicians/me/location", response_model=dict)
async def update_location(
    payload: LocationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """REST fallback for location updates (technician only)."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can update location"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    # Validate booking exists
    booking = booking_store.get_by_id(payload.booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Validate technician is assigned to this booking
    if booking["technician_id"] != tech["id"]:
        return error_response(
            code="FORBIDDEN",
            details="You are not assigned to this booking"
        )
    
    # Validate booking status is active
    allowed_statuses = ["ASSIGNED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS"]
    if booking["status"] not in allowed_statuses:
        return error_response(
            code="INVALID_STATUS",
            details=f"Cannot update location for booking with status {booking['status']}"
        )
    
    # Update technician location
    tech = technician_store.update(
        tech["id"],
        latitude=payload.lat,
        longitude=payload.lng
    )
    
    # Save location history
    location = tracking_store.save_location(
        technician_id=tech["id"],
        booking_id=payload.booking_id,
        latitude=payload.lat,
        longitude=payload.lng
    )
    
    # Broadcast to WebSocket clients
    await manager.broadcast_location(
        booking_id=payload.booking_id,
        technician_id=tech["id"],
        lat=payload.lat,
        lng=payload.lng
    )
    
    return success_response(
        data={
            "technician_id": tech["id"],
            "booking_id": payload.booking_id,
            "latitude": payload.lat,
            "longitude": payload.lng,
            "created_at": location["created_at"]
        },
        message="Location updated successfully"
    )

@router.get("/bookings/{booking_id}/location", response_model=dict)
async def get_booking_location(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get last known technician location for a booking (customer only)."""
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Only booking's customer can view
    if booking["customer_id"] != current_user["id"]:
        return error_response(
            code="FORBIDDEN",
            details="You can only view location for your own bookings"
        )
    
    # Only if technician is assigned
    if not booking["technician_id"]:
        return error_response(
            code="NOT_ASSIGNED",
            details="No technician assigned to this booking yet"
        )
    
    # Get latest location
    location = tracking_store.get_latest_location(booking_id)
    
    if not location:
        return error_response(
            code="NO_LOCATION",
            details="Technician location not yet available"
        )
    
    # Enrich with technician info
    tech = technician_store.get_by_id(booking["technician_id"])
    
    return success_response(
        data={
            "booking_id": location["booking_id"],
            "technician_id": location["technician_id"],
            "technician_name": tech["user_id"] if tech else None,
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "updated_at": location["created_at"]
        },
        message="Location retrieved successfully"
    )

