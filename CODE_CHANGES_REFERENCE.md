# Code Changes Summary - Exact Files Modified

## CRITICAL CHANGES REFERENCE

---

## 1. NEW FILE: `app/stores/tracking_store.py`

```python
import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryTrackingStore:
    """Store location history for technicians per booking."""
    
    def __init__(self):
        self.locations: Dict[str, Dict] = {}
        self.booking_index: Dict[str, str] = {}  # booking_id -> latest location_id
        self.technician_booking_index: Dict[str, List[str]] = {}  # (tech_id, booking_id) -> [location_ids]
    
    def save_location(self, technician_id: str, booking_id: str, latitude: float, longitude: float) -> Dict:
        """Save location update for technician on a booking."""
        location_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        location = {
            "id": location_id,
            "technician_id": technician_id,
            "booking_id": booking_id,
            "latitude": latitude,
            "longitude": longitude,
            "created_at": now,
        }
        
        self.locations[location_id] = location
        self.booking_index[booking_id] = location_id  # Keep latest
        
        # Track by (tech_id, booking_id)
        key = f"{technician_id}:{booking_id}"
        if key not in self.technician_booking_index:
            self.technician_booking_index[key] = []
        self.technician_booking_index[key].append(location_id)
        
        return location
    
    def get_latest_location(self, booking_id: str) -> Optional[Dict]:
        """Get the latest location for a booking."""
        location_id = self.booking_index.get(booking_id)
        return self.locations.get(location_id) if location_id else None
    
    def get_location_history(self, technician_id: str, booking_id: str) -> List[Dict]:
        """Get all location updates for a technician on a booking."""
        key = f"{technician_id}:{booking_id}"
        location_ids = self.technician_booking_index.get(key, [])
        return [self.locations[lid] for lid in location_ids if lid in self.locations]
    
    def get_all(self) -> List[Dict]:
        return list(self.locations.values())

tracking_store = InMemoryTrackingStore()
```

---

## 2. MODIFIED: `app/stores/booking_store.py`

**Change: Update verify_otp method to return tuple for idempotency**

```python
def verify_otp(self, booking_id: str, otp_code: str) -> tuple:
    """Verify OTP. Returns (success: bool, already_verified: bool)"""
    booking = self.bookings.get(booking_id)
    if not booking:
        return False, False
    
    # If already verified, return success but mark as already verified
    if booking.get("otp_verified_at"):
        return True, True
    
    if booking["otp_code"] != otp_code:
        return False, False
    
    if is_otp_expired(datetime.fromisoformat(booking["otp_expiry"])):
        return False, False
    
    booking["otp_verified_at"] = datetime.utcnow().isoformat()
    return True, False
```

---

## 3. MODIFIED: `app/stores/technician_store.py`

**Change: Add rating_count field**

In the `create()` method, update the technician dict initialization:

```python
technician = {
    "id": tech_id,
    "user_id": user_id,
    "skills": skills or [],
    "rating": 0.0,
    "rating_count": 0,  # NEW FIELD
    "total_jobs": 0,
    "city": None,
    "area": None,
    "latitude": None,
    "longitude": None,
    "shop_available": False,
    "is_online": False,
    "created_at": now,
}
```

---

## 4. MODIFIED: `app/api/v1/endpoints/bookings.py`

### A. Enhanced assign endpoint with skill validation & status checks:

```python
@router.patch("/{booking_id}/assign", response_model=dict)
async def assign_booking(
    booking_id: str,
    req: BookingAssign,
    current_user: dict = Depends(get_current_user)
):
    """Assign a technician to a booking."""
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Prevent assign if COMPLETED or CANCELLED
    if booking["status"] in ["COMPLETED", "CANCELLED"]:
        return error_response(
            code="INVALID_STATUS",
            details=f"Cannot assign booking with status {booking['status']}"
        )
    
    # Check permissions - only customer or admin can assign
    if booking["customer_id"] != current_user["id"] and current_user["role"] != "admin":
        return error_response(
            code="FORBIDDEN",
            details="You can only assign your own bookings"
        )
    
    if req.auto_assign:
        # Auto-assign: pick first online technician with matching category skill
        cat = category_store.get_by_id(booking["category_id"])
        if not cat:
            return error_response(
                code="INVALID_CATEGORY",
                details="Category not found"
            )
        
        # Find technicians with this category skill that are online
        all_techs = technician_store.get_all()
        matching_techs = [
            t for t in all_techs 
            if cat["name"] in t["skills"] and t["is_online"]
        ]
        
        if not matching_techs:
            return error_response(
                code="NO_TECHNICIANS",
                details="No online technicians available for this category"
            )
        
        technician_id = matching_techs[0]["id"]
    else:
        technician_id = req.technician_id
        if not technician_id:
            return error_response(
                code="INVALID_REQUEST",
                details="Either auto_assign or technician_id must be provided"
            )
    
    # Verify technician exists
    tech = technician_store.get_by_id(technician_id)
    if not tech:
        return error_response(
            code="TECHNICIAN_NOT_FOUND",
            details="Technician not found"
        )
    
    # Verify technician has matching skill
    cat = category_store.get_by_id(booking["category_id"])
    if cat and cat["name"] not in tech["skills"]:
        return error_response(
            code="SKILL_MISMATCH",
            details=f"Technician does not have skill: {cat['name']}"
        )
    
    booking = booking_store.assign_technician(booking_id, technician_id)
    
    return success_response(
        data=booking,
        message="Booking assigned successfully"
    )
```

### B. Enhanced status update with customer cancel validation:

```python
@router.patch("/{booking_id}/status", response_model=dict)
async def update_booking_status(
    booking_id: str,
    req: BookingUpdateStatus,
    current_user: dict = Depends(get_current_user)
):
    """Update booking status."""
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Check permissions and allowed statuses
    if current_user["role"] == "technician":
        tech = technician_store.get_by_user_id(current_user["id"])
        if not tech or booking["technician_id"] != tech["id"]:
            return error_response(
                code="FORBIDDEN",
                details="You can only update your own bookings"
            )
        # Technicians can: ACCEPTED, ON_THE_WAY, IN_PROGRESS, COMPLETED, CANCELLED
        allowed_statuses = ["ACCEPTED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
        if req.status not in allowed_statuses:
            return error_response(
                code="INVALID_STATUS",
                details=f"Invalid status for technician: {req.status}"
            )
    elif current_user["role"] == "customer":
        if booking["customer_id"] != current_user["id"]:
            return error_response(
                code="FORBIDDEN",
                details="You can only update your own bookings"
            )
        # Customers can only CANCEL, and only if not COMPLETED
        if req.status != "CANCELLED":
            return error_response(
                code="INVALID_STATUS",
                details="Customers can only cancel bookings"
            )
        if booking["status"] == "COMPLETED":
            return error_response(
                code="INVALID_STATUS",
                details="Cannot cancel a completed booking"
            )
    else:
        return error_response(
            code="FORBIDDEN",
            details="Only technicians and customers can update booking status"
        )
    
    booking = booking_store.update(booking_id, status=req.status, amount=req.amount)
    
    # If status is COMPLETED and amount provided, create earning exactly once
    if req.status == "COMPLETED" and req.amount and booking["technician_id"]:
        existing_earning = earning_store.get_by_booking(booking_id)
        if not existing_earning:
            earning_store.create(
                technician_id=booking["technician_id"],
                booking_id=booking_id,
                amount=req.amount
            )
    
    return success_response(
        data=booking,
        message="Booking status updated successfully"
    )
```

### C. Enhanced OTP verify with idempotency:

```python
@router.post("/{booking_id}/otp/verify", response_model=dict)
async def verify_otp(
    booking_id: str,
    req: OTPVerify,
    current_user: dict = Depends(get_current_user)
):
    """Verify OTP for a booking."""
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Only customer can verify OTP
    if booking["customer_id"] != current_user["id"]:
        return error_response(
            code="FORBIDDEN",
            details="You can only verify OTP for your own bookings"
        )
    
    success, already_verified = booking_store.verify_otp(booking_id, req.otp_code)
    
    if not success:
        return error_response(
            code="INVALID_OTP",
            details="Invalid or expired OTP"
        )
    
    booking = booking_store.get_by_id(booking_id)
    
    if already_verified:
        return success_response(
            data=booking,
            message="OTP already verified successfully"
        )
    
    return success_response(
        data=booking,
        message="OTP verified successfully"
    )
```

### D. Enhanced rating with duplicate prevention and correct average:

```python
@router.post("/{booking_id}/rating", response_model=dict)
async def add_rating(
    booking_id: str,
    req: BookingRating,
    current_user: dict = Depends(get_current_user)
):
    """Add rating to a completed booking."""
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return error_response(
            code="NOT_FOUND",
            details="Booking not found"
        )
    
    # Only customer can rate
    if booking["customer_id"] != current_user["id"]:
        return error_response(
            code="FORBIDDEN",
            details="You can only rate your own bookings"
        )
    
    # Only if COMPLETED
    if booking["status"] != "COMPLETED":
        return error_response(
            code="INVALID_STATUS",
            details="You can only rate completed bookings"
        )
    
    # Prevent duplicate rating
    if booking.get("rated_by_customer"):
        return error_response(
            code="ALREADY_RATED",
            details="You have already rated this booking"
        )
    
    # Validate rating range
    if req.rating < 1 or req.rating > 5:
        return error_response(
            code="INVALID_RATING",
            details="Rating must be between 1 and 5"
        )
    
    # Update booking with rating
    booking = booking_store.update(
        booking_id, 
        rating=req.rating, 
        feedback=req.feedback,
        rated_by_customer=True
    )
    
    # Update technician rating using correct average formula
    if booking["technician_id"]:
        tech = technician_store.get_by_id(booking["technician_id"])
        if tech:
            tech_bookings = booking_store.get_by_technician(booking["technician_id"])
            ratings = [b["rating"] for b in tech_bookings if b["rating"] is not None]
            
            if ratings:
                # New average = (old_avg * old_count + new_rating) / (old_count + 1)
                old_count = tech["rating_count"]
                old_avg = tech["rating"]
                new_count = old_count + 1
                new_avg = (old_avg * old_count + req.rating) / new_count
                
                technician_store.update(
                    booking["technician_id"],
                    rating=round(new_avg, 2),
                    rating_count=new_count,
                    total_jobs=len([b for b in tech_bookings if b["status"] == "COMPLETED"])
                )
    
    return success_response(
        data=booking,
        message="Rating added successfully"
    )
```

---

## 5. MODIFIED: `app/api/v1/endpoints/tracking.py`

**Complete replacement with validation:**

```python
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
```

---

## 6. MODIFIED: `app/schemas/earning.py`

```python
from pydantic import BaseModel
from typing import Optional, List

class EarningResponse(BaseModel):
    id: str
    technician_id: str
    booking_id: str
    amount: float
    payout_date: Optional[str] = None
    created_at: str  # NEW FIELD

class BookingRecord(BaseModel):  # NEW CLASS
    booking_id: str
    status: str
    amount: Optional[float] = None
    rating: Optional[int] = None
    created_at: str

class AnalyticsResponse(BaseModel):
    total_earnings: float
    total_jobs_completed: int  # Changed from total_jobs
    avg_rating: float
    range: str  # NEW FIELD
    last_10_bookings: List[BookingRecord]  # Changed type
```

---

## 7. MODIFIED: `app/schemas/common.py`

```python
from pydantic import BaseModel
from typing import Optional, Any

class LocationUpdate(BaseModel):
    booking_id: str
    lat: float
    lng: float

class LocationResponse(BaseModel):  # NEW CLASS
    booking_id: str
    technician_id: str
    technician_name: Optional[str] = None
    latitude: float
    longitude: float
    updated_at: str
```

---

## 8. MODIFIED: `app/api/v1/endpoints/earnings.py`

**Change: Fix FastAPI deprecation warning**

```python
# OLD:
range: str = Query("month", regex="^(week|month|year)$"),

# NEW:
range: str = Query("month", pattern="^(week|month|year)$"),
```

---

## SUMMARY OF CHANGES BY FILE

| File | Change Type | What Changed |
|------|-------------|--------------|
| `app/stores/tracking_store.py` | **NEW** | Location history storage |
| `app/stores/booking_store.py` | Modified | `verify_otp()` returns tuple for idempotency |
| `app/stores/technician_store.py` | Modified | Added `rating_count` field |
| `app/api/v1/endpoints/bookings.py` | Modified | Enhanced all 4 critical endpoints with validations |
| `app/api/v1/endpoints/tracking.py` | Modified | Complete rewrite with location endpoint + validations |
| `app/schemas/earning.py` | Modified | Updated field names and added BookingRecord class |
| `app/schemas/common.py` | Modified | Added LocationResponse class |
| `app/api/v1/endpoints/earnings.py` | Modified | Fixed Query deprecation warning |

---

✅ **All changes complete and tested**
Server running successfully with all new functionality!
