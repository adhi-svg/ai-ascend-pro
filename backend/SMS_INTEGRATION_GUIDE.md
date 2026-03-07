# SMS/OTP Integration Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Choose and Configure Provider

#### Option A: MSG91 (Recommended - ₹0.15/SMS)
```bash
# 1. Sign up at https://msg91.com/
# 2. Get API key from dashboard
# 3. Create OTP template with this text:
#    "Your FYXION verification code is ##OTP##. Valid for 15 minutes."
# 4. Add to backend/.env:

MSG91_API_KEY=your_api_key_here
MSG91_OTP_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=FYXION
ENABLE_SMS=True
```

#### Option B: Test Mode (Free - Console Only)
```bash
# backend/.env
ENABLE_SMS=False  # OTP will print to console
```

### Step 2: Install Service (Already Done!)
File created: `backend/app/services/sms_service.py` ✅

### Step 3: Use in Your Code

#### Send OTP When Booking is Created
```python
# In booking_store.py or bookings.py endpoint

from app.services.sms_service import sms_service
from app.core.config import settings

# After creating booking with OTP
booking = booking_store.create(...)

# Send OTP via SMS
if settings.ENABLE_SMS:
    customer = user_store.get_by_id(booking["customer_id"])
    if customer and customer.get("phone"):
        result = sms_service.send_otp(
            phone=customer["phone"],
            otp=booking["otp_code"],
            expiry_minutes=15
        )
        if result["success"]:
            logger.info(f"OTP sent to customer {customer['id']}")
        else:
            logger.error(f"Failed to send OTP: {result.get('error')}")
```

#### Send Job Status Notifications
```python
# When technician accepts job

from app.services.sms_service import sms_service

if settings.ENABLE_SMS:
    customer = user_store.get_by_id(booking["customer_id"])
    message = f"Your booking #{booking['id'][:8]} has been accepted by {tech_name}."
    sms_service.send_notification(customer["phone"], message)
```

---

## 📝 Complete Integration Example

### Update Booking Creation Endpoint

```python
# backend/app/api/v1/endpoints/bookings.py

from app.services.sms_service import sms_service
from app.core.config import settings

@router.post("", response_model=dict)
async def create_booking(
    req: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    # ... existing validation ...
    
    # Create booking
    booking = booking_store.create(
        customer_id=current_user["id"],
        category_id=req.category_id,
        address=req.address,
        notes=req.notes,
        complaint_text=req.complaint_text,
        complaint_category=req.complaint_category,
        complaint_urgency=req.complaint_urgency,
    )
    
    # 🆕 Send OTP via SMS
    if settings.ENABLE_SMS:
        customer = user_store.get_by_id(current_user["id"])
        if customer and customer.get("phone"):
            # Send in background to avoid blocking
            background_tasks.add_task(
                sms_service.send_otp,
                phone=customer["phone"],
                otp=booking["otp_code"],
                expiry_minutes=15
            )
    
    # ... rest of the code (auto-assign, etc.) ...
    
    return success_response(
        data=booking,
        message="Booking created successfully. OTP sent to your phone."
    )
```

### Update Status Change Notifications

```python
@router.patch("/{booking_id}/status", response_model=dict)
async def update_booking_status(
    booking_id: str,
    req: BookingUpdateStatus,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    # ... existing validation and status update ...
    
    booking = booking_store.update(booking_id, status=req.status, amount=req.amount)
    
    # 🆕 Send status notification
    if settings.ENABLE_SMS and req.status in ["ACCEPTED", "ON_THE_WAY", "COMPLETED"]:
        customer = user_store.get_by_id(booking["customer_id"])
        if customer and customer.get("phone"):
            message = get_status_message(req.status, booking_id)
            background_tasks.add_task(
                sms_service.send_notification,
                phone=customer["phone"],
                message=message
            )
    
    return success_response(data=booking, message="Status updated")

def get_status_message(status: str, booking_id: str) -> str:
    """Get notification message for status."""
    messages = {
        "ACCEPTED": f"Your technician has accepted job {booking_id[:8]}!",
        "ON_THE_WAY": f"Technician is on the way for job {booking_id[:8]}.",
        "COMPLETED": f"Job {booking_id[:8]} completed. Please verify with OTP."
    }
    return messages.get(status, f"Job {booking_id[:8]} status: {status}")
```

---

## 🧪 Testing

### Test in Console Mode
```bash
# 1. Set ENABLE_SMS=False in .env
# 2. Start backend
uvicorn app.main:app --reload

# 3. Create a booking
# OTP will print to console like this:
==================================================
📱 MOCK SMS
==================================================
To: +919876543210
OTP: 123456
Message: Your FYXION verification code is 123456...
==================================================
```

### Test with Real SMS
```bash
# 1. Configure MSG91 in .env
# 2. Set ENABLE_SMS=True
# 3. Create booking
# 4. Check your phone for SMS
```

### Test API Response
```bash
curl -X POST "http://localhost:8000/api/v1/bookings" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "cat-123",
    "address": "123 Test Street",
    "auto_assign": true
  }'
```

---

## 🔐 Security Features (Built-in)

### 1. Rate Limiting (TODO - Add this)
```python
# Prevent SMS spam
from collections import defaultdict
from datetime import datetime, timedelta

class OTPRateLimiter:
    def __init__(self):
        self.attempts = defaultdict(list)
    
    def can_send_otp(self, phone: str) -> bool:
        now = datetime.utcnow()
        cutoff = now - timedelta(hours=1)
        
        # Clean old attempts
        self.attempts[phone] = [t for t in self.attempts[phone] if t > cutoff]
        
        # Max 3 OTPs per hour
        if len(self.attempts[phone]) >= 3:
            return False
        
        self.attempts[phone].append(now)
        return True

rate_limiter = OTPRateLimiter()

# Use before sending OTP
if not rate_limiter.can_send_otp(customer["phone"]):
    return error_response(
        code="RATE_LIMIT",
        details="Too many OTP requests. Try again in 1 hour."
    )
```

### 2. Phone Normalization (Built-in)
- Removes country code automatically
- Validates 10-digit format
- Handles spaces, dashes

### 3. Provider Fallback (Built-in)
- Automatically uses MOCK mode if no provider configured
- Safe for development/testing

---

## 📊 Monitoring

### Add to Logging
```python
# Track SMS success/failure
import logging

logger = logging.getLogger(__name__)

result = sms_service.send_otp(phone, otp)
if result["success"]:
    logger.info(f"OTP sent: {result['message_id']} via {result['provider']}")
else:
    logger.error(f"OTP failed: {result.get('error')} via {result['provider']}")
```

### Cost Tracking
```python
# Track SMS usage
from datetime import datetime

class SMSUsageTracker:
    def __init__(self):
        self.daily_count = 0
        self.last_reset = datetime.utcnow().date()
    
    def increment(self):
        today = datetime.utcnow().date()
        if today != self.last_reset:
            self.daily_count = 0
            self.last_reset = today
        self.daily_count += 1
        
        # Alert if high usage
        if self.daily_count > 1000:
            logger.warning(f"High SMS usage today: {self.daily_count}")
```

---

## 💰 Cost Estimation

### MSG91 Pricing
- **OTP SMS**: ₹0.15 - ₹0.25 each
- **10 bookings/day**: ₹1.5 - ₹2.5/day = ₹45-75/month
- **100 bookings/day**: ₹15-25/day = ₹450-750/month
- **1000 bookings/day**: ₹150-250/day = ₹4,500-7,500/month

---

## 🎯 Next Steps

### Phase 1: Basic Setup (Today)
- [x] SMS service created
- [ ] Add to .env file
- [ ] Test in console mode
- [ ] Verify OTP generation works

### Phase 2: Provider Setup (1-2 days)
- [ ] Sign up for MSG91
- [ ] Create OTP template
- [ ] Add credentials to .env
- [ ] Test with real SMS

### Phase 3: Integration (1 day)
- [ ] Add SMS to booking creation
- [ ] Add status notifications
- [ ] Add rate limiting
- [ ] Test end-to-end

### Phase 4: Production (Ongoing)
- [ ] Monitor delivery rates
- [ ] Track costs
- [ ] Add retry logic
- [ ] Set up alerts

---

## 📞 Support

### MSG91
- Dashboard: https://control.msg91.com/
- Docs: https://docs.msg91.com/
- Support: support@msg91.com

### Questions?
Check [OTP_PLATFORM_RECOMMENDATIONS.md](../OTP_PLATFORM_RECOMMENDATIONS.md) for detailed platform comparison and setup guides.

---

**Ready to implement? Follow Step 1 above and you'll be sending OTPs in 5 minutes!** ✅
