# Fyxion Backend

Fully working Python backend for Fyxion home-services app using **FastAPI**, in-memory storage, JWT authentication, and WebSocket tracking.

## Features

✅ **Authentication**: JWT-based auth with roles (CUSTOMER, TECHNICIAN, ADMIN)  
✅ **In-Memory Storage**: Dict-based repositories (easily replaceable with DB)  
✅ **REST API**: Full CRUD endpoints for all resources  
✅ **WebSocket**: Real-time location tracking for technicians  
✅ **Pydantic**: Request/response validation  
✅ **CORS**: Pre-configured for React frontend (localhost:5173)  
✅ **OpenAPI Docs**: Auto-generated at `/docs`  

## Tech Stack

- Python 3.11+
- FastAPI
- Uvicorn
- python-jose (JWT)
- passlib (password hashing)
- Pydantic v2

## Quick Start

### 1. Create Virtual Environment

```bash
python -m venv venv
```

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment (Optional)

Copy `.env.example` to `.env` and customize if needed:
```bash
cp .env.example .env
```

Default values work fine for local development.

### 4. Run Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at `http://localhost:8000`

### 5. Access API

- **API Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Default Demo Credentials

Register as customer or technician, or use these demo accounts:

**Customer:**
- Phone: `9000000001`
- Password: `demo123`

**Technician:**
- Phone: `9100000001`
- Password: `demo123`

## API Endpoints

### Authentication
```bash
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login (returns JWT)
GET    /api/v1/auth/me          # Get current user (requires auth)
```

### Categories
```bash
GET    /api/v1/categories       # List all service categories
```

### Technicians
```bash
GET    /api/v1/technicians?skill=AC&lat=..&lng=..  # Search technicians
GET    /api/v1/technicians/{id}                     # Get technician details
PATCH  /api/v1/technicians/me                       # Update my profile
PATCH  /api/v1/technicians/me/online                # Toggle online status
```

### Bookings
```bash
POST   /api/v1/bookings                    # Create booking (customer)
GET    /api/v1/bookings/me                 # My bookings (customer)
GET    /api/v1/technicians/me/bookings     # My bookings (technician)
PATCH  /api/v1/bookings/{id}/assign        # Assign technician
PATCH  /api/v1/bookings/{id}/status        # Update booking status
POST   /api/v1/bookings/{id}/otp/verify    # Verify OTP
POST   /api/v1/bookings/{id}/rating        # Add rating (after completion)
```

### Complaints
```bash
POST   /api/v1/complaints       # Create complaint
GET    /api/v1/complaints/me    # My complaints
```

### Earnings
```bash
GET    /api/v1/technicians/me/earnings         # My earnings
GET    /api/v1/technicians/me/earnings/analytics  # My analytics
```

### Location Tracking
```bash
POST   /api/v1/technicians/me/location   # Update location (REST)
WS     /ws/bookings/{booking_id}         # WebSocket for location updates
WS     /ws/technicians/me/location       # WebSocket for sending location
```

## Example Requests

### Register as Customer
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999",
    "password": "securepass123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Booking
```bash
curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "ac-category-id",
    "address": "123 Main St",
    "notes": "Please call before arriving"
  }'
```

### Assign Technician (Auto)
```bash
curl -X PATCH http://localhost:8000/api/v1/bookings/{booking_id}/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "auto_assign": true
  }'
```

## WebSocket Usage

### JavaScript Client Example

```javascript
// For receiving location updates (Customer)
const ws = new WebSocket('ws://localhost:8000/ws/bookings/{booking_id}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Location update:', data.latitude, data.longitude);
};

// For sending location updates (Technician)
const wsLocation = new WebSocket(
  `ws://localhost:8000/ws/technicians/me/location?token=${token}`
);

wsLocation.send(JSON.stringify({
  booking_id: 'booking-123',
  lat: 40.7128,
  lng: -74.0060
}));
```

## Project Structure

```
backend/
├── app/
│   ├── core/              # Security, config, dependencies
│   ├── stores/            # In-memory data repositories
│   ├── schemas/           # Pydantic models
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/ # Route handlers
│   ├── ws/                # WebSocket logic
│   ├── utils/             # Helpers (responses, exceptions, geo, OTP)
│   └── main.py            # FastAPI app
├── requirements.txt
├── .env.example
└── README.md
```

## Response Format

All endpoints follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  },
  "message": "User-friendly message"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `your-super-secret-key...` | JWT signing key (change in production!) |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiry in minutes |
| `DEBUG` | `True` | Debug mode |

## Notes

- All data is stored in-memory using Python dicts
- On server restart, all data is lost (expected for demo)
- Categories are seeded at startup
- To replace with database: extend the repository classes
- Passwords are hashed with bcrypt
- Location tracking uses Haversine formula for distance calculation

## Next Steps

To integrate with a database:

1. Replace `InMemory*Store` classes with database-backed repositories
2. Migrate data models to SQLAlchemy ORM
3. Add database migrations with Alembic
4. Update dependencies in `requirements.txt`

## Support

For issues or questions, refer to FastAPI docs: https://fastapi.tiangolo.com
