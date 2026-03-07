# FYXION — Setup & Deployment Guide

**Version**: 2.0.0 | **Last Updated**: March 2026

---

## Table of Contents
1. [Quick Start (5 Minutes)](#quick-start)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Google OAuth Setup](#google-oauth-setup)
6. [Gemini AI Setup](#gemini-ai-setup)
7. [Environment Variables Reference](#environment-variables)
8. [Demo Credentials](#demo-credentials)
9. [AWS Production Deployment](#aws-production-deployment)
10. [Docker Setup](#docker-setup)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Batch File
```bash
run_project.bat
```

### Option 2: Manual (3 Terminals)

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Customer Frontend:**
```bash
npm install && npm run dev
```

**Terminal 3 — Technician Frontend:**
```bash
cd technician-frontend
npm install && npm run dev
```

### Access Points
| App | URL |
|---|---|
| Customer App | http://localhost:5173 |
| Technician App | http://localhost:5174 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/health |

---

## Project Structure

```
fyxion/
├── src/                          # Customer Frontend (React)
│   ├── components/
│   │   ├── cards/                # ServiceCategoryCard, TechnicianCard, etc.
│   │   ├── layout/              # Header, Footer, BottomNav
│   │   └── ui/                  # Button, Input, Toast, Badge, etc.
│   ├── context/                 # AppContext, ToastContext
│   ├── pages/                   # 22 pages (Login, Home, Booking, etc.)
│   ├── services/api.js          # API client (axios)
│   ├── admin/                   # Admin Panel (pages + components)
│   └── auth/                    # AdminGuard
│
├── technician-frontend/         # Technician Frontend (React)
│   └── src/
│       ├── pages/               # Dashboard, Jobs, Earnings, Profile
│       ├── components/ui/       # Shared UI components
│       ├── context/             # AuthContext, TechAppContext
│       └── layout/              # Navbar, Sidebar, BottomNav
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/   # 14 endpoint modules
│   │   ├── ai/                  # Gemini chat + vision
│   │   ├── auth/                # Auth providers
│   │   ├── core/                # Config, database, security, deps
│   │   ├── models.py            # 7 SQLAlchemy models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── stores/              # Data stores + seed data
│   │   ├── utils/               # S3, SNS, assignment, OTP, geo
│   │   ├── ws/                  # WebSocket routes
│   │   └── main.py              # FastAPI app entry point
│   ├── tests/                   # test_vision.py
│   ├── requirements.txt
│   └── .env
│
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Backend Setup

### Prerequisites
- Python 3.11+
- pip

### Install & Run
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On startup, the backend automatically:
- Initializes SQLite database (`test.db`)
- Creates all 7 tables
- Seeds categories and demo data
- Logs: `✓ Database initialized successfully`

### Dependencies (requirements.txt)
```
fastapi, uvicorn[standard], sqlalchemy, psycopg2-binary, alembic
python-jose[cryptography], passlib[bcrypt], bcrypt==3.2.2
pydantic, pydantic-settings, python-multipart, python-dotenv
google-auth-oauthlib, google-auth-httplib2, google-api-python-client
google-generativeai, pillow, requests, httpx, boto3, email-validator
```

### Test Endpoints
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "test123", "name": "Test User", "role": "customer"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "test123"}'
```

---

## Frontend Setup

### Customer Frontend
```bash
npm install
npm run dev          # Dev server at :5173
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
```

### Technician Frontend
```bash
cd technician-frontend
npm install
npm run dev          # Dev server at :5174
```

### Design System
- **Primary**: `#1E3A5F` (Professional Blue)
- **Accent**: `#E6A11A` (Energetic Gold)
- **Background**: Soft gradients (`#CFEDEE` → `#E8F8F9`)
- **Font**: Inter
- **Framework**: Tailwind CSS with custom tokens

---

## Google OAuth Setup

### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add **Authorized redirect URI**:
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
5. Remove old URI if present: `http://localhost:8000/auth/google/callback`
6. **Save** and wait a few minutes

### 2. Enable APIs
- Maps JavaScript API
- Geocoding API
- Places API

### 3. Test
1. Go to http://localhost:5173/login
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect back and log in automatically

### Troubleshooting OAuth
- **"redirect_uri_mismatch"**: Ensure correct redirect URI in Google Cloud Console
- **"Not Found" on callback**: Fixed in code — uses `/api/v1/auth/google/callback`
- **Manual login fallback**: Phone `9000000001`, Password `customer123`

---

## Gemini AI Setup

### 1. Get API Key
Visit [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API Key

### 2. Set in backend/.env
```env
GOOGLE_API_KEY=AIzaSy_YOUR_KEY_HERE
```

### 3. Restart Backend
Backend auto-loads the key on startup.

### 4. Test
```bash
python test_gemini_chat.py
```

### Features
| Feature | Description |
|---|---|
| Text Chat | Natural language Q&A about home repairs |
| Image Vision | Upload photos of broken devices for AI analysis |
| Safety Detection | Auto-detects fire, sparks, exposed wires → forces HIGH urgency |
| Fallback | Returns safe default response if API unavailable |

### FLEX AI Vision Pipeline
```
User message + optional image
→ Image validation (< 5MB, JPEG/PNG/WebP/GIF)
→ Gemini Vision API (device type, risks, condition)
→ Combine with chat response
→ Safety override if critical risks detected
→ Return enhanced response with vision metadata
```

### Vision API Response
```json
{
  "reply": "⚠️ SAFETY ALERT...",
  "urgency": "HIGH",
  "suggest_booking": true,
  "vision_detected": {
    "device_type": "switchboard",
    "condition": "critical",
    "risk_signals": ["sparks", "burning"],
    "confidence": 0.98
  }
}
```

---

## Environment Variables

### backend/.env
```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True

# Database (default: SQLite)
DATABASE_URL=sqlite:///./test.db
# Production: postgresql://user:password@host:5432/fyxion

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_MAPS_API_KEY=your-maps-key

# Gemini AI
GOOGLE_API_KEY=your-gemini-api-key

# Frontend URLs
FRONTEND_URL=http://localhost:5173
TECHNICIAN_FRONTEND_URL=http://localhost:5174

# AWS (optional for local dev)
ENABLE_S3_UPLOAD=False
ENABLE_SNS_ALERTS=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=
AWS_SNS_TOPIC_ARN=

# Cognito (optional, future)
COGNITO_USER_POOL_ID=
COGNITO_APP_CLIENT_ID=
```

---

## Demo Credentials

### Customer Login
- **Phone**: `9000000001`
- **Password**: `customer123`

### Technician Login (Frontend)
- Uses mock auth — any credentials work in demo mode
- Demo technicians: Anuj Verma (Electrical), Riya Mehta (Plumbing)

### Admin Login
- Navigate to `/admin/login`
- Uses localStorage-based session (not real auth yet)

---

## AWS Production Deployment

### 1. RDS PostgreSQL
```bash
aws rds create-db-instance \
  --db-instance-identifier fyxion-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username fyxion_admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20
```

### 2. S3 Bucket
Create bucket with folders: `documents/`, `images/`, `complaints/`

### 3. SNS Topic
Create topic: `fyxion-emergency-alerts`

### 4. Update .env for Production
```env
DATABASE_URL=postgresql://user:pass@fyxion-db.xxx.rds.amazonaws.com:5432/fyxion
ENABLE_S3_UPLOAD=True
ENABLE_SNS_ALERTS=True
DEBUG=False
FRONTEND_URL=https://yourdomain.com
```

### Deployment Checklist
- [ ] RDS instance created and accessible
- [ ] S3 bucket with correct permissions
- [ ] SNS topic created
- [ ] EC2/ECS with IAM role (S3 + SNS + RDS access)
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] SSL certificate configured
- [ ] Health check: `curl http://<IP>:8000/health`
- [ ] CloudWatch logging enabled
- [ ] RDS automated backups configured

---

## Docker Setup

### Dockerfile (backend)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y gcc postgresql-client && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build & Push to ECR
```bash
docker build -t fyxion-backend:latest .
docker tag fyxion-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/fyxion-backend:latest
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/fyxion-backend:latest
```

---

## Troubleshooting

### Backend won't start
- Check Python 3.11+ installed
- Run `pip install -r requirements.txt`
- Check `.env` file exists in `backend/`

### Google Login fails
- Verify redirect URI in Google Cloud Console matches `/api/v1/auth/google/callback`
- Wait a few minutes after saving changes
- Check backend logs for OAuth errors

### Gemini AI returns fallback response
- Verify `GOOGLE_API_KEY` is set in `backend/.env`
- Key should start with `AIzaSy`
- Restart backend after changing `.env`

### Frontend shows white page
- Check browser console for errors
- Hard refresh: `Ctrl + F5`
- Clear localStorage and try again

### Port conflicts
```powershell
# Kill process on specific port
Get-NetTCPConnection -LocalPort 5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## Presentation Demo Flow

### Quick Demo (5 min)
1. Open customer app → Login with demo credentials
2. Browse services → Select "AC Repair" → Choose technician
3. Book service → Watch auto-acceptance (3 seconds)
4. Complete mock payment → Track technician on map
5. OTP verification → Rate and feedback

### Dual-Screen Demo
- Customer app on left screen (`:5173`)
- Technician app on right screen (`:5174`)
- Show real-time job acceptance + tracking

### Key Wow Moments
- ✨ 3-second auto-acceptance
- 📍 Live map tracking with ETA countdown
- 💳 Smooth payment modal
- 🔔 Real-time toast notifications
- 🎊 Celebration animations on completion
