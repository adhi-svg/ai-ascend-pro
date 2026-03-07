# S3 Integration Documentation

## Overview
The FastAPI backend now supports uploading documents to AWS S3 with metadata tracking in RDS.

### Architecture
```
Frontend → FastAPI Backend (/api/v1/upload/document) → S3
                    ↓
                   RDS (metadata only)
```

## Configuration

### Environment Variables (.env)
```
AWS_REGION=us-east-1
AWS_S3_BUCKET=fyxion-adhi-65454
```

### AWS Credentials
The backend uses Boto3's default credential provider chain:
1. **Lab Environment (AWS Academy)**: Credentials come from the instance IAM role
2. **Local Development**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables
3. **Production**: Use IAM roles attached to EC2/ECS instances

**Do NOT hardcode credentials in code.**

## Endpoints

### POST /api/v1/upload/document

**Authentication**: Required (Bearer token)

**Request**:
```
Content-Type: multipart/form-data

Form Parameters:
- file: File to upload (PDF, PNG, JPG, DOCX)
- userId: User identifier (e.g., customer ID, technician ID)
- docType: Document type (e.g., 'aadhar', 'profile_photo', 'license', 'aadhaar_front', 'aadhaar_back')
```

**Response** (200 OK):
```json
{
  "message": "Upload successful",
  "bucket": "fyxion-adhi-65454",
  "key": "documents/user-123/1741361112000_resume.pdf",
  "original_name": "resume.pdf",
  "content_type": "application/pdf",
  "size": 12345,
  "document_type": "aadhar"
}
```

**Error Responses**:
- 400: Invalid file type or file too large (>10MB)
- 403: Access denied (insufficient S3 permissions)
- 500: Credentials not configured or S3 upload failed

## File Validation

**Allowed File Types**:
- `application/pdf` (.pdf)
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/jpg` (.jpg)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)

**Max File Size**: 10 MB

**Filename Sanitization**: Special characters are removed; safe filename format used

## S3 Key Structure

Files are organized by user in S3:
```
documents/{user_id}/{timestamp_ms}_{filename}

Example:
documents/user-123/1741361112000_aadhar_front.png
documents/user-123/1741361122500_aadhar_back.png
documents/user-456/1741361130000_profile.jpg
```

This ensures:
- Users can't access each other's uploads (S3 bucket is private)
- Unique keys prevent overwriting
- Easy to query all uploads for a user

## Database Integration

### Create Table (MySQL/PostgreSQL)
Run the SQL in `AWS_S3_RDS_SCHEMA.sql`:

```sql
CREATE TABLE documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  s3_key VARCHAR(500) NOT NULL UNIQUE,
  content_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

### Store Metadata After Upload
```python
# After successful S3 upload, insert metadata into RDS:
db.execute(
    """INSERT INTO documents 
       (user_id, document_type, original_name, s3_key, content_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)""",
    (user_id, doc_type, filename, s3_key, content_type, file_size)
)
db.commit()
```

## Frontend Integration

### React/JavaScript Example
```javascript
async function uploadDocument(file, userId, docType) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("docType", docType);

  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/upload/document",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    const data = await response.json();
    console.log("Upload successful:", data);
    // data.key contains the S3 key for future reference
    // Save data.key to database if needed

    return data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// Usage:
const fileInput = document.querySelector('input[type="file"]');
const userId = user.id;
const docType = "aadhar_front";

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  try {
    const result = await uploadDocument(file, userId, docType);
    console.log("File uploaded:", result.key);
  } catch (error) {
    console.error("Upload failed:", error.message);
  }
});
```

### Technician Registration Example
For technician registration with multiple documents:

```javascript
async function submitTechnicianWithDocuments(formData, documents) {
  try {
    // Step 1: Upload all documents
    const uploadedDocs = {};
    for (const [docType, file] of Object.entries(documents)) {
      const result = await uploadDocument(file, formData.userId, docType);
      uploadedDocs[docType] = result.key;
    }

    // Step 2: Submit registration with S3 keys
    const response = await fetch("http://localhost:8000/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        aadhaarFront: uploadedDocs.aadhaar_front,
        aadhaarBack: uploadedDocs.aadhaar_back,
        profilePhoto: uploadedDocs.profile_photo,
        role: "technician",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}
```

## Troubleshooting

### Error: "AWS credentials not configured"
- Ensure you're running in the lab environment with instance role
- Or set environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Check `.env` file exists with correct bucket name

### Error: "Access denied" or "AccessDenied"
- Verify the IAM role has `s3:PutObject` permission on the bucket
- Check bucket policy allows the role to upload

### Error: "Invalid file type"
- File MIME type not recognized
- Ensure actual file content matches extension
- Browser may report wrong MIME type; verify on server side

### Error: "File too large"
- File exceeds 10 MB limit
- Check `MAX_SIZE` in `document_service.py`

## Security Considerations

1. **Bucket Privacy**: Keep S3 bucket private (block public access)
2. **Upload via Backend Only**: Don't expose presigned URLs for direct browser-to-S3 uploads
3. **Authentication**: All uploads require JWT token
4. **File Validation**: Server-side validation of file type and size
5. **Unique Keys**: Timestamp + filename ensures uniqueness and prevents overwrites
6. **Access Control**: Users can only upload with their own user ID (optional enforcement)
7. **Metadata Tracking**: All uploads logged in RDS for audit trail

## Testing

### Test with cURL
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test_image.png" \
  -F "userId=user-123" \
  -F "docType=profile_photo" \
  http://localhost:8000/api/v1/upload/document
```

### Test with PowerShell
```powershell
$token = "YOUR_JWT_TOKEN"
$fieldsHash = @{
    file = Get-Item "test_image.png"
    userId = "user-123"
    docType = "profile_photo"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/upload/document" \
  -Method POST \
  -Headers @{ Authorization = "Bearer $token" } \
  -Form $fieldsHash
```

## Next Steps

1. **Create RDS Table**: Run `AWS_S3_RDS_SCHEMA.sql` on your database
2. **Update Document Service**: Integrate database insert after S3 upload
3. **Frontend Integration**: Use the provided JavaScript examples
4. **Testing**: Verify upload works in lab environment
5. **Security Audit**: Review IAM permissions and S3 bucket policies

## File Locations

- Core S3 Client: `backend/app/core/s3_client.py`
- Document Service: `backend/app/services/document_service.py`
- Upload Endpoint: `backend/app/api/v1/endpoints/s3_upload.py`
- Upload Schemas: `backend/app/schemas/upload.py`
- DB Schema: `backend/AWS_S3_RDS_SCHEMA.sql`
- Configuration: `backend/.env` and `backend/app/core/config.py`
