import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryEarningStore:
    def __init__(self):
        self.earnings: Dict[str, Dict] = {}
        self.technician_index: Dict[str, List[str]] = {}
        self.booking_index: Dict[str, str] = {}
    
    def create(self, technician_id: str, booking_id: str, amount: float) -> Optional[Dict]:
        # One earning per booking
        if booking_id in self.booking_index:
            return None
        
        earning_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        earning = {
            "id": earning_id,
            "technician_id": technician_id,
            "booking_id": booking_id,
            "amount": amount,
            "payout_date": None,
            "created_at": now,
        }
        
        self.earnings[earning_id] = earning
        
        if technician_id not in self.technician_index:
            self.technician_index[technician_id] = []
        self.technician_index[technician_id].append(earning_id)
        
        self.booking_index[booking_id] = earning_id
        
        return earning
    
    def get_by_id(self, earning_id: str) -> Optional[Dict]:
        return self.earnings.get(earning_id)
    
    def get_by_technician(self, technician_id: str) -> List[Dict]:
        earning_ids = self.technician_index.get(technician_id, [])
        return [self.earnings[eid] for eid in earning_ids if eid in self.earnings]
    
    def get_by_booking(self, booking_id: str) -> Optional[Dict]:
        earning_id = self.booking_index.get(booking_id)
        return self.earnings.get(earning_id) if earning_id else None
    
    def get_all(self) -> List[Dict]:
        return list(self.earnings.values())

earning_store = InMemoryEarningStore()
