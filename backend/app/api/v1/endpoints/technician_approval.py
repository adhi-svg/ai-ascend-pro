"""Technician approval and application endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models import User, Technician, TechnicianStatusEnum, UserRoleEnum
from app.schemas.technician import TechnicianApplicationSchema, TechnicianSchema
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/technician", tags=["technician"])


@router.get("/applications", dependencies=[Depends(require_role(["admin"]))])
async def get_all_applications(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all technician applications (admin only).
    
    Query params:
    - status: Filter by status (pending/approved/rejected/suspended)
    """
    query = db.query(Technician)
    
    if status:
        query = query.filter(Technician.status == TechnicianStatusEnum[status.upper()])
    
    technicians = query.all()
    return success_response(
        data=[TechnicianApplicationSchema.from_orm(t).dict() for t in technicians],
        message=f"Found {len(technicians)} technician applications"
    )


@router.get("/{technician_id}/application")
async def get_application(
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get technician application details."""
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    # User can view their own application or admin can view any
    if current_user["id"] != tech.user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return success_response(
        data=TechnicianApplicationSchema.from_orm(tech).dict(),
        message="Application retrieved"
    )


@router.patch("/{technician_id}/approve", dependencies=[Depends(require_role(["admin"]))])
async def approve_technician(
    technician_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Approve a technician application."""
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    tech.status = TechnicianStatusEnum.APPROVED
    tech.updated_at = datetime.utcnow()
    
    db.add(tech)
    db.commit()
    
    return success_response(
        data={"technician_id": tech.id, "status": tech.status},
        message="Technician approved"
    )


@router.patch("/{technician_id}/reject", dependencies=[Depends(require_role(["admin"]))])
async def reject_technician(
    technician_id: str,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Reject a technician application."""
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    tech.status = TechnicianStatusEnum.REJECTED
    tech.updated_at = datetime.utcnow()
    
    db.add(tech)
    db.commit()
    
    return success_response(
        data={"technician_id": tech.id, "status": tech.status},
        message=f"Technician rejected{f': {reason}' if reason else ''}"
    )


@router.patch("/{technician_id}/suspend", dependencies=[Depends(require_role(["admin"]))])
async def suspend_technician(
    technician_id: str,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Suspend a technician account."""
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    tech.status = TechnicianStatusEnum.SUSPENDED
    tech.is_online = False
    tech.updated_at = datetime.utcnow()
    
    db.add(tech)
    db.commit()
    
    return success_response(
        data={"technician_id": tech.id, "status": tech.status},
        message=f"Technician suspended{f': {reason}' if reason else ''}"
    )


@router.patch("/toggle-status", dependencies=[Depends(require_role(["technician"]))])
async def toggle_online_status(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Toggle technician online/offline status.
    
    Requirements:
    - User must be a technician
    - Technician must be approved
    """
    # Get technician profile
    tech = db.query(Technician).filter(Technician.user_id == current_user["id"]).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician profile not found")
    
    # Check if approved
    if tech.status != TechnicianStatusEnum.APPROVED:
        raise HTTPException(
            status_code=403,
            detail=f"Cannot toggle status: technician is {tech.status}"
        )
    
    # Toggle status
    tech.is_online = not tech.is_online
    tech.updated_at = datetime.utcnow()
    
    db.add(tech)
    db.commit()
    
    return success_response(
        data={
            "technician_id": tech.id,
            "is_online": tech.is_online,
            "status": tech.status
        },
        message=f"Technician is now {'online' if tech.is_online else 'offline'}"
    )


@router.get("/profile")
async def get_technician_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get current technician profile."""
    tech = db.query(Technician).filter(Technician.user_id == current_user["id"]).first()
    
    if not tech:
        raise HTTPException(status_code=404, detail="Technician profile not found")
    
    return success_response(
        data=TechnicianSchema.from_orm(tech).dict(),
        message="Profile retrieved"
    )
