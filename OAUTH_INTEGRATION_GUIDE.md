# OAuth Integration Guide

This guide explains how to set up Google and Facebook OAuth authentication, as well as Google Maps integration for your FieldFix application.

## Configuration Overview

Your application now supports:
- **Google OAuth 2.0** for user authentication
- **Facebook OAuth** for user authentication  
- **Google Maps API** for technician tracking

## Step 1: Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add these URIs:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 1.2 Add to Environment Variables

#### Backend (backend/.env)
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Step 2: Google Maps API Setup

### 2.1 Enable Google Maps API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Maps JavaScript API**
3. Click **Enable**
4. Use the same project or create credentials for a new key

### 2.2 Add API Key

The same **Google Cloud API Key** works for both Maps and OAuth. Add it to:

#### Backend (backend/.env)
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### Frontend (.env)
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Step 3: Facebook OAuth Setup

### 3.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in app details and create
5. Go to **Settings** → **Basic** to copy **App ID** and **App Secret**

### 3.2 Configure Facebook Login

1. Add **Facebook Login** product to your app
2. In Facebook Login settings, add redirect URIs:
   - `http://localhost:5173/auth/facebook/callback`
   - `http://localhost:5173` (Valid OAuth Redirect URIs)

### 3.3 Add to Environment Variables

#### Backend (backend/.env)
```env
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

#### Frontend (.env)
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

## Step 4: Implementation in Code

### Backend Endpoints

#### Google OAuth Endpoints

**Initiate Google Login**
```
GET /api/v1/auth/google/login
Returns: { "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

**Google OAuth Callback**
```
GET /api/v1/auth/google/callback?code=AUTH_CODE
Returns: { "access_token": "jwt_token", "user": {...} }
```

#### Facebook OAuth Endpoint

**Verify Facebook Token**
```
POST /api/v1/auth/facebook/login?token=FACEBOOK_TOKEN
Returns: { "access_token": "jwt_token", "user": {...} }
```

### Frontend Integration

#### Login Page (`src/pages/Login.jsx`)

The login page now includes:

**Google Login Button**
- Clicking redirects to Google OAuth
- Automatically creates user if new
- Returns JWT token for session management

**Facebook Login Button**
- Clicking redirects to Facebook OAuth
- Automatically creates user if new
- Returns JWT token for session management

#### Technician Tracking (`src/pages/TechnicianTracking.jsx`)

- Real-time Google Maps integration
- Shows customer and technician locations
- Auto-loads with API key from environment

## Step 5: Testing

### Test Google Login

1. Start both frontend and backend:
   ```bash
   npm run dev        # Frontend (terminal 1)
   python -m uvicorn app.main:app --reload  # Backend (terminal 2)
   ```

2. Navigate to `http://localhost:5173/login`
3. Click "Continue with Google"
4. Complete Google authentication
5. Should redirect to home page with token

### Test Facebook Login

1. Same steps as Google
2. Click "Continue with Facebook"
3. Complete Facebook authentication
4. Should redirect to home page with token

### Test Google Maps

1. Go to Technician Tracking page (requires active booking)
2. Maps should load with:
   - Customer location (blue marker)
   - Technician location (green marker)
   - Real-time position updates

## Environment Variables Summary

### Backend (.env)
```env
# Existing
JWT_SECRET=your-super-secret-key-change-in-production-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True

# OAuth & Maps (Add these)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET}
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
VITE_FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
```

## Troubleshooting

### Google Maps Not Loading
- ✅ Verify `VITE_GOOGLE_MAPS_API_KEY` is set in frontend `.env`
- ✅ Check API key has Maps JavaScript API enabled
- ✅ Check redirect URIs in Google Console

### Google Login Not Working
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` is set
- ✅ Check OAuth redirect URI in Google Console: `http://localhost:8000/auth/google/callback`
- ✅ Ensure backend has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Facebook Login Not Working
- ✅ Verify `VITE_FACEBOOK_APP_ID` is set
- ✅ Check Facebook app settings for correct redirect URIs
- ✅ Ensure backend has `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`

## Security Notes

⚠️ **Production Deployment**:
- Never commit `.env` files to version control
- Use secure environment variable management services
- Enable HTTPS for all redirects (change `http://` to `https://`)
- Update CORS origins to production domain
- Use strong JWT_SECRET key (minimum 32 characters)
- Enable OAuth consent screen verification on Google

## Files Modified

- `backend/.env` - Added OAuth credentials
- `.env` - Created with frontend OAuth config
- `backend/app/core/config.py` - Added OAuth settings
- `backend/app/api/v1/endpoints/auth.py` - Added OAuth endpoints
- `backend/app/stores/user_store.py` - Added `get_by_email` method
- `src/pages/Login.jsx` - Integrated Google & Facebook OAuth buttons
- `src/pages/TechnicianTracking.jsx` - Integrated Google Maps

## Next Steps

1. Replace `${GOOGLE_CLIENT_ID}`, etc. with actual credentials
2. Test OAuth flows with both providers
3. Test Google Maps with active tracking
4. Deploy and update URIs for production
