# Technician Job Filtering - Implementation Guide

## 🎯 Overview

The backend now includes comprehensive filtering to ensure **technicians only see jobs that match their service type/skills**. This prevents skill mismatches and improves job matching efficiency.

## ✅ Features Implemented

### 1. **Skill-Based Job Filtering**
Technicians only see bookings for categories they're qualified to handle based on their configured skills.

### 2. **Available Jobs Endpoint**
New endpoint for technicians to discover pending jobs matching their skills.

### 3. **Claim Job Functionality**
Technicians can directly claim available jobs, with automatic skill validation.

### 4. **Enhanced My Bookings**
Existing bookings endpoint now filters by technician skills (safety check).

---

## 📡 API Endpoints

### 1. Get Available Bookings (Matching Skills)

**Endpoint**: `GET /api/v1/bookings/available`

**Description**: Returns pending/assigned bookings that match the technician's skills

**Authorization**: Bearer token (technician role required)

**Query Parameters**:
- `limit` (optional): Maximum results to return (default: 20)

**Request Example**:
```http
GET /api/v1/bookings/available?limit=10
Authorization: Bearer <technician_jwt_token>
```

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-123",
      "customer_id": "customer-456",
      "category_id": "cat-789",
      "category_name": "Plumbing",
      "category_emoji": "🔧",
      "status": "PENDING",
      "address": "123 Main St, Apt 4B",
      "notes": "Kitchen sink leaking",
      "complaint_text": "Water dripping from under sink",
      "complaint_urgency": "HIGH",
      "created_at": "2026-03-06T10:30:00Z"
    }
  ],
  "message": "Found 1 available bookings matching your skills"
}
```

**Filtering Logic**:
- ✅ Only shows bookings for categories matching technician skills
- ✅ Excludes bookings already assigned to the requesting technician
- ✅ Only shows PENDING or ASSIGNED status bookings
- ✅ Sorted by creation time (newest first)

---

### 2. Claim a Booking

**Endpoint**: `POST /api/v1/bookings/{booking_id}/claim`

**Description**: Technician claims an available booking (with skill validation)

**Authorization**: Bearer token (technician role required)

**Request Example**:
```http
POST /api/v1/bookings/booking-123/claim
Authorization: Bearer <technician_jwt_token>
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "booking-123",
    "technician_id": "tech-456",
    "status": "ASSIGNED",
    "updated_at": "2026-03-06T10:35:00Z"
  },
  "message": "Booking claimed successfully"
}
```

**Validations**:
- ✅ Technician must have matching skill for the job category
- ✅ Technician must be online (`is_online: true`)
- ✅ Booking must be in PENDING or ASSIGNED status
- ✅ Automatically triggers timeout-based reassignment (5 minutes)

**Error Responses**:

**Skill Mismatch**:
```json
{
  "success": false,
  "error": {
    "code": "SKILL_MISMATCH",
    "details": "You don't have the required skill: Electrical. Your skills: Plumbing, Carpentry"
  },
  "message": "Validation failed"
}
```

**Technician Offline**:
```json
{
  "success": false,
  "error": {
    "code": "TECHNICIAN_OFFLINE",
    "details": "You must be online to claim bookings"
  }
}
```

---

### 3. Get My Bookings (Enhanced)

**Endpoint**: `GET /api/v1/bookings/technician/me/bookings`

**Description**: Returns bookings assigned to the technician (filtered by skills)

**Authorization**: Bearer token (technician role required)

**Query Parameters**:
- `status` (optional): Filter by booking status (e.g., "ASSIGNED", "ACCEPTED", "IN_PROGRESS")

**Request Example**:
```http
GET /api/v1/bookings/technician/me/bookings?status=ASSIGNED
Authorization: Bearer <technician_jwt_token>
```

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-789",
      "customer_id": "customer-456",
      "technician_id": "tech-456",
      "category_id": "cat-plumbing",
      "status": "ASSIGNED",
      "address": "456 Oak Ave",
      "created_at": "2026-03-06T09:00:00Z"
    }
  ],
  "message": "Bookings retrieved successfully"
}
```

**Filtering Logic**:
- ✅ Only shows bookings assigned to the technician
- ✅ Filters by technician's skills (safety check)
- ✅ Optional status filter

---

## 🔧 Backend Implementation Details

### 1. Booking Store Updates

**File**: `backend/app/stores/booking_store.py`

**New Methods**:

```python
def get_pending_by_category(self, category_id: str) -> List[Dict]:
    """Get all pending bookings for a specific category."""
    return [
        b for b in self.bookings.values()
        if b["category_id"] == category_id and b["status"] == "PENDING"
    ]

def get_available_bookings(self, category_ids: List[str]) -> List[Dict]:
    """Get all pending or assigned bookings for specific categories."""
    return [
        b for b in self.bookings.values()
        if b["category_id"] in category_ids 
        and b["status"] in ["PENDING", "ASSIGNED"]
    ]
```

### 2. Technician Data Model

**Skills Field**: `List[str]`

Technicians have a `skills` array that contains category names they can handle:

```python
technician = {
    "id": "tech-123",
    "user_id": "user-456",
    "skills": ["Plumbing", "Electrical", "Carpentry"],
    "rating": 4.5,
    "is_online": True,
    ...
}
```

### 3. Category Matching Logic

**How it Works**:
1. Technician has `skills: ["Plumbing", "Electrical"]`
2. Categories are fetched: `[{id: "cat-1", name: "Plumbing"}, ...]`
3. Matching category IDs are collected: `["cat-1", ...]`
4. Bookings with those category IDs are returned

---

## 🔄 Complete Workflow

### Scenario: Plumber Finding and Claiming a Job

#### Step 1: Technician Goes Online
```http
PATCH /api/v1/technician/toggle-status
Authorization: Bearer <token>
```

#### Step 2: Check Available Jobs
```http
GET /api/v1/bookings/available?limit=10
Authorization: Bearer <token>
```

**Response**: List of plumbing jobs (only!)

#### Step 3: Claim a Job
```http
POST /api/v1/bookings/booking-123/claim
Authorization: Bearer <token>
```

**Result**: 
- ✅ Job assigned to technician
- ✅ Status changed to ASSIGNED
- ⏱️ 5-minute timer started for acceptance

#### Step 4: Accept the Job
```http
PATCH /api/v1/bookings/booking-123/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED"
}
```

#### Step 5: View My Active Jobs
```http
GET /api/v1/bookings/technician/me/bookings?status=ACCEPTED
Authorization: Bearer <token>
```

---

## ✅ Validation Rules

### Skill Matching
- Technician skills are compared with category names
- **Case-sensitive match**: "Plumbing" ≠ "plumbing"
- Technician can have multiple skills
- Each booking has exactly one category

### Status Transitions
```
PENDING → ASSIGNED (via claim or auto-assign)
ASSIGNED → ACCEPTED (technician confirms)
ACCEPTED → ON_THE_WAY (technician en route)
ON_THE_WAY → IN_PROGRESS (work started)
IN_PROGRESS → COMPLETED (work finished)
```

### Claim Restrictions
- ❌ Cannot claim if not online
- ❌ Cannot claim if skill mismatch
- ❌ Cannot claim if booking already completed/cancelled
- ❌ Cannot claim own bookings (if already assigned)

---

## 🛡️ Security & Permissions

### Role-Based Access Control
- **Technicians**: Can view available bookings, claim jobs, view their bookings
- **Customers**: Can create bookings, view their bookings, rate technicians
- **Admins**: Can assign any booking to any technician

### Automatic Skill Validation
All assignment operations validate technician skills:
1. Customer auto-assigns → System picks skilled technician
2. Technician claims job → System validates skill
3. Admin manually assigns → System validates skill

---

## 📊 Testing the Implementation

### Test Case 1: Filter Available Jobs

**Setup**:
- Technician A: Skills = ["Plumbing"]
- Technician B: Skills = ["Electrical"]
- Booking 1: Category = "Plumbing", Status = "PENDING"
- Booking 2: Category = "Electrical", Status = "PENDING"

**Test**:
```bash
# As Technician A
curl -X GET "http://localhost:8000/api/v1/bookings/available" \
  -H "Authorization: Bearer <tech_a_token>"
```

**Expected Result**: Only Booking 1 (Plumbing) is returned

---

### Test Case 2: Claim Job with Skill Mismatch

**Setup**:
- Technician: Skills = ["Plumbing"]
- Booking: Category = "Electrical"

**Test**:
```bash
curl -X POST "http://localhost:8000/api/v1/bookings/booking-123/claim" \
  -H "Authorization: Bearer <token>"
```

**Expected Result**: 
```json
{
  "success": false,
  "error": {
    "code": "SKILL_MISMATCH",
    "details": "You don't have the required skill: Electrical. Your skills: Plumbing"
  }
}
```

---

### Test Case 3: My Bookings Filtering

**Setup**:
- Technician: Skills = ["Plumbing"]
- Booking 1: Assigned to technician, Category = "Plumbing" ✅
- Booking 2: Assigned to technician, Category = "Electrical" ❌ (should not appear)

**Test**:
```bash
curl -X GET "http://localhost:8000/api/v1/bookings/technician/me/bookings" \
  -H "Authorization: Bearer <token>"
```

**Expected Result**: Only Booking 1 is returned

---

## 🔧 Configuration

### Adding Skills to Technician Profile

**Endpoint**: `PATCH /api/v1/technicians/me`

```json
{
  "skills": ["Plumbing", "Electrical", "HVAC"]
}
```

### Available Categories

Default categories in the system:
- Electrical
- Plumbing
- Carpentry
- Appliance Repair
- HVAC
- Painting
- Cleaning
- Pest Control

---

## 📝 Developer Notes

### Adding New Categories

When adding a new category:
1. Add to `category_store` with unique name
2. Technicians add the category name to their `skills` array
3. Filtering automatically works for new categories

### Database Migration Notes

When migrating to PostgreSQL:
- `skills` field should be `TEXT[]` or `JSON` array
- Index on `technician.skills` for performance
- Index on `booking.category_id` and `booking.status`

### Performance Considerations

- Available bookings query filters in-memory (SQLite/lightweight stores)
- For PostgreSQL, use indexed queries:
  ```sql
  SELECT * FROM bookings 
  WHERE category_id = ANY($1) 
  AND status IN ('PENDING', 'ASSIGNED')
  ORDER BY created_at DESC
  LIMIT 20
  ```

---

## 🎓 Summary

The technician filtering system ensures:
- ✅ **Right jobs to right people**: Only skilled technicians see relevant jobs
- ✅ **Automatic validation**: System prevents skill mismatches
- ✅ **Efficient discovery**: Technicians quickly find jobs they can do
- ✅ **Quality control**: Better service through proper skill matching

---

**Date**: March 6, 2026  
**Version**: 2.0.0  
**Status**: ✅ Implemented and Ready
