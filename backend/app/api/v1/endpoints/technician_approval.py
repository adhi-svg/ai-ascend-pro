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
    import json
    
    query = db.query(Technician).join(User, Technician.user_id == User.id)
    
    if status:
        query = query.filter(Technician.status == TechnicianStatusEnum[status.upper()])
    
    technicians = query.all()
    
    # Enrich with user data for frontend
    enriched_data = []
    for tech in technicians:
        skills_list = json.loads(tech.skills or "[]")
        docs = json.loads(tech.documents or "{}")
        
        enriched_data.append({
            "id": tech.id,
            "userId": tech.user_id,
            "fullName": tech.user.name or "Unknown",
            "phone": tech.user.phone or "",
            "email": tech.user.email or "",
            "status": tech.status.value.upper(),
            "skill": skills_list[0] if skills_list else None,
            "skills": skills_list,
            "profilePhotoUrl": tech.profile_image_url,
            "aadhaarNumber": docs.get("aadhaar_number"),
            "aadhaarFrontUrl": docs.get("aadhaar_front_url"),
            "aadhaarBackUrl": docs.get("aadhaar_back_url"),
            "selfieUrl": docs.get("selfie_url"),
            "baseVisitFee": docs.get("base_visit_fee"),
            "radiusKm": tech.radius_km or docs.get("radius_km"),
            "experience": tech.experience,
            "hasShop": tech.shop_available,
            "shopName": tech.shop_name,
            "shopAddress": tech.shop_address,
            "shopLocation": tech.shop_location_text,
            "city": tech.city,
            "area": tech.area,
            "rating": tech.rating,
            "totalJobs": tech.total_jobs,
            "isOnline": tech.is_online,
            "createdAt": tech.created_at.isoformat() if tech.created_at else None,
            "updatedAt": tech.updated_at.isoformat() if tech.updated_at else None,
        })
    
    return success_response(
        data=enriched_data,
        message=f"Found {len(enriched_data)} technician applications"
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
