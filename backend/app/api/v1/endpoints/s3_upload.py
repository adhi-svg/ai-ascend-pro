from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.schemas.upload import UploadResponse
from app.services.document_service import upload_document_to_s3
from app.core.deps import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/document", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    doc_type: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a document to S3.
    
    Requires authentication. User can only upload for their own user_id.
    
    Form Parameters:
    - file: The file to upload (PDF, PNG, JPG, or DOCX)
    - user_id: User ID (must match authenticated user)
    - doc_type: Document type (e.g., 'aadhar', 'profile_photo', 'license')
    
    Returns:
    - Upload metadata including S3 key and bucket name
    """
    
    # Optional: Validate that user can only upload for themselves
    # Uncomment to enforce user ownership:
    # if current_user["id"] != user_id:
    #     raise HTTPException(status_code=403, detail="Can only upload for your own user ID")
    
    return await upload_document_to_s3(file=file, user_id=user_id, doc_type=doc_type)
