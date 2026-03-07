#!/bin/bash
# S3 Integration Setup Script
# Run this after cloning the repository to set up S3 upload functionality

set -e

echo "=========================================="
echo "S3 Integration Setup"
echo "=========================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
AWS_REGION=us-east-1
AWS_S3_BUCKET=fyxion-adhi-65454
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Check backend directory
cd backend || exit 1

# Check Python dependencies
echo ""
echo "Checking Python dependencies..."
if python -c "import boto3" 2>/dev/null; then
    echo "✓ boto3 installed"
else
    echo "✗ boto3 not found, installing..."
    pip install boto3
fi

if python -c "import multipart" 2>/dev/null; then
    echo "✓ python-multipart installed"
else
    echo "✗ python-multipart not found, installing..."
    pip install python-multipart
fi

if python -c "import dotenv" 2>/dev/null; then
    echo "✓ python-dotenv installed"
else
    echo "✗ python-dotenv not found, installing..."
    pip install python-dotenv
fi

# Verify models
echo ""
echo "Verifying models..."
python -c "from app.models import Document; print('✓ Document model OK')" || {
    echo "✗ Document model failed to import"
    exit 1
}

# Verify S3 client
echo ""
echo "Verifying S3 client..."
python -c "from app.core.s3_client import s3_client; print('✓ S3 client initialized')" || {
    echo "✗ S3 client initialization failed"
    exit 1
}

# Verify endpoints
echo ""
echo "Verifying endpoints..."
python -c "from app.api.v1.endpoints import s3_upload; print('✓ Upload endpoint loaded')" || {
    echo "✗ Upload endpoint failed to import"
    exit 1
}

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify AWS credentials (IAM role in lab environment)"
echo "2. Create RDS table: Run AWS_S3_RDS_SCHEMA.sql on your database"
echo "3. Start backend: uvicorn app.main:app --reload"
echo "4. Test upload: POST /api/v1/upload/document"
echo ""
echo "Documentation: See S3_INTEGRATION_GUIDE.md"
echo ""
