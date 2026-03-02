import uuid
from datetime import datetime
from typing import Dict, Optional, List

class InMemoryTrackingStore:
    """Store location history for technicians per booking."""
    
    def __init__(self):
        self.locations: Dict[str, Dict] = {}
        self.booking_index: Dict[str, str] = {}  # booking_id -> latest location_id
        self.technician_booking_index: Dict[str, List[str]] = {}  # (tech_id, booking_id) -> [location_ids]
    
    def save_location(self, technician_id: str, booking_id: str, latitude: float, longitude: float) -> Dict:
        """Save location update for technician on a booking."""
        location_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        location = {
            "id": location_id,
            "technician_id": technician_id,
            "booking_id": booking_id,
            "latitude": latitude,
            "longitude": longitude,
            "created_at": now,
        }
        
        self.locations[location_id] = location
        self.booking_index[booking_id] = location_id  # Keep latest
        
        # Track by (tech_id, booking_id)
        key = f"{technician_id}:{booking_id}"
        if key not in self.technician_booking_index:
            self.technician_booking_index[key] = []
        self.technician_booking_index[key].append(location_id)
        
        return location
    
    def get_latest_location(self, booking_id: str) -> Optional[Dict]:
        """Get the latest location for a booking."""
        location_id = self.booking_index.get(booking_id)
        return self.locations.get(location_id) if location_id else None
    
    def get_location_history(self, technician_id: str, booking_id: str) -> List[Dict]:
        """Get all location updates for a technician on a booking."""
        key = f"{technician_id}:{booking_id}"
        location_ids = self.technician_booking_index.get(key, [])
        return [self.locations[lid] for lid in location_ids if lid in self.locations]
    
    def get_all(self) -> List[Dict]:
        return list(self.locations.values())

tracking_store = InMemoryTrackingStore()
