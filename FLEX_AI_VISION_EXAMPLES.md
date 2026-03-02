# FLEX AI Vision - Complete Integration Examples

## Quick Reference Guide

---

## 1. Frontend Integration (React/JSX)

### Basic Image Upload Implementation

```jsx
import { useState, useRef } from 'react'

function ImageUploadChat() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target.result)
      setImagePreview(URL.createObjectURL(file))
    }
    reader.readAsDataURL(file)
  }

  // Send message with optional image
  const handleSendMessage = async (message) => {
    const payload = {
      message: message,
      context: { user_role: 'customer' }
    }

    // Add image if selected
    if (selectedImage) {
      payload.image_base64 = selectedImage
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (result.success) {
        const aiResponse = result.data
        
        // Display vision analysis if present
        if (aiResponse.vision_detected) {
          console.log('Vision Analysis:', aiResponse.vision_detected)
          displayVisionInfo(aiResponse.vision_detected)
        }
        
        // Display main response
        displayMessage(aiResponse)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Helper: Display vision info
  const displayVisionInfo = (vision) => {
    const markup = `
      <div class="vision-analysis">
        <h4>🔍 Device Analysis</h4>
        <p><strong>Device:</strong> ${vision.device_type}</p>
        <p><strong>Condition:</strong> ${vision.condition}</p>
        ${vision.risk_signals.length > 0 ? 
          `<p><strong>⚠️ Alerts:</strong> ${vision.risk_signals.join(', ')}</p>` 
          : ''}
        <p><em>Confidence: ${(vision.confidence * 100).toFixed(0)}%</em></p>
      </div>
    `
    // Render markup to DOM
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />

      <button onClick={() => fileInputRef.current?.click()}>
        📸 Upload Photo
      </button>

      {imagePreview && (
        <div>
          <img src={imagePreview} alt="preview" style={{ maxWidth: '120px' }} />
          <button onClick={() => {
            setSelectedImage(null)
            setImagePreview(null)
            fileInputRef.current.value = ''
          }}>
            ✕ Remove
          </button>
        </div>
      )}

      <button onClick={() => handleSendMessage('Your message here')}>
        Send
      </button>
    </>
  )
}
```

### Display Vision Analysis Results

```jsx
function VisionAnalysisPanel({ visionData }) {
  if (!visionData) return null

  const { device_type, condition, risk_signals, visible_damage, confidence } = visionData

  return (
    <div className="vision-panel">
      <h3>🔍 Vision Analysis</h3>
      
      <div className="vision-row">
        <label>Device Type:</label>
        <span>{device_type}</span>
      </div>

      <div className="vision-row">
        <label>Condition:</label>
        <span className={`condition-${condition.toLowerCase()}`}>
          {condition}
        </span>
      </div>

      {visible_damage && visible_damage.length > 0 && (
        <div className="vision-row">
          <label>Damage:</label>
          <span>{visible_damage.join(', ')}</span>
        </div>
      )}

      {risk_signals && risk_signals.length > 0 && (
        <div className="vision-row warning">
          <label>⚠️ Risk Signals:</label>
          <span>{risk_signals.join(', ')}</span>
        </div>
      )}

      <div className="vision-confidence">
        <div className="confidence-bar">
          <div 
            className="confidence-fill" 
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
        <span>{(confidence * 100).toFixed(0)}% Confidence</span>
      </div>
    </div>
  )
}
```

---

## 2. Backend Integration (Python/FastAPI)

### Using Vision Processor Directly

```python
from app.ai.vision import VisionProcessor
from app.ai.image_utils import validate_base64_image

# Example: Process image independently
def analyze_user_image(base64_image: str):
    """Analyze image and get detailed insights"""
    
    # Step 1: Validate image
    is_valid, error = validate_base64_image(base64_image)
    if not is_valid:
        return {"error": error, "success": False}
    
    # Step 2: Process with vision
    vision_result = VisionProcessor.process_image(base64_image)
    
    # Step 3: Check for risks
    has_risks = VisionProcessor.detect_critical_risks(vision_result)
    
    # Step 4: Get summary
    risk_summary = VisionProcessor.get_risk_summary(vision_result)
    
    # Step 5: Combine with message
    message = "User said: [something]"
    combined = VisionProcessor.combine_message_with_vision(message, vision_result)
    
    return {
        "vision": vision_result,
        "has_critical_risks": has_risks,
        "risk_summary": risk_summary,
        "combined_message": combined
    }
```

### Custom Vision Analysis Endpoint

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI"])

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    detailed: bool = False

@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisRequest):
    """Dedicated endpoint for image analysis"""
    try:
        # Validate
        is_valid, error = validate_base64_image(req.image_base64)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error)
        
        # Analyze
        vision_result = VisionProcessor.process_image(req.image_base64)
        
        # Return full or summary
        if req.detailed:
            return success_response(data=vision_result)
        else:
            return success_response(data={
                "device_type": vision_result.get("device_type"),
                "condition": vision_result.get("condition"),
                "risk_signals": vision_result.get("risk_signals"),
                "confidence": vision_result.get("confidence")
            })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Integration with Booking System

```python
from app.api.v1.endpoints.ai_chat import chat_agent
from app.ai.vision import VisionProcessor

async def auto_assign_technician(complaint_text: str, image_base64: str = None):
    """Auto-assign technician based on complaint + image"""
    
    # Get AI analysis
    vision_result = None
    if image_base64:
        vision_result = VisionProcessor.process_image(image_base64)
        combined_text = VisionProcessor.combine_message_with_vision(
            complaint_text, 
            vision_result
        )
    else:
        combined_text = complaint_text
    
    # Get AI categorization
    ai_response = chat_agent(combined_text)
    
    # Extract details for assignment
    category = ai_response.get("category")
    urgency = ai_response.get("urgency")
    is_critical = VisionProcessor.detect_critical_risks(vision_result) if vision_result else False
    
    # Assignment logic
    if is_critical or urgency == "HIGH":
        # Assign highest-rated technician
        technician = get_highest_rated_technician(category)
        priority = "URGENT"
    elif urgency == "MEDIUM":
        # Assign available technician in area
        technician = get_nearest_available_technician(category)
        priority = "NORMAL"
    else:
        # Assign by preference
        technician = get_preferred_technician(category)
        priority = "LOW"
    
    return {
        "technician_id": technician.id,
        "priority": priority,
        "category": category,
        "analysis": ai_response
    }
```

---

## 3. Testing Examples

### Unit Test: Vision Integration

```python
import pytest
from unittest.mock import patch, MagicMock
from app.ai.vision import VisionProcessor

class TestVisionIntegration:
    
    @patch('app.ai.vision_client.GeminiVisionClient.analyze_home_service_image')
    def test_critical_risk_detected(self, mock_api):
        """Test that critical risks are properly detected"""
        
        # Mock API response
        mock_api.return_value = {
            "device_type": "switchboard",
            "condition": "critical",
            "risk_signals": ["sparks", "burning"],
            "confidence": 0.98
        }
        
        # Process image
        result = VisionProcessor.process_image("mock_base64_image")
        
        # Check detection
        is_critical = VisionProcessor.detect_critical_risks(result)
        
        assert is_critical is True
        assert "sparks" in result["risk_signals"]
        assert result["confidence"] > 0.9
    
    @patch('app.ai.vision_client.GeminiVisionClient.analyze_home_service_image')
    def test_message_combination(self, mock_api):
        """Test message + vision combination"""
        
        mock_api.return_value = {
            "description": "Water leaking from tap connection",
            "device_type": "water tap",
            "risk_signals": [],
            "confidence": 0.87
        }
        
        message = "How to fix this?"
        vision = VisionProcessor.process_image("base64")
        combined = VisionProcessor.combine_message_with_vision(message, vision)
        
        assert "How to fix this?" in combined
        assert "water tap" in combined.lower()
        assert "leaking" in combined.lower()

    def test_vision_processor_without_api_key(self):
        """Test graceful degradation without API key"""
        
        # Simulate no API key
        with patch.dict('os.environ', {}, clear=True):
            from app.ai.vision_client import reset_vision_client, get_vision_client
            reset_vision_client()
            
            client = get_vision_client()
            assert client.enabled is False
            
            # Should return empty analysis
            result = client._empty_analysis()
            assert result["confidence"] == 0.0
```

### Integration Test: End-to-End Chat

```python
@pytest.mark.asyncio
async def test_chat_with_image_e2e():
    """Test complete chat flow with image"""
    
    from app.api.v1.endpoints.ai_chat import ChatRequest, ai_help_chat
    import base64
    
    # Create mock image (smallest valid JPEG)
    mock_jpeg = b'\xff\xd8\xff\xe0' + b'\x00' * 100 + b'\xff\xd9'
    image_base64 = base64.b64encode(mock_jpeg).decode()
    
    # Create request
    request = ChatRequest(
        message="Is this safe?",
        image_base64=image_base64,
        context=None
    )
    
    # Call endpoint
    response = await ai_help_chat(request)
    
    # Verify response
    assert response["success"] is True
    data = response["data"]
    
    assert "assistant_name" in data
    assert "reply" in data
    assert data["assistant_name"] == "FLEX AI"
    
    # Vision data should be present
    assert "vision_detected" in data
    if data["vision_detected"]:
        assert "device_type" in data["vision_detected"]
        assert "confidence" in data["vision_detected"]
```

---

## 4. API Call Examples

### Using cURL (Text Only)

```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My AC is not cooling",
    "context": {
      "user_role": "customer",
      "locale": "en-IN"
    }
  }'
```

### Using Python requests (With Image)

```python
import requests
import base64

# Load image
with open("ac_image.jpg", "rb") as f:
    image_data = f.read()
    image_base64 = base64.b64encode(image_data).decode()

# Make request
response = requests.post(
    "http://localhost:8000/api/v1/ai/chat",
    json={
        "message": "AC not cooling, green light on",
        "image_base64": image_base64,
        "context": {
            "user_role": "customer",
            "locale": "en-IN"
        }
    }
)

# Process response
result = response.json()
if result["success"]:
    ai_response = result["data"]
    
    print("Response:", ai_response["reply"])
    print("Urgency:", ai_response["urgency"])
    print("Book?", ai_response["suggest_booking"])
    
    if ai_response.get("vision_detected"):
        vision = ai_response["vision_detected"]
        print(f"Device: {vision['device_type']}")
        print(f"Condition: {vision['condition']}")
        print(f"Confidence: {vision['confidence']*100:.0f}%")
```

### Using JavaScript Fetch

```javascript
// Read image file
const file = document.querySelector('input[type="file"]').files[0]
const reader = new FileReader()

reader.onload = async (e) => {
  const base64Image = e.target.result
  
  // Send request
  const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Is this broken?',
      image_base64: base64Image,
      context: {
        user_role: 'customer',
        locale: 'en-IN'
      }
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    const data = result.data
    
    // Display vision info
    if (data.vision_detected) {
      console.log('Device:', data.vision_detected.device_type)
      console.log('Risks:', data.vision_detected.risk_signals)
    }
    
    // Display message
    console.log(data.reply)
  }
}

reader.readAsDataURL(file)
```

---

## 5. Error Handling Examples

### Frontend Error Handling

```javascript
async function sendMessageWithImage(message, imageBase64) {
  try {
    // Validate image if present
    if (imageBase64) {
      if (imageBase64.length > 5 * 1024 * 1024) {
        throw new Error('Image too large (max 5MB)')
      }
    }
    
    // Send request
    const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        image_base64: imageBase64,
        context: { user_role: 'customer' }
      })
    })
    
    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    // Handle API errors
    if (!result.success) {
      throw new Error(result.error || 'API Error')
    }
    
    return result.data
    
  } catch (error) {
    console.error('Chat error:', error.message)
    
    // Graceful fallback
    return {
      reply: '❌ Sorry, I encountered an error. Please try again.',
      error: error.message
    }
  }
}
```

### Backend Error Handling

```python
from app.ai.image_utils import validate_base64_image, ImageProcessingError
from app.ai.vision_client import VisionAPIError

@router.post("/chat")
async def ai_help_chat(req: ChatRequest):
    try:
        # Step 1: Validate image if present
        if req.image_base64:
            is_valid, error = validate_base64_image(req.image_base64)
            if not is_valid:
                return error_response(
                    code="INVALID_IMAGE",
                    details=error
                )
        
        # Step 2: Process vision
        vision_result = None
        try:
            if req.image_base64:
                vision_result = VisionProcessor.process_image(req.image_base64)
        except VisionAPIError as e:
            logger.warning(f"Vision API failed: {str(e)}")
            # Continue with text-only
            vision_result = None
        except Exception as e:
            logger.error(f"Unexpected vision error: {str(e)}")
            vision_result = None
        
        # Step 3: Process with rule engine
        combined_text = req.message
        if vision_result:
            combined_text = VisionProcessor.combine_message_with_vision(
                req.message,
                vision_result
            )
        
        result = chat_agent(combined_text)
        
        # Step 4: Enhance response
        if vision_result:
            result["vision_detected"] = {
                "device_type": vision_result.get("device_type"),
                "condition": vision_result.get("condition"),
                "risk_signals": vision_result.get("risk_signals"),
                "visible_damage": vision_result.get("visible_damage"),
                "confidence": vision_result.get("confidence")
            }
            
            # Safety override
            if VisionProcessor.detect_critical_risks(vision_result):
                result["urgency"] = "HIGH"
                result["suggest_booking"] = True
        
        return success_response(data=result)
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response(
            code="INTERNAL_ERROR",
            details="An unexpected error occurred"
        )
```

---

## 6. Configuration Examples

### Environment Setup

**.env file**:
```
# Required
GOOGLE_API_KEY=AIzaSyD... [your actual key]

# Optional
VISION_API_TIMEOUT=10
MAX_IMAGE_SIZE=5242880
VISION_ENABLED=true
LOG_LEVEL=INFO
```

**Load in application**:
```python
# backend/app/core/config.py
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    VISION_API_TIMEOUT = int(os.getenv("VISION_API_TIMEOUT", 10))
    MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 5242880))
    VISION_ENABLED = os.getenv("VISION_ENABLED", "true").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
```

### Docker Integration

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV GOOGLE_API_KEY=${API_KEY}
ENV VISION_ENABLED=true

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Run:
```bash
docker build -t flex-ai .
docker run -e API_KEY="your-key" -p 8000:8000 flex-ai
```

---

**That's it!** You now have a complete, production-ready FLEX AI Vision system integrated into your application.

Theme: "Intelligent. Autonomous. Agentic in Action." ✨
