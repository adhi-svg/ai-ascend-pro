from fastapi import APIRouter, Depends, Query, BackgroundTasks, HTTPException
from typing import Optional, List
from app.core.deps import get_current_user, require_role
from app.schemas.booking import BookingCreate, BookingUpdateStatus, BookingAssign, OTPVerify, BookingRating, BookingPayment
from app.core.database import get_db
from app.models import User, Technician, Category, Booking, BookingStatusEnum, TechnicianStatusEnum
from app.utils.responses import success_response, error_response
from app.utils.otp import generate_otp, get_otp_expiry, is_otp_expired
from sqlalchemy.orm import Session
from datetime import datetime
import asyncio
import json

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def pick_best_technician(db: Session, category_id: str, exclude_ids: list = None):
    """
    Intelligent technician selection using scoring algorithm.
    """
    if exclude_ids is None:
        exclude_ids = []
    
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        return None
    
    # Get all online, approved technicians who aren't excluded
    all_techs = db.query(Technician).filter(
        Technician.status == TechnicianStatusEnum.APPROVED,
        Technician.is_online == True,
        ~Technician.id.in_(exclude_ids)
    ).all()
    
    # Filter by skill (JSON search)
    matching_techs = [t for t in all_techs if cat.name in (json.loads(t.skills or "[]"))]
    
    if not matching_techs:
        return None
    
    # Simple scoring logic
    scored_techs = []
    for tech in matching_techs:
        score = (tech.rating or 0) * 2
        # Check if tech has active bookings in the DB
        active_jobs = db.query(Booking).filter(
            Booking.technician_id == tech.user_id, # Match user_id not tech_id
            Booking.status.in_([BookingStatusEnum.ASSIGNED, BookingStatusEnum.IN_PROGRESS])
        ).count()
        if active_jobs == 0:
            score += 5
        scored_techs.append((tech, score))
    
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
        booking.technician_id = new_tech.user_id
        booking.status = BookingStatusEnum.ASSIGNED
        
        # Log reassignment event
        events = json.loads(booking.reassignment_events or "[]")
        events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "timeout",
            "previous_technician": str(previous_tech_id) if previous_tech_id else None,
            "new_technician": str(new_tech.user_id)
        })
        
        booking.reassignment_events = json.dumps(events)
        db.commit()
    else:
        # No technicians available, cancel booking
        booking.status = BookingStatusEnum.CANCELLED
        events = json.loads(booking.reassignment_events or "[]")
        events.append({
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "no_technicians_available",
            "previous_technician": str(previous_tech_id) if previous_tech_id else None
        })
        booking.reassignment_events = json.dumps(events)
        db.commit()

@router.post("", response_model=dict)
async def create_booking(
    req: BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new booking."""
    if current_user["role"] != "customer":
        return error_response(code="FORBIDDEN", details="Only customers can create bookings")
    
    # Validate category exists
    cat = db.query(Category).filter(Category.id == req.category_id).first()
    if not cat:
        return error_response(code="INVALID_CATEGORY", details="Category not found")
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry()
    
    booking = Booking(
        customer_id=current_user["id"],
        category_id=req.category_id,
        service_name=cat.name,
        description=req.notes or req.complaint_text,
        address=req.address,
        # Set lat/lng from request (defaults to 0 if missing for simplified demo if needed)
        latitude=0.0,
        longitude=0.0,
        city="Delhi", # Default or extract from address
        status=BookingStatusEnum.PENDING,
        otp_code=otp_code,
        otp_expiry=otp_expiry
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # If auto_assign requested, use intelligent dispatch
    if req.auto_assign:
        tech = pick_best_technician(db, req.category_id)
        if tech:
            booking.technician_id = tech.user_id # Important: technician_id is user_id in model
            booking.status = BookingStatusEnum.ASSIGNED
            db.commit()
            db.refresh(booking)
            background_tasks.add_task(auto_reassign_after_timeout, db, str(booking.id), 300)
        else:
            return error_response(code="NO_TECHNICIANS", details="No online technicians available")
    
    return success_response(data=booking, message="Booking created successfully")

@router.get("/me", response_model=dict)
async def get_my_bookings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get my bookings (customer)."""
    if current_user["role"] != "customer":
        return error_response(code="FORBIDDEN", details="Only customers can view their bookings")
    
    bookings = db.query(Booking).filter(Booking.customer_id == current_user["id"]).all()
    return success_response(data=bookings, message="Bookings retrieved successfully")

@router.get("/technician/me/bookings", response_model=dict)
async def get_my_technician_bookings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get my bookings (technician)."""
    if current_user["role"] != "technician":
        return error_response(code="FORBIDDEN", details="Only technicians can view their bookings")
    
    bookings = db.query(Booking).filter(Booking.technician_id == current_user["id"]).all()
    return success_response(data=bookings, message="Bookings retrieved successfully")

@router.patch("/{booking_id}/assign", response_model=dict)
async def assign_booking(
    booking_id: str,
    req: BookingAssign,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Assign a technician to a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    if req.auto_assign:
        tech = pick_best_technician(db, booking.category_id)
        if not tech:
            return error_response(code="NO_TECHNICIANS", details="No technicians available")
        tech_user_id = tech.user_id
    else:
        tech_user_id = req.technician_id
        if not tech_user_id:
            return error_response(code="INVALID_REQUEST", details="tech_id missing")
    
    booking.technician_id = tech_user_id
    booking.status = BookingStatusEnum.ASSIGNED
    db.commit()
    
    return success_response(data=booking, message="Assigned successfully")

@router.patch("/{booking_id}/status", response_model=dict)
async def update_booking_status(
    booking_id: str,
    req: BookingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update booking status."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    # Map status string to Enum
    try:
        new_status = BookingStatusEnum[req.status.upper()]
    except (KeyError, AttributeError):
        return error_response(code="INVALID_STATUS", details=f"Invalid status: {req.status}")

    # Check permissions
    if current_user["role"] == "technician":
        if booking.technician_id != current_user["id"]:
            return error_response(code="FORBIDDEN", details="You can only update your own bookings")
    elif current_user["role"] == "customer":
        if booking.customer_id != current_user["id"]:
            return error_response(code="FORBIDDEN", details="You can only update your own bookings")
        if new_status != BookingStatusEnum.CANCELLED:
            return error_response(code="INVALID_STATUS", details="Customers can only cancel bookings")
    
    booking.status = new_status
    if req.amount:
        booking.actual_cost = req.amount
    
    db.commit()
    return success_response(data=booking, message="Status updated successfully")

@router.post("/{booking_id}/otp/verify", response_model=dict)
async def verify_otp(
    booking_id: str,
    req: OTPVerify,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Verify OTP for a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    if booking.otp_verified_at:
        return success_response(data=booking, message="OTP already verified")
    
    if booking.otp_code != req.otp_code:
        return error_response(code="INVALID_OTP", details="Invalid OTP code")
    
    # Check expiry
    if booking.otp_expiry and booking.otp_expiry < datetime.utcnow():
        return error_response(code="EXPIRED_OTP", details="OTP has expired")
    
    booking.otp_verified_at = datetime.utcnow()
    db.commit()
    return success_response(data=booking, message="OTP verified successfully")

@router.post("/{booking_id}/rating", response_model=dict)
async def add_rating(
    booking_id: str,
    req: BookingRating,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add rating to a completed booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    if booking.rated_by_customer:
        return error_response(code="ALREADY_RATED", details="Already rated")
    
    booking.rating = req.rating
    booking.feedback = req.feedback
    booking.rated_by_customer = True
    
    # Update technician average rating
    if booking.technician_id:
        tech = db.query(Technician).filter(Technician.user_id == booking.technician_id).first()
        if tech:
            old_count = tech.rating_count or 0
            old_avg = tech.rating or 0.0
            new_count = old_count + 1
            new_avg = (old_avg * old_count + req.rating) / new_count
            tech.rating = round(new_avg, 2)
            tech.rating_count = new_count
    
    db.commit()
    return success_response(data=booking, message="Rating added")

@router.post("/{booking_id}/payment", response_model=dict)
async def process_payment(
    booking_id: str,
    req: BookingPayment,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Process payment for a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return error_response(code="NOT_FOUND", details="Booking not found")
    
    booking.payment_mode = req.method
    booking.payment_status = "PAID"
    booking.actual_cost = req.amount
    booking.status = BookingStatusEnum.COMPLETED
    
    db.commit()
    return success_response(data=booking, message="Payment confirmed")
