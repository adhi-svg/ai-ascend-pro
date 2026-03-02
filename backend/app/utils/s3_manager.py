"""AWS S3 integration for file uploads."""
import boto3
import os
import uuid
from pathlib import Path
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class S3Manager:
    """Manages S3 file uploads and storage."""
    
    def __init__(self):
        self.enabled = settings.ENABLE_S3_UPLOAD and settings.AWS_S3_BUCKET_NAME
        if self.enabled:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            self.bucket_name = settings.AWS_S3_BUCKET_NAME
    
    def upload_file(self, file_data: bytes, file_name: str, folder: str = "uploads") -> Optional[str]:
        """
        Upload file to S3 or local storage (fallback).
        
        Args:
            file_data: File content as bytes
            file_name: Original file name
            folder: S3 folder path
            
        Returns:
            URL of uploaded file or None on failure
        """
        if not self.enabled:
            return self._save_locally(file_data, file_name, folder)
        
        try:
            # Create unique file name
            ext = Path(file_name).suffix
            unique_name = f"{uuid.uuid4()}{ext}"
            s3_key = f"{folder}/{unique_name}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_data,
                ContentType=self._get_content_type(file_name)
            )
            
            # Return S3 URL
            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            logger.info(f"✓ File uploaded to S3: {url}")
            return url
            
        except Exception as e:
            logger.error(f"S3 upload failed: {str(e)}")
            # Fallback to local storage
            return self._save_locally(file_data, file_name, folder)
    
    def _save_locally(self, file_data: bytes, file_name: str, folder: str) -> str:
        """Save file locally as fallback."""
        try:
            # Create local directory
            local_path = Path("local_storage") / folder
            local_path.mkdir(parents=True, exist_ok=True)
            
            # Create unique file name
            ext = Path(file_name).suffix
            unique_name = f"{uuid.uuid4()}{ext}"
            file_path = local_path / unique_name
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # Return relative URL for local access
            url = f"/uploads/{folder}/{unique_name}"
            logger.info(f"✓ File saved locally: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Local file save failed: {str(e)}")
            return None
    
    def delete_file(self, file_url: str) -> bool:
        """Delete file from S3 or local storage."""
        try:
            if not self.enabled or "http" in file_url:
                # Local file
                return self._delete_locally(file_url)
            
            # S3 file
            s3_key = file_url.split(f"{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/")[-1]
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
            logger.info(f"✓ File deleted from S3: {s3_key}")
            return True
            
        except Exception as e:
            logger.error(f"File deletion failed: {str(e)}")
            return False
    
    def _delete_locally(self, file_url: str) -> bool:
        """Delete local file."""
        try:
            # Parse file path from URL
            file_path = Path("local_storage") / file_url.lstrip("/uploads/")
            if file_path.exists():
                file_path.unlink()
                logger.info(f"✓ Local file deleted: {file_url}")
                return True
            return False
        except Exception as e:
            logger.error(f"Local file deletion failed: {str(e)}")
            return False
    
    @staticmethod
    def _get_content_type(file_name: str) -> str:
        """Get content type based on file extension."""
        ext = Path(file_name).suffix.lower()
        content_types = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        return content_types.get(ext, 'application/octet-stream')


# Singleton instance
s3_manager = S3Manager()
