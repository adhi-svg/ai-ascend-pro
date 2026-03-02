# FieldFix Framework Architecture

## Overview
FieldFix is a **full-stack home services platform** built using modern web technologies with separate frontends for customers and technicians.

---

## Technology Stack

### 🎨 Frontend Architecture

#### **Framework: React 18**
- **Library**: React.js with Vite as the build tool
- **Language**: JavaScript (JSX)
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React

#### **Two Separate Frontends**:

1. **Customer Frontend** (Port: 5173)
   - Location: `src/`
   - Entry: `src/main.jsx`
   - Context: AppContext (Customer-specific state)
   - Routes: Customer booking flow, tracking, complaints, etc.

2. **Technician Frontend** (Port: 5174)
   - Location: `technician-frontend/`
   - Entry: `technician-frontend/src/main.jsx`
   - Context: AuthContext + TechAppContext (Technician-specific state)
   - Routes: Dashboard, jobs, earnings, profile, etc.

---

### 🔧 Backend Architecture

#### **Framework: FastAPI (Python)**
- **Framework**: FastAPI 0.115+
- **Language**: Python 3.x
- **Server**: Uvicorn (ASGI server)
- **API Style**: RESTful + WebSocket
- **Location**: `backend/`
- **Entry**: `backend/app/main.py`

#### **Backend Structure**:
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── api/v1/              # API endpoints
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── bookings.py      # Booking management
│   │   ├── categories.py    # Service categories
│   │   ├── complaints.py    # Customer complaints
│   │   └── technicians.py   # Technician management
│   ├── core/
│   │   ├── config.py        # Configuration settings
│   │   ├── deps.py          # Dependencies (auth, etc.)
│   │   └── security.py      # JWT token handling
│   ├── schemas/             # Pydantic models (data validation)
│   ├── stores/              # In-memory data stores
│   ├── utils/               # Utility functions
│   └── ws/                  # WebSocket routes (real-time)
```

---

## How Frontend and Backend Integrate

### 🔗 Communication Method: **REST API + WebSocket**

#### **1. REST API Communication**
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **Base URL**: `http://localhost:8000/api/v1`

**Example Flow**:
```javascript
// Frontend (React) - src/services/api.js
const API_BASE = 'http://localhost:8000/api/v1'

// Customer login
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  })
  return response.json()
}

// Backend (FastAPI) - backend/app/api/v1/auth.py
@router.post("/login")
async def login(data: LoginRequest):
    # Validate credentials
    # Generate JWT token
    return {"success": True, "data": {"user": user_data, "token": jwt_token}}
```

#### **2. WebSocket Communication (Real-time)**
- **Protocol**: WebSocket (ws://)
- **Use Cases**: Live booking tracking, technician location updates
- **Endpoint**: `ws://localhost:8000/ws/track/{booking_id}`

**Example Flow**:
```javascript
// Frontend - Real-time tracking
const ws = new WebSocket(`ws://localhost:8000/ws/track/${bookingId}`)
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Update technician location on map
}

// Backend - WebSocket handler
@router.websocket("/ws/track/{booking_id}")
async def tracking_websocket(websocket: WebSocket, booking_id: str):
    await websocket.accept()
    # Send real-time updates
    await websocket.send_json({"location": {...}})
```

---

## Authentication Flow

### JWT-Based Authentication

1. **User Login**:
   - Frontend sends credentials to `/api/v1/auth/login`
   - Backend validates and returns JWT token
   - Frontend stores token in Context + localStorage

2. **Authenticated Requests**:
   - Frontend includes token in Authorization header
   - Backend validates token using `get_current_user` dependency
   - Protected routes require valid token

```javascript
// Frontend - Add token to requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Backend - Protect routes
@router.get("/bookings")
async def get_bookings(current_user = Depends(get_current_user)):
    # Only accessible with valid token
    return bookings
```

---

## Data Flow Example: Customer Books a Service

### Step-by-Step:

1. **Customer Frontend** (React):
   - User selects service, date, location
   - Fills booking form
   - Clicks "Book Now"

2. **API Call** (HTTP POST):
   ```javascript
   POST /api/v1/bookings
   Body: {
     category_id: "plumbing",
     scheduled_at: "2026-02-15T10:00:00",
     address: {...},
     issues: ["Leaking pipe"]
   }
   ```

3. **Backend Processing** (FastAPI):
   - Validates request data using Pydantic schema
   - Finds available technician
   - Creates booking in store
   - Returns booking confirmation

4. **Response** (JSON):
   ```json
   {
     "success": true,
     "data": {
       "booking_id": "BK001",
       "status": "pending",
       "technician": {...}
     }
   }
   ```

5. **Technician Frontend** (React):
   - Receives notification (via polling or WebSocket)
   - Displays new job request
   - Technician accepts/rejects

6. **Real-time Updates** (WebSocket):
   - Customer sees "Technician assigned"
   - Live location tracking
   - Status updates (on_the_way, in_progress, completed)

---

## State Management

### Customer Frontend (AppContext):
```javascript
// src/context/AppContext.jsx
const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  
  // Shared state and functions
  return (
    <AppContext.Provider value={{user, bookings, ...}}>
      {children}
    </AppContext.Provider>
  )
}
```

### Technician Frontend (AuthContext + TechAppContext):
```javascript
// technician-frontend/src/context/AuthContext.jsx
// Handles authentication state

// technician-frontend/src/context/TechAppContext.jsx
// Handles jobs, earnings, notifications
```

---

## CORS Configuration

Backend allows requests from both frontends:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Customer frontend
        "http://localhost:5174"   # Technician frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Development Workflow

### Running the Full Stack:

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn app.main:app --reload
   # Runs on http://localhost:8000
   ```

2. **Start Customer Frontend** (Terminal 2):
   ```bash
   npm run dev
   # Runs on http://localhost:5173
   ```

3. **Start Technician Frontend** (Terminal 3):
   ```bash
   cd technician-frontend
   npm run dev -- --port 5174
   # Runs on http://localhost:5174
   ```

---

## Color Scheme (Consistent Across Both Frontends)

### Primary Colors:
- **Orange**: `#f97316` (orange-500) - Primary actions, CTAs
- **Red**: `#ef4444` (red-500) - Accents, gradients
- **Gradient**: `from-orange-500 to-red-500`

### Background Colors:
- **Light Orange**: `#fff7ed` (orange-50) - Subtle backgrounds
- **Light Red**: `#fef2f2` (red-50) - Accent backgrounds
- **White**: `#ffffff` - Cards, modals

### Text Colors:
- **Dark**: `#111827` (gray-900) - Headings
- **Medium**: `#4b5563` (gray-600) - Body text
- **Light**: `#9ca3af` (gray-400) - Secondary text

### Applied Using Tailwind:
```jsx
// Buttons
className="bg-gradient-to-r from-orange-500 to-red-500"

// Backgrounds
className="bg-gradient-to-br from-orange-50 via-white to-red-50"

// Borders
className="border-orange-200"
```

---

## Key Features Integration

### 1. **Google OAuth**:
- Frontend initiates OAuth flow
- Backend handles callback, generates JWT
- User redirected with token

### 2. **Real-time Tracking**:
- WebSocket connection from customer
- Technician sends location updates
- Map updates automatically

### 3. **Payment Processing**:
- Customer completes job
- Frontend shows payment modal
- Backend processes payment (mock implementation)
- Updates booking status

### 4. **Notifications**:
- Backend triggers events
- Frontend polls or uses WebSocket
- Displays toast notifications

---

## Summary

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **Customer Frontend** | React + Vite | 5173 | Customer booking interface |
| **Technician Frontend** | React + Vite | 5174 | Technician job management |
| **Backend API** | FastAPI + Python | 8000 | Business logic + data |
| **Communication** | REST + WebSocket | - | API integration |
| **Styling** | Tailwind CSS | - | Consistent UI/UX |
| **State** | React Context | - | Client-side state |

---

## Why This Architecture?

✅ **Separation of Concerns**: Customer and technician experiences are distinct
✅ **Scalability**: Independent frontends can be deployed separately
✅ **Performance**: FastAPI is one of the fastest Python frameworks
✅ **Real-time**: WebSocket support for live updates
✅ **Type Safety**: Pydantic schemas validate all API data
✅ **Modern Stack**: Latest React + Python best practices
✅ **Developer Experience**: Hot reload, TypeScript-like validation

---

**Built with**: React + FastAPI + Tailwind CSS + WebSocket
**Version**: 1.0.0
**Last Updated**: February 2026
