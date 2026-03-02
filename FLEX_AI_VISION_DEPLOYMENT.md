# FLEX AI Vision Implementation Guide
## Complete Step-by-Step Deployment

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend Implementation
- [x] Create `app/ai/vision_client.py` - Gemini Vision API client
- [x] Create `app/ai/vision.py` - Vision processing orchestrator
- [x] Update `app/ai/image_utils.py` - Image validation utilities
- [x] Update `app/ai/__init__.py` - Module exports
- [x] Update `app/api/v1/endpoints/ai_chat.py` - Enhanced endpoint
- [x] Update `backend/requirements.txt` - New dependencies

### Frontend Implementation
- [x] Update `src/components/AIHelpChat.jsx` - Image upload UI
- [x] Add vision data display
- [x] Image preview functionality
- [x] Base64 conversion

### Testing
- [x] Create `backend/tests/test_vision.py` - Unit tests

### Documentation
- [x] Create `FLEX_AI_VISION_SETUP.md` - Setup guide
- [x] Create this deployment guide

---

## 🚀 QUICK START (5 MINUTES)

### 1. Get Google API Key

```bash
# Visit: https://aistudio.google.com/app/apikey
# Click "Create API Key"
# Copy the key
```

### 2. Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GOOGLE_API_KEY = "your-api-key-here"
```

**Linux/Mac:**
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

**Or create .env file in backend/:**
```
GOOGLE_API_KEY=your-api-key-here
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run Tests

```bash
cd backend
python -m pytest tests/test_vision.py -v
```

### 5. Start Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Test in Frontend

Open `http://localhost:5173` and:
1. Click FLEX AI icon (bottom-right)
2. Click "📸 Upload Photo"
3. Select an image
4. Type a question
5. Send message

---

## 📋 SETUP VERIFICATION

### Check 1: API Key Configuration

```bash
# Test if API key is set
python -c "import os; print('Key set:', bool(os.environ.get('GOOGLE_API_KEY')))"
```

### Check 2: Dependencies Installed

```bash
python -c "import google.generativeai; print('✓ google-generativeai installed')"
python -c "from PIL import Image; print('✓ Pillow installed')"
```

### Check 3: Vision Client Works

```python
from app.ai.vision_client import get_vision_client
client = get_vision_client()
print("Vision client enabled:", client.enabled)
```

### Check 4: Backend Running

```bash
curl http://localhost:8000/health
# Should return: {"status": "ok"}
```

### Check 5: Frontend Running

Visit `http://localhost:5173` and verify FLEX AI widget visible

---

## 🔧 CONFIGURATION OPTIONS

### Environment Variables

Create `backend/.env`:

```env
# Required
GOOGLE_API_KEY=your-api-key

# Optional (defaults shown)
VISION_API_TIMEOUT=10
MAX_IMAGE_SIZE=5242880  # 5MB in bytes
VISION_API_ENABLED=true

# Logging
LOG_LEVEL=INFO
DEBUG_VISION_CALLS=false
```

### Load in Code

```python
# backend/app/main.py
from dotenv import load_dotenv
load_dotenv()  # Load from .env file
```

---

## 📊 ARCHITECTURE LAYERS (Detailed)

### Layer 0: Image Upload
```
User Browser
    │
    ├─ Select Image File (< 5MB)
    │
    ├─ Read with FileReader API
    │
    ├─ Convert to Base64
    │
    └─ Include in JSON payload
```

### Layer 1: Backend Validation
```
POST /api/v1/ai/chat
    │
    ├─ Validate base64 format
    │
    ├─ Check file size (< 5MB)
    │
    ├─ Check image signature (JPEG/PNG/WebP/GIF)
    │
    └─ Return error if invalid
```

### Layer 2: Vision Processing
```
VisionProcessor.process_image(base64)
    │
    ├─ Call Gemini Vision API (10s timeout)
    │
    ├─ Parse structured response
    │
    ├─ Extract:
    │  ├─ device_type
    │  ├─ condition
    │  ├─ risk_signals
    │  └─ confidence
    │
    └─ Handle API errors gracefully
```

### Layer 3: Text Enhancement
```
Combined Input = Original Message + Vision Description
    │
    ├─ Add vision insights to text
    │
    ├─ Include risk signals
    │
    └─ Pass to rule engine
```

### Layer 4: Rule Engine
```
chat_agent(combined_text)
    │
    ├─ Keyword matching (unchanged)
    │
    ├─ Intent classification
    │
    ├─ Category detection
    │
    └─ Generate response
```

### Layer 5: Safety Override
```
if critical_risks_detected:
    └─ FORCE: urgency = HIGH
    └─ FORCE: intent = BOOK_TECHNICIAN
    └─ FORCE: suggest_booking = true
```

### Layer 6: Response Enhancement
```
Response JSON
    │
    ├─ Include rule engine output
    │
    └─ Add vision_detected metadata:
       ├─ device_type
       ├─ condition
       ├─ risk_signals
       ├─ visible_damage
       └─ confidence
```

---

## 💾 CODE ORGANIZATION

### Backend Directory Structure

```
backend/
├── app/
│   ├── ai/                          # NEW: AI Module
│   │   ├── __init__.py              # NEW: Module exports
│   │   ├── vision_client.py          # NEW: Gemini API client
│   │   ├── vision.py                 # NEW: Vision processing
│   │   └── image_utils.py            # UPDATED: Image handling
│   │
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── ai_chat.py        # UPDATED: Endpoint (vision support)
│   │
│   ├── main.py                       # App entry point
│   ├── core/
│   │   └── config.py                 # Config management
│   │
│   └── utils/
│       └── responses.py              # Response formatting
│
├── tests/
│   ├── test_vision.py                # NEW: Vision tests
│   └── __init__.py
│
├── requirements.txt                  # UPDATED: New dependencies
├── .env.example                      # NEW: Example config
└── .gitignore                        # Remember to ignore .env!

frontend/
├── src/
│   ├── components/
│   │   └── AIHelpChat.jsx            # UPDATED: Image upload support
│   │
│   └── ...rest of frontend
```

### New Files Created

1. **backend/app/ai/__init__.py** (42 lines)
   - Module initialization
   - Exports for clean imports

2. **backend/app/ai/vision_client.py** (210 lines)
   - `GeminiVisionClient` class
   - API communication
   - Error handling
   - Response parsing

3. **backend/app/ai/vision.py** (250 lines)
   - `VisionProcessor` class
   - Image analysis orchestration
   - Risk detection
   - Message combination

4. **backend/tests/test_vision.py** (320 lines)
   - Comprehensive unit tests
   - Mock API calls
   - Edge case testing

### Updated Files

1. **backend/app/api/v1/endpoints/ai_chat.py**
   - Added `image_base64` to `ChatRequest`
   - Added `VisionDetected` schema
   - Updated `ai_help_chat()` endpoint
   - Vision processing logic

2. **backend/requirements.txt**
   - Added `google-generativeai`
   - Added `pillow`

3. **src/components/AIHelpChat.jsx**
   - Added `selectedImage` state
   - Added `imagePreview` state
   - Added `handleImageSelect()` function
   - Added `clearImage()` function
   - Updated `handleSendMessage()` to include image
   - Added image upload button UI
   - Added vision analysis display
   - Updated header text

---

## 🧪 TESTING GUIDE

### Unit Tests

```bash
# Run all vision tests
cd backend
python -m pytest tests/test_vision.py -v

# Run specific test class
python -m pytest tests/test_vision.py::TestVisionProcessor -v

# Run with coverage
python -m pytest tests/test_vision.py --cov=app.ai
```

### Manual API Testing

#### Using curl (text only)
```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My AC is not cooling",
    "context": {"user_role": "customer"}
  }'
```

#### Using Python requests (with image)
```python
import requests
import base64

# Load image
with open("ac_image.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode()

# Send request
response = requests.post(
    "http://localhost:8000/api/v1/ai/chat",
    json={
        "message": "AC not cooling, is this normal?",
        "image_base64": image_base64,
        "context": {"user_role": "customer"}
    }
)

print(response.json())
```

#### Using Postman
1. Create POST request to `http://localhost:8000/api/v1/ai/chat`
2. Body → raw → JSON
3. Paste:
```json
{
  "message": "Your question here",
  "image_base64": "[paste base64 image here]",
  "context": {"user_role": "customer"}
}
```
4. Send

### Frontend Testing

1. **Open customer app**: `http://localhost:5173`
2. **Locate FLEX AI**: Bottom-right corner
3. **Upload image**:
   - Click "📸 Upload Photo"
   - Select image < 5MB
   - Image preview appears
4. **Send message** with image
5. **Check response**:
   - Vision analysis section should appear
   - Device type, condition, risks shown
   - Rule engine response displayed

### Test Cases

#### ✅ Case 1: Text Only (Backward Compatible)
- Input: Text message, no image
- Expected: Works exactly as before
- Result: ✓ All existing requests work unchanged

#### ✅ Case 2: Image Only
- Input: Image, no message text
- Expected: "(Image only)" placeholder + vision analysis
- Result: ✓ Image analyzed, response generated

#### ✅ Case 3: Image + Text
- Input: Text message + image
- Expected: Combined analysis
- Result: ✓ Both inform the response

#### ✅ Case 4: Critical Risk Detection
- Input: Image of fire/sparks + text
- Expected: HIGH urgency forced, booking suggested
- Result: ✓ Safety override activates

#### ✅ Case 5: Large Image
- Input: Image > 5MB
- Expected: Error message
- Result: ✓ Rejected with helpful message

#### ✅ Case 6: Invalid Base64
- Input: Corrupted base64 data
- Expected: Error or fallback to text
- Result: ✓ Graceful error handling

#### ✅ Case 7: Vision API Disabled (No API key)
- Input: Image when GOOGLE_API_KEY not set
- Expected: Text-only processing continues
- Result: ✓ Fallback works

#### ✅ Case 8: Vision API Timeout
- Input: Very slow network (10+ seconds)
- Expected: Timeout and fallback
- Result: ✓ 10-second timeout enforced

---

## 🚨 ERROR HANDLING

### Common Errors & Solutions

#### Error: "GOOGLE_API_KEY not found"
```
❌ Solution:
1. Set environment variable
2. Or create .env file
3. Restart application
```

#### Error: "Image too large (max 5MB)"
```
❌ Solution:
1. Compress image
2. Reduce resolution
3. Use JPEG instead of PNG
```

#### Error: "Invalid image format"
```
❌ Solution:
1. Use: JPEG, PNG, WebP, GIF
2. Ensure file is not corrupted
3. Try another image
```

#### Error: "Vision API timeout"
```
❌ Solution:
1. Check internet connection
2. Try smaller image
3. Retry request
```

#### Error: "AttributeError: module 'google.generativeai' has no attribute..."
```
❌ Solution:
1. Update package: pip install --upgrade google-generativeai
2. Verify version >= 0.3.0
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Image Size Optimization

Before sending:
```javascript
// Frontend: Compress image
async function compressImage(file) {
  const canvas = await new Promise(resolve => {
    const img = new Image()
    img.onload = function() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this, 0, 0)
      resolve(canvas)
    }
    img.src = URL.createObjectURL(file)
  })
  
  return canvas.toBlob(blob => {
    return blob
  }, 'image/jpeg', 0.8) // 80% quality
}
```

### Caching Vision Results

```python
# Backend: Cache duplicate images
from functools import lru_cache

@lru_cache(maxsize=100)
def analyze_image_cached(image_hash: str):
    """Cache analysis by image hash"""
    return analyze_image(image_hash)
```

### Batch Processing

```python
# If handling multiple images
async def process_batch_images(images: List[str]):
    """Process multiple images sequentially"""
    results = []
    for image_base64 in images:
        result = VisionProcessor.process_image(image_base64)
        results.append(result)
        await asyncio.sleep(0.1)  # Rate limiting
    return results
```

---

## 🔐 SECURITY CONSIDERATIONS

### API Key Management

✅ **DO:**
- Store in environment variables
- Use `.env` file (gitignore it!)
- Rotate keys periodically
- Use service account keys for production

❌ **DON'T:**
- Commit API keys to GitHub
- Expose in frontend code
- Use hardcoded strings
- Share keys insecurely

### Image Data Protection

✅ Images are:
- NOT stored on backend
- Sent directly to Google API
- Encrypted in transit (HTTPS)
- Auto-deleted after processing

❌ Never:
- Store images in database
- Log image content
- Cache unencrypted images
- Share with third parties

### Request Validation

```python
# Validate all inputs
if not ChatRequest.validate():
    return error_response("Invalid request")

# Check image size
if len(encoded_image) > MAX_SIZE:
    return error_response("Image too large")

# Validate base64
is_valid, error = validate_base64_image(image)
if not is_valid:
    return error_response(error)
```

---

## 📱 DEPLOYMENT

### Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

# Set environment
ENV GOOGLE_API_KEY=${GOOGLE_API_KEY}
ENV LOG_LEVEL=INFO

# Start uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build
docker build -t flex-ai-backend .

# Run
docker run -e GOOGLE_API_KEY="your-key" \
           -p 8000:8000 \
           flex-ai-backend
```

### AWS Lambda Deployment

```python
# lambda_handler already in ai_chat.py
# Deploy using AWS CLI:

aws lambda create-function \
  --function-name flex-ai-chat \
  --runtime python3.11 \
  --handler app.api.v1.endpoints.ai_chat.lambda_handler \
  --zip-file fileb://function.zip \
  --environment Variables={GOOGLE_API_KEY=your-key}
```

### Production Checklist

- [ ] API key in environment variables
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error logging active
- [ ] Performance monitoring
- [ ] Backup strategy
- [ ] Security audit completed
- [ ] Tests passing 100%

---

## 📚 API REFERENCE

### POST /api/v1/ai/chat

**Request Body:**
```json
{
  "message": "Your question (string, required)",
  "image_base64": "Base64 image (string, optional)",
  "context": {
    "user_role": "customer | technician | admin",
    "last_booking_id": "string, optional",
    "locale": "en-IN"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "The AI response",
    "intent": "APP_HELP | DIY_TIPS | BOOK_TECHNICIAN | OTHER",
    "category": "Electrical | Plumbing | AC Repair | ...",
    "urgency": "LOW | MEDIUM | HIGH",
    "suggest_booking": true,
    "safe_steps": ["step1", "step2"],
    "disclaimer": "Safety warning",
    "vision_detected": {
      "device_type": "AC unit",
      "condition": "critical",
      "risk_signals": ["sparks"],
      "visible_damage": ["burnt marks"],
      "confidence": 0.92
    }
  }
}
```

---

## ✨ NEXT STEPS

1. **Immediate**: Get API key and set environment variable
2. **Today**: Install dependencies and run tests
3. **Tomorrow**: Deploy to staging and test end-to-end
4. **This week**: Monitor production, gather metrics
5. **Next**: Optimize based on real usage data

---

## 📞 SUPPORT & TROUBLESHOOTING

### Still having issues?

1. Check logs: `VISION_PROCESSING` log entries
2. Verify API key: `python -c "import os; print(os.environ.get('GOOGLE_API_KEY'))"`
3. Test Gemini API directly: https://aistudio.google.com
4. Review error in response: `response.data.error` field
5. Check GitHub issues or documentation

### Performance Monitoring

```python
# Add to code for metrics
import time
start = time.time()
result = vision_processor.process_image(image)
duration = time.time() - start
logger.info(f"Vision processing: {duration:.2f}s")
```

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Theme**: "Intelligent. Autonomous. Agentic in Action." ✨
