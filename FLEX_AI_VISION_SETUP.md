# FLEX AI Vision Integration - Production Setup Guide

## Overview

FLEX AI has been upgraded with **Gemini Vision API** integration for image analysis. The system combines:

- **Vision Processing**: Google Gemini Vision API for image understanding
- **Rule-Based Engine**: Existing keyword-based logic (unchanged)
- **Clean Architecture**: Modular design for cloud deployment

## Architecture Layers

```
┌─────────────────────────────────────────┐
│   Frontend (AIHelpChat.jsx)             │
│   - Image upload                        │
│   - Base64 conversion                   │
│   - Vision analysis display             │
└────────────┬────────────────────────────┘
             │ POST /api/v1/ai/chat
             │ {message, image_base64}
             ▼
┌─────────────────────────────────────────┐
│   Backend Endpoint (ai_chat.py)         │
│   - Request validation                  │
│   - Vision orchestration                │
└────────────┬────────────────────────────┘
             │
       ┌─────┴──────┐
       ▼            ▼
  ┌────────┐   ┌──────────────┐
  │ No    │   │ Vision       │
  │Image  │   │Processor     │
  └────┬──┘   └──────┬───────┘
       │             │
       │      ┌──────▼──────┐
       │      │ Gemini      │
       │      │ Vision API  │
       │      └──────┬──────┘
       │             │
       └──────┬──────┘
              │
              ▼
       ┌─────────────────┐
       │ Rule Engine     │
       │ chat_agent()    │
       │ (unchanged)     │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Enhanced        │
       │ Response JSON   │
       └─────────────────┘
```

## Environment Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**New packages added:**
```
google-generativeai>=0.3.0
pillow>=9.0.0
```

### 2. Set Google API Key

Create a `.env` file in the backend root:

```env
# Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here

# Optional configuration
VISION_API_TIMEOUT=10
MAX_IMAGE_SIZE=5242880  # 5MB in bytes
```

**Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste into `.env`

### 3. Load Environment Variables

Update `backend/app/main.py` or use a `.env` loader:

```python
from dotenv import load_dotenv
load_dotenv()
```

## Backend Implementation Files

### File Structure

```
backend/app/
├── ai/
│   ├── __init__.py          # Module exports
│   ├── vision_client.py      # Gemini Vision API client
│   ├── vision.py             # Vision processing orchestrator
│   └── image_utils.py        # Image validation & handling
├── api/
│   └── v1/
│       └── endpoints/
│           └── ai_chat.py    # Updated endpoint
└── main.py                   # App entry point
```

### File Descriptions

#### `app/ai/vision_client.py`
- **Purpose**: Single responsibility - communicate with Gemini API
- **Main Class**: `GeminiVisionClient`
- **Key Method**: `analyze_home_service_image(base64_image: str) -> Dict`
- **Error Handling**: Custom `VisionAPIError` exception
- **Fallback**: Returns empty analysis if Vision API disabled

#### `app/ai/image_utils.py`
- **Purpose**: Image validation and processing
- **Functions**:
  - `validate_base64_image()`: Validate format and size
  - `extract_image_format()`: Get MIME type
  - `clean_base64_string()`: Remove data URL prefix
  - `get_image_size()`: Get image dimensions
  - `describe_image_metadata()`: Image metadata summary

#### `app/ai/vision.py`
- **Purpose**: Orchestrate vision analysis and rule engine integration
- **Main Class**: `VisionProcessor`
- **Key Methods**:
  - `process_image()`: Analyze image with error handling
  - `detect_critical_risks()`: Check for safety hazards
  - `combine_message_with_vision()`: Merge text + vision insights
  - `process_chat_with_vision()`: Full chat pipeline

#### `app/api/v1/endpoints/ai_chat.py` (Updated)
- **New Schema**: `ChatRequest` with optional `image_base64`
- **New Schema**: `ChatResponse` with optional `vision_detected`
- **Updated Endpoint**: `/api/v1/ai/chat` handles images
- **Preserves**: All existing rule engine logic

## API Endpoints

### POST /api/v1/ai/chat

**Text-only request (backward compatible):**

```json
{
  "message": "My AC is not cooling",
  "context": {
    "user_role": "customer",
    "locale": "en-IN"
  }
}
```

**With image request:**

```json
{
  "message": "Is this safe? AC making noise",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "context": {
    "user_role": "customer",
    "locale": "en-IN"
  }
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "⚠️ Detected: sparks\n\n**AC EMERGENCY DETECTED**...",
    "intent": "BOOK_TECHNICIAN",
    "category": "AC Repair",
    "urgency": "HIGH",
    "suggest_booking": true,
    "safe_steps": ["Turn off AC immediately", "Evacuate area", "Call technician"],
    "disclaimer": "⚠️ This is a safety hazard!",
    "vision_detected": {
      "device_type": "AC outdoor unit",
      "condition": "critical",
      "risk_signals": ["sparks", "overheating"],
      "visible_damage": ["burnt components"],
      "confidence": 0.92
    }
  }
}
```

## 5 Sample API Responses

### Sample 1: Router with Red Light

**Request:**
```json
{
  "message": "Why is this not connecting?",
  "image_base64": "[base64_router_image_with_red_light]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "📡 **WiFi/Internet Router Issue**\n\n**Quick Fixes:**\n1. Check power supply (LED lights)\n2. Restart router (unplug 30 sec)\n3. Move closer to router\n4. Reduce interference\n\n**If still not working:**\nThe issue might be with ISP or internal components.",
    "intent": "DIY_TIPS",
    "category": "WiFi/Internet",
    "urgency": "MEDIUM",
    "suggest_booking": false,
    "safe_steps": ["Unplug router", "Wait 30 seconds", "Power on again"],
    "vision_detected": {
      "device_type": "WiFi router",
      "condition": "degraded",
      "risk_signals": ["red light on"],
      "visible_damage": [],
      "confidence": 0.88
    }
  }
}
```

### Sample 2: Electrical Hazard (Sparks)

**Request:**
```json
{
  "message": "Is this dangerous?",
  "image_base64": "[base64_switchboard_with_sparks]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "⚠️ **SAFETY ALERT**: This sounds like an electrical emergency!\n\n**Immediate Steps:**\n1. Turn off the main power switch immediately\n2. Evacuate the area if there's smoke\n3. Do NOT touch any electrical equipment\n4. Call fire department (101) if needed\n\nI'm connecting you with an emergency electrician right away.",
    "intent": "BOOK_TECHNICIAN",
    "category": "Electrical",
    "urgency": "HIGH",
    "suggest_booking": true,
    "safe_steps": [
      "Turn off main power switch",
      "Evacuate if smoke present",
      "Do not touch electrical equipment",
      "Call 101 if fire present"
    ],
    "disclaimer": "⚠️ Safety first! If in immediate danger, call emergency services.",
    "vision_detected": {
      "device_type": "electrical switchboard",
      "condition": "critical",
      "risk_signals": ["sparks", "burning marks"],
      "visible_damage": ["burnt contacts"],
      "confidence": 0.95
    }
  }
}
```

### Sample 3: Dripping Tap (DIY)

**Request:**
```json
{
  "message": "How to fix this leak?",
  "image_base64": "[base64_dripping_tap_image]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "💧 **Water Leak - Quick Fix:**\n\n**Immediate Action:**\n• Locate and turn off the water shut-off valve\n• Place a bucket to catch dripping water\n• Wipe area dry to prevent electrical hazards\n\n**Temporary Fix:**\n• Use plumber's tape on threaded connections\n• Apply waterproof sealant for small cracks\n\nHowever, for lasting repair, I recommend booking a plumber.",
    "intent": "DIY_TIPS",
    "category": "Plumbing",
    "urgency": "MEDIUM",
    "suggest_booking": true,
    "safe_steps": [
      "Turn off water valve",
      "Place bucket to catch water",
      "Inspect valve connection",
      "Apply plumber's tape"
    ],
    "disclaimer": "💡 If problem persists after trying these steps, book a professional to avoid pipe damage.",
    "vision_detected": {
      "device_type": "water tap",
      "condition": "degraded",
      "risk_signals": [],
      "visible_damage": ["water leak"],
      "confidence": 0.87
    }
  }
}
```

### Sample 4: AC Frozen Coil

**Request:**
```json
{
  "message": "AC not cooling, ice appearing",
  "image_base64": "[base64_ac_frozen_coil]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "❄️ **AC Frozen - Emergency Check:**\n\n**Immediate Action:**\n• Turn OFF AC immediately (important!)\n• Do NOT restart for 2-3 hours\n• Allow ice to melt naturally\n\n**Common Causes:**\n• Clogged air filter\n• Low refrigerant level\n• Blocked airflow\n\n**What to do:**\n• Check and clean filter\n• Ensure vents are clear\n• Do not operate until thawed\n\nThis might need professional diagnosis.",
    "intent": "DIY_TIPS",
    "category": "AC Repair",
    "urgency": "MEDIUM",
    "suggest_booking": true,
    "safe_steps": [
      "Turn off AC immediately",
      "Wait 2-3 hours for ice to melt",
      "Check air filter",
      "Clear outdoor unit blockage"
    ],
    "disclaimer": "💡 Refrigerant leaks require professional handling.",
    "vision_detected": {
      "device_type": "AC indoor unit",
      "condition": "critical",
      "risk_signals": ["ice formation"],
      "visible_damage": ["frozen coil"],
      "confidence": 0.89
    }
  }
}
```

### Sample 5: Perfectly Fine Device

**Request:**
```json
{
  "message": "Just checking if this is working properly",
  "image_base64": "[base64_working_device]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assistant_name": "FLEX AI",
    "reply": "✅ **Device Status Look Good!**\n\nBasic visual inspection shows no obvious issues. However, if you're experiencing performance problems, they might be internal.\n\n**Preventive Tips:**\n• Keep device clean and dust-free\n• Ensure proper ventilation\n• Regular maintenance checks\n• Avoid sudden temperature changes\n\nIf you're having issues, describe them and I can help troubleshoot!",
    "intent": "OTHER",
    "category": null,
    "urgency": "LOW",
    "suggest_booking": false,
    "safe_steps": [],
    "vision_detected": {
      "device_type": "HVAC unit",
      "condition": "good",
      "risk_signals": [],
      "visible_damage": [],
      "confidence": 0.75
    }
  }
}
```

## Unit Tests

### Test File: `backend/tests/test_vision.py`

```python
import pytest
from app.ai.vision import VisionProcessor
from app.ai.image_utils import validate_base64_image

def test_validate_base64_image_valid():
    """Test valid base64 image validation"""
    valid_base64 = "/9j/4AAQSkZJRgABA..." # valid JPEG base64
    is_valid, error = validate_base64_image(valid_base64)
    assert is_valid is True
    assert error is None

def test_validate_base64_image_invalid():
    """Test invalid base64 rejection"""
    is_valid, error = validate_base64_image("not-base64!!!")
    assert is_valid is False
    assert error is not None

def test_detect_critical_risks():
    """Test critical risk detection"""
    vision_result = {
        "risk_signals": ["smoke", "fire"],
        "confidence": 0.9
    }
    is_critical = VisionProcessor.detect_critical_risks(vision_result)
    assert is_critical is True

def test_extract_description():
    """Test description extraction"""
    vision_result = {
        "description": "Shows AC unit with ice buildup",
        "device_type": "AC unit",
        "confidence": 0.85
    }
    desc = VisionProcessor.extract_description(vision_result)
    assert "AC unit" in desc

def test_combine_message_with_vision():
    """Test message + vision combination"""
    message = "Not cooling"
    vision_result = {
        "description": "AC unit with frozen coil",
        "risk_signals": [],
        "confidence": 0.9
    }
    combined = VisionProcessor.combine_message_with_vision(message, vision_result)
    assert "frozen coil" in combined
    assert "Not cooling" in combined

pytest.main([__file__, "-v"])
```

### Running Tests

```bash
cd backend
python -m pytest tests/test_vision.py -v
```

## Error Handling & Fallbacks

### Vision API Unavailable
```python
# If GOOGLE_API_KEY not set or API fails
vision_result = {
    "description": "",
    "device_type": "unknown",
    "risk_signals": [],
    "confidence": 0.0,
    "error": "Vision API not available"
}
# System continues to rule engine with text only
```

### Image Validation Failed
```python
# If image is corrupted or invalid
response = {
    "success": false,
    "error": "Invalid image format or size exceeds 5MB"
}
```

### Timeout Protection
```python
# Vision API call timeout (default 10 seconds)
# Falls back to text-only mode
combined_message = original_user_message
# Continues processing without vision data
```

## Frontend Implementation

### Image Upload Flow

1. **User selects image** → FileReader API converts to base64
2. **Validation** → Check size (< 5MB) and type (image/*)
3. **Image preview** → Display selected image
4. **Send request** → Include image_base64 in JSON payload
5. **Receive response** → Display vision_detected data
6. **Show analysis** → Device type, condition, risks

### Vision Display in Chat

```jsx
{/* Vision Analysis Summary */}
{msg.vision_detected && (
  <div className="vision-analysis">
    <p>🔍 Device: {msg.vision_detected.device_type}</p>
    <p>Condition: {msg.vision_detected.condition}</p>
    {msg.vision_detected.risk_signals.length > 0 && (
      <p>⚠️ Risks: {msg.vision_detected.risk_signals.join(', ')}</p>
    )}
  </div>
)}
```

## Performance Considerations

### Image Size Limits
- **Max upload**: 5MB
- **Recommended**: < 2MB for faster processing
- **Timeout**: 10 seconds per image

### Vision API Rate Limits
- **Default**: 60 requests/minute (free tier)
- **Paid tier**: Higher limits available
- **Batchable**: Multiple images can be processed sequentially

### Optimization Tips
1. Compress images before sending
2. Use JPEG format (smaller than PNG)
3. Cache vision results per unique image
4. Queue bulk requests during off-peak hours

## Deployment

### AWS Lambda Ready

The `chat_agent()` function is pure and cloud-ready:

```python
# Lambda handler (in ai_chat.py)
def lambda_handler(event, context):
    message = event.get("message")
    image_base64 = event.get("image_base64")
    
    vision_result = None
    if image_base64:
        vision_result = VisionProcessor.process_image(image_base64)
    
    result = chat_agent(message)
    return {"statusCode": 200, "body": result}
```

### Docker Support

Add to Dockerfile:
```dockerfile
RUN pip install google-generativeai pillow
```

## Troubleshooting

### Vision API Returns Empty Analysis
- **Cause**: Image quality too poor
- **Solution**: Try clearer, well-lit image
- **Fallback**: Text analysis continues normally

### High Latency on Images
- **Cause**: Slow network or large image
- **Solution**: Compress image, reduce resolution
- **Timeout**: 10 seconds default

### API Key Not Found
- **Cause**: GOOGLE_API_KEY environment variable missing
- **Solution**: Set in `.env` file
- **Fallback**: Text-only mode works

## Safety & Security

### Image Data Handling
- Images are **NOT stored** on backend
- Sent directly to Google Gemini API
- Encrypted in transit (HTTPS)
- Not logged or cached (unless explicitly configured)

### API Key Security
- **Never commit** .env file
- Use environment variables in production
- Rotate keys regularly
- Use service account keys for deployment

### Risk Detection
Critical risks are **hardcoded** for safety:
```python
CRITICAL_RISK_SIGNALS = {
    "smoke", "fire", "sparks", "burning",
    "exposed wires", "water leak", "flood"
}
```

No exceptions - always forces HIGH urgency + booking

## Monitoring & Logging

Add to backend for production:

```python
import logging

logger = logging.getLogger(__name__)

# Log vision analysis
logger.info(f"Vision analysis: {result['device_type']}")

# Log errors
logger.error(f"Vision API failed: {error}")

# Track confidence
logger.debug(f"Confidence: {result['confidence']}")
```

## Next Steps

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Set GOOGLE_API_KEY in `.env`
3. ✅ Test backend: `python -m pytest tests/test_vision.py`
4. ✅ Start backend: `uvicorn app.main:app --reload`
5. ✅ Test frontend: Open customer app and try image upload
6. ✅ Monitor logs: Check for vision API calls and errors

---

**Architecture Theme**: "Intelligent. Autonomous. Agentic in Action." ✨
