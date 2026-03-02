from fastapi import APIRouter
from app.schemas.category import CategoryResponse
from app.stores.category_store import category_store
from app.utils.responses import success_response

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=dict)
async def list_categories():
    """Get all active categories."""
    categories = category_store.get_all(active_only=True)
    return success_response(
        data=categories,
        message="Categories retrieved successfully"
    )
