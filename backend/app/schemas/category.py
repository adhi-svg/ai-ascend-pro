from pydantic import BaseModel
from typing import Optional

class CategoryResponse(BaseModel):
    id: str
    name: str
    emoji: Optional[str] = None
    tagline: Optional[str] = None
    is_active: bool
