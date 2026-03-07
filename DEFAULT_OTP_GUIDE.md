# Default OTP for Development - Quick Guide

## 🎯 What This Does

When `USE_DEFAULT_OTP=True` is set, all bookings will use the **fixed OTP code: `MOCK_DB_PASSWORD`** instead of random codes.

**Perfect for**:
- ✅ Development and testing
- ✅ QA testing without SMS setup
- ✅ Demo builds
- ✅ Automated testing

---

## ⚙️ Setup (Already Enabled!)

Your `.env` file already has:
```env
USE_DEFAULT_OTP=True
```

**When backend starts**, you'll see:
```
[CONFIG] ⚠️ DEVELOPMENT MODE: Using default OTP 'MOCK_DB_PASSWORD' for all bookings
```

---

## 📱 How to Test

### Step 1: Create a Booking
```bash
curl -X POST "http://localhost:8000/api/v1/bookings" \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "cat-123",
    "address": "123 Test Street",
    "auto_assign": true
  }'
```

### Step 2: Response Contains OTP
```json
{
  "success": true,
  "data": {
    "id": "booking-123",
    "otp_code": "MOCK_DB_PASSWORD",  ← Always this value!
    "otp_expiry": "2026-03-06T15:20:00Z",
    "status": "ASSIGNED",
    "customer_id": "cust-456",
    "technician_id": "tech-789"
  }
}
```

### Step 3: Verify OTP
```bash
curl -X POST "http://localhost:8000/api/v1/bookings/booking-123/otp/verify" \
  -H "Authorization: Bearer <customer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "otp_code": "MOCK_DB_PASSWORD"
  }'
```

**Result**: ✅ OTP verified successfully!

---

## 🧪 Testing Scenarios

### Scenario 1: Quick Job Completion Flow
```bash
# 1. Create booking (auto-assigned)
# 2. Use OTP: MOCK_DB_PASSWORD
# 3. Verify OTP in under 15 minutes
# 4. Mark as COMPLETED
# 5. No SMS needed!
```

### Scenario 2: Bulk Testing
```bash
# Create 10 bookings in a loop
# All will have OTP: MOCK_DB_PASSWORD
# Perfect for load testing!

for i in {1..10}; do
  curl -X POST "http://localhost:8000/api/v1/bookings" \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"category_id": "cat-123", "auto_assign": true}'
done
```

### Scenario 3: Automated Testing
```python
# Python test
import requests

def test_booking_otp():
    booking = create_booking()
    assert booking["otp_code"] == "MOCK_DB_PASSWORD"
    
    verify = verify_otp(booking["id"], "MOCK_DB_PASSWORD")
    assert verify["success"] == True
```

---

## 🔄 Switching Modes

### Enable Default OTP (Development)
```env
# .env
USE_DEFAULT_OTP=True
```
```bash
# Backend will show:
[CONFIG] ⚠️ DEVELOPMENT MODE: Using default OTP 'MOCK_DB_PASSWORD'
```

### Disable Default OTP (Production)
```env
# .env
USE_DEFAULT_OTP=False
```
```bash
# Backend will show:
# (no warning, random OTPs generated)
```

---

## 📝 Example: Complete Testing Flow

### Setup
```bash
# Terminal 1: Start backend with default OTP enabled
cd backend
uvicorn app.main:app --reload
# Output: [CONFIG] ⚠️ DEVELOPMENT MODE: Using default OTP 'MOCK_DB_PASSWORD'
```

### Test Flow
```bash
# Terminal 2: Create booking
curl -X POST "http://localhost:8000/api/v1/bookings" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "cat-plumbing",
    "address": "123 Main St",
    "notes": "Pipe burst",
    "auto_assign": true
  }'

# Response:
# {
#   "data": {
#     "otp_code": "MOCK_DB_PASSWORD"
#   }
# }

# Verify OTP (using default)
curl -X POST "http://localhost:8000/api/v1/bookings/booking-123/otp/verify" \
  -H "Authorization: Bearer eyJ0eXAi..." \
  -H "Content-Type: application/json" \
  -d '{"otp_code": "MOCK_DB_PASSWORD"}'

# Result: OTP verified! ✅
```

---

## ⚡ Benefits for Development

### 1. **No SMS Setup Required**
- ✅ Test bookings without SMS provider
- ✅ No need for MSG91/Twilio account
- ✅ Instant testing

### 2. **Consistent Testing**
- ✅ Same OTP every time
- ✅ Easy to test in Postman/curl
- ✅ Reproducible results

### 3. **Fast Development**
- ✅ Don't wait for OTP SMS
- ✅ No phone number validation needed
- ✅ Instant flow testing

### 4. **QA Testing**
- ✅ Test OTP verification logic
- ✅ No cost
- ✅ Unlimited tests

---

## 🚨 Important Notes

### Development Only!
```env
# ❌ NEVER enable in production!
USE_DEFAULT_OTP=False  # Always disable for production
```

### Security Consideration
- Default OTP is public (in docs/code)
- Only use if backend is NOT exposed to internet
- Disable immediately before deploying

### OTP Format
- Default OTP: **MOCK_DB_PASSWORD**
- Length: 6 digits
- Can be verified before expiry (15 minutes)
- Still respects expiry time

---

## 🎓 Testing Checklist

- [ ] Create booking with default OTP enabled
- [ ] Verify OTP: MOCK_DB_PASSWORD
- [ ] Check job completion flow works
- [ ] Test multiple bookings (all use MOCK_DB_PASSWORD)
- [ ] Verify expiry still works
- [ ] Test rate limiting (if implemented)
- [ ] Switch to production mode (USE_DEFAULT_OTP=False)
- [ ] Verify random OTPs generated

---

## 📊 API Response Examples

### Booking with Default OTP
```json
{
  "success": true,
  "data": {
    "id": "booking-abc123",
    "customer_id": "cust-456",
    "technician_id": "tech-789",
    "category_id": "cat-plumbing",
    "status": "ASSIGNED",
    "address": "123 Main St, Apt 4B",
    "notes": "Pipe burst",
    "otp_code": "MOCK_DB_PASSWORD",
    "otp_expiry": "2026-03-06T15:20:00Z",
    "created_at": "2026-03-06T15:05:00Z"
  },
  "message": "Booking created successfully"
}
```

### OTP Verification Success
```json
{
  "success": true,
  "data": {
    "id": "booking-abc123",
    "status": "ASSIGNED",
    "otp_verified_at": "2026-03-06T15:10:00Z"
  },
  "message": "OTP verified successfully"
}
```

---

## 🔍 Monitoring

### Check if Default OTP is Active
```bash
# Look for this in backend logs when starting:
[CONFIG] ⚠️ DEVELOPMENT MODE: Using default OTP 'MOCK_DB_PASSWORD'
```

### Verify in Code
```python
from app.core.config import settings

if settings.USE_DEFAULT_OTP:
    print("Default OTP is enabled - Development mode")
else:
    print("Production mode - Random OTPs")
```

---

## 📋 Reference

**Backend Config File**: `backend/app/core/config.py`
- Setting: `USE_DEFAULT_OTP: bool = False`

**OTP Generator**: `backend/app/utils/otp.py`
- Function: `generate_otp()`
- Returns "MOCK_DB_PASSWORD" if `USE_DEFAULT_OTP=True`
- Returns random 6-digit OTP if `USE_DEFAULT_OTP=False`

**Environment File**: `backend/.env`
```env
USE_DEFAULT_OTP=True  # Set to False for production
```

---

## ✅ Summary

**Default OTP "MOCK_DB_PASSWORD"** is now enabled for development! 

- ✅ All new bookings use the same OTP
- ✅ Perfect for testing without SMS
- ✅ Easy to verify (just use "MOCK_DB_PASSWORD")
- ✅ Works with all testing tools
- ⚠️ Remember to disable for production!

**Start testing immediately!** Create a booking and use OTP: **MOCK_DB_PASSWORD** 🚀
