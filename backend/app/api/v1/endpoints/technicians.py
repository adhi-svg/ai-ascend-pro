from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.deps import get_current_user, require_role
from app.schemas.technician import TechnicianUpdate, TechnicianResponse
from app.stores.user_store import user_store
from app.stores.technician_store import technician_store
from app.utils.responses import success_response, error_response
from app.utils.geo import haversine_distance

router = APIRouter(prefix="/technicians", tags=["Technicians"])

@router.get("", response_model=dict)
async def list_technicians(
    skill: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: Optional[float] = Query(5),
    online: Optional[bool] = Query(None),
):
    """Get technicians with filtering options."""
    technicians = technician_store.get_all()
    
    # Filter by skill
    if skill:
        technicians = [t for t in technicians if skill in t["skills"]]
    
    # Filter by online status
    if online is not None:
        technicians = [t for t in technicians if t["is_online"] == online]
    
    # Filter by location (Haversine distance)
    if lat is not None and lng is not None:
        filtered = []
        for tech in technicians:
            if tech.get("latitude") is not None and tech.get("longitude") is not None:
                dist = haversine_distance(lat, lng, tech["latitude"], tech["longitude"])
                if dist <= radius_km:
                    filtered.append(tech)
        technicians = filtered
    
    # Enrich with user info
    result = []
    for tech in technicians:
        user = user_store.get_by_id(tech["user_id"])
        if user:
            tech["name"] = user["name"]
            tech["phone"] = user["phone"]
            result.append(tech)
    
    return success_response(
        data=result,
        message="Technicians retrieved successfully"
    )

@router.get("/{technician_id}", response_model=dict)
async def get_technician(technician_id: str):
    """Get a specific technician profile."""
    tech = technician_store.get_by_id(technician_id)
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician not found"
        )
    
    user = user_store.get_by_id(tech["user_id"])
    if user:
        tech["name"] = user["name"]
        tech["phone"] = user["phone"]
    
    return success_response(
        data=tech,
        message="Technician retrieved successfully"
    )

@router.patch("/me", response_model=dict)
async def update_my_profile(
    update: TechnicianUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update my technician profile."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can update their profile"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    update_data = update.model_dump(exclude_unset=True)
    tech = technician_store.update(tech["id"], **update_data)
    
    return success_response(
        data=tech,
        message="Profile updated successfully"
    )

@router.patch("/me/online", response_model=dict)
async def toggle_online_status(
    is_online: bool = Query(...),
    current_user: dict = Depends(get_current_user)
):
    """Toggle technician online status."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can update online status"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    tech = technician_store.update(tech["id"], is_online=is_online)
    
    return success_response(
        data={"is_online": tech["is_online"]},
        message=f"Now {'online' if is_online else 'offline'}"
    )
