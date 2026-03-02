# FieldFix Quick Start Guide - v2.0.0

## 🚀 Running the Backend Locally

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your values (local defaults work for development)
# DATABASE_URL=sqlite:///./test.db  # Default SQLite
# ENABLE_S3_UPLOAD=False             # Use local storage
# ENABLE_SNS_ALERTS=False            # Simulate alerts
```

### 3. Run Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Test the API
```bash
# Health check
curl http://localhost:8000/health

# API Docs
# Open: http://localhost:8000/docs (Swagger)
# Or: http://localhost:8000/redoc (ReDoc)
```

---

## 🔑 Authentication

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "password": "password123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "token_type": "bearer",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "+1234567890",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/me
```

---

## 👨‍💼 Technician Workflow

### 1. Register as Technician
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+9876543210",
    "password": "techpass123",
    "name": "Jane Smith",
    "role": "technician"
  }'
```

Status: **PENDING** (awaiting admin approval)

### 2. Admin: View Applications
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:8000/api/v1/technician/applications?status=pending"
```

### 3. Admin: Approve Technician
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8000/api/v1/technician/{TECH_ID}/approve
```

Status: **APPROVED** ✅

### 4. Technician: Toggle Online Status
```bash
curl -X PATCH \
  -H "Authorization: Bearer TECH_TOKEN" \
  http://localhost:8000/api/v1/technician/toggle-status
```

Result: `is_online = true` → Ready to receive jobs

### 5. Technician: Get Profile
```bash
curl -H "Authorization: Bearer TECH_TOKEN" \
  http://localhost:8000/api/v1/technician/profile
```

---

## 📱 Booking & Cancellation

### Customer: Create Booking
```bash
# Use your booking creation endpoint with is_emergency flag
curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "plumbing",
    "service_name": "Pipe Repair",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, NYC",
    "city": "New York",
    "estimated_cost": 150.00,
    "is_emergency": true,
    "priority": "HIGH"
  }'
```

### Cancel Booking (Technician or Customer)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Unable to complete at this time"}' \
  http://localhost:8000/api/v1/bookings/{BOOKING_ID}/cancel
```

---

## 💰 Refunds (Admin Only)

### Process Refund
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refund_amount": 150.00,
    "reason": "Technician cancellation"
  }' \
  http://localhost:8000/api/v1/bookings/{BOOKING_ID}/refund
```

### List Refunds
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:8000/api/v1/bookings/refunds?status=pending"
```

### Complete Refund
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id": "txn_12345"}' \
  http://localhost:8000/api/v1/bookings/refund/{REFUND_ID}/complete
```

---

## 🎟️ Support Tickets

### Create Ticket with Files
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "subject=Issue with my booking" \
  -F "description=The technician didn't show up" \
  -F "category=no_show" \
  -F "priority=HIGH" \
  -F "booking_id=booking-123" \
  -F "files=@/path/to/screenshot.png" \
  http://localhost:8000/api/v1/support/ticket
```

### Get My Tickets
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/support/tickets
```

### Admin: View All Tickets
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:8000/api/v1/support/all?status=open"
```

### Admin: Resolve Ticket
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resolution": "Issue resolved. Refund processed. Apologies for inconvenience."}' \
  http://localhost:8000/api/v1/support/ticket/{TICKET_ID}/resolve
```

---

## 🗄️ Database Management

### Using SQLite (Local)
```bash
# Database file: sqlite:///./test.db
# Auto-created on first run

# Reset database (delete file)
rm test.db
# Backend will recreate it on next startup
```

### Using PostgreSQL (Production)
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/fieldfix"

# Backend initializes schema automatically
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── models.py               # SQLAlchemy ORM models
│   ├── core/
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # Database connection
│   │   ├── security.py        # JWT token handling
│   │   └── deps.py            # Dependency injection
│   ├── api/v1/
│   │   ├── api.py             # Router aggregation
│   │   └── endpoints/
│   │       ├── auth.py        # Authentication
│   │       ├── technician_approval.py  # Approval workflow
│   │       ├── refunds.py     # Cancellation & refunds
│   │       ├── support.py     # Support tickets
│   │       └── ...            # Other endpoints
│   ├── utils/
│   │   ├── s3_manager.py      # AWS S3 integration
│   │   ├── sns_manager.py     # AWS SNS integration
│   │   ├── assignment.py      # Auto-assignment logic
│   │   └── responses.py       # Response formatting
│   └── schemas/               # Pydantic models
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md
```

---

## 🔧 Common Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run backend with auto-reload
uvicorn app.main:app --reload

# Run backend on specific port
uvicorn app.main:app --port 8001

# Run with public access
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Install new package
pip install package-name
pip freeze > requirements.txt

# Run with specific log level
uvicorn app.main:app --log-level debug
```

---

## ⚙️ Configuration

### Environment Variables (in .env)
```bash
# Database
DATABASE_URL=sqlite:///./test.db

# JWT
JWT_SECRET=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google OAuth
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret

# AWS (Optional)
AWS_S3_BUCKET_NAME=bucket-name
ENABLE_S3_UPLOAD=False
ENABLE_SNS_ALERTS=False

# Frontend URLs
FRONTEND_URL=http://localhost:5173
TECHNICIAN_FRONTEND_URL=http://localhost:5174
```

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:8000/health
# Response: {"status": "ok", "version": "2.0.0"}
```

### Auto-Generated Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

### Database Locked (SQLite)
```bash
# Delete database and restart
rm test.db
```

### Import Error
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### CORS Error from Frontend
Check `settings.FRONTEND_URL` and `TECHNICIAN_FRONTEND_URL` in config.

### JWT Token Invalid
1. Make sure token is not expired
2. Check JWT_SECRET matches backend
3. Format: `Authorization: Bearer <token>`

---

## 📞 Support

- **API Docs**: See endpoints in `/docs`
- **Full Documentation**: See `API_DOCUMENTATION.md`
- **Deployment**: See `AWS_DEPLOYMENT_GUIDE.md`
- **Architecture**: See `IMPLEMENTATION_ROADMAP.md`

---

## ✅ Checklist Before Deployment

- [ ] `.env` configured with all required variables
- [ ] Database accessible (RDS or local SQLite)
- [ ] S3 bucket created (if ENABLE_S3_UPLOAD=True)
- [ ] SNS topic created (if ENABLE_SNS_ALERTS=True)
- [ ] All endpoints tested locally
- [ ] Frontend updated with new API calls
- [ ] Error handling added to frontend
- [ ] Load testing completed
- [ ] Security review passed
- [ ] Monitoring/logging configured

---

**Happy coding! 🚀**
