from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from app.core.deps import get_current_user, require_role
from app.stores.technician_store import technician_store
from app.stores.earning_store import earning_store
from app.stores.booking_store import booking_store
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/technicians/me/earnings", tags=["Earnings"])

def get_date_range(range_type: str = "month"):
    """Get date range for filtering."""
    now = datetime.utcnow()
    
    if range_type == "week":
        start_date = now - timedelta(days=7)
    elif range_type == "year":
        start_date = now - timedelta(days=365)
    else:  # month
        start_date = now - timedelta(days=30)
    
    return start_date

@router.get("", response_model=dict)
async def get_my_earnings(current_user: dict = Depends(get_current_user)):
    """Get technician earnings."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can view earnings"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    earnings = earning_store.get_by_technician(tech["id"])
    
    return success_response(
        data=earnings,
        message="Earnings retrieved successfully"
    )

@router.get("/analytics", response_model=dict)
async def get_analytics(
    range: str = Query("month", pattern="^(week|month|year)$"),
    current_user: dict = Depends(get_current_user)
):
    """Get technician analytics for specified range (week/month/year)."""
    if current_user["role"] != "technician":
        return error_response(
            code="FORBIDDEN",
            details="Only technicians can view analytics"
        )
    
    tech = technician_store.get_by_user_id(current_user["id"])
    if not tech:
        return error_response(
            code="NOT_FOUND",
            details="Technician profile not found"
        )
    
    # Filter earnings by date range
    start_date = get_date_range(range)
    earnings = earning_store.get_by_technician(tech["id"])
    filtered_earnings = [
        e for e in earnings 
        if datetime.fromisoformat(e["created_at"]) >= start_date
    ]
    total_earnings = sum(e["amount"] for e in filtered_earnings)
    
    # Get bookings in range with completed status
    all_bookings = booking_store.get_by_technician(tech["id"])
    completed_bookings = [
        b for b in all_bookings 
        if b["status"] == "COMPLETED" and 
        datetime.fromisoformat(b["created_at"]) >= start_date
    ]
    
    # Calculate average rating from completed bookings
    ratings = [b["rating"] for b in completed_bookings if b["rating"] is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0
    
    # Get last 10 completed bookings
    last_10_bookings = sorted(
        completed_bookings, 
        key=lambda b: b["created_at"], 
        reverse=True
    )[:10]
    
    analytics = {
        "total_earnings": round(total_earnings, 2),
        "total_jobs_completed": len(completed_bookings),
        "avg_rating": round(avg_rating, 2),
        "range": range,
        "last_10_bookings": [
            {
                "booking_id": b["id"],
                "status": b["status"],
                "amount": b["amount"],
                "rating": b["rating"],
                "created_at": b["created_at"]
            }
            for b in last_10_bookings
        ],
    }
    
    return success_response(
        data=analytics,
        message=f"Analytics retrieved successfully (range: {range})"
    )
