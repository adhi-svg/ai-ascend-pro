@echo off
REM S3 Integration Setup Script for Windows
REM Run this after cloning the repository to set up S3 upload functionality

cls
echo.
echo ==========================================
echo S3 Integration Setup
echo ==========================================
echo.

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo AWS_REGION=us-east-1
        echo AWS_S3_BUCKET=fyxion-adhi-65454
    ) > ".env"
    echo    Created .env
) else (
    echo    .env already exists
)

cd backend

echo.
echo Checking Python dependencies...
python -c "import boto3" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    ^✓ boto3 installed
) else (
    echo    Installing boto3...
    pip install boto3 >nul
)

python -c "import multipart" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    ^✓ python-multipart installed
) else (
    echo    Installing python-multipart...
    pip install python-multipart >nul
)

python -c "import dotenv" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo    ^✓ python-dotenv installed
) else (
    echo    Installing python-dotenv...
    pip install python-dotenv >nul
)

echo.
echo Verifying models...
python -c "from app.models import Document; print('   ^✓ Document model OK')" || (
    echo    ^✗ Document model failed
    exit /b 1
)

echo.
echo Verifying S3 client...
python -c "from app.core.s3_client import s3_client; print('   ^✓ S3 client initialized')" || (
    echo    ^✗ S3 client failed
    exit /b 1
)

echo.
echo Verifying endpoints...
python -c "from app.api.v1.endpoints import s3_upload; print('   ^✓ Upload endpoint loaded')" || (
    echo    ^✗ Upload endpoint failed
    exit /b 1
)

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Verify AWS credentials (IAM role in lab environment)
echo 2. Create RDS table: Run AWS_S3_RDS_SCHEMA.sql on your database
echo 3. Start backend: uvicorn app.main:app --reload
echo 4. Test upload: POST /api/v1/upload/document
echo.
echo Documentation: See S3_INTEGRATION_GUIDE.md
echo.
