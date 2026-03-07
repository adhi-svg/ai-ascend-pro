# ============================================================
# FLEX AI CHAT WITH GENERATIVE AI (Groq)
# Theme: "Intelligent. Autonomous. Agentic in Action."
# Meet FLEX AI: Your AI-powered intelligent assistant
# Uses Groq Llama 3 models for ultra-fast natural conversations
# ============================================================

import os
import json
import logging
import warnings
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Suppress warnings
warnings.filterwarnings("ignore", category=FutureWarning)

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from app.utils.responses import success_response
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Groq
GROQ_API_KEY = settings.GROQ_API_KEY
groq_client = None

if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY not set in settings. Using fallback responses only.")
    GROQ_AVAILABLE = False
elif not GROQ_AVAILABLE:
    logger.warning("⚠️ groq library not available. Using fallback responses.")
else:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq API configured successfully with Llama 3 models")
    except Exception as e:
        logger.error(f"❌ Failed to configure Groq: {str(e)}")
        GROQ_AVAILABLE = False

router = APIRouter(prefix="/ai", tags=["AI Agent"])

# ============================================================
# SYSTEM PROMPT FOR GEMINI
# ============================================================

SYSTEM_PROMPT = """You are FLEX AI, an intelligent home services assistant inside a field service app.

## Your Role
- Help customers with home service issues
- Provide practical, friendly advice
- Recommend professional help when needed
- Support image uploads for visual problem diagnosis

## Response Format
You MUST respond with ONLY valid JSON (no markdown, no explanations). Return this exact structure:
{
  "assistant_name": "FLEX AI",
  "reply": "Your conversational response (friendly and practical)",
  "intent": "APP_HELP|DIY_TIPS|BOOK_TECHNICIAN|OTHER",
  "category": "Electrical|Plumbing|AC Repair|WiFi/Internet|Appliance Repair|Carpentry|Cleaning|Other",
  "urgency": "LOW|MEDIUM|HIGH",
  "suggest_booking": true/false,
  "safe_steps": ["step 1", "step 2"],
  "disclaimer": "optional warning if needed",
  "vision_detected": null or {
    "device_type": "what device is shown",
    "condition": "brief assessment",
    "risk_signals": ["signal1", "signal2"],
    "visible_damage": ["damage1", "damage2"],
    "confidence": 0.85
  }
}

## Intent Classification
- **APP_HELP**: Questions about the app (booking, tracking, payments, complaints, etc.)
- **DIY_TIPS**: How-to questions, repair guidance, quick fixes
- **BOOK_TECHNICIAN**: Emergency situations, complex repairs, safety hazards
- **OTHER**: General questions

## Category Options
Electrical, Plumbing, AC Repair, WiFi/Internet, Appliance Repair, Carpentry, Cleaning, Other

## Urgency Levels
- **LOW**: Minor issues, general questions, maintenance
- **MEDIUM**: Moderate issues, inconveniences, non-emergency repairs
- **HIGH**: Safety hazards, fires, gas leaks, electrical emergencies, major damage

## Safety Rules
1. **Fire/Smoke/Burning**: Intent BOOK_TECHNICIAN, urgency HIGH, suggest_booking=true
2. **Electrical Hazard**: Intent BOOK_TECHNICIAN, urgency HIGH, suggest_booking=true
3. **Gas Leak**: Intent BOOK_TECHNICIAN, urgency HIGH, suggest_booking=true
4. **Water Leaks**: Intent DIY_TIPS, suggest_booking=true (for persistent issues)
5. **Major Structural Damage**: Intent BOOK_TECHNICIAN, urgency HIGH, suggest_booking=true

## Guidelines
- Keep replies short, friendly, and practical (2-4 sentences max without lists)
- If providing DIY tips, include 3-5 practical steps
- Always prioritize safety
- Suggest booking only when necessary
- If image provided, analyze it and comment on the condition
- Ask ONE clarification question if user's issue is ambiguous
- Be conversational, not robotic
- Use emojis sparingly for tone

## For Images
- Analyze device type, visible damage, safety risks, condition
- Return high confidence (0.7-0.95) when you can identify problems
- Extract specific risk signals (e.g., "loose wiring", "rust", "water damage")
- Force HIGH urgency if critical risks detected in image

## Important
- Return ONLY JSON matching the requested structure
- No markdown code blocks surrounding the JSON
- No explanations outside JSON
- Ensure all fields are valid JSON types
- Empty arrays [] for empty lists, not null
"""


class ChatContext(BaseModel):
    user_role: Optional[str] = "customer"
    last_booking_id: Optional[str] = None
    locale: Optional[str] = "en-IN"

class ChatRequest(BaseModel):
    message: str
    image_base64: Optional[str] = None
    context: Optional[ChatContext] = None

class VisionDetected(BaseModel):
    device_type: Optional[str] = None
    condition: Optional[str] = None
    risk_signals: Optional[List[str]] = None
    visible_damage: Optional[List[str]] = None
    confidence: Optional[float] = None

class ChatResponse(BaseModel):
    assistant_name: str
    reply: str
    intent: str
    category: Optional[str] = None
    urgency: Optional[str] = None
    suggest_booking: bool = False
    safe_steps: Optional[List[str]] = None
    disclaimer: Optional[str] = None
    vision_detected: Optional[VisionDetected] = None


# ============================================================
# FALLBACK RESPONSE (If Gemini fails)
# ============================================================

def get_fallback_response() -> Dict[str, Any]:
    """Return a safe fallback response when AI fails."""
    return {
        "assistant_name": "FLEX AI",
        "reply": "I'm having trouble processing your request right now. Please try again or contact support at our 24/7 helpline.",
        "intent": "OTHER",
        "category": None,
        "urgency": "LOW",
        "suggest_booking": False,
        "safe_steps": [],
        "disclaimer": None,
        "vision_detected": None
    }


# ============================================================
# GROQ AI CHAT ENGINE
# ============================================================

def call_ai_api(
    message: str,
    image_base64: Optional[str] = None,
    context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Call Groq API to generate intelligent response.
    
    Args:
        message: User's text message
        image_base64: Optional image data as base64
        context: Optional user context
    
    Returns:
        Parsed JSON response matching ChatResponse schema
    """
    if not GROQ_API_KEY or not GROQ_AVAILABLE or not groq_client:
        logger.warning("Groq API not available. Returning fallback response.")
        return get_fallback_response()
    
    try:
        logger.info("Initializing Groq chat completion...")
        
        # Build user message content
        user_content = f"User message: {message}"
        if context:
            user_content += f"\nUser role: {context.get('user_role', 'customer')}"
            user_content += f"\nLocale: {context.get('locale', 'en-IN')}"
        
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Determine model and format messages based on image presence
        if image_base64:
            # Use multimodal model
            model_name = "llama-3.2-11b-vision-preview"
            
            # Format image string for Groq Requirements (data:image/jpeg;base64,...)
            if not image_base64.startswith("data:image"):
                # Clean any non-standard prefixes
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]
                image_url = f"data:image/jpeg;base64,{image_base64}"
            else:
                image_url = image_base64
                
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": user_content},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            })
            logger.info("Image added to Groq vision request")
        else:
            # Use high-performance text model
            model_name = "llama-3.3-70b-versatile"
            messages.append({
                "role": "user",
                "content": user_content
            })
        
        # Call API
        logger.info(f"📞 Calling Groq model {model_name} with message: {message[:50]}...")
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model=model_name,
            response_format={"type": "json_object"},
            temperature=0.2, # Low temperature for reliable JSON
        )
        
        # Extract response text
        response_text = chat_completion.choices[0].message.content.strip()
        logger.info(f"✅ Groq response received: {len(response_text)} chars")
        
        # Parse JSON response
        logger.info("Parsing JSON response...")
        result = json.loads(response_text)
        
        # Validate required fields
        required_fields = [
            "assistant_name", "reply", "intent", "urgency",
            "suggest_booking", "safe_steps"
        ]
        for field in required_fields:
            if field not in result:
                logger.warning(f"⚠️ Missing required field: {field}")
                if field == "assistant_name":
                    result[field] = "FLEX AI"
                elif field == "safe_steps":
                    result[field] = []
                elif field == "suggest_booking":
                    result[field] = False
                elif field == "urgency":
                    result[field] = "LOW"
                else:
                    result[field] = ""
        
        # Ensure safe_steps is a list
        if not isinstance(result.get("safe_steps"), list):
            result["safe_steps"] = []
        
        # Ensure vision_detected is in correct format
        if result.get("vision_detected"):
            vision = result["vision_detected"]
            if not isinstance(vision.get("risk_signals"), list):
                vision["risk_signals"] = []
            if not isinstance(vision.get("visible_damage"), list):
                vision["visible_damage"] = []
        
        logger.info(f"✅ Groq success: intent={result.get('intent')}, urgency={result.get('urgency')}")
        return result
    
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse JSON from AI: {str(e)}")
        logger.error(f"Response was: {response_text[:200]}")
        return get_fallback_response()
    except Exception as e:
        logger.error(f"❌ AI API call failed: {str(e)}", exc_info=True)
        return get_fallback_response()


# ============================================================
# FASTAPI ENDPOINT
# ============================================================

@router.post("/chat", response_model=dict)
async def ai_help_chat(req: ChatRequest):
    """
    FLEX AI - Intelligent generative chat endpoint using Groq.
    
    Supports:
    - Text-only messages (llama-3.3-70b-versatile)
    - Image analysis via Vision (llama-3.2-11b-vision-preview)
    - Structured JSON responses matching schema
    - Fallback responses if Groq fails
    
    Args:
        req: ChatRequest containing message, optional image, and context
    
    Returns:
        success_response with ChatResponse data
    """
    context_dict = req.context.dict() if req.context else {}
    
    # Call AI engine
    result = call_ai_api(
        message=req.message,
        image_base64=req.image_base64,
        context=context_dict
    )
    
    # Ensure all required fields are present
    if "assistant_name" not in result:
        result["assistant_name"] = "FLEX AI"
    if "safe_steps" not in result:
        result["safe_steps"] = []
    if "vision_detected" not in result:
        result["vision_detected"] = None
    
    logger.info(f"Chat response: intent={result.get('intent')}, urgency={result.get('urgency')}")
    
    return success_response(
        data=result,
        message="Chat response generated"
    )


# ============================================================
# LAMBDA HANDLER (Cloud-Ready)
# For AWS Lambda serverless deployment
# ============================================================

def lambda_handler(event, context):
    """
    AWS Lambda handler for chat endpoint.
    
    Event format:
    {
        "message": "string",
        "image_base64": "optional_string",
        "context": {"user_role": "customer", ...}
    }
    """
    try:
        message = event.get("message", "")
        image_base64 = event.get("image_base64")
        chat_context = event.get("context", {})
        
        result = call_ai_api(message, image_base64, chat_context)
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
