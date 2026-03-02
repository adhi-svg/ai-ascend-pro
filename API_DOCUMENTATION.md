# FieldFix API Documentation

## Overview

FieldFix Backend API v2.0.0 - Home Services Platform with AWS Integration

**Base URL:** `http://localhost:8000/api/v1` (development)

## Authentication

All endpoints (except auth endpoints) require JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### JWT Token Structure
- `sub`: User ID
- `role`: User role (customer, technician, admin)
- `exp`: Expiration time

---

## Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "phone": "+1234567890",
  "password": "password123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer"  // or "technician"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "user": {
      "id": "user-id",
      "phone": "+1234567890",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

#### POST /auth/login
Login with phone and password.

**Request:**
```json
{
  "phone": "+1234567890",
  "password": "password123"
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "user-id",
    "phone": "+1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "profile_complete": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

---

### Technician Approval Endpoints

#### GET /technician/applications
Get all technician applications (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, suspended)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "tech-id",
      "user_id": "user-id",
      "status": "pending",
      "rating": 4.8,
      "rating_count": 42,
      "completed_jobs": 50,
      "cancelled_jobs": 2,
      "completion_rate": 0.96,
      "cancellation_rate": 0.04,
      "profile_image_url": "https://...",
      "performance_score": 0.85,
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "message": "Found X technician applications"
}
```

#### PATCH /technician/{technician_id}/approve
Approve a technician application (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "technician_id": "tech-id",
    "status": "approved"
  },
  "message": "Technician approved"
}
```

#### PATCH /technician/{technician_id}/reject
Reject a technician application.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `reason`: Optional rejection reason

#### PATCH /technician/{technician_id}/suspend
Suspend a technician account (Admin only).

**Query Parameters:**
- `reason`: Optional suspension reason

#### PATCH /technician/toggle-status
Toggle technician online/offline status (Technician only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "technician_id": "tech-id",
    "is_online": true,
    "status": "approved"
  },
  "message": "Technician is now online"
}
```

**Requirements:**
- User must have technician role
- Technician must be approved status
- Cannot go online if suspended or pending

#### GET /technician/profile
Get current technician profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "tech-id",
    "user_id": "user-id",
    "status": "approved",
    "rating": 4.8,
    "is_online": true,
    "is_busy": false,
    "performance_score": 0.85,
    ...
  }
}
```

---

### Booking Endpoints

#### POST /bookings/{booking_id}/cancel
Cancel a booking (Customer, Technician, or Admin).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "reason": "Optional cancellation reason"
}
```

**Cancellation Logic:**
- If technician cancels: Apply penalty, attempt reassignment (max 3), initiate refund if no one available
- If customer cancels: Mark as cancelled
- Emergency cancellations: Apply double penalty to technician

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking_id": "booking-id",
    "status": "cancelled"
  }
}
```

---

### Refund Endpoints

#### PATCH /bookings/{booking_id}/refund
Process refund for a booking (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "refund_amount": 50.00,
  "reason": "Technician cancellation"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "refund_id": "refund-id",
    "booking_id": "booking-id",
    "amount": 50.00,
    "status": "initiated"
  }
}
```

#### GET /bookings/refunds
Get all refunds (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (pending, initiated, processed, completed, failed)

#### PATCH /bookings/refund/{refund_id}/complete
Mark refund as completed (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "transaction_id": "txn-12345"  // Optional
}
```

---

### Support Ticket Endpoints

#### POST /support/ticket
Create a new support ticket.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Form Data:**
- `subject`: string (required)
- `description`: string (required)
- `category`: string (optional)
- `priority`: string (optional, default: NORMAL) - NORMAL, HIGH, URGENT
- `booking_id`: string (optional)
- `files`: file[] (optional) - Multiple attachments supported

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "ticket-id",
    "user_id": "user-id",
    "subject": "Issue with booking",
    "status": "open",
    "priority": "NORMAL",
    "attachment_urls": "http://...",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### GET /support/tickets
Get user's support tickets.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (open, in_progress, resolved, closed)

#### GET /support/ticket/{ticket_id}
Get specific support ticket.

**Headers:** `Authorization: Bearer <token>`

#### GET /support/all
Get all support tickets (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status

#### PATCH /support/ticket/{ticket_id}/resolve
Mark ticket as resolved (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "resolution": "Issue has been resolved. Refund processed."
}
```

#### PATCH /support/ticket/{ticket_id}/close
Close a ticket (Admin only).

---

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "details": "Detailed error message",
  "message": "User-friendly message"
}
```

### Common Error Codes

- `MISSING_TOKEN`: Authorization header missing
- `INVALID_TOKEN`: Token is invalid or expired
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Insufficient permissions
- `DUPLICATE_PHONE`: Phone number already registered
- `INVALID_CREDENTIALS`: Login failed
- `NOT_FOUND`: Resource not found
- `INVALID_STATUS`: Invalid status value
- `INVALID_ROLE`: Invalid user role

---

## Data Models

### User
```
{
  id: string (UUID)
  phone: string (unique)
  email: string (nullable, unique)
  name: string
  password_hash: string
  role: "customer" | "technician" | "admin"
  profile_complete: boolean
  google_id: string (nullable)
  facebook_id: string (nullable)
  created_at: datetime
  updated_at: datetime
}
```

### Technician
```
{
  id: string (UUID)
  user_id: string (FK User)
  status: "pending" | "approved" | "rejected" | "suspended"
  skills: string (JSON array)
  category_id: string
  city: string
  area: string
  latitude: float
  longitude: float
  rating: float (0-5)
  rating_count: integer
  completed_jobs: integer
  cancelled_jobs: integer
  completion_rate: float (0-1)
  cancellation_rate: float (0-1)
  is_online: boolean
  is_busy: boolean
  is_available: boolean
  profile_image_url: string (S3 URL)
  documents: string (JSON array of URLs)
  performance_score: float (0-1)
  created_at: datetime
  updated_at: datetime
}
```

### Booking
```
{
  id: string (UUID)
  customer_id: string (FK User)
  technician_id: string (FK User, nullable)
  category_id: string
  service_name: string
  description: string
  latitude: float
  longitude: float
  address: string
  city: string
  preferred_date: datetime
  appointment_time: string
  duration_minutes: integer
  estimated_cost: decimal
  actual_cost: decimal
  status: "pending" | "assigned" | "confirmed" | "in_progress" | "completed" | "cancelled" | "failed"
  priority: "NORMAL" | "HIGH" | "EMERGENCY"
  is_emergency: boolean
  cancellation_reason: string (nullable)
  cancelled_by: "customer" | "technician" (nullable)
  cancelled_at: datetime (nullable)
  refund_status: "pending" | "initiated" | "processed" | "completed" | "failed"
  refund_amount: decimal (nullable)
  created_at: datetime
  updated_at: datetime
}
```

### SupportTicket
```
{
  id: string (UUID)
  user_id: string (FK User)
  booking_id: string (nullable)
  subject: string
  description: string
  category: string
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
  status: "open" | "in_progress" | "resolved" | "closed"
  resolution: string (nullable)
  resolved_at: datetime (nullable)
  assigned_admin_id: string (nullable)
  attachment_urls: string (pipe-separated URLs)
  created_at: datetime
  updated_at: datetime
}
```

### RefundLog
```
{
  id: string (UUID)
  booking_id: string (FK Booking)
  initiated_by_user_id: string (FK User)
  amount: decimal
  reason: string
  status: "pending" | "initiated" | "processed" | "completed" | "failed"
  transaction_id: string (nullable)
  processed_at: datetime (nullable)
  created_at: datetime
  updated_at: datetime
}
```

---

## Performance Scoring Algorithm

Technician performance score is calculated as:

```
score = (0.35 × rating_score) + (0.25 × completion_rate) + 
        (0.20 × cancellation_penalty) + (0.20 × proximity_score)

Where:
- rating_score = technician.rating / 5.0 (normalized 0-1)
- completion_rate = completed_jobs / total_jobs
- cancellation_penalty = 1.0 - cancellation_rate
- proximity_score = 1.0 - (distance_km / max_distance_km)
  (0 if distance > 15km)
```

This ensures fair distribution of jobs based on:
1. Customer satisfaction (rating)
2. Reliability (completion rate)
3. Commitment (cancellation rate)
4. Convenience (proximity)

---

## Deployment Configuration

See [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) for:
- PostgreSQL RDS configuration
- S3 bucket setup
- SNS topic configuration
- EC2 deployment
- Docker containerization
- Environment variables
