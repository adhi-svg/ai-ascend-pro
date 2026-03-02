import uuid
from datetime import datetime
from typing import Dict, Optional, List
from ..utils.otp import generate_otp, get_otp_expiry, is_otp_expired

class InMemoryBookingStore:
    def __init__(self):
        self.bookings: Dict[str, Dict] = {}
        self.customer_index: Dict[str, List[str]] = {}
        self.technician_index: Dict[str, List[str]] = {}
    
    def create(self, customer_id: str, category_id: str, 
               address: Optional[str] = None, notes: Optional[str] = None,
               complaint_text: Optional[str] = None, 
               complaint_category: Optional[str] = None,
               complaint_urgency: Optional[str] = None) -> Dict:
        booking_id = str(uuid.uuid4())
        return self.create_with_id(
            booking_id=booking_id,
            customer_id=customer_id,
            category_id=category_id,
            address=address,
            notes=notes,
            complaint_text=complaint_text,
            complaint_category=complaint_category,
            complaint_urgency=complaint_urgency,
        )

    def create_with_id(self, booking_id: str, customer_id: str, category_id: str,
                       address: Optional[str] = None, notes: Optional[str] = None,
                       complaint_text: Optional[str] = None,
                       complaint_category: Optional[str] = None,
                       complaint_urgency: Optional[str] = None) -> Dict:
        if booking_id in self.bookings:
            return None

        now = datetime.utcnow().isoformat()
        otp_code = generate_otp()
        otp_expiry = get_otp_expiry()

        booking = {
            "id": booking_id,
            "customer_id": customer_id,
            "technician_id": None,
            "category_id": category_id,
            "status": "PENDING",
            "address": address,
            "notes": notes,
            "scheduled_at": None,
            "otp_code": otp_code,
            "otp_expiry": otp_expiry.isoformat(),
            "otp_verified_at": None,
            "payment_mode": None,
            "amount": None,
            "rating": None,
            "rated_by_customer": False,
            "feedback": None,
            "technician_latitude": None,
            "technician_longitude": None,
            "complaint_text": complaint_text,
            "complaint_category": complaint_category,
            "complaint_urgency": complaint_urgency,
            "reassign_count": 0,
            "reassignment_events": [],
            "created_at": now,
            "updated_at": now,
        }

        self.bookings[booking_id] = booking

        if customer_id not in self.customer_index:
            self.customer_index[customer_id] = []
        self.customer_index[customer_id].append(booking_id)

        return booking
    
    def get_by_id(self, booking_id: str) -> Optional[Dict]:
        return self.bookings.get(booking_id)
    
    def get_by_customer(self, customer_id: str) -> List[Dict]:
        booking_ids = self.customer_index.get(customer_id, [])
        return [self.bookings[bid] for bid in booking_ids if bid in self.bookings]
    
    def get_by_technician(self, technician_id: str) -> List[Dict]:
        booking_ids = self.technician_index.get(technician_id, [])
        return [self.bookings[bid] for bid in booking_ids if bid in self.bookings]
    
    def update(self, booking_id: str, **kwargs) -> Optional[Dict]:
        booking = self.bookings.get(booking_id)
        if not booking:
            return None
        
        now = datetime.utcnow().isoformat()
        kwargs["updated_at"] = now
        
        booking.update(kwargs)
        return booking
    
    def assign_technician(self, booking_id: str, technician_id: str) -> Optional[Dict]:
        booking = self.bookings.get(booking_id)
        if not booking:
            return None
        
        old_tech_id = booking.get("technician_id")
        if old_tech_id and old_tech_id in self.technician_index:
            try:
                self.technician_index[old_tech_id].remove(booking_id)
            except ValueError:
                pass
        
        booking["technician_id"] = technician_id
        booking["status"] = "ASSIGNED"
        booking["updated_at"] = datetime.utcnow().isoformat()
        
        if technician_id not in self.technician_index:
            self.technician_index[technician_id] = []
        self.technician_index[technician_id].append(booking_id)
        
        return booking
    
    def verify_otp(self, booking_id: str, otp_code: str) -> tuple:
        """Verify OTP. Returns (success: bool, already_verified: bool)"""
        booking = self.bookings.get(booking_id)
        if not booking:
            return False, False
        
        # If already verified, return success but mark as already verified
        if booking.get("otp_verified_at"):
            return True, True
        
        if booking["otp_code"] != otp_code:
            return False, False
        
        if is_otp_expired(datetime.fromisoformat(booking["otp_expiry"])):
            return False, False
        
        booking["otp_verified_at"] = datetime.utcnow().isoformat()
        return True, False
    
    def get_all(self) -> List[Dict]:
        return list(self.bookings.values())

booking_store = InMemoryBookingStore()
