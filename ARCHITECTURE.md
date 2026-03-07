# FYXION — Architecture & System Design

**Version**: 2.0.0 | **Last Updated**: March 2026

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Database Schema](#database-schema)
4. [API Endpoint Map](#api-endpoint-map)
5. [Authentication Architecture](#authentication-architecture)
6. [AI Assignment Algorithm](#ai-assignment-algorithm)
7. [AWS Infrastructure](#aws-infrastructure)
8. [Business Model](#business-model)
9. [Performance Characteristics](#performance-characteristics)

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    FYXION Backend v2.0 (FastAPI + SQLAlchemy)  │
└───────────────────────────────────────────────────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
│ Customer Frontend │   │ Technician App   │   │  Admin Panel  │
│ (React + Vite)   │   │ (React + Vite)   │   │  (React)      │
│ :5173            │   │ :5174            │   │  /admin       │
└───────┬──────────┘   └────────┬─────────┘   └──────┬───────┘
        └──────────────────────┼──────────────────────┘
                               │ HTTP / WebSocket
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                FastAPI Application (:8000)                     │
├───────────────────────────────────────────────────────────────┤
│ Auth (JWT + Google OAuth)  │  17 API Endpoints (v1)           │
│ RBAC (customer/tech/admin) │  Technician Approval (7)         │
│ Cognito-ready structure    │  Refund Management (4)           │
│                            │  Support Tickets (6)             │
├───────────────────────────────────────────────────────────────┤
│ AI Assignment (4-factor)   │  AWS S3 (file upload)            │
│ Penalty Calculation        │  AWS SNS (emergency alerts)      │
│ Gemini AI Chat + Vision    │  WebSocket (real-time tracking)  │
└───────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ PostgreSQL   │   │  AWS S3      │   │  AWS SNS     │
│ (or SQLite)  │   │  (or local)  │   │  (or console)│
│ 7 Tables     │   │  files/docs  │   │  alerts      │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Customer Frontend | React 18, Vite, Tailwind CSS, Leaflet, Axios |
| Technician Frontend | React 18, Vite, Tailwind CSS |
| Backend API | FastAPI, Python 3.11, Uvicorn |
| ORM / Database | SQLAlchemy, PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT (python-jose), Google OAuth, Cognito-ready |
| AI | Google Gemini 1.5 Pro (chat + vision) |
| File Storage | AWS S3 (prod) / local filesystem (dev) |
| Notifications | AWS SNS (prod) / console logging (dev) |
| Real-time | WebSocket (FastAPI native) |
| Maps | Leaflet.js + OpenStreetMap |

---

## Data Flow

### Booking Creation → Completion

```
1. Customer creates booking (POST /bookings)
   → Booking stored with status = PENDING

2. AI Assignment triggered
   → Filter: approved + online + distance < 25km
   → Score = (0.35 × rating) + (0.25 × completion_rate)
           + (0.20 × proximity) - (0.20 × cancellation_penalty)
   → Assign highest scorer → status = ASSIGNED
   → Send SNS alert to technician

3. Technician accepts → status = IN_PROGRESS

4. Job completed → status = COMPLETED
   → Technician completed_jobs += 1
   → Customer rates technician

5. If cancelled:
   → Regular: -0.5 rating, attempt 3 reassignments
   → Emergency: -1.0 rating (double penalty)
   → If no reassignment: create RefundLog (PENDING)
```

---

## Database Schema

```
User (users)
├─ id, phone, email, name, password_hash
├─ role: customer | technician | admin
├─ google_id, facebook_id, profile_complete
├─ created_at, updated_at
│
├─ 1:1 → Technician (technicians)
│   ├─ status: pending | approved | rejected | suspended
│   ├─ skills, category_id, city, area, lat/lng
│   ├─ rating, rating_count, completed_jobs, cancelled_jobs
│   ├─ completion_rate, cancellation_rate, performance_score
│   ├─ is_online, is_busy, is_available
│   ├─ profile_image_url, documents
│   └─ created_at, updated_at
│
├─ 1:N → Booking (bookings)
│   ├─ customer_id, technician_id, category_id
│   ├─ service_name, description, address, city, lat/lng
│   ├─ status: pending | assigned | confirmed | in_progress | completed | cancelled | failed
│   ├─ priority: NORMAL | HIGH | EMERGENCY
│   ├─ estimated_cost, actual_cost, otp_code
│   ├─ cancellation_reason, cancelled_by, refund_status
│   │
│   ├─ 1:1 → EmergencyLog (emergency_logs)
│   │   └─ severity, description, sns_message_id, sns_published
│   │
│   └─ 1:1 → RefundLog (refund_logs)
│       └─ amount, reason, status, transaction_id
│
├─ 1:N → SupportTicket (support_tickets)
│   ├─ subject, description, category
│   ├─ priority: LOW | NORMAL | HIGH | URGENT
│   ├─ status: open | in_progress | resolved | closed
│   └─ resolution, attachment_urls
│
└─ Category (categories)
    └─ name, description, icon, is_active
```

---

## API Endpoint Map

```
/api/v1/
├── /auth/
│   ├─ POST /register           → Create account
│   ├─ POST /login              → Login (phone + password)
│   ├─ GET  /me                 → Current user info
│   ├─ GET  /google/login       → Google OAuth redirect
│   └─ GET  /google/callback    → Google OAuth callback
│
├── /categories/
│   └─ GET  /                   → List service categories
│
├── /technicians/
│   ├─ GET  /                   → Search technicians
│   ├─ GET  /{id}               → Technician profile
│   └─ PATCH /me                → Update profile
│
├── /technician/                (approval + status)
│   ├─ GET  /applications       → List applications (Admin)
│   ├─ PATCH /{id}/approve      → Approve (Admin)
│   ├─ PATCH /{id}/reject       → Reject (Admin)
│   ├─ PATCH /{id}/suspend      → Suspend (Admin)
│   ├─ PATCH /toggle-status     → Online/offline toggle
│   └─ GET  /profile            → Current tech profile
│
├── /bookings/
│   ├─ POST /                   → Create booking
│   ├─ GET  /                   → List bookings
│   ├─ GET  /{id}               → Booking details
│   ├─ PATCH /{id}              → Update booking
│   ├─ POST /{id}/cancel        → Cancel + penalty
│   ├─ PATCH /{id}/refund       → Process refund (Admin)
│   ├─ PATCH /refund/{id}/complete → Complete refund (Admin)
│   ├─ GET  /refunds            → List refunds (Admin)
│   ├─ POST /{id}/otp/generate  → Generate OTP
│   ├─ POST /{id}/otp/verify    → Verify OTP
│   └─ POST /{id}/rate          → Submit rating
│
├── /complaints/
│   ├─ POST /                   → Submit complaint
│   └─ GET  /                   → List complaints
│
├── /earnings/
│   ├─ GET  /                   → Technician earnings
│   └─ GET  /analytics          → Earnings analytics
│
├── /tracking/
│   ├─ POST /location           → Update tech location
│   └─ GET  /location/{booking} → Get tech location
│
├── /support/
│   ├─ POST /ticket             → Create ticket (multipart)
│   ├─ GET  /tickets            → User's tickets
│   ├─ GET  /all                → All tickets (Admin)
│   ├─ GET  /ticket/{id}        → Ticket details
│   ├─ PATCH /ticket/{id}/resolve → Resolve (Admin)
│   └─ PATCH /ticket/{id}/close → Close (Admin)
│
├── /ai/
│   ├─ POST /chat               → AI chat (text + image)
│   └─ POST /agent              → AI agent
│
└── /ws/
    └─ WS /bookings/{id}        → Real-time tracking
```

---

## Authentication Architecture

### Current: JWT + Google OAuth
- **Token payload**: `{ sub: user_id, role: "customer"|"technician"|"admin", exp }`
- **Header**: `Authorization: Bearer <token>`
- **Role-based access**: `require_role("admin")` dependency
- **Files**: `core/security.py`, `core/deps.py`, `api/v1/endpoints/auth.py`

### Cognito Migration Path (Future)
The auth layer uses a pluggable provider pattern:
1. `AuthProvider` base class with `authenticate()`, `validate_token()`, `refresh_token()`
2. `JWTProvider` — current implementation
3. `CognitoProvider` — future, uses `boto3 cognito-idp`
4. Provider selected via `AUTH_PROVIDER` env var (`jwt` or `cognito`)

**Migration**: Setup Cognito user pool → Deploy with `AUTH_PROVIDER=jwt` → Switch to `cognito` on staging → Full migration

---

## AI Assignment Algorithm

```python
score = (0.35 × rating_score)        # rating / 5.0
      + (0.25 × completion_rate)      # completed / total
      + (0.20 × cancellation_penalty) # 1.0 - cancellation_rate
      + (0.20 × proximity_score)      # 1.0 - (distance / 15km)

# Filters: status=approved, is_online=true, distance < 25km
# Emergency: priority=HIGH, assigned immediately
# Reassignment: up to 3 attempts on cancellation
```

---

## AWS Infrastructure (Production)

```
AWS Cloud
├── EC2/ECS         → FastAPI backend (Docker, port 8000)
├── RDS PostgreSQL  → Database (7 tables, automated backups)
├── S3 Bucket       → File storage (documents/, images/, complaints/)
├── SNS Topic       → Emergency alerts, admin notifications
├── IAM Roles       → EC2 → RDS/S3/SNS access policies
├── CloudFront      → CDN for frontend static files
└── ALB             → Load balancer for high availability
```

### IAM Policy (EC2)
```json
{
  "Statement": [
    { "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject"], "Resource": "arn:aws:s3:::fyxion-uploads/*" },
    { "Action": ["sns:Publish"], "Resource": "arn:aws:sns:*:*:fyxion-alerts" },
    { "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"], "Resource": "*" }
  ]
}
```

---

## Business Model

### Revenue Structure

| Revenue Stream | Split | Description |
|---|---|---|
| Booking confirmation fee | Platform 20%, Technician 80% | Customer pays upfront when booking |
| Work/labor charges | Platform 0%, Technician 100% | Direct payment for on-site work |
| Monthly subscription | Platform 100% | ₹299–₹799/month for platform access |

### Example: Plumber pipe repair
- Booking fee ₹200 → Platform ₹40, Technician wallet ₹160
- On-site labor ₹1,500 → Technician 100%
- Materials ₹800 → Technician 100%
- **Technician total: ₹2,460**

### Key Value Props
1. **"Keep 100% of work charges"** — Only 20% on booking confirmation
2. **"Profile works 24/7"** — Visible to thousands of local customers
3. **"Get found two ways"** — Auto-assignment + manual customer selection
4. **"Customer pays upfront"** — Confirmation fee before you travel
5. **"Withdraw anytime"** — Instant wallet to bank transfer

---

## Performance Characteristics

| Aspect | Target |
|---|---|
| API Response Time | < 200ms (local), < 500ms (AWS) |
| Throughput | 1000+ req/sec per instance |
| AI Assignment | 10–50ms per assignment |
| Gemini AI Chat | 1–3 seconds |
| Gemini Vision | 2–5 seconds |
| WebSocket Tracking | Real-time, < 100ms latency |
| S3 Upload | 1–5 MB/sec |
| SNS Delivery | < 5 seconds |
| Image Size Limit | 5 MB |
| Database Pool | 5–20 connections |

---

*Architecture designed for scalability, reliability, and maintainability.*
*Deployment model: Cloud-native (AWS-ready) with local development fallbacks.*
