# FIXORA — AWS Services Setup Guide

**Purpose**: Step-by-step guide to configure all AWS services for FIXORA.  
**Date**: March 2026  
**Status**: Code is ready — only credential configuration needed.

---

## Current Status

| AWS Service | Code Ready | Config Needed | Used For |
|---|---|---|---|
| **S3** | ✅ `s3_manager.py` | Fill credentials in `.env` | Document uploads, images, complaint files |
| **SNS** | ✅ `sns_manager.py` | Fill credentials in `.env` | Emergency alerts, admin notifications |
| **RDS** | ✅ `database.py` | Fill `DATABASE_URL` in `.env` | PostgreSQL production database |
| **Cognito** | ✅ `config.py` (placeholders) | Fill credentials in `.env` | Future auth provider (optional) |

> **All services have local fallbacks**: S3 → local filesystem, SNS → console logging, RDS → SQLite.

---

## Prerequisites

1. **AWS Account** — [Sign up](https://aws.amazon.com/)
2. **AWS CLI** (optional) — `pip install awscli` then `aws configure`
3. **IAM User** with programmatic access

---

## Step 1: Create IAM User & Get Credentials

### 1.1 Go to IAM Console
```
https://console.aws.amazon.com/iam/
```

### 1.2 Create a New User
1. Click **Users** → **Create user**
2. User name: `fixora-backend`
3. Check **Provide user access to the AWS Management Console** (optional)
4. Click **Next**

### 1.3 Attach Policies
Attach these managed policies:
- `AmazonS3FullAccess`
- `AmazonSNSFullAccess`
- `AmazonRDSFullAccess`
- `AmazonCognitoPowerUser` (if using Cognito)

> ⚠️ For production, create a custom policy with minimal permissions instead.

### 1.4 Get Access Keys
1. Go to the created user → **Security credentials** tab
2. Click **Create access key** → Select **Application running outside AWS**
3. **Copy both keys immediately** (you won't see the secret key again)

### 1.5 Update `.env`
```env
AWS_ACCESS_KEY_ID=AKIA...YOUR_KEY_HERE
AWS_SECRET_ACCESS_KEY=wJal...YOUR_SECRET_HERE
AWS_REGION=ap-south-1
```

---

## Step 2: Setup Amazon S3 (File Storage)

### 2.1 Create S3 Bucket
1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Bucket name: `fixora-uploads` (must be globally unique, try `fixora-uploads-yourname`)
4. Region: `ap-south-1` (Asia Pacific - Mumbai) or your preferred region
5. **Uncheck** "Block all public access" (for document URLs to work)
6. Acknowledge the warning
7. Click **Create bucket**

### 2.2 Set Bucket Policy (Public Read for Uploaded Files)
Go to bucket → **Permissions** → **Bucket policy** → Paste:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::fixora-uploads-yourname/*"
        }
    ]
}
```
> Replace `fixora-uploads-yourname` with your actual bucket name.

### 2.3 Create Folder Structure
Inside the bucket, create these folders:
- `documents/` — Technician verification documents (Aadhaar, etc.)
- `images/` — Profile photos, service images
- `complaints/` — Complaint attachment files
- `uploads/` — General uploads

### 2.4 Set CORS Configuration
Go to bucket → **Permissions** → **CORS** → Paste:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
        "ExposeHeaders": ["ETag"]
    }
]
```
> Add your production domain to `AllowedOrigins` when deploying.

### 2.5 Update `.env`
```env
AWS_S3_BUCKET_NAME=fixora-uploads-yourname
ENABLE_S3_UPLOAD=True
```

### 2.6 Verify
Restart backend and check logs:
```
[CONFIG] AWS S3 enabled: True
```

---

## Step 3: Setup Amazon SNS (Notifications)

### 3.1 Create SNS Topic
1. Go to [SNS Console](https://console.aws.amazon.com/sns/)
2. Click **Topics** → **Create topic**
3. Type: **Standard**
4. Name: `fixora-emergency-alerts`
5. Click **Create topic**
6. **Copy the Topic ARN** (looks like `arn:aws:sns:ap-south-1:123456789012:fixora-emergency-alerts`)

### 3.2 Create Email Subscription (for Admin Alerts)
1. Click the topic → **Create subscription**
2. Protocol: **Email**
3. Endpoint: Your admin email address
4. Click **Create subscription**
5. **Check your email** and confirm the subscription

### 3.3 (Optional) Create SMS Subscription
1. Create subscription → Protocol: **SMS**
2. Endpoint: Admin phone number with country code (e.g., `+919876543210`)

### 3.4 Update `.env`
```env
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:fixora-emergency-alerts
ENABLE_SNS_ALERTS=True
```

### 3.5 Verify
Restart backend and check logs:
```
[CONFIG] AWS SNS enabled: True
```

---

## Step 4: Setup Amazon RDS (PostgreSQL Database)

### 4.1 Create RDS Instance
1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Choose:
   - Engine: **PostgreSQL**
   - Version: **15.x** (latest stable)
   - Template: **Free tier** (for dev/testing)
4. Settings:
   - DB instance identifier: `fixora-db`
   - Master username: `fixora_admin`
   - Master password: Choose a strong password
5. Instance configuration:
   - Class: `db.t3.micro` (Free tier)
   - Storage: 20 GB
6. Connectivity:
   - VPC: Default
   - Public access: **Yes** (for development; **No** for production)
   - Security group: Create new or use existing
7. Additional configuration:
   - Initial database name: `fixora`
8. Click **Create database**

### 4.2 Configure Security Group
1. Go to the RDS instance → **Connectivity & security**
2. Click the security group link
3. Edit **Inbound rules** → Add rule:
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **Your IP** (for dev) or **EC2 security group** (for production)

### 4.3 Get Connection Endpoint
1. Go to RDS instance details
2. Copy the **Endpoint** (looks like `fixora-db.c1234abcde.ap-south-1.rds.amazonaws.com`)

### 4.4 Update `.env`
```env
DATABASE_URL=postgresql://fixora_admin:YOUR_PASSWORD@fixora-db.c1234abcde.ap-south-1.rds.amazonaws.com:5432/fixora
```

### 4.5 Initialize Database
After updating DATABASE_URL, restart backend — it auto-creates all 7 tables:
```
[CONFIG] Database URL configured: True
✓ Database tables initialized
```

### 4.6 Verify Connection
```bash
# Test with psql (optional)
psql -h fixora-db.c1234abcde.ap-south-1.rds.amazonaws.com -U fixora_admin -d fixora
```

---

## Step 5: Setup AWS Cognito (Optional — Future Auth)

### 5.1 Create User Pool
1. Go to [Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click **Create user pool**
3. Sign-in options: **Phone number** + **Email**
4. Password policy: Customize as needed
5. MFA: **Optional** (recommended for production)
6. User pool name: `fixora-users`
7. Click **Create user pool**

### 5.2 Create App Client
1. Go to user pool → **App integration** → **Create app client**
2. App client name: `fixora-backend`
3. Authentication flows: `ALLOW_USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
4. Click **Create app client**
5. Copy **Client ID**

### 5.3 Configure Google OAuth (Social Login)
1. Go to user pool → **Sign-in experience** → **Federated identity provider sign-in**
2. Add **Google** as identity provider
3. Enter your existing Google Client ID and Secret
4. Map attributes: `email`, `name`, `phone_number`

### 5.4 Update `.env`
```env
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
```

---

## Complete `.env` Example (All Services Configured)

```env
# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=False

# Database (PostgreSQL on RDS)
DATABASE_URL=postgresql://fixora_admin:YourPassword@fixora-db.xxx.ap-south-1.rds.amazonaws.com:5432/fixora

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_MAPS_API_KEY=your-maps-key

# Gemini AI
GOOGLE_API_KEY=your-gemini-key

# Frontend URLs
FRONTEND_URL=https://your-production-domain.com
TECHNICIAN_FRONTEND_URL=https://tech.your-production-domain.com

# AWS Core
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1

# AWS S3
AWS_S3_BUCKET_NAME=fixora-uploads-yourname
ENABLE_S3_UPLOAD=True

# AWS SNS
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:fixora-emergency-alerts
ENABLE_SNS_ALERTS=True

# AWS Cognito (optional)
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
```

---

## How the Code Uses These Services

### S3 (file: `backend/app/utils/s3_manager.py`)
```
ENABLE_S3_UPLOAD=True  →  Files uploaded to S3 bucket
ENABLE_S3_UPLOAD=False →  Files saved to local_storage/ folder (fallback)
```
- Used by: support ticket attachments, technician documents
- Functions: `s3_manager.upload_file()`, `s3_manager.delete_file()`

### SNS (file: `backend/app/utils/sns_manager.py`)
```
ENABLE_SNS_ALERTS=True  →  Alerts published to SNS topic
ENABLE_SNS_ALERTS=False →  Alerts logged to console (fallback)
```
- Used by: emergency bookings, admin alerts
- Functions: `sns_manager.publish_emergency_alert()`, `sns_manager.publish_custom_alert()`

### RDS (file: `backend/app/core/database.py`)
```
DATABASE_URL=postgresql://...  →  PostgreSQL (production)
DATABASE_URL=sqlite:///...     →  SQLite file (development)
```
- Auto-detects engine type from URL prefix
- All 7 tables created automatically on startup

### Cognito (file: `backend/app/core/config.py`)
```
COGNITO_USER_POOL_ID + COGNITO_APP_CLIENT_ID  →  Cognito auth enabled
Empty values                                   →  JWT auth used (current)
```
- Currently using JWT — Cognito is for future migration
- JWKS URL auto-generated from pool ID

---

## Activation Sequence

Follow this order to enable services one at a time:

### Phase 1: S3 First (Low Risk)
1. Create IAM user + get keys → fill `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
2. Create S3 bucket → fill `AWS_S3_BUCKET_NAME`
3. Set `ENABLE_S3_UPLOAD=True`
4. Restart backend → test file upload via support ticket

### Phase 2: SNS Next
1. Create SNS topic → fill `AWS_SNS_TOPIC_ARN`
2. Create email subscription → confirm email
3. Set `ENABLE_SNS_ALERTS=True`
4. Restart backend → test via emergency booking

### Phase 3: RDS (When Ready for Production)
1. Create RDS instance → get endpoint
2. Update `DATABASE_URL=postgresql://...`
3. Restart backend → tables auto-created
4. Set `DEBUG=False`

### Phase 4: Cognito (Future)
1. Create user pool + app client
2. Fill `COGNITO_USER_POOL_ID`, `COGNITO_APP_CLIENT_ID`
3. Update auth provider code (migration from JWT)

---

## Verification Checklist

After configuring each service, restart backend and check logs:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
[CONFIG] Database URL configured: True          ← True if using PostgreSQL
[CONFIG] AWS Cognito configured: False          ← True when Cognito is set up
[CONFIG] Google Client ID loaded: True          ← Already working
[CONFIG] AWS S3 enabled: True                   ← True after S3 setup
[CONFIG] AWS SNS enabled: True                  ← True after SNS setup
✓ Database tables initialized
```

---

## Estimated Cost (AWS Free Tier)

| Service | Free Tier | After Free Tier |
|---|---|---|
| S3 | 5 GB storage, 20K GET, 2K PUT/month | ~$0.023/GB/month |
| SNS | 1M publishes free | ~$0.50/1M publishes |
| RDS | 750 hrs db.t3.micro, 20GB | ~$15-25/month |
| Cognito | 50K MAU free | ~$0.0055/MAU |

> Total estimated monthly cost (small scale): **$15–30/month** after free tier.

---

## Security Best Practices

1. **Never commit `.env` to Git** — ensure `.gitignore` includes `.env`
2. **Use IAM roles on EC2** instead of access keys in production
3. **Rotate access keys** every 90 days
4. **Enable MFA** on your AWS root account
5. **Use least-privilege IAM policies** in production (not `FullAccess`)
6. **Enable RDS encryption** at rest
7. **Enable S3 bucket versioning** for important data
8. **Set up CloudWatch alarms** for billing and unusual activity

---

*All backend code is ready. Configure credentials → enable feature flags → restart backend.*
