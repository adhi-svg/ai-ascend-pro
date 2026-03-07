import re
import time
from fastapi import HTTPException, UploadFile
from app.core.config import settings
from app.core.s3_client import s3_client

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
    "image/jpg",
}

MAX_SIZE = 10 * 1024 * 1024  # 10 MB


def sanitize_filename(filename: str) -> str:
    """Remove special characters from filename."""
    return re.sub(r"[^a-zA-Z0-9._-]", "", filename or "file")


async def upload_document_to_s3(file: UploadFile, user_id: str, doc_type: str) -> dict:
    """
    Upload a document to S3.
    
    Args:
        file: The uploaded file
        user_id: User ID for organizing files
        doc_type: Document type (e.g., 'aadhar', 'profile_photo', 'license')
        
    Returns:
        Dictionary with upload metadata
        
    Raises:
        HTTPException: On validation or upload errors
    """
    
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_TYPES)}"
        )

    # Read file contents
    contents = await file.read()

    # Validate file size
    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_SIZE / (1024*1024):.0f} MB"
        )

    # Generate S3 key with timestamp to ensure uniqueness
    safe_name = sanitize_filename(file.filename)
    timestamp_ms = int(time.time() * 1000)
    key = f"documents/{user_id}/{timestamp_ms}_{safe_name}"

    try:
        # Upload to S3
        # put_object is the official S3 API - successful call means full object was added
        s3_client.put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME or "fyxion-adhi-65454",
            Key=key,
            Body=contents,
            ContentType=file.content_type,
        )

        return {
            "message": "Upload successful",
            "bucket": settings.AWS_S3_BUCKET_NAME or "fyxion-adhi-65454",
            "key": key,
            "original_name": file.filename,
            "content_type": file.content_type,
            "size": len(contents),
            "document_type": doc_type,
        }

    except Exception as e:
        error_msg = str(e)
        # Provide helpful error message for common issues
        if "NoCredentialsError" in error_msg or "Unable to locate credentials" in error_msg:
            raise HTTPException(
                status_code=500,
                detail="AWS credentials not configured. Check environment or IAM role."
            )
        elif "AccessDenied" in error_msg or "Access Denied" in error_msg:
            raise HTTPException(
                status_code=403,
                detail="Access denied. Ensure the IAM role has s3:PutObject permission."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {error_msg}"
            )
