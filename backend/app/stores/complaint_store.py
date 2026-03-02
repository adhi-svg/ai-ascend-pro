import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryComplaintStore:
    def __init__(self):
        self.complaints: Dict[str, Dict] = {}
        self.user_index: Dict[str, List[str]] = {}
    
    def create(self, user_id: str, title: str, description: str,
               booking_id: Optional[str] = None) -> Dict:
        complaint_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        complaint = {
            "id": complaint_id,
            "user_id": user_id,
            "booking_id": booking_id,
            "title": title,
            "description": description,
            "status": "OPEN",
            "created_at": now,
        }
        
        self.complaints[complaint_id] = complaint
        
        if user_id not in self.user_index:
            self.user_index[user_id] = []
        self.user_index[user_id].append(complaint_id)
        
        return complaint
    
    def get_by_id(self, complaint_id: str) -> Optional[Dict]:
        return self.complaints.get(complaint_id)
    
    def get_by_user(self, user_id: str) -> List[Dict]:
        complaint_ids = self.user_index.get(user_id, [])
        return [self.complaints[cid] for cid in complaint_ids if cid in self.complaints]
    
    def update(self, complaint_id: str, **kwargs) -> Optional[Dict]:
        complaint = self.complaints.get(complaint_id)
        if not complaint:
            return None
        
        complaint.update(kwargs)
        return complaint
    
    def get_all(self) -> List[Dict]:
        return list(self.complaints.values())

complaint_store = InMemoryComplaintStore()
