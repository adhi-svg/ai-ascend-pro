from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.models import Category
from app.utils.responses import success_response
from sqlalchemy.orm import Session

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=dict)
async def list_categories(db: Session = Depends(get_db)):
    """Get all active categories from the database."""
    categories = db.query(Category).filter(Category.is_active == True).all()
    return success_response(
        data=categories,
        message="Categories retrieved successfully"
    )
