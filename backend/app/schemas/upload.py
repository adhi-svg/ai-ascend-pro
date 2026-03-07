from pydantic import BaseModel

class UploadResponse(BaseModel):
    """Response schema for S3 upload."""
    message: str
    bucket: str
    key: str
    original_name: str
    content_type: str
    size: int
    document_type: str
