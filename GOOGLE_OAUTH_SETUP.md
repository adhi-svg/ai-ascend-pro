# Google OAuth Setup Guide

## ✅ Fixed Issues

The Google OAuth redirect URI has been corrected. The application now uses the proper API path.

## 🔧 Required: Update Google Cloud Console

You **MUST** update your Google Cloud Console OAuth configuration for Google login to work:

### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (the one with ID: `308647868127-8n8vb7950h978fcm5kpjii07fir6005n`)
5. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
6. **Remove the old URI** (if present):
   ```
   http://localhost:8000/auth/google/callback
   ```
7. Click **Save**

## 📝 Current Configuration

**Frontend (.env):**
```env
VITE_GOOGLE_CLIENT_ID=308647868127-8n8vb7950h978fcm5kpjii07fir6005n.apps.googleusercontent.com
```

**Backend (backend/.env):**
```env
GOOGLE_CLIENT_ID=308647868127-8n8vb7950h978fcm5kpjii07fir6005n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=MY_GOOGLE_CLIENT_SECRET
```

**Redirect URI (configured in code):**
```
http://localhost:8000/api/v1/auth/google/callback
```

## 🧪 Testing

After updating the Google Cloud Console:

1. Go to http://localhost:5173/login
2. Click "Sign in with Google"
3. You should be redirected to Google login
4. After authentication, you'll be redirected back and logged in automatically

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- This means the Google Cloud Console doesn't have the correct redirect URI
- Make sure you added: `http://localhost:8000/api/v1/auth/google/callback`
- Wait a few minutes after saving changes in Google Cloud Console

### Error: {"detail":"Not Found"}
- This was the old error caused by wrong redirect URI in the code
- This has been fixed - the code now uses the correct path

### Test Credentials (Manual Login)
If Google OAuth still doesn't work, you can test with manual login:
- **Phone:** 9000000001
- **Password:** customer123

## 📍 Google Maps API

Your Google Maps API key is already configured:
```
VITE_GOOGLE_MAPS_API_KEY=MY_GOOGLE_MAPS_KEY
```

This is used for:
- Location services
- Technician tracking
- Address autocomplete

Make sure this API key has the following APIs enabled in Google Cloud Console:
- Maps JavaScript API
- Geocoding API
- Places API

---

**Status:** ✅ Code is fixed. Waiting for Google Cloud Console configuration update.
