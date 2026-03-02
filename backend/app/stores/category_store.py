import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryCategoryStore:
    def __init__(self):
        self.categories: Dict[str, Dict] = {}
        self.name_index: Dict[str, str] = {}
    
    def create(self, name: str, emoji: Optional[str] = None, 
               tagline: Optional[str] = None) -> Optional[Dict]:
        # Check uniqueness
        if name in self.name_index:
            return None
        
        cat_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        category = {
            "id": cat_id,
            "name": name,
            "emoji": emoji,
            "tagline": tagline,
            "is_active": True,
            "created_at": now,
        }
        
        self.categories[cat_id] = category
        self.name_index[name] = cat_id
        
        return category
    
    def get_by_id(self, cat_id: str) -> Optional[Dict]:
        return self.categories.get(cat_id)
    
    def get_by_name(self, name: str) -> Optional[Dict]:
        cat_id = self.name_index.get(name)
        return self.categories.get(cat_id) if cat_id else None
    
    def get_all(self, active_only: bool = True) -> List[Dict]:
        cats = self.categories.values()
        if active_only:
            return [c for c in cats if c["is_active"]]
        return list(cats)

category_store = InMemoryCategoryStore()
