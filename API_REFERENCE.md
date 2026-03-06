# FIXORA — API Reference

**Base URL**: `http://localhost:8000/api/v1`  
**Auth**: All endpoints (except auth) require `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/register
```json
// Request
{ "phone": "+1234567890", "password": "password123", "name": "John Doe", "email": "john@example.com", "role": "customer" }

// Response
{ "status": "success", "data": { "access_token": "eyJhbGc...", "token_type": "bearer", "user": { "id": "uuid", "phone": "+1234567890", "name": "John Doe", "role": "customer" } } }
```

### POST /auth/login
```json
{ "phone": "+1234567890", "password": "password123" }
```

### GET /auth/me
Returns current user info (id, phone, name, email, role, profile_complete, created_at).

### GET /auth/google/login
Redirects to Google OAuth consent screen.

### GET /auth/google/callback
Handles Google OAuth callback, creates/finds user, returns JWT.

---

## Categories

### GET /categories
Returns list of service categories (id, name, description, icon, is_active).

---

## Technicians

### GET /technicians?skill=&lat=&lng=&radius_km=&online=true
Search/filter technicians by skill, location, radius, online status.

### GET /technicians/{id}
Get technician profile details.

### GET /technician/applications?status=pending
List technician applications (Admin only). Filter by: pending, approved, rejected, suspended.

### PATCH /technician/{id}/approve
Approve technician application (Admin only).

### PATCH /technician/{id}/reject?reason=
Reject technician application with optional reason (Admin only).

### PATCH /technician/{id}/suspend?reason=
Suspend technician account (Admin only).

### PATCH /technician/toggle-status
Toggle online/offline. Requires: technician role + approved status.
```json
// Response
{ "status": "success", "data": { "technician_id": "id", "is_online": true, "status": "approved" } }
```

### GET /technician/profile
Current technician's full profile.

---

## Bookings

### POST /bookings
Create a new booking. Auto-assigns technician via AI scoring algorithm.
```json
{ "category_id": "cat-id", "address": "123 Main St", "notes": "AC not cooling", "latitude": 19.07, "longitude": 72.87 }
```

### GET /bookings
List bookings for current user.

### GET /bookings/{id}
Booking details including technician info.

### PATCH /bookings/{id}
Update booking status/details.

### POST /bookings/{id}/cancel
Cancel booking. Logic:
- **Technician cancels**: Penalty applied (-0.5 rating, -1.0 for emergency), attempt 3 reassignments, initiate refund if none available
- **Customer cancels**: Mark cancelled, no penalty

```json
{ "reason": "Optional cancellation reason" }
```

### POST /bookings/{id}/otp/generate
Generate 4-digit OTP for job completion verification.

### POST /bookings/{id}/otp/verify
```json
{ "otp_code": "1234" }
```

### POST /bookings/{id}/rate
```json
{ "rating": 5, "feedback": "Excellent service" }
```

---

## Refunds

### GET /bookings/refunds?status=pending
List all refunds (Admin only). Filter: pending, initiated, processed, completed, failed.

### PATCH /bookings/{id}/refund
Process refund (Admin only).
```json
{ "refund_amount": 50.00, "reason": "Technician cancellation" }
```

### PATCH /bookings/refund/{refund_id}/complete
Mark refund as completed (Admin only).
```json
{ "transaction_id": "txn-12345" }
```

---

## Support Tickets

### POST /support/ticket
Create ticket. Supports multipart/form-data with file attachments.

| Field | Type | Required |
|---|---|---|
| subject | string | ✅ |
| description | string | ✅ |
| category | string | ❌ |
| priority | NORMAL/HIGH/URGENT | ❌ |
| booking_id | string | ❌ |
| files | file[] | ❌ |

### GET /support/tickets?status=open
User's own tickets. Filter: open, in_progress, resolved, closed.

### GET /support/all?status=
All tickets (Admin only).

### GET /support/ticket/{id}
Ticket details.

### PATCH /support/ticket/{id}/resolve
```json
{ "resolution": "Issue has been resolved. Refund processed." }
```

### PATCH /support/ticket/{id}/close
Close a ticket (Admin only).

---

## Complaints

### POST /complaints
```json
{ "booking_id": "booking-id", "title": "Overcharge", "description": "Was charged ₹500 extra" }
```

### GET /complaints
List user's complaints.

---

## Earnings

### GET /earnings
Technician earnings summary.

### GET /earnings/analytics?range=month
Earnings analytics with total_earnings, total_jobs, avg_rating, last_10_bookings.

---

## Location Tracking

### POST /tracking/location
Update technician location during active booking.
```json
{ "booking_id": "id", "latitude": 19.07, "longitude": 72.87 }
```

### GET /tracking/location/{booking_id}
Get current technician location for a booking.

### WebSocket: ws://localhost:8000/ws/bookings/{booking_id}
Real-time location tracking. Sends `{ type: "location_update", latitude, longitude, technician_id }`.

---

## AI Chat (FLEX AI)

### POST /ai/chat
```json
{
  "message": "My AC is not cooling",
  "image_base64": "data:image/jpeg;base64,...",  // optional
  "context": { "user_role": "customer", "locale": "en-IN" }
}
```

**Response:**
```json
{
  "assistant_name": "FLEX AI",
  "reply": "Your AC issue could be...",
  "intent": "DIY_TIPS",
  "category": "AC Repair",
  "urgency": "MEDIUM",
  "suggest_booking": true,
  "safe_steps": ["Check remote batteries", "Clean filter"],
  "vision_detected": {
    "device_type": "AC unit",
    "condition": "critical",
    "risk_signals": ["sparks"],
    "confidence": 0.95
  }
}
```

---

## Error Response Format

```json
{ "status": "error", "code": "ERROR_CODE", "details": "Detailed message", "message": "User-friendly message" }
```

### Error Codes
| Code | Meaning |
|---|---|
| MISSING_TOKEN | Authorization header missing |
| INVALID_TOKEN | Token invalid or expired |
| UNAUTHORIZED | Not authenticated |
| FORBIDDEN | Insufficient permissions |
| DUPLICATE_PHONE | Phone already registered |
| INVALID_CREDENTIALS | Login failed |
| NOT_FOUND | Resource not found |
| INVALID_STATUS | Invalid status value |
| INVALID_ROLE | Invalid user role |

### HTTP Status Codes
| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

---

## Frontend Integration Examples

### API Client Setup
```javascript
const API_URL = 'http://localhost:8000/api/v1';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  });
  return response.json();
};
```

### WebSocket Tracking (Customer)
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/bookings/${bookingId}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'location_update') {
    updateMapMarker(data.latitude, data.longitude);
  }
};
```

### WebSocket Location (Technician)
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/technicians/me/location?token=${token}`);
setInterval(() => {
  navigator.geolocation.getCurrentPosition((pos) => {
    ws.send(JSON.stringify({ booking_id, lat: pos.coords.latitude, lng: pos.coords.longitude }));
  });
}, 10000);
```
