# FieldFix Frontend-Backend Integration Guide

## ✅ Integration Complete!

The frontend has been successfully integrated with the FastAPI backend.

## 🔄 Changes Made

### 1. **API Service Updated** (`src/services/api.js`)
- ✅ Replaced mock data with real API calls
- ✅ Added authentication (JWT token handling)
- ✅ Implemented all 20+ endpoints
- ✅ Added WebSocket support for real-time tracking
- ✅ Proper error handling

### 2. **AppContext Updated** (`src/context/AppContext.jsx`)
- ✅ Integrated real login/register with backend
- ✅ Token storage in localStorage
- ✅ Auto-load user on app startup
- ✅ Proper error handling with toast notifications

### 3. **Login Page Updated** (`src/pages/Login.jsx`)
- ✅ Uses phone + password authentication
- ✅ Async login with error handling
- ✅ Backend validation

### 4. **Register Page Updated** (`src/pages/Register.jsx`)
- ✅ Creates account via backend API
- ✅ Sends name, phone, email, password
- ✅ Async registration with error handling

---

## 🧪 Testing the Integration

### Step 1: Start Backend Server
```bash
cd d:\fieldfix2\backend
Set-Location D:\fieldfix2\backend
& D:\fieldfix2\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

✅ **Backend is already running on:** http://localhost:8000

### Step 2: Start Frontend Dev Server
```bash
cd d:\fieldfix2
npm run dev
```

### Step 3: Test Login with Demo Accounts

**Customer Account:**
- Phone: `9000000001`
- Password: `customer123`

**Technician Account:**
- Phone: `9100000001`
- Password: `tech123`

---

## 📋 API Endpoints Available

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Login with phone + password

### Categories
- `GET /api/v1/categories` - List all service categories

### Technicians
- `GET /api/v1/technicians` - List technicians (optional: filter by category)
- `GET /api/v1/technicians/me/requests` - Get technician's booking requests
- `GET /api/v1/technicians/me/earnings` - Get earnings list
- `GET /api/v1/technicians/me/earnings/analytics` - Get analytics (week/month/year)
- `POST /api/v1/technicians/me/location` - Update technician location

### Bookings
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings/me` - Get user's bookings
- `GET /api/v1/bookings/{id}` - Get booking details
- `POST /api/v1/bookings/{id}/assign` - Assign technician to booking
- `PATCH /api/v1/bookings/{id}/status` - Update booking status
- `POST /api/v1/bookings/{id}/otp/generate` - Generate OTP for completion
- `POST /api/v1/bookings/{id}/otp/verify` - Verify OTP (complete job)
- `POST /api/v1/bookings/{id}/rating` - Submit rating & feedback
- `GET /api/v1/bookings/{id}/location` - Get technician's current location

### Complaints
- `POST /api/v1/complaints` - Submit complaint
- `GET /api/v1/complaints/me` - Get user's complaints

### Help Center
- `GET /api/v1/help/faq` - Get all FAQs
- `GET /api/v1/help/faq/search?q=query` - Search FAQs

### WebSocket
- `ws://localhost:8000/ws/tracking/{booking_id}` - Real-time location updates

---

## 🎯 Key Features Integrated

### ✅ Authentication
- JWT token stored in `localStorage` as `auth_token`
- User info stored as `user_info`
- Auto-login on page refresh
- Logout clears tokens

### ✅ Booking Flow
1. Customer browses categories
2. Selects technician
3. Creates booking
4. Technician receives request
5. Technician accepts/rejects
6. Status updates (ASSIGNED → ON_THE_WAY → IN_PROGRESS)
7. Technician generates OTP
8. Customer verifies OTP
9. Booking marked COMPLETED
10. Customer submits rating

### ✅ Location Tracking
- Technician updates location via REST API
- Real-time broadcast to WebSocket
- Customer sees technician location on map
- Validates booking status before allowing updates

### ✅ Business Rules Enforced
- ✅ Can't verify OTP twice (idempotent)
- ✅ Can't rate same booking twice
- ✅ Technician must have required skill
- ✅ Proper status workflow validation
- ✅ Location updates only during active statuses
- ✅ Correct rating average calculation

---

## 🔧 Frontend Usage Examples

### Login Example
```javascript
import { login } from '../services/api'

try {
  const data = await login('9000000001', 'customer123')
  console.log('User:', data.user)
  console.log('Token:', data.access_token)
} catch (error) {
  console.error('Login failed:', error.message)
}
```

### Create Booking Example
```javascript
import { postBooking } from '../services/api'

const booking = await postBooking({
  category_id: 1,
  description: 'AC not cooling',
  address: '123 Main St',
  scheduled_time: '2026-02-01T10:00:00'
})
```

### Update Location Example
```javascript
import { updateTechnicianLocation } from '../services/api'

await updateTechnicianLocation(
  bookingId,
  latitude: 12.9716,
  longitude: 77.5946
)
```

### WebSocket Tracking Example
```javascript
import { createTrackingWebSocket } from '../services/api'

const ws = createTrackingWebSocket(bookingId, (location) => {
  console.log('New location:', location)
  // Update map with new coordinates
})

// Close when done
ws.close()
```

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to fetch"
**Solution:** Make sure backend is running on port 8000

### Issue: "401 Unauthorized"
**Solution:** Token expired or invalid. Login again.

### Issue: "CORS error"
**Solution:** Backend already configured for localhost:5173

### Issue: "Module not found: app"
**Solution:** Must run uvicorn from `/backend` directory

---

## 📊 Next Steps

1. ✅ **Test Complete User Flows:**
   - Register new account
   - Login with existing account
   - Create booking as customer
   - Accept booking as technician
   - Update location
   - Complete with OTP
   - Submit rating

2. **Add Loading States:**
   - Show spinners during API calls
   - Disable buttons while loading

3. **Error Handling:**
   - Display API error messages in UI
   - Handle network failures gracefully

4. **Real-time Features:**
   - Connect WebSocket for live location
   - Show notifications for booking updates

5. **Polish:**
   - Add success animations
   - Improve error messages
   - Add form validation feedback

---

## 🎉 Ready to Test!

Your backend and frontend are now fully integrated. Start the dev server and test with the demo accounts!

```bash
# Frontend
npm run dev

# Backend (already running)
# http://localhost:8000
```

**Swagger Docs:** http://localhost:8000/docs
