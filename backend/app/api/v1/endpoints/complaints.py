from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.schemas.complaint import ComplaintCreate
from app.stores.complaint_store import complaint_store
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=dict)
async def create_complaint(
    req: ComplaintCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new complaint."""
    complaint = complaint_store.create(
        user_id=current_user["id"],
        title=req.title,
        description=req.description,
        booking_id=req.booking_id
    )
    
    return success_response(
        data=complaint,
        message="Complaint created successfully"
    )

@router.get("/me", response_model=dict)
async def get_my_complaints(current_user: dict = Depends(get_current_user)):
    """Get my complaints."""
    complaints = complaint_store.get_by_user(current_user["id"])
    
    return success_response(
        data=complaints,
        message="Complaints retrieved successfully"
    )
