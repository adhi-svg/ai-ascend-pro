# Frontend Integration Guide

## 🔌 Connecting React Frontend to FastAPI Backend

Backend is running at **http://localhost:8000**

---

## 📡 Base Setup

### Install Fetch/Axios
```bash
cd frontend  # Your React app
npm install axios  # or use native fetch
```

### Create API Client

**`src/services/api.js`**
```javascript
const API_URL = 'http://localhost:8000/api/v1';

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  
  return data;
};

export default api;
```

---

## 🔐 Authentication Flow

### 1. Register

**Component: `src/pages/Register.jsx`**
```javascript
import api from '../services/api';

const handleRegister = async (formData) => {
  try {
    const response = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role // 'customer' or 'technician'
      })
    });
    
    // Save token
    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect
    navigate(formData.role === 'customer' ? '/customer-home' : '/technician-dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### 2. Login

**Component: `src/pages/Login.jsx`**
```javascript
const handleLogin = async (phone, password) => {
  try {
    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    
    localStorage.setItem('authToken', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect based on role
    const role = response.data.user.role;
    navigate(role === 'customer' ? '/customer-home' : '/technician-dashboard');
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### 3. Get Current User

```javascript
const fetchCurrentUser = async () => {
  try {
    const response = await api('/auth/me', { method: 'GET' });
    setCurrentUser(response.data);
  } catch (error) {
    // Token expired, redirect to login
    localStorage.removeItem('authToken');
    navigate('/login');
  }
};

// Use in useEffect
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    fetchCurrentUser();
  }
}, []);
```

---

## 📋 Categories

### Get All Categories

```javascript
const fetchCategories = async () => {
  try {
    const response = await api('/categories');
    setCategories(response.data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

// Usage in ServiceCategoryCard component
useEffect(() => {
  fetchCategories();
}, []);
```

---

## 👨‍🔧 Technicians

### Search Technicians

**Component: `src/pages/TechnicianList.jsx`**
```javascript
const searchTechnicians = async (filters) => {
  try {
    const params = new URLSearchParams();
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radius_km) params.append('radius_km', filters.radius_km);
    if (filters.online) params.append('online', 'true');
    
    const response = await api(`/technicians?${params}`);
    setTechnicians(response.data);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Get Technician Details

```javascript
const fetchTechnicianDetails = async (technicianId) => {
  try {
    const response = await api(`/technicians/${technicianId}`);
    setTechnician(response.data);
  } catch (error) {
    console.error('Failed to load technician:', error);
  }
};
```

### Update Technician Profile

```javascript
const updateTechnicianProfile = async (skills, location) => {
  try {
    const response = await api('/technicians/me', {
      method: 'PATCH',
      body: JSON.stringify({
        skills: skills,
        city: location.city,
        area: location.area,
        latitude: location.latitude,
        longitude: location.longitude
      })
    });
    console.log('Profile updated:', response.data);
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### Toggle Online Status

```javascript
const toggleOnlineStatus = async (isOnline) => {
  try {
    const response = await api(`/technicians/me/online?is_online=${isOnline}`, {
      method: 'PATCH'
    });
    setTechnicianOnline(response.data.is_online);
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};
```

---

## 📅 Bookings

### Create Booking

**Component: `src/pages/CustomerHome.jsx`**
```javascript
const createBooking = async (categoryId, address, notes) => {
  try {
    const response = await api('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        category_id: categoryId,
        address: address,
        notes: notes
      })
    });
    
    const booking = response.data;
    console.log('OTP:', booking.otp_code); // Display to customer
    setBooking(booking);
  } catch (error) {
    console.error('Booking creation failed:', error);
  }
};
```

### Get My Bookings (Customer)

```javascript
const fetchMyBookings = async () => {
  try {
    const response = await api('/bookings/me');
    setMyBookings(response.data);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  }
};
```

### Get Technician Bookings

```javascript
const fetchTechnicianBookings = async () => {
  try {
    const response = await api('/technicians/me/bookings');
    setTechnicianBookings(response.data);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
  }
};
```

### Assign Technician (Auto)

```javascript
const assignTechnicianAuto = async (bookingId) => {
  try {
    const response = await api(`/bookings/${bookingId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ auto_assign: true })
    });
    console.log('Assigned to:', response.data.technician_id);
  } catch (error) {
    console.error('Assignment failed:', error);
  }
};
```

### Update Booking Status

```javascript
const updateBookingStatus = async (bookingId, status, amount = null) => {
  try {
    const response = await api(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: status,
        ...(amount && { amount: amount })
      })
    });
    console.log('Status updated:', response.data);
  } catch (error) {
    console.error('Status update failed:', error);
  }
};

// Usage
updateBookingStatus(bookingId, 'ACCEPTED');
updateBookingStatus(bookingId, 'IN_PROGRESS');
updateBookingStatus(bookingId, 'COMPLETED', 500); // Amount when completing
```

### Verify OTP

**Component: `src/components/OTPModal.jsx`**
```javascript
const verifyOTP = async (bookingId, otpCode) => {
  try {
    const response = await api(`/bookings/${bookingId}/otp/verify`, {
      method: 'POST',
      body: JSON.stringify({ otp_code: otpCode })
    });
    console.log('OTP verified successfully');
  } catch (error) {
    setError('Invalid OTP');
  }
};
```

### Add Rating & Feedback

**Component: `src/pages/RatingFeedback.jsx`**
```javascript
const submitRating = async (bookingId, rating, feedback) => {
  try {
    const response = await api(`/bookings/${bookingId}/rating`, {
      method: 'POST',
      body: JSON.stringify({
        rating: rating, // 1-5
        feedback: feedback
      })
    });
    console.log('Rating submitted:', response.data);
  } catch (error) {
    console.error('Rating submission failed:', error);
  }
};
```

---

## 📍 Location Tracking

### WebSocket: Listen for Location Updates (Customer)

**Component: `src/pages/TechnicianTracking.jsx`**
```javascript
useEffect(() => {
  const bookingId = params.bookingId;
  const ws = new WebSocket(`ws://localhost:8000/ws/bookings/${bookingId}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'location_update') {
      setTechnicianLocation({
        lat: data.latitude,
        lng: data.longitude,
        technicianId: data.technician_id
      });
      // Update map with new coordinates
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return () => ws.close();
}, []);
```

### WebSocket: Send Location Updates (Technician)

**Component: `src/pages/TechnicianDashboard.jsx`**
```javascript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  const ws = new WebSocket(`ws://localhost:8000/ws/technicians/me/location?token=${token}`);
  
  let locationInterval;
  
  ws.onopen = () => {
    // Send location every 10 seconds
    locationInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          ws.send(JSON.stringify({
            booking_id: currentBookingId,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        });
      }
    }, 10000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    clearInterval(locationInterval);
  };
  
  return () => {
    clearInterval(locationInterval);
    ws.close();
  };
}, [currentBookingId]);
```

### REST Fallback: Update Location

```javascript
const updateLocation = async (bookingId, lat, lng) => {
  try {
    const response = await api('/technicians/me/location', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: bookingId,
        lat: lat,
        lng: lng
      })
    });
    console.log('Location updated:', response.data);
  } catch (error) {
    console.error('Location update failed:', error);
  }
};
```

---

## 💬 Complaints

### Create Complaint

**Component: `src/pages/CustomerComplaints.jsx`**
```javascript
const submitComplaint = async (bookingId, title, description) => {
  try {
    const response = await api('/complaints', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: bookingId,
        title: title,
        description: description
      })
    });
    console.log('Complaint submitted:', response.data);
  } catch (error) {
    console.error('Submission failed:', error);
  }
};
```

### Get My Complaints

```javascript
const fetchMyComplaints = async () => {
  try {
    const response = await api('/complaints/me');
    setComplaints(response.data);
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
  }
};
```

---

## 💰 Earnings & Analytics

### Get Technician Earnings

**Component: `src/pages/TechnicianDashboard.jsx`**
```javascript
const fetchEarnings = async () => {
  try {
    const response = await api('/technicians/me/earnings');
    setEarnings(response.data);
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
  }
};
```

### Get Technician Analytics

```javascript
const fetchAnalytics = async (range = 'month') => {
  try {
    const response = await api(`/technicians/me/earnings/analytics?range=${range}`);
    setAnalytics(response.data);
    
    // response.data contains:
    // - total_earnings: number
    // - total_jobs: number
    // - avg_rating: number
    // - last_10_bookings: array
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
};
```

---

## 🔒 Protected Routes

**Component: `src/components/ProtectedRoute.jsx`**
```javascript
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};
```

**Usage in `src/App.jsx`:**
```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  <Route 
    path="/customer-home" 
    element={
      <ProtectedRoute requiredRole="customer">
        <CustomerHome />
      </ProtectedRoute>
    } 
  />
  
  <Route 
    path="/technician-dashboard" 
    element={
      <ProtectedRoute requiredRole="technician">
        <TechnicianDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

---

## ✅ Testing Checklist

- [ ] Login with demo credentials (9000000001 / demo123)
- [ ] Verify JWT token saved to localStorage
- [ ] Fetch and display categories
- [ ] Search technicians with filters
- [ ] Create a booking
- [ ] Assign technician (auto)
- [ ] Update booking status
- [ ] Verify OTP
- [ ] Submit rating
- [ ] Send/receive location via WebSocket
- [ ] Submit complaint
- [ ] View earnings & analytics

---

## 🔗 API Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid data) |
| 401 | Unauthorized (no token/expired) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 422 | Validation error |
| 500 | Server error |

---

## 🚀 Production Deployment

When deploying to production:

1. **Update API URL:**
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
   ```

2. **Update CORS in backend** (`app/main.py`):
   ```python
   allow_origins=[
     "https://yourdomain.com",
     "https://www.yourdomain.com",
   ]
   ```

3. **Use HTTPS:**
   - Change WebSocket to `wss://` instead of `ws://`
   - Use SSL certificates

4. **Secure sensitive data:**
   - Store tokens in httpOnly cookies (not localStorage)
   - Implement refresh token rotation
   - Use environment variables for secrets

---

**Frontend is ready to integrate with backend! 🎉**
