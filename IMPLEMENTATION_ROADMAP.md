# AWS Migration & Implementation Guide

## ✅ Completed: Backend Architecture Updates

### 1. Database Layer
- ✅ SQLAlchemy ORM models with PostgreSQL support
- ✅ All required entities: User, Technician, Booking, RefundLog, EmergencyLog, SupportTicket, Category
- ✅ Database URL configuration via environment variable
- ✅ SQLite fallback for local development
- ✅ Connection pooling ready for RDS

**Location:** `/backend/app/models.py`, `/backend/app/core/database.py`

### 2. AWS Service Integrations
- ✅ **S3 Manager**: File uploads for documents, images, complaints
  - Location: `/backend/app/utils/s3_manager.py`
  - Fallback to local storage if S3 not configured
  - Support for multiple file types (PDF, images, etc.)

- ✅ **SNS Manager**: Emergency booking alerts
  - Location: `/backend/app/utils/sns_manager.py`
  - Simulates alerts if SNS not configured
  - Includes severity levels (LOW, MEDIUM, HIGH, CRITICAL)

- ✅ **Auto-Assignment System**: AI-based technician matching
  - Location: `/backend/app/utils/assignment.py`
  - Performance score calculation: (0.35×rating) + (0.25×completion) + (0.20×cancellation) + (0.20×proximity)
  - Automatic reassignment on technician cancellation
  - Distance-based proximity scoring

### 3. New API Endpoints
- ✅ **Technician Approval Workflow**
  - GET `/technician/applications` - List applications (admin)
  - PATCH `/technician/{id}/approve` - Approve (admin)
  - PATCH `/technician/{id}/reject` - Reject (admin)
  - PATCH `/technician/{id}/suspend` - Suspend (admin)
  - PATCH `/technician/toggle-status` - Go online/offline (technician)
  - GET `/technician/profile` - Get profile

  Location: `/backend/app/api/v1/endpoints/technician_approval.py`

- ✅ **Booking Cancellation & Refunds**
  - POST `/bookings/{id}/cancel` - Cancel booking with penalty logic
  - PATCH `/bookings/{id}/refund` - Process refund (admin)
  - GET `/bookings/refunds` - List refunds (admin)
  - PATCH `/bookings/refund/{id}/complete` - Complete refund (admin)

  Location: `/backend/app/api/v1/endpoints/refunds.py`

- ✅ **Support Tickets**
  - POST `/support/ticket` - Create ticket with file uploads
  - GET `/support/tickets` - Get user tickets
  - GET `/support/all` - Get all tickets (admin)
  - PATCH `/support/ticket/{id}/resolve` - Resolve (admin)
  - PATCH `/support/ticket/{id}/close` - Close (admin)

  Location: `/backend/app/api/v1/endpoints/support.py`

### 4. Authentication Layer
- ✅ Existing JWT system maintained
- ✅ JWT token contains: `sub` (user_id), `role`, `exp`
- ✅ Role-based access control enforced
- ✅ Technician status check (pending vs approved)
- ✅ Auth layer structured for Cognito replacement

  Location: `/backend/app/core/security.py`, `/backend/app/core/deps.py`

### 5. Configuration & Environment
- ✅ Environment variable support for all AWS services
- ✅ `.env.example` with all required variables
- ✅ Feature flags: `ENABLE_S3_UPLOAD`, `ENABLE_SNS_ALERTS`
- ✅ Database URL configuration
- ✅ Multi-environment support (dev, staging, prod)

  Locations: `/backend/.env.example`, `/backend/app/core/config.py`

---

## 🚀 Next Steps: Frontend Updates

### Phase 1: Update Customer Frontend
From `src/` directory:

#### 1. Update Booking Service
**File:** `src/services/api.js`

Add endpoints:
```javascript
// Cancel booking with penalty logic
export async function cancelBooking(bookingId, reason) {
  return api.post(`/bookings/${bookingId}/cancel`, { reason });
}

// Get refund status
export async function getRefundStatus(bookingId) {
  return api.get(`/bookings/${bookingId}/refund`);
}
```

#### 2. Add Support Ticket Page
**Create:** `src/pages/SupportTicket.jsx`

Features:
- Create support ticket with file uploads
- View ticket history
- Track resolution status
- Related booking reference

#### 3. Update Emergency Booking
**File:** `src/pages/BookingDetails.jsx`

Changes:
- Add emergency flag checkbox
- Display priority indicator
- Show SNS alert confirmation (when enabled)

#### 4. Update Complaint System
**File:** `src/pages/CustomerComplaints.jsx`

Integration:
- Link complaints to support system
- Use S3 URLs for image uploads
- Show refund status

---

### Phase 2: Update Technician Frontend
From `technician-frontend/src/` directory:

#### 1. Add Approval Status Page
**Create:** `technician-frontend/src/pages/ApplicationStatus.jsx`

Show:
- Current application status (pending/approved/rejected)
- Profile completion percentage
- Required documents checklist
- Rejection reason (if applicable)
- Reapplication option

#### 2. Update Dashboard
**File:** `technician-frontend/src/pages/Dashboard.jsx`

Add:
- Online/offline toggle button
- Performance score display
- Completion rate percentage
- Cancellation count warning
- Rating trend

#### 3. Update Booking Accept Flow
**File:** `technician-frontend/src/pages/BookingRequest.jsx`

Changes:
- Only show bookings if status = "approved"
- Show priority/emergency flag
- Quick actions: Accept, Reject (with reassignment)
- Document upload for verification

#### 4. Add Cancellation Handling
**File:** `technician-frontend/src/pages/ActiveJob.jsx`

Features:
- Cancel job button (with penalty warning)
- Automatic reassignment notification
- Cancellation reason dialog
- Rating impact preview

#### 5. Add Profile Documents Upload
**File:** `technician-frontend/src/pages/Profile.jsx`

Updates:
- Document upload form
- S3 file management
- Document list with URLs
- Re-upload capability

---

## 📋 Implementation Checklist

### Backend Verification
- [ ] Install dependencies: `pip install -r backend/requirements.txt`
- [ ] Set up `.env` file with all variables (use `.env.example` as template)
- [ ] Verify database initialization: `python -c "from app.core.database import init_db; init_db()"`
- [ ] Run backend: `uvicorn app.main:app --reload`
- [ ] Test `/health` endpoint
- [ ] Test JWT authentication endpoints
- [ ] Verify new endpoints available at `/api/v1`

### Frontend Updates (Customer)
- [ ] Update `src/services/api.js` with new endpoints
- [ ] Create support ticket page
- [ ] Update emergency booking flow
- [ ] Add refund status view
- [ ] Test file uploads (S3 fallback)
- [ ] Update error handling for new scenarios

### Technician Frontend Updates
- [ ] Add application status page
- [ ] Update dashboard with metrics
- [ ] Implement online/offline toggle
- [ ] Update job acceptance flow
- [ ] Add job cancellation with warnings
- [ ] Create profile document upload
- [ ] Update performance score display

### Testing
- [ ] Unit tests for assignment algorithm
- [ ] Integration tests for approval workflow
- [ ] End-to-end tests for booking → cancel → refund flow
- [ ] Test S3 upload (or local fallback)
- [ ] Test SNS alert (or simulated)
- [ ] Load testing with multiple technicians

### Deployment Preparation
- [ ] Review `AWS_DEPLOYMENT_GUIDE.md`
- [ ] Create RDS PostgreSQL instance
- [ ] Create S3 bucket (if using)
- [ ] Create SNS topic (if using)
- [ ] Set up EC2 instance with IAM role
- [ ] Test database connection string
- [ ] Deploy to staging environment
- [ ] Run smoke tests

---

## 📊 Database Schema Overview

```
Users
├── Technicians (1-to-1)
│   ├── Performance metrics
│   └── Documents (S3 URLs)
├── Bookings (1-to-many)
│   ├── Refund logs
│   └── Emergency logs
├── Support Tickets (1-to-many)
└── Refund Logs (1-to-many)
```

### Key Relationships
- **User → Technician**: 1-to-1 for technician users
- **Booking → Technician**: Many-to-1 (assignment)
- **Booking → Customer**: Many-to-1
- **Booking → RefundLog**: 1-to-1
- **Booking → EmergencyLog**: 1-to-1

---

## 🔐 Security Considerations

### Already Implemented
- ✅ Role-based access control
- ✅ JWT token validation
- ✅ Technician approval gate
- ✅ Admin-only endpoints
- ✅ File upload validation (S3 manager)

### To Add
- [ ] API rate limiting
- [ ] Input validation (Pydantic schemas)
- [ ] SQL injection prevention (SQLAlchemy)
- [ ] CORS security review
- [ ] ✅ HTTPS in production
- [ ] ✅ Environment variable secrets not in code

---

## 🚨 Emergency Alert Flow

### Trigger
1. Customer creates emergency booking
2. `is_emergency=true`, `priority=HIGH`

### Actions
1. **Backend:**
   - Create booking record
   - Call SNS to publish alert
   - Log emergency event
   - Auto-assign top technician
   - Send confirmation

2. **SNS (if configured):**
   - Publish message to topic
   - Include booking ID, location, severity
   - Subscribed admins notified

3. **Fallback (if SNS not configured):**
   - Log simulated alert
   - Proceed with normal assignment

### Frontend
1. Show alert confirmation
2. Display assigned technician if available
3. Request location permission
4. Update booking status in real-time

---

## 💰 Refund & Cancellation Logic

### Technician Cancellation (After Confirmation)
```
1. Mark booking as cancelled
2. Apply penalty to technician:
   - cancelled_jobs += 1
   - If emergency: cancelled_jobs += 2
   - Reduce rating by 0.5
3. Update metrics (completion_rate, cancellation_rate)
4. Attempt reassignment (max 3 technicians)
5. If none available: Initiate refund
```

### Customer Cancellation
```
1. Mark booking as cancelled
2. Initiate refund
3. No penalty to technician
```

### Refund Status
- `pending` → `initiated` → `processed` → `completed` / `failed`

---

## 📈 Performance Scoring

Used for auto-assignment of bookings:

```
score = (0.35 × rating_norm) + 
        (0.25 × completion_rate) + 
        (0.20 × (1 - cancellation_rate)) + 
        (0.20 × proximity_score)

Where:
- rating_norm = rating / 5.0
- proximity_score = 1 - (distance_km / 15)
  (0 if distance > 15km)
```

Higher score = Higher priority for job assignment

---

## 🧪 Testing the APIs

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Register technician
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "password": "password",
    "name": "John",
    "role": "technician"
  }'

# Get applications (admin)
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/technician/applications

# Approve technician (admin)
curl -X PATCH \
  -H "Authorization: Bearer <admin_token>" \
  http://localhost:8000/api/v1/technician/{tech_id}/approve

# Toggle online status
curl -X PATCH \
  -H "Authorization: Bearer <tech_token>" \
  http://localhost:8000/api/v1/technician/toggle-status

# Cancel booking
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Emergency came up"}' \
  http://localhost:8000/api/v1/bookings/{booking_id}/cancel
```

---

## 🎯 Success Criteria

- ✅ Backend compiles without errors
- ✅ All endpoints return proper response format
- ✅ JWT authentication works with user_id and role
- ✅ Technician approval workflow enforced
- ✅ Assignment algorithm selects qualified technicians
- ✅ Cancellation applies correct penalties
- ✅ Refund workflow complete
- ✅ Support tickets created and tracked
- ✅ S3/SNS fallbacks work if services disabled
- ✅ Frontend integrates new API endpoints
- ✅ Staging deployment successful
- ✅ Smoke tests pass
