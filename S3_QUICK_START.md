# S3 Integration - Quick Start

## What Was Done ✅

Implemented complete S3 document upload integration for FastAPI backend with aws Academy lab environment support.

### Files Created/Modified

| File | Type | Purpose |
|------|------|---------|
| `.env` | Config | AWS credentials (region, bucket) |
| `backend/app/core/s3_client.py` | Module | Boto3 S3 client initialization |
| `backend/app/services/document_service.py` | Module | Upload validation & S3 logic |
| `backend/app/schemas/upload.py` | Schema | Pydantic upload response model |
| `backend/app/api/v1/endpoints/s3_upload.py` | Route | POST /api/v1/upload/document endpoint |
| `backend/app/models.py` | ORM | Document model for metadata storage |
| `backend/AWS_S3_RDS_SCHEMA.sql` | SQL | RDS table schema |
| `backend/app/api/v1/api.py` | Router | Registered upload router |
| `S3_INTEGRATION_GUIDE.md` | Docs | Complete documentation |
| `S3_IMPLEMENTATION_SUMMARY.md` | Docs | Implementation details |
| `setup_s3.bat` / `setup_s3.sh` | Script | Automated setup verification |

## Quick Test

### 1. Backend is Running
```bash
curl http://localhost:8000/api/v1/categories
# Should return 200 with categories list
```

✅ **Backend verified running**

### 2. Endpoint Available
```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"customer123"}' | jq -r '.data.access_token')

# Test upload endpoint (requires file)
curl -X POST http://localhost:8000/api/v1/upload/document \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_image.png" \
  -F "userId=user-123" \
  -F "docType=profile_photo"
```

**Expected Response**:
```json
{
  "message": "Upload successful",
  "bucket": "fyxion-adhi-65454",
  "key": "documents/user-123/1741361112000_test_image.png",
  "original_name": "test_image.png",
  "content_type": "image/png",
  "size": 286,
  "document_type": "profile_photo"
}
```

## Configuration

### Environment Variables
Located in `backend/.env`:
```
AWS_REGION=us-east-1
AWS_S3_BUCKET=fyxion-adhi-65454
```

### AWS Credentials
Uses **Boto3 default credential provider chain**:
1. **Lab Environment** (AWS Academy): Instance IAM role (automatic)
2. **Local Machine**: Set environment variables
3. **Production**: IAM role attached to EC2/ECS

**Do NOT hardcode credentials**

## API Endpoint

### POST /api/v1/upload/document

**Authentication**: ✅ Required (JWT Bearer token)

**Request**:
```
Content-Type: multipart/form-data

Form Parameters:
- file: Binary file (PDF, PNG, JPG, DOCX)
- userId: User identifier (string)
- docType: Document type (string)
```

**Response** (200 OK):
```json
{
  "message": "Upload successful",
  "bucket": "fyxion-adhi-65454",
  "key": "documents/{userId}/{timestamp}_{filename}",
  "original_name": "filename.ext",
  "content_type": "mime/type",
  "size": 12345,
  "document_type": "docType"
}
```

**Errors**:
- `400`: Invalid file type or too large (>10MB)
- `403`: Insufficient S3 permissions
- `500`: AWS credentials not found or S3 upload failed

## Supported File Types

- ✅ PDF: `application/pdf`
- ✅ PNG: `image/png`
- ✅ JPG/JPEG: `image/jpeg`, `image/jpg`
- ✅ DOCX: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Max Size**: 10 MB

## Frontend Integration

### JavaScript Example
```javascript
async function uploadDocument(file, userId, docType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("docType", docType);

  const response = await fetch("http://localhost:8000/api/v1/upload/document", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
const result = await uploadDocument(
  fileInput.files[0],
  "user-123",
  "profile_photo"
);
console.log("Uploaded to S3:", result.key);
```

### React Example
```jsx
import { useState } from 'react';

export function DocumentUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);
      formData.append("docType", "profile_photo");

      const response = await fetch(
        "http://localhost:8000/api/v1/upload/document",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("S3 Key:", result.key);
      // Save result.key to database or state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Database Integration (Optional)

### 1. Create Table
```bash
mysql -u root -p < backend/AWS_S3_RDS_SCHEMA.sql
```

### 2. Store Metadata After Upload
```python
from app.models import Document
from app.core.database import get_db

db = next(get_db())
doc = Document(
    user_id=user_id,
    document_type=doc_type,
    original_name=file.filename,
    s3_key=s3_key,  # returned from upload_document_to_s3
    content_type=file.content_type,
    file_size=file_size
)
db.add(doc)
db.commit()
```

### 3. Query Uploads
```python
# Get all uploads for a user
docs = db.query(Document).filter(Document.user_id == user_id).all()

# Get specific document type
aadhar_docs = db.query(Document).filter(
    Document.user_id == user_id,
    Document.document_type == "aadhar_front"
).all()
```

## Troubleshooting

### "AWS credentials not configured"
**Cause**: Running outside lab environment without AWS credentials
**Solution**:
- In lab: Ensure running on EC2 with proper IAM role
- Locally: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables
- Check `.env` file exists with bucket name

### "Access Denied" or "AccessDenied"
**Cause**: IAM role missing `s3:PutObject` permission
**Solution**:
- Verify IAM role has `s3:PutObject` on the S3 bucket
- Check AWS IAM console for role permissions
- May need to wait for role/policy propagation

### "Invalid file type"
**Cause**: File MIME type not in allowed list
**Solution**:
- Check file extension matches actual content
- Supported types: PDF, PNG, JPG, DOCX only
- Browser may report wrong MIME type

### "File too large"
**Cause**: File exceeds 10 MB limit
**Solution**:
- Compress file before upload
- Or update `MAX_SIZE` in `document_service.py` (not recommended)

## Architecture

```
App User (Browser)
    ↓
Frontend (React)
    ↓ HTTP POST
FastAPI Backend
    ↓
Validate & Sanitize
    ↓
Boto3 S3 Client
    ↓ put_object()
AWS S3 Bucket
    ↓ (optional)
RDS MySQL/PostgreSQL (metadata only)
```

## Security Checklist

- ✅ JWT authentication required
- ✅ File type validation
- ✅ File size limits
- ✅ Filename sanitization
- ✅ S3 bucket private (no public access)
- ✅ Unique S3 keys (prevent overwrites)
- ✅ No hardcoded credentials
- ✅ Helpful error messages (security-conscious)
- ⚠️ Optional: Enforce user ownership (uncomment in s3_upload.py)

## Files to Review

1. **Integration Guide**: `S3_INTEGRATION_GUIDE.md`
2. **Implementation Details**: `S3_IMPLEMENTATION_SUMMARY.md`
3. **Core Code**:
   - `backend/app/core/s3_client.py` - Boto3 setup
   - `backend/app/services/document_service.py` - Upload logic
   - `backend/app/api/v1/endpoints/s3_upload.py` - REST endpoint

## Testing Files Included

- ✅ `test_image.png` - Test image (286 bytes)
- ✅ `test_upload.txt` - Test text file

## Status

✅ **Implementation Complete**
✅ **Backend Running**
✅ **Endpoint Registered**
✅ **Ready for Testing**

## Next Steps

1. Run setup script: `setup_s3.bat` (Windows) or `setup_s3.sh` (Linux)
2. Create RDS table: `AWS_S3_RDS_SCHEMA.sql`
3. Test upload endpoint
4. Integrate with technician registration flow
5. Integrate with customer profile completion

---

**Questions?** See `S3_INTEGRATION_GUIDE.md` for detailed documentation.
