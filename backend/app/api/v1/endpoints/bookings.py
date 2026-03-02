from fastapi import APIRouter, Depends, Query, BackgroundTasks
from typing import Optional
from app.core.deps import get_current_user, require_role
from app.schemas.booking import BookingCreate, BookingUpdateStatus, BookingAssign, OTPVerify, BookingRating
from app.stores.booking_store import booking_store
from app.stores.user_store import user_store
from app.stores.technician_store import technician_store
from app.stores.category_store import category_store
from app.stores.earning_store import earning_store
from app.utils.responses import success_response, error_response
from app.utils.otp import is_otp_expired
from datetime import datetime
import asyncio

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def pick_best_technician(category_id: str, exclude_ids: list = None):
    """
    Intelligent technician selection using scoring algorithm.
    Scoring: rating * 2 + (5 if no active job) + (3 if in same area)
    Returns the highest-scoring online technician with skill match.
    """
    if exclude_ids is None:
        exclude_ids = []
    
    cat = category_store.get_by_id(category_id)
    if not cat:
        return None
    
    all_techs = technician_store.get_all()
    matching_techs = [
        t for t in all_techs 
        if cat["name"] in t["skills"] 
        and t["is_online"] 
        and t["id"] not in exclude_ids
    ]
    
    if not matching_techs:
        return None
    
    # Score each technician
    scored_techs = []
    for tech in matching_techs:
        score = tech.get("rating", 0) * 2
        
        # Bonus for no active jobs
        tech_bookings = booking_store.get_by_technician(tech["id"])
        active_jobs = [
            b for b in tech_bookings 
            if b["status"] in ["ASSIGNED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS"]
        ]
        if not active_jobs:
            score += 5
        
        # Area bonus (placeholder - would need booking location)
        # score += 3 if tech["area"] == booking_area else 0
        
        scored_techs.append((tech, score))
    
    # Return technician with highest score
    scored_techs.sort(key=lambda x: x[1], reverse=True)
    return scored_techs[0][0] if scored_techs else None

async def auto_reassign_after_timeout(booking_id: str, timeout: int = 300):
    """
    Background task to automatically reassign booking after timeout.
    Runs 5 minutes after assignment if still PENDING/ASSIGNED.
    """
    await asyncio.sleep(timeout)
    
    booking = booking_store.get_by_id(booking_id)
    if not booking:
        return
    
    # Only reassign if still waiting for technician action
    if booking["status"] not in ["PENDING", "ASSIGNED"]:
        return
    
    # Check reassignment limit
    if booking.get("reassign_count", 0) >= 2:
        # Max reassignments reached, mark as failed
        booking_store.update(booking_id, status="CANCELLED")
        events = booking.get("reassignment_events", [])
        events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "max_reassignments_reached",
            "previous_technician": booking.get("technician_id")
        })
        booking_store.update(booking_id, reassignment_events=events)
        return
    
    # Get previous technician to exclude
    previous_tech_id = booking.get("technician_id")
    exclude_ids = [previous_tech_id] if previous_tech_id else []
    
    # Try to find new technician
    new_tech = pick_best_technician(booking["category_id"], exclude_ids=exclude_ids)
    
    if new_tech:
        # Reassign to new technician
        booking_store.assign_technician(booking_id, new_tech["id"])
        
        # Log reassignment event
        events = booking.get("reassignment_events", [])
        events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "timeout",
            "previous_technician": previous_tech_id,
            "new_technician": new_tech["id"]
        })
        
        reassign_count = booking.get("reassign_count", 0) + 1
        booking_store.update(
            booking_id, 
            reassignment_events=events,
            reassign_count=reassign_count
        )
        
        # Schedule next reassignment check
        if reassign_count < 2:
            asyncio.create_task(auto_reassign_after_timeout(booking_id, timeout))
    else:
        # No technicians available, cancel booking
        booking_store.update(booking_id, status="CANCELLED")
        events = booking.get("reassignment_events", [])
        events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "no_technicians_available",
            "previous_technician": previous_tech_id
        })
        booking_store.update(booking_id, reassignment_events=events)

@router.post("", response_model=dict)
async def create_booking(
    req: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new booking."""
    if current_user["role"] != "customer":
        return error_response(
            code="FORBIDDEN",
            details="Only customers can create bookings"
        )
    
    # Validate category exists
    cat = category_store.get_by_id(req.category_id)
    if not cat:
        return error_response(
            code="INVALID_CATEGORY",
            details="Category not found"
        )
    
    booking = booking_store.create(
        customer_id=current_user["id"],
        category_id=req.category_id,
        address=req.address,
        notes=req.notes,
        complaint_text=req.complaint_text,
        complaint_category=req.complaint_category,
        complaint_urgency=req.complaint_urgency,
    )
    
    # If auto_assign requested, use intelligent dispatch
    if req.auto_assign:
        tech = pick_best_technician(req.category_id)
        if tech:
            booking = booking_store.assign_technician(booking["id"], tech["id"])
            # Schedule auto-reassignment after timeout
            background_tasks.add_task(auto_reassign_after_timeout, booking["id"], 300)
        else:
            return error_response(
                code="NO_TECHNICIANS",
                details="No online technicians available for this category"
            )
    
    return success_response(
        data=booking,
        message="Booking created successfully"
    )

@router.get("/me", response_model=dict)
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    """Get my bookings (customer)."""
    if current_user["role"] != "customer":
        return error_response(
            code="FORBIDDEN",
            details="Only customers can view their bookings"
        )
    
    bookings = booking_store.get_by_customer(current_user["id"])
    return success_response(
        data=bookings,
        message="Bookings retrieved successfully"
    )

@router.get("/technician/me/bookings", response_model=dict)
async def get_my_technician_bookings(current_user: dict = Depends(get_current_user)):
    """Get my bookings (technician)."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can view their bookings"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    bookings = booking_store.get_by_technician(tech["id"])
    return success_response(
        data=bookings,
        message="Bookings retrieved successfully"
    )

@router.patch("/{booking_id}/assign", response_model=dict)
async def assign_booking(
    booking_id: str,
    req: BookingAssign,
    background_tasks: BackgroundTasks,
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
        # Use intelligent dispatch
        tech = pick_best_technician(booking["category_id"])
        if not tech:
            return error_response(
                code="NO_TECHNICIANS",
                details="No online technicians available for this category"
            )
        technician_id = tech["id"]
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
    
    # Schedule auto-reassignment after timeout
    background_tasks.add_task(auto_reassign_after_timeout, booking_id, 300)
    
    return success_response(
        data=booking,
        message="Booking assigned successfully"
    )

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
