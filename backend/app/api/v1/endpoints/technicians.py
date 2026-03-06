from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import Technician, User, TechnicianStatusEnum
from app.utils.responses import success_response, error_response
import json

router = APIRouter(prefix="/technicians", tags=["Technicians"])

@router.get("", response_model=dict)
async def list_technicians(
    skill: Optional[str] = Query(None),
    online: Optional[bool] = Query(None),
    status: Optional[str] = Query("approved"),
    db: Session = Depends(get_db)
):
    """Get technicians with filtering options."""
    query = db.query(Technician).join(User)
    
    if status:
        try:
            query = query.filter(Technician.status == TechnicianStatusEnum[status.upper()])
        except (KeyError, AttributeError):
            pass
            
    if online is not None:
        query = query.filter(Technician.is_online == online)
    
    technicians = query.all()
    
    # Filter by skill (JSON search)
    result = []
    for tech in technicians:
        skills = json.loads(tech.skills or "[]")
        if skill and skill not in skills:
            continue
            
        # Manually enrich with user info for response matching frontend expectation
        tech_dict = {
            "id": tech.id,
            "user_id": tech.user_id,
            "name": tech.user.name,
            "phone": tech.user.phone,
            "skills": skills,
            "rating": tech.rating,
            "rating_count": tech.rating_count,
            "is_online": tech.is_online,
            "status": tech.status.value,
            "profile_image_url": tech.profile_image_url
        }
        result.append(tech_dict)
    
    return success_response(data=result, message="Technicians retrieved")

@router.get("/{technician_id}", response_model=dict)
async def get_technician(technician_id: str, db: Session = Depends(get_db)):
    """Get a specific technician profile."""
    tech = db.query(Technician).filter(Technician.id == technician_id).first()
    if not tech:
        return error_response(code="NOT_FOUND", details="Technician not found")
    
    return success_response(
        data={
            "id": tech.id,
            "name": tech.user.name,
            "skills": json.loads(tech.skills or "[]"),
            "rating": tech.rating,
            "is_online": tech.is_online
        }
    )

@router.patch("/me/online", response_model=dict)
async def toggle_online_status(
    is_online: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Toggle technician online status."""
    tech = db.query(Technician).filter(Technician.user_id == current_user["id"]).first()
    if not tech:
        return error_response(code="NOT_FOUND", details="Technician not found")
    
    tech.is_online = is_online
    db.commit()
    return success_response(data={"is_online": tech.is_online})
