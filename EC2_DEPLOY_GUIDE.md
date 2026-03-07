# EC2 Deployment Guide — Fyxion

## Architecture Overview

````
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  CloudFront  │────▶│   S3 Bucket  │     │   EC2 (API)  │
│  (CDN/SSL)   │     │  (Frontends) │     │  Uvicorn +   │
└──────────────┘     └──────────────┘     │  Nginx       │
                                           └──────┬───────┘
                                                  │
                     ┌────────────────────────────┼────────────────────┐
                     │                            │                    │
              ┌──────▼───────┐  ┌────────────────▼──┐  ┌─────────────▼──┐
              │   RDS        │  │   DynamoDB        │  │   S3 (Files)   │
              │  PostgreSQL  │  │  Sessions/Logs    │  │   Uploads      │
              └──────────────┘  └───────────────────┘  └────────────────┘
## 💰 Cost Optimization (How to keep your $50 credit safe)

To avoid exhausting your $50 learner credit, stick strictly to the **AWS Free Tier**:

1. **Database:** An RDS `db.t3.micro` is free (750 hrs/month for 1 year). **WARNING**: Do NOT enable "Multi-AZ" deployment, and keep storage at the minimum (20GB). Alternatively, just use SQLite locally on the EC2 instance (EBS is free up to 30GB) for zero DB costs.
2. **EC2 Instance:** Use `t2.micro` or `t3.micro` (750 hours/month free).
3. **SNS (Alerts):** Sending emails or push notifications is cheap/free, but **SMS text messages cost money** (varies by country, usually ~$0.02 - $0.05 per message). For testing, rely on the backend logs/simulation or use Email instead of SMS to preserve credits.
4. **NAT Gateways:** NEVER create a NAT Gateway. They charge ~$32/month just for existing. Keep your EC2 in a public subnet.
5. **Elastic IPs:** Free *only* if attached to a running EC2 instance. If you stop the instance, you will be billed for the IP. Release it if unused.

---

## Prerequisites

- AWS Account with IAM user (access key + secret key)
- Domain name (optional but recommended)
- Node.js 18+ and Python 3.10+ locally

---

## Step 1: AWS Services Setup

### 1.1 Create IAM User

1. Go to **IAM Console → Users → Add user**
2. Username: `fyxion-deploy`
3. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonSNSFullAccess`
   - `AmazonCognitoPowerUser`
   - `AmazonRDSFullAccess`
4. Create access key → copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 1.2 Create S3 Bucket (File Uploads)

```bash
aws s3 mb s3://fyxion-uploads --region ap-south-1
````

Enable public access for file downloads:

- Bucket → Permissions → Block public access → OFF (for public-read objects)

### 1.3 Create S3 Bucket (Frontend Hosting)

```bash
aws s3 mb s3://fyxion-frontend --region ap-south-1
aws s3 website s3://fyxion-frontend/ --index-document index.html --error-document index.html
```

### 1.4 Create RDS PostgreSQL

1. **RDS Console → Create database**
2. Engine: PostgreSQL 15
3. Instance: `db.t3.micro` (free tier)
4. DB name: `fyxion`
5. Set password, note the endpoint

### 1.5 Create Cognito User Pool (Optional)

1. **Cognito Console → Create User Pool**
2. Configure sign-in: Email + Phone
3. App client: Create without secret
4. Note `User Pool ID` and `App Client ID`

### 1.6 Create SNS Topic

```bash
aws sns create-topic --name fyxion-emergency-alerts --region ap-south-1
```

### 1.7 Create DynamoDB Tables (Optional)

Tables are auto-created by the app on startup when `ENABLE_DYNAMODB=True`.

---

## Step 2: EC2 Setup (Backend)

### 2.1 Launch EC2 Instance

- **AMI**: Ubuntu 22.04 LTS
- **Instance type**: `t3.small` (minimum recommended)
- **Security Group**:
  - SSH (22) — your IP only
  - HTTP (80) — 0.0.0.0/0
  - HTTPS (443) — 0.0.0.0/0
  - Custom TCP (8000) — 0.0.0.0/0 (for direct API access during setup)

### 2.2 Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.10 python3.10-venv python3-pip nginx git

# Clone your repository
git clone <your-repo-url> /home/ubuntu/fyxion
cd /home/ubuntu/fyxion/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 2.3 Configure Environment

Create `/home/ubuntu/fyxion/backend/.env`:

```env
# JWT
JWT_SECRET=<generate-a-strong-random-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server
DEBUG=False

# Database (RDS)
DATABASE_URL=postgresql://fyxion_user:<password>@<rds-endpoint>:5432/fyxion

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_MAPS_API_KEY=<your-maps-key>
GOOGLE_API_KEY=<your-gemini-key>

# Frontend URLs (update with your domain)
FRONTEND_URL=https://fyxion.com
TECHNICIAN_FRONTEND_URL=https://tech.fyxion.com

# AWS
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=ap-south-1

# S3
AWS_S3_BUCKET_NAME=fyxion-uploads
ENABLE_S3_UPLOAD=True

# SNS
AWS_SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:<account-id>:fyxion-emergency-alerts
ENABLE_SNS_ALERTS=True

# Cognito (optional)
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=<pool-id>
COGNITO_APP_CLIENT_ID=<client-id>

# DynamoDB (optional)
ENABLE_DYNAMODB=True
AWS_DYNAMODB_TABLE_PREFIX=fyxion_

# Deployment
BACKEND_URL=https://api.fyxion.com
ALLOWED_ORIGINS=https://fyxion.com,https://tech.fyxion.com
```

### 2.4 Create Systemd Service

Create `/etc/systemd/system/fyxion.service`:

```ini
[Unit]
Description=Fyxion Backend API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/fyxion/backend
Environment="PATH=/home/ubuntu/fyxion/backend/venv/bin"
ExecStart=/home/ubuntu/fyxion/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable fyxion
sudo systemctl start fyxion
```

### 2.5 Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/fyxion`:

```nginx
server {
    listen 80;
    server_name api.fyxion.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fyxion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.fyxion.com
```

---

## Step 3: Deploy Frontends to S3 + CloudFront

### 3.1 Build Frontends

```bash
# Customer frontend
cd /path/to/fyxion
echo "VITE_API_URL=https://api.fyxion.com" > .env.production
npm run build

# Upload to S3
aws s3 sync dist/ s3://fyxion-frontend/ --delete

# Technician frontend
cd technician-frontend
echo "VITE_API_URL=https://api.fyxion.com" > .env.production
npm run build
aws s3 sync dist/ s3://fyxion-tech-frontend/ --delete
```

### 3.2 Create CloudFront Distribution (Optional)

1. **CloudFront Console → Create Distribution**
2. Origin: S3 bucket website endpoint
3. Default root object: `index.html`
4. Custom error responses: 403/404 → `/index.html` (for SPA routing)
5. Attach SSL certificate (ACM)

---

## Step 4: Verify Deployment

```bash
# Check backend health
curl https://api.fyxion.com/health

# Check AWS services status
curl https://api.fyxion.com/aws-status

# Test registration
curl -X POST https://api.fyxion.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"test123","role":"customer","name":"Test"}'
```

---

## Quick Reference — Environment Variables

| Variable                | Service  | Required               |
| ----------------------- | -------- | ---------------------- |
| `AWS_ACCESS_KEY_ID`     | All AWS  | Yes (for any AWS)      |
| `AWS_SECRET_ACCESS_KEY` | All AWS  | Yes (for any AWS)      |
| `AWS_REGION`            | All AWS  | Yes                    |
| `AWS_S3_BUCKET_NAME`    | S3       | For file uploads       |
| `ENABLE_S3_UPLOAD`      | S3       | Set `True` to activate |
| `AWS_SNS_TOPIC_ARN`     | SNS      | For emergency alerts   |
| `ENABLE_SNS_ALERTS`     | SNS      | Set `True` to activate |
| `COGNITO_USER_POOL_ID`  | Cognito  | For Cognito auth       |
| `COGNITO_APP_CLIENT_ID` | Cognito  | For Cognito auth       |
| `ENABLE_DYNAMODB`       | DynamoDB | Set `True` to activate |
| `DATABASE_URL`          | RDS      | For PostgreSQL         |
| `BACKEND_URL`           | Deploy   | For OAuth callbacks    |
| `ALLOWED_ORIGINS`       | Deploy   | For CORS               |
