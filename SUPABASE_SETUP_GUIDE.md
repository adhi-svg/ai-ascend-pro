# Supabase Database Connection Guide

## 🎯 Current Status

**Partially Configured** - Need additional credentials to complete setup.

### ✅ What's Already Configured:
- Supabase URL: `https://mock_supabase_id.supabase.co`
- Publishable Key: `sb_publishable_uDy1krcPPprixVxjwplh7A_wzxaRO6H`
- Backend files updated with Supabase support
- Dependencies added to `requirements.txt`

### ⚠️ What's Missing:
You need **2 more credentials** from your Supabase dashboard:

---

## 📋 Step 1: Get Missing Credentials

### Go to Supabase Dashboard
1. Visit: https://app.supabase.com/project/mock_supabase_id/settings/api
2. Login to your Supabase account

### Find These Credentials:

#### 1. **Service Role Key** (for Backend API)
- **Location**: Settings → API → Project API keys
- **Key Name**: `service_role` (secret)
- **Format**: Starts with `eyJ...` (JWT token)
- **Use**: Backend operations with elevated privileges
- **⚠️ NEVER expose this in frontend!**

#### 2. **Database Password**
- **Location**: Settings → Database → Connection String
- **Look for**: "Connection pooling" or "Direct connection"
- **Password**: In the connection string after `postgres:`
- **Format**: A random string (e.g., `abcd1234xyz...`)

---

## 📝 Step 2: Update Your .env File

Once you have the missing credentials, update `backend/.env`:

```dotenv
# ============================================
# Supabase Configuration
# ============================================
SUPABASE_URL=https://mock_supabase_id.supabase.co
SUPABASE_KEY=sb_publishable_uDy1krcPPprixVxjwplh7A_wzxaRO6H
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY_HERE
SUPABASE_DB_PASSWORD=your-actual-database-password-here

# PostgreSQL Database URL (Update with your password)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.mock_supabase_id.supabase.co:5432/postgres
```

### Example (with fake credentials):
```dotenv
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueHR2cmx3a29mdmJwenJlYWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYzODMxMDgwMCwiZXhwIjoxOTUzODg2ODAwfQ.example_signature
SUPABASE_DB_PASSWORD=MySecureP@ssw0rd123!
DATABASE_URL=postgresql://postgres:MySecureP@ssw0rd123!@db.mock_supabase_id.supabase.co:5432/postgres
```

---

## 🚀 Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `supabase` - Official Supabase Python client
- `postgrest-py` - PostgreSQL REST API client
- `psycopg2-binary` - PostgreSQL adapter (already included)

---

## ✅ Step 4: Test the Connection

### Option A: Test PostgreSQL Connection (SQLAlchemy)
```bash
cd backend
python -c "from app.core.database import engine; print('Database connection test...'); engine.connect(); print('✓ Connected to PostgreSQL!')"
```

### Option B: Test Supabase Client
```bash
cd backend
python -c "from app.core.supabase_client import get_supabase_client; client = get_supabase_client(); print('✓ Supabase client initialized!' if client else '✗ Supabase not configured')"
```

---

## 📊 Step 5: Initialize Database Tables

Run database migrations to create all tables:

```bash
cd backend
python -c "from app.core.database import init_db; init_db(); print('✓ All tables created!')"
```

Or start the backend (it will auto-initialize):
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

---

## 🔧 What Was Changed

### 1. **backend/app/core/config.py**
Added Supabase configuration settings:
```python
SUPABASE_URL: str = ""
SUPABASE_KEY: str = ""
SUPABASE_SERVICE_ROLE_KEY: str = ""
SUPABASE_DB_PASSWORD: str = ""
```

### 2. **backend/.env**
Added Supabase credentials section with your provided values.

### 3. **backend/requirements.txt**
Added:
- `supabase` - Supabase Python SDK
- `postgrest-py` - PostgreSQL REST client

### 4. **backend/app/core/supabase_client.py** (NEW)
Created utility for Supabase client initialization:
- `get_supabase_client()` - For client-side operations
- `get_supabase_admin_client()` - For backend operations with admin access

### 5. **backend/app/core/database.py** (No changes needed!)
Already supports PostgreSQL connections - will automatically use Supabase PostgreSQL when `DATABASE_URL` is updated.

---

## 🎓 How to Use Supabase in Your Code

### Using PostgreSQL (Recommended for this app)

The existing SQLAlchemy models will work automatically:

```python
from app.core.database import get_db
from app.models import User, Booking

# In your endpoint
@router.get("/bookings")
def get_bookings(db = Depends(get_db)):
    bookings = db.query(Booking).all()
    return bookings
```

### Using Supabase Client (Optional)

For Supabase-specific features like Auth, Storage, Realtime:

```python
from app.core.supabase_client import get_supabase_client, get_supabase_admin_client

# Client operations (anon key)
client = get_supabase_client()
if client:
    # Query data
    response = client.table('bookings').select('*').execute()
    
    # Upload file to Storage
    client.storage.from_('avatars').upload('user.jpg', file_bytes)

# Admin operations (service role key)
admin = get_supabase_admin_client()
if admin:
    # Bypass RLS policies
    admin.table('users').insert({'email': 'test@example.com'}).execute()
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store service role key in `.env` file (never commit!)
- Use service role key ONLY in backend
- Use anon/publishable key in frontend
- Enable Row Level Security (RLS) in Supabase dashboard
- Use environment variables for production

### ❌ DON'T:
- Expose service role key in frontend code
- Commit `.env` file to git
- Share service role key publicly
- Use service role key in browser/mobile apps

---

## 🗄️ Database Schema Setup

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to: https://app.supabase.com/project/mock_supabase_id/editor
2. Click "SQL Editor"
3. Create tables using SQL:

```sql
-- Example: Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can read their own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

### Option 2: Using SQLAlchemy Models (Automatic)
Your existing models in `backend/app/models.py` will be auto-created when the backend starts!

```python
# The database.py init_db() will create all tables
from app.core.database import init_db
init_db()
```

---

## 📊 Verify Setup Checklist

- [ ] Got service role key from Supabase dashboard
- [ ] Got database password from connection string
- [ ] Updated `backend/.env` with both credentials
- [ ] Updated `DATABASE_URL` with password
- [ ] Ran `pip install -r requirements.txt`
- [ ] Tested database connection
- [ ] Backend starts without errors
- [ ] Tables created in Supabase dashboard

---

## 🐛 Troubleshooting

### Issue: "Could not connect to database"
**Solution**: Check that:
1. Database password is correct in `DATABASE_URL`
2. Connection string format: `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres`
3. No extra spaces in `.env` file
4. Supabase project is not paused

### Issue: "Supabase client initialization failed"
**Solution**: Check that:
1. `SUPABASE_URL` and `SUPABASE_KEY` are set in `.env`
2. URL format is correct: `https://PROJECT_REF.supabase.co`
3. Key starts with `eyJ...` for service role or `sb_...` for publishable

### Issue: "Permission denied"
**Solution**: 
1. Check if Row Level Security (RLS) is enabled
2. Use service role key for backend operations
3. Create appropriate RLS policies in Supabase dashboard

---

## 📚 Resources

- **Supabase Dashboard**: https://app.supabase.com/project/mock_supabase_id
- **Supabase Docs**: https://supabase.com/docs
- **Python Client**: https://supabase.com/docs/reference/python/introduction
- **Connection Strings**: https://supabase.com/docs/guides/database/connecting-to-postgres

---

## 🎯 Next Steps

1. **Get the missing credentials** from Supabase dashboard (Step 1)
2. **Update .env file** with service role key and database password (Step 2)
3. **Install dependencies**: `pip install -r requirements.txt` (Step 3)
4. **Test connection** to verify setup (Step 4)
5. **Start backend**: `uvicorn app.main:app --reload` (Step 5)

Once complete, your backend will be connected to Supabase PostgreSQL! 🚀

---

## ✅ Summary

**What you provided:**
- ✅ Supabase URL
- ✅ Publishable key

**What you still need:**
- ⚠️ Service role key (from API settings)
- ⚠️ Database password (from connection string)

**Once you have those, update the .env file and restart the backend!**
