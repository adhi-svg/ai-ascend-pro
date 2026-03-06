import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryTechnicianStore:
    def __init__(self):
        self.technicians: Dict[str, Dict] = {}
        self.user_id_index: Dict[str, str] = {}
    
    def create(self, user_id: str, **kwargs) -> Dict:
        # One technician profile per user
        if user_id in self.user_id_index:
            return None
        
        tech_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        technician = {
            "id": tech_id,
            "user_id": user_id,
            "skills": kwargs.get("skills", []),
            "rating": 0.0,
            "rating_count": 0,
            "total_jobs": 0,
            "city": kwargs.get("city"),
            "area": kwargs.get("area"),
            "latitude": kwargs.get("latitude"),
            "longitude": kwargs.get("longitude"),
            "shop_available": kwargs.get("shop_available", False),
            "is_online": False,
            "created_at": now,
        }
        
        # Merge all other metadata (Aadhaar, shop details, photos)
        technician.update(kwargs)
        
        self.technicians[tech_id] = technician
        self.user_id_index[user_id] = tech_id
        
        return technician
    
    def get_by_id(self, tech_id: str) -> Optional[Dict]:
        return self.technicians.get(tech_id)
    
    def get_by_user_id(self, user_id: str) -> Optional[Dict]:
        tech_id = self.user_id_index.get(user_id)
        return self.technicians.get(tech_id) if tech_id else None
    
    def update(self, tech_id: str, **kwargs) -> Optional[Dict]:
        technician = self.technicians.get(tech_id)
        if not technician:
            return None
        
        technician.update(kwargs)
        return technician
    
    def update_by_user_id(self, user_id: str, **kwargs) -> Optional[Dict]:
        tech_id = self.user_id_index.get(user_id)
        if not tech_id:
            return None
        return self.update(tech_id, **kwargs)
    
    def get_all(self) -> List[Dict]:
        return list(self.technicians.values())
    
    def get_by_skill(self, skill: str) -> List[Dict]:
        return [t for t in self.technicians.values() if skill in t["skills"]]

technician_store = InMemoryTechnicianStore()
