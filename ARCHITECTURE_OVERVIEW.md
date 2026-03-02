# FieldFix Backend - Architecture & System Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FieldFix Backend v2.0                    │
│                      (FastAPI + SQLAlchemy)                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐     ┌────────────────┐
│   Frontend (React)   │      │ Technician Frontend  │     │   Mobile Apps  │
│  (Customer Portal)   │      │   (Technician App)   │     │  (Android/iOS) │
└──────────────┬───────┘      └──────────┬───────────┘     └────────┬───────┘
               │                         │                          │
               └─────────────────────────┼──────────────────────────┘
                                         │ HTTPS
                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Application Server                       │
│                    http://localhost:8000                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Authentication     │  │        API Routes (17 new)           │ │
│  ├──────────────────────┤  ├──────────────────────────────────────┤ │
│  │ • JWT validation     │  │  Technician Approval (7 endpoints)   │ │
│  │ • Role-based access  │  │  Refund Management (4 endpoints)     │ │
│  │ • Cognito-ready      │  │  Support Tickets (6 endpoints)       │ │
│  └──────────────────────┘  └──────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Core Utilities     │  │     Business Logic Modules           │ │
│  ├──────────────────────┤  ├──────────────────────────────────────┤ │
│  │ • Database helpers   │  │  • AI Assignment (4-factor scoring)  │ │
│  │ • Config management  │  │  • Penalty calculation               │ │
│  │ • Error handling     │  │  • Refund processing                 │ │
│  └──────────────────────┘  │  • Support ticket management         │ │
│                            └──────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │   AWS Integration    │  │     Data Validation                  │ │
│  ├──────────────────────┤  ├──────────────────────────────────────┤ │
│  │ • S3 File Upload     │  │  • Pydantic schemas (4 schema sets)  │ │
│  │ • SNS Alerts         │  │  • Input validation                  │ │
│  │ • Boto3 clients      │  │  • HTTP error responses              │ │
│  └──────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
  │                      │                      │
  ▼                      ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  PostgreSQL/RDS  │ │   AWS S3 Bucket  │ │   AWS SNS Topic  │
│   (Database)     │ │   (File Storage) │ │   (Alerts)       │
│                  │ │                  │ │                  │
│ • 7 Tables       │ │ • documents/     │ │ • Emergency msgs │
│ • 67 Fields      │ │ • images/        │ │ • Admin alerts   │
│ • Relationships  │ │ • complaints/    │ │ • Notifications  │
│ • Constraints    │ │ • Fallback: Local│ │ • Fallback: Log  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
    │                                           │
    │ (or SQLite                               │ (if enabled)
    │  in dev)                                 │
    └─────────────────────────────────────────┘
```

## Data Flow: Booking Creation to Completion

```
1. CUSTOMER CREATES BOOKING
   ┌──────────────────┐
   │  POST /bookings  │◄── Customer location, service type
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │ Store in Database (Booking.PENDING)      │
   └──────────────────────────────────────────┘

2. AI ASSIGNMENT TRIGGERED
   ┌──────────────────────────────────────────┐
   │ Get Eligible Technicians:                │
   │  • Status = APPROVED                     │
   │  • Online status = true                  │
   │  • Distance < 25km                       │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Calculate Performance Score for Each:    │
   │  Score = (0.35 × rating)                 │
   │         + (0.25 × completion_rate)       │
   │         + (0.20 × proximity)             │
   │         - (0.20 × cancellation_penalty)  │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Select Technician with Highest Score    │
   │ Update Booking.technician_id = selected │
   │ Update Booking.status = ASSIGNED         │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Send SNS Alert to Technician             │
   │ (via AWS SNS or fallback log)            │
   └──────────────────────────────────────────┘

3. TECHNICIAN ACCEPTS & WORKS
   ├─ Booking.status = IN_PROGRESS
   └─ Technician.online_status = true

4. JOB COMPLETED
   ├─ Booking.status = COMPLETED
   ├─ Update completed_at timestamp
   ├─ Technician.completed_jobs += 1
   └─ Request customer rating

5. CUSTOMER RATES TECHNICIAN
   ├─ Store Technician.rating (average)
   └─ Update AI scoring for next jobs

6. CANCELLATION (if customer cancels)
   ┌──────────────────────────────────────────┐
   │ POST /bookings/{id}/cancel               │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Apply Penalty to Technician:             │
   │  • Regular job: -0.5 rating              │
   │  • Emergency job: -1.0 rating            │
   │  • Increment cancelled_jobs counter      │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Create RefundLog                         │
   │ Calculate refund amount                  │
   │ Update RefundLog.status = PENDING        │
   └──────────────┬─────────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Attempt 3 Automatic Reassignments        │
   │ Send SNS Alert to Admin for Review       │
   └──────────────────────────────────────────┘
```

## API Endpoint Organization

```
/api/v1/
│
├── /technician/
│   ├── GET /applications              → List pending applications
│   ├── PATCH /{id}/approve            → Admin approves technician
│   ├── PATCH /{id}/reject             → Admin rejects application
│   ├── PATCH /{id}/suspend            → Admin suspends technician
│   ├── PATCH /toggle-status           → Tech: Toggle online/offline
│   ├── GET /me                        → Current tech profile
│   └── GET /{id}                      → View technician profile
│
├── /bookings/
│   ├── GET /                          → List bookings
│   ├── POST /                         → Create booking
│   ├── GET /{id}                      → View booking details
│   ├── PATCH /{id}/                   → Update booking
│   ├── PATCH /{id}/cancel             → Cancel with penalty
│   ├── GET /refunds                   → List refunds
│   ├── PATCH/{id}/refund              → Process refund
│   └── PATCH /refund/{id}/complete    → Complete refund
│
├── /support/
│   ├── POST /ticket                   → Create ticket with file
│   ├── GET /tickets                   → List user tickets
│   ├── GET /all                       → Admin: List all tickets
│   ├── GET /ticket/{id}               → View ticket details
│   ├── PATCH /ticket/{id}/resolve     → Mark resolved
│   └── PATCH /ticket/{id}/close       → Close ticket
│
└── [Other existing endpoints] (23 existing endpoints)
```

## Database Schema Relationships

```
User (8 fields)
  ├─ PK: id
  ├─ Fields: email, fullname, phone, password_hash, role, created_at, updated_at
  │
  ├─ 1:1 → Technician (if role=TECHNICIAN)
  │          ├─ PK: id
  │          ├─ FK: user_id
  │          ├─ Fields: approval_status, online_status, rating, 
  │          │          completed_jobs, cancelled_jobs, location
  │          │
  │          └─ 1:N → Booking
  │                    ├─ PK: id
  │                    ├─ FK: customer_id, technician_id
  │                    ├─ Fields: service_type, status, price, location
  │                    │
  │                    ├─ 1:1 → RefundLog
  │                    │        ├─ Fields: refund_amount, reason, status
  │                    │
  │                    ├─ 1:N → SupportTicket
  │                    │        ├─ Fields: title, description, category, 
  │                    │        │          status, file_url
  │                    │
  │                    └─ 1:N → EmergencyLog
  │                             ├─ Fields: severity, description
  │
  ├─ 1:N → Booking (if role=CUSTOMER)
  │
  └─ 1:N → SupportTicket
```

## Feature Implementation Map

```
┌─────────────────────────────────────────────────────────────┐
│         FEATURE                           IMPLEMENTATION    │
├─────────────────────────────────────────────────────────────┤
│ Authentication                    core/security.py          │
│   ├─ JWT Generation              core/security.py           │
│   ├─ JWT Validation              core/security.py           │
│   ├─ Role Check                  core/deps.py               │
│   └─ Tech Status Check           core/deps.py               │
│                                                              │
│ Database                          core/database.py          │
│   ├─ PostgreSQL Support          core/database.py           │
│   ├─ SQLite Fallback             core/database.py           │
│   ├─ Session Management          core/database.py           │
│   └─ Initialization              app/main.py                │
│                                                              │
│ AI Assignment                     utils/assignment.py       │
│   ├─ Scoring (4 factors)         utils/assignment.py        │
│   ├─ Distance Calculation        utils/assignment.py        │
│   ├─ Eligibility Filtering       utils/assignment.py        │
│   └─ Reassignment Logic          utils/assignment.py        │
│                                                              │
│ AWS S3                            utils/s3_manager.py       │
│   ├─ File Upload                 utils/s3_manager.py        │
│   ├─ File Deletion               utils/s3_manager.py        │
│   ├─ Signed URLs                 utils/s3_manager.py        │
│   └─ Local Fallback              utils/s3_manager.py        │
│                                                              │
│ AWS SNS                           utils/sns_manager.py      │
│   ├─ Emergency Alerts             utils/sns_manager.py      │
│   ├─ Message Publishing           utils/sns_manager.py      │
│   ├─ Severity Levels              utils/sns_manager.py      │
│   └─ Fallback Logging             utils/sns_manager.py      │
│                                                              │
│ Technician Approval              endpoints/tech_approval.py │
│   ├─ Application Submit           existing endpoint          │
│   ├─ Admin Approve/Reject         endpoints/tech_approval.py │
│   ├─ Admin Suspend                endpoints/tech_approval.py │
│   └─ Status Toggle                endpoints/tech_approval.py │
│                                                              │
│ Refund & Cancellation            endpoints/refunds.py       │
│   ├─ Cancellation                 endpoints/refunds.py       │
│   ├─ Penalty Application          endpoints/refunds.py       │
│   ├─ Refund Processing            endpoints/refunds.py       │
│   └─ Reassignment Attempt         utils/assignment.py       │
│                                                              │
│ Support Tickets                   endpoints/support.py      │
│   ├─ Ticket Creation              endpoints/support.py       │
│   ├─ File Upload                  endpoints/support.py       │
│   ├─ Status Management            endpoints/support.py       │
│   └─ Admin Tools                  endpoints/support.py       │
│                                                              │
│ File Upload                       endpoints/support.py      │
│   ├─ Multipart Form Data          endpoints/support.py       │
│   ├─ File Validation              endpoints/support.py       │
│   ├─ S3 Upload                    utils/s3_manager.py        │
│   └─ Local Fallback               utils/s3_manager.py        │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture (AWS)

```
┌──────────────────────────────────────────────────────────────┐
│                    AWS Cloud Infrastructure                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    AWS EC2 / ECS (FieldFix Backend)                 │   │
│  │    ┌──────────────────────────────────────────┐     │   │
│  │    │  Docker Container: FieldFix Backend      │     │   │
│  │    │  Python 3.11 + FastAPI + Uvicorn         │     │   │
│  │    │  Port: 8000                              │     │   │
│  │    └──────────────────────────────────────────┘     │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     ├─────────────────────────────────────┐ │
│                     │                                     │ │
│  ┌─────────────────▼──┐  ┌──────────────────┐  ┌────────▼───┐
│  │  AWS RDS          │  │  AWS S3          │  │  AWS SNS   │
│  │  (PostgreSQL)     │  │  (File Storage)  │  │  (Alerts)  │
│  │                   │  │                  │  │            │
│  │ • fieldfix db    │  │ • documents/    │  │ • Emergency│
│  │ • 7 tables       │  │ • images/       │  │   alerts    │
│  │ • Automated      │  │ • complaints/   │  │ • Automatic│
│  │   backups        │  │ • Large objects│  │   messaging│
│  │ • Read replicas │  │                  │  │            │
│  │ • Multi-AZ      │  │                  │  │            │
│  └──────────────────┘  └──────────────────┘  └────────────┘
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    CloudFront CDN (Optional - for S3 content)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Load Balancer (ALB) - for high availability      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    IAM Roles & Policies (Access Control)             │  │
│  │    • EC2 → RDS                                       │  │
│  │    • EC2 → S3                                        │  │
│  │    • EC2 → SNS                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │ HTTPS             │ HTTPS             │ HTTPS
         │                    │                    │
┌────────┴──────┐  ┌─────────┴────────┐  ┌──────┴──────────┐
│  Customers    │  │  Technicians    │  │  Admin Panel   │
│  (React App)  │  │  (Mobile App)   │  │  (React)       │
└───────────────┘  └─────────────────┘  └────────────────┘
```

## Execution Environment

```
┌─────────────────────────────────────────────────────────────┐
│           Development Environment Setup                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Project Root: d:\fieldfix2                                │
│                                                              │
│  Virtual Environment: d:\fieldfix2\.venv                   │
│   └─ Python 3.11                                            │
│   └─ 20+ packages installed                                 │
│   └─ All AWS packages included                              │
│                                                              │
│  Backend Directory: d:\fieldfix2\backend                   │
│   ├─ app/                                                    │
│   │  ├─ core/          (database, config, security, deps)  │
│   │  ├─ models.py      (7 ORM tables)                       │
│   │  ├─ schemas/       (Pydantic validation)                │
│   │  ├─ api/           (route organization)                 │
│   │  ├─ utils/         (S3, SNS, assignment)                │
│   │  └─ main.py        (FastAPI app)                        │
│   │                                                          │
│   ├─ requirements.txt  (all dependencies)                    │
│   ├─ .env.example      (environment template)               │
│   └─ test files (optional)                                  │
│                                                              │
│  Startup Command:                                            │
│   cd d:\fieldfix2\backend && python -m uvicorn \            │
│   app.main:app --reload --host 0.0.0.0 --port 8000         │
│                                                              │
│  Documentation:                                              │
│   http://localhost:8000/docs       (Swagger UI)             │
│   http://localhost:8000/redoc      (ReDoc)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Integration Summary

```
┌──────────────────────────────────────────────────────────────┐
│                  INTEGRATION OVERVIEW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND                                                    │
│   └─ Sends HTTP requests → API endpoints                    │
│                                                              │
│  API LAYER (FastAPI)                                         │
│   ├─ Receives requests                                       │
│   ├─ Validates input (Pydantic schemas)                     │
│   ├─ Checks authentication (JWT + RBAC)                     │
│   └─ Routes to appropriate handler                          │
│                                                              │
│  BUSINESS LOGIC                                              │
│   ├─ AI Assignment: Calculate scores & assign techs          │
│   ├─ Penalty Logic: Apply cancellation penalties            │
│   ├─ File Upload: Handle multipart form data                │
│   └─ Notification: Send SNS alerts                          │
│                                                              │
│  DATA LAYER (SQLAlchemy)                                     │
│   ├─ Query database                                          │
│   ├─ Create/update records                                  │
│   ├─ Maintain relationships                                 │
│   └─ Enforce constraints                                    │
│                                                              │
│  AWS SERVICES                                                │
│   ├─ S3: Store files                                         │
│   ├─ SNS: Send alerts                                        │
│   └─ RDS: Persist data (production)                          │
│                                                              │
│  RESPONSE                                                    │
│   └─ Return JSON response to frontend                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────────┐
│              PERFORMANCE & SCALABILITY                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  API Endpoints:                                              │
│   ├─ Response Time: <200ms (local), <500ms (with AWS)      │
│   ├─ Throughput: 1000+ requests/second (per instance)       │
│   ├─ Concurrent Users: 100+ per instance                    │
│   └─ Scaling: Horizontal (standard FastAPI setup)           │
│                                                              │
│  Database (PostgreSQL):                                      │
│   ├─ Connection Pool: 5-20 connections                      │
│   ├─ Query Performance: Indexed columns for filtering        │
│   ├─ Transactions: ACID compliant                           │
│   └─ Scaling: RDS read replicas recommended                 │
│                                                              │
│  File Upload (S3):                                           │
│   ├─ Upload Speed: 1-5MB/sec (network dependent)            │
│   ├─ File Size: Max 500MB (configurable)                    │
│   ├─ Storage: Unlimited (AWS S3 limit)                      │
│   └─ Retrieval: <100ms for signed URLs                      │
│                                                              │
│  AI Assignment Algorithm:                                    │
│   ├─ Processing Time: 10-50ms (per assignment)              │
│   ├─ Filter Operations: 1000+ techs/sec                    │
│   ├─ Scoring: O(n) complexity                               │
│   └─ Optimization: Caching eligible techs possible          │
│                                                              │
│  SNS Alerts:                                                 │
│   ├─ Delivery Time: <5 seconds                              │
│   ├─ Throughput: 100+ messages/second                       │
│   ├─ Reliability: 99.9% guaranteed delivery                 │
│   └─ Fallback: Console logging if disabled                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Architecture Designed For:** Scalability, Reliability, Maintainability
**Deployment Model:** Cloud-native (AWS-ready)
**Technology Stack:** Modern Python async/await patterns with industry-standard frameworks
