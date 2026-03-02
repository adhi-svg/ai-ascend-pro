from fastapi import APIRouter, Depends

from app.auth.auth import get_current_user, role_required

router = APIRouter(tags=["Auth Demo"])


@router.get("/admin-only", dependencies=[Depends(role_required(["Admin"]))])
async def admin_only(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Welcome Admin",
        "user": current_user,
    }


@router.get("/technician-only", dependencies=[Depends(role_required(["Technician"]))])
async def technician_only(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Welcome Technician",
        "user": current_user,
    }


@router.get("/citizen-only", dependencies=[Depends(role_required(["Citizen"]))])
async def citizen_only(current_user: dict = Depends(get_current_user)):
    return {
        "message": "Welcome Citizen",
        "user": current_user,
    }
