import uuid
from datetime import datetime
from typing import Dict, Optional, List
from ..core.security import hash_password, verify_password

class InMemoryUserStore:
    def __init__(self):
        self.users: Dict[str, Dict] = {}
        self.phone_index: Dict[str, str] = {}
        self.email_index: Dict[str, str] = {}
    
    def create(self, phone: str, password: str, name: Optional[str] = None, 
               email: Optional[str] = None, role: str = "customer") -> Dict:
        # Check uniqueness
        if phone in self.phone_index:
            return None
        if email and email in self.email_index:
            return None
        
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Hash password only if provided (for OAuth users, password may be empty)
        password_hash = hash_password(password) if password else None
        
        user = {
            "id": user_id,
            "phone": phone,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "profile_complete": False,
            "created_at": now,
        }
        
        self.users[user_id] = user
        self.phone_index[phone] = user_id
        if email:
            self.email_index[email] = user_id
        
        return user
    
    def get_by_id(self, user_id: str) -> Optional[Dict]:
        return self.users.get(user_id)
    
    def get_by_phone(self, phone: str) -> Optional[Dict]:
        user_id = self.phone_index.get(phone)
        return self.users.get(user_id) if user_id else None
    
    def get_by_email(self, email: str) -> Optional[Dict]:
        user_id = self.email_index.get(email)
        return self.users.get(user_id) if user_id else None
    
    def verify_password(self, user: Dict, password: str) -> bool:
        return verify_password(password, user["password_hash"])
    
    def update(self, user_id: str, **kwargs) -> Optional[Dict]:
        user = self.users.get(user_id)
        if not user:
            return None
        
        user.update(kwargs)
        return user
    
    def get_all(self) -> List[Dict]:
        return list(self.users.values())

user_store = InMemoryUserStore()
