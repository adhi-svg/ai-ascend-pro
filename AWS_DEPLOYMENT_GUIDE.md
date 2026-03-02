# Environment Configuration for FieldFix AWS Deployment

## Development Setup (.env for local)
```
# JWT
JWT_SECRET=your-super-secret-key-change-in-production-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True

# Database (Local)
DATABASE_URL=sqlite:///./test.db

# Or PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/fieldfix

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_MAPS_API_KEY=your-maps-api-key
GOOGLE_API_KEY=your-gemini-api-key

# Frontend URLs
FRONTEND_URL=http://localhost:5173
TECHNICIAN_FRONTEND_URL=http://localhost:5174

# AWS (Optional for local)
ENABLE_S3_UPLOAD=False
ENABLE_SNS_ALERTS=False
```

## Production Setup (AWS RDS + EC2)

### RDS PostgreSQL Connection
```
DATABASE_URL=postgresql://username:password@fieldfix-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/fieldfix
```

### AWS Credentials (EC2 IAM Role preferred over static keys)
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=fieldfix-uploads-prod
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:fieldfix-emergency-alerts
```

### Feature Flags
```
ENABLE_S3_UPLOAD=True
ENABLE_SNS_ALERTS=True
DEBUG=False
```

### Frontend URLs (Production)
```
FRONTEND_URL=https://customerdomain.com
TECHNICIAN_FRONTEND_URL=https://technicianapp.customerdomain.com
```

## AWS IAM Policy for EC2 Instance

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::fieldfix-uploads-prod/*",
                "arn:aws:s3:::fieldfix-uploads-prod"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": "arn:aws:sns:us-east-1:123456789012:fieldfix-emergency-alerts"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:/aws/ec2/fieldfix:*"
        }
    ]
}
```

## Docker Setup for Deployment

### backend/Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations (if using Alembic)
# RUN alembic upgrade head

# Start app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### AWS ECR Push
```bash
# Build image
docker build -t fieldfix-backend:latest .

# Tag for ECR
docker tag fieldfix-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/fieldfix-backend:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/fieldfix-backend:latest
```

## Database Initialization

### Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier fieldfix-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username fieldfix_admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20 \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxxxxxx
```

### Initialize Database Schema
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-instance

# Navigate to backend
cd /app/backend

# Run initialization
python -c "from app.core.database import init_db; init_db()"

# Or with Alembic (if implemented)
# alembic upgrade head
```

## Deployment Checklist

- [ ] RDS PostgreSQL instance created and secure
- [ ] S3 bucket created with appropriate permissions
- [ ] SNS topic created for emergency alerts
- [ ] EC2 instance launched with appropriate IAM role
- [ ] Environment variables configured on EC2
- [ ] Database schema initialized
- [ ] Backend deployed to EC2 / ECS
- [ ] Frontend static files uploaded to S3 or CloudFront
- [ ] SSL certificate configured (via CloudFront or ALB)
- [ ] Health check working: `curl http://ec2-ip:8000/health`
- [ ] Test S3 upload functionality
- [ ] Test SNS emergency alerts
- [ ] Set up CloudWatch logs monitoring
- [ ] Configure backups for RDS
