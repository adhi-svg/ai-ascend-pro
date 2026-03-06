# Google Login Debugging Guide

## Issue Resolved
The "Failed to start Google login. Please try again." error has been addressed with improved error logging.

## Current Status ✅

### Backend Configuration
- **Server Status**: Running on `http://localhost:8000`
- **Google Client ID**: Configured in `backend/.env`
- **Google Client Secret**: Configured in `backend/.env`
- **Endpoint**: `/api/v1/auth/google/login` - Responding with **200 OK**

### Frontend Configuration
- **Server**: Running (multiple Node processes detected)
- **Google Client ID**: Configured in `.env`
- **Enhanced Error Logging**: Added to `src/pages/Login.jsx`

## Verification Steps

### 1. Check Backend Server
```powershell
# Verify backend is running
http://localhost:8000/docs
```

### 2. Test Google Login Endpoint
```powershell
# PowerShell command to test endpoint
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/google/login" -Method Get
$response | ConvertTo-Json -Depth 5
```

Expected response:
```json
{
  "success": true,
  "data": {
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  },
  "message": "Google OAuth URL generated"
}
```

### 3. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab when clicking "Continue with Google":

**Look for these log messages:**
- `[Login] Google login initiated via backend`
- `[Login] Response status: 200 OK`
- `[Login] Response data: {...}`
- `[Login] Got auth URL from backend: YES`
- `[Login] Redirecting to Google OAuth with state`

**If you see errors:**
- Note the exact error message
- Check if it's a CORS error
- Check if it's a network error (fetch failed)
- Check the response data structure

### 4. Check Environment Variables

#### Backend (backend/.env)
```env
GOOGLE_CLIENT_ID=308647868127-8n8vb7950h978fcm5kpjii07fir6005n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=MY_GOOGLE_CLIENT_SECRET
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=308647868127-8n8vb7950h978fcm5kpjii07fir6005n.apps.googleusercontent.com
```

### 5. Verify Google OAuth Credentials

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Select your project
2. Go to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Verify **Authorized redirect URIs** include:
   - `http://localhost:8000/api/v1/auth/google/callback`
   - `http://localhost:5173/auth/callback`

## Common Issues and Solutions

### Issue 1: CORS Error in Browser Console
**Error**: `Access to fetch at 'http://localhost:8000/api/v1/auth/google/login' has been blocked by CORS policy`

**Solution**:
Check backend CORS configuration in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Network Error (fetch failed)
**Error**: `Failed to fetch` or `net::ERR_CONNECTION_REFUSED`

**Solution**:
1. Verify backend is running: `http://localhost:8000/docs`
2. Restart backend: 
   ```powershell
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Issue 3: "Google OAuth is not configured"
**Error**: Frontend shows "Google OAuth is not configured"

**Solution**:
1. Check backend logs for error messages
2. Verify `GOOGLE_CLIENT_ID` is set in `backend/.env`
3. Restart backend after adding environment variables

### Issue 4: Invalid redirect_uri
**Error**: `redirect_uri_mismatch` from Google

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add these Authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:8000/api/v1/auth/google/callback`
5. Save changes

### Issue 5: State Mismatch Error
**Error**: "Authentication validation failed - state mismatch"

**Solution**:
1. Clear sessionStorage: Open browser console and run `sessionStorage.clear()`
2. Try logging in again
3. This is a security feature to prevent CSRF attacks

## Testing the Complete Flow

### Step-by-Step Test:

1. **Open Frontend**
   - Navigate to `http://localhost:5173/login`

2. **Open Browser Console**
   - Press F12 to open Developer Tools
   - Go to Console tab

3. **Click "Continue with Google"**
   - Watch console for log messages
   - Should redirect to Google OAuth page

4. **Sign in with Google**
   - Choose your Google account
   - Grant permissions

5. **Callback Handling**
   - Should redirect to `http://localhost:5173/auth/callback`
   - Console should show: `[OAuthCallback] Received OAuth callback`
   - Should then redirect to `/customer/home`

## Manual API Test

Test the endpoint directly with curl or PowerShell:

```powershell
# Test if endpoint is accessible
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/google/login" -UseBasicParsing
$response.Content
```

Expected output should contain:
```json
{
  "success": true,
  "data": {
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
}
```

## Logs to Check

### Backend Logs
Watch for these in your backend terminal:
```
INFO:     127.0.0.1:xxxxx - "GET /api/v1/auth/google/login HTTP/1.1" 200 OK
[OAUTH] Google login URL generated with redirect_uri: http://localhost:5173/auth/callback
```

### Frontend Console Logs
Watch for these in browser console:
```
[Login] Google login initiated via backend
[Login] Response status: 200 OK
[Login] Response data: {...}
[Login] Got auth URL from backend: YES
[Login] OAuth state set for CSRF protection
[Login] Redirecting to Google OAuth with state
```

## Quick Fix Commands

### Restart Backend
```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Restart Frontend
```powershell
npm run dev
```

### Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"

### Check Environment Variables
```powershell
# Backend
cd backend
Get-Content .env | Select-String "GOOGLE"

# Frontend
Get-Content .env | Select-String "GOOGLE"
```

## Next Steps

If the issue persists after trying all the above:

1. **Check the enhanced error message** in the browser console - it will now show more detailed information
2. **Check backend logs** for any exceptions
3. **Verify Google OAuth credentials** in Google Cloud Console
4. **Test with a different browser** to rule out browser-specific issues
5. **Check if antivirus/firewall** is blocking the connection

## Contact Support

If you continue to experience issues, provide this information:
- Exact error message from browser console
- Backend logs (copy the last 20 lines)
- Screenshot of the error
- Browser and version you're using
