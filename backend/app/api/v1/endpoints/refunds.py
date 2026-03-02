"""Refund and cancellation logic endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import logging

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models import (
    Booking, BookingStatusEnum, Technician, RefundLog, RefundStatusEnum, 
    User, UserRoleEnum
)
from app.utils.responses import success_response
from app.utils.assignment import update_technician_metrics, get_eligible_technicians
from app.utils.sns_manager import sns_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/bookings", tags=["bookings"])


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel a booking.
    
    Cancellation logic:
    - If technician cancels after confirmation: apply penalty
    - If emergency: apply double penalty
    - Attempt reassignment (max 3 attempts)
    - If no one available: initiate refund
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check authorization: customer or assigned technician can cancel
    is_customer = current_user["id"] == booking.customer_id
    is_technician = booking.technician_id and current_user["id"] == booking.technician_id
    
    if not (is_customer or is_technician) and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel")
    
    # Cannot cancel already completed or cancelled bookings
    if booking.status in [BookingStatusEnum.COMPLETED, BookingStatusEnum.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")
    
    # Update booking
    booking.status = BookingStatusEnum.CANCELLED
    booking.cancellation_reason = reason
    booking.cancelled_by = "technician" if is_technician else "customer"
    booking.cancelled_at = datetime.utcnow()
    
    # Apply penalty to technician if they cancelled after confirmation
    if is_technician and booking.status == BookingStatusEnum.CONFIRMED:
        tech = db.query(Technician).filter(Technician.id == booking.technician_id_active).first()
        if tech:
            # Apply cancellation penalty
            tech.cancelled_jobs += 1
            
            # Double penalty for emergency
            if booking.is_emergency:
                tech.cancelled_jobs += 1
            
            tech.total_jobs = tech.completed_jobs + tech.cancelled_jobs
            if tech.total_jobs > 0:
                tech.cancellation_rate = tech.cancelled_jobs / tech.total_jobs
                # Reduce rating slightly
                if tech.rating > 0:
                    tech.rating = max(0, tech.rating - 0.5)
            
            tech.is_busy = False
            db.add(tech)
            logger.info(f"✓ Penalty applied to technician {tech.id}")
    
    # Try reassignment if technician cancelled
    if is_technician and booking.status in [BookingStatusEnum.PENDING, BookingStatusEnum.ASSIGNED]:
        eligible = get_eligible_technicians(db, booking)
        
        assigned = False
        for i, (tech, score) in enumerate(eligible[:3]):  # Max 3 attempts
            try:
                tech.is_busy = True
                booking.technician_id = tech.user_id
                booking.technician_id_active = tech.id
                booking.status = BookingStatusEnum.ASSIGNED
                booking.assignment_attempts = (booking.assignment_attempts or 0) + 1
                
                db.add(tech)
                db.add(booking)
                db.commit()
                
                logger.info(f"✓ Booking reassigned to technician {tech.id}")
                assigned = True
                break
                
            except Exception as e:
                logger.warning(f"Reassignment attempt {i+1} failed: {str(e)}")
                db.rollback()
                continue
        
        if not assigned:
            # No available technician, initiate refund
            booking.status = BookingStatusEnum.FAILED
            booking.refund_status = RefundStatusEnum.PENDING
            logger.info(f"✓ No technician available, refund initiated for booking {booking_id}")
    
    db.add(booking)
    db.commit()
    
    return success_response(
        data={"booking_id": booking.id, "status": booking.status},
        message="Booking cancelled"
    )


@router.patch("/{booking_id}/refund", dependencies=[Depends(require_role(["admin"]))])
async def process_refund(
    booking_id: str,
    refund_amount: float = None,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Process refund for a booking (admin only).
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Use booking amount if not specified
    amount = refund_amount or float(booking.estimated_cost or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid refund amount")
    
    try:
        # Create refund log
        refund_log = RefundLog(
            booking_id=booking_id,
            initiated_by_user_id=current_user["id"],
            amount=amount,
            reason=reason,
            status=RefundStatusEnum.INITIATED
        )
        
        # Update booking
        booking.refund_status = RefundStatusEnum.INITIATED
        booking.refund_amount = amount
        
        db.add(refund_log)
        db.add(booking)
        db.commit()
        
        logger.info(f"✓ Refund processed for booking {booking_id}: ${amount}")
        
        return success_response(
            data={
                "refund_id": refund_log.id,
                "booking_id": booking_id,
                "amount": amount,
                "status": refund_log.status
            },
            message="Refund processed"
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Refund processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process refund")


@router.get("/refunds", dependencies=[Depends(require_role(["admin"]))])
async def get_all_refunds(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all refunds (admin only)."""
    query = db.query(RefundLog)
    
    if status:
        try:
            query = query.filter(RefundLog.status == RefundStatusEnum[status.upper()])
        except KeyError:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    refunds = query.order_by(RefundLog.created_at.desc()).all()
    
    return success_response(
        data=[{
            "id": r.id,
            "booking_id": r.booking_id,
            "amount": str(r.amount),
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        } for r in refunds],
        message=f"Found {len(refunds)} refunds"
    )


@router.patch("/refund/{refund_id}/complete", dependencies=[Depends(require_role(["admin"]))])
async def complete_refund(
    refund_id: str,
    transaction_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark refund as completed."""
    refund = db.query(RefundLog).filter(RefundLog.id == refund_id).first()
    
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found")
    
    refund.status = RefundStatusEnum.COMPLETED
    refund.processed_at = datetime.utcnow()
    if transaction_id:
        refund.transaction_id = transaction_id
    
    # Update booking
    booking = db.query(Booking).filter(Booking.id == refund.booking_id).first()
    if booking:
        booking.refund_status = RefundStatusEnum.COMPLETED
        db.add(booking)
    
    db.add(refund)
    db.commit()
    
    logger.info(f"✓ Refund completed: {refund_id}")
    
    return success_response(
        data={"refund_id": refund.id, "status": refund.status},
        message="Refund completed"
    )
