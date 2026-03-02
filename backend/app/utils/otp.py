import random
import string
from datetime import datetime, timedelta

def generate_otp(length: int = 6) -> str:
    """Generate a random OTP."""
    return ''.join(random.choices(string.digits, k=length))

def get_otp_expiry(minutes: int = 15) -> datetime:
    """Get OTP expiry time."""
    return datetime.utcnow() + timedelta(minutes=minutes)

def is_otp_expired(expiry_time: datetime) -> bool:
    """Check if OTP is expired."""
    return datetime.utcnow() > expiry_time
