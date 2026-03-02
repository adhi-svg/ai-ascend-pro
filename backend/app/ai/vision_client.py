# ============================================================
# VISION API CLIENT - Production Ready
# Integrates Google Gemini Vision for image analysis
# ============================================================

import google.generativeai as genai
from typing import Dict, Any, Optional
import logging
import os

logger = logging.getLogger(__name__)


class VisionAPIError(Exception):
    """Custom exception for Vision API errors."""
    pass


class GeminiVisionClient:
    """Secure Gemini Vision API client for home service image analysis."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini Vision client.
        
        Args:
            api_key: Google API key (can also come from GOOGLE_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        
        if not self.api_key:
            logger.warning(
                "GOOGLE_API_KEY not found. Vision features will be disabled."
            )
            self.enabled = False
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self.enabled = True
            logger.info("✓ Gemini Vision client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Vision: {str(e)}")
            self.enabled = False
    
    def analyze_home_service_image(self, image_base64: str, timeout: int = 10) -> Dict[str, Any]:
        """
        Analyze a home service related image.
        
        Args:
            image_base64: Base64 encoded image string
            timeout: Timeout in seconds
        
        Returns:
            Structured analysis result
        """
        if not self.enabled:
            logger.warning("Vision API not enabled, returning empty analysis")
            return self._empty_analysis()
        
        try:
            # Create vision prompt
            vision_prompt = """Analyze this home service image. Return a JSON-like response with:

1. "description": 2-3 sentence description of what you see
2. "device_type": What device/appliance is visible (e.g., "AC unit", "water tap", "electrical switchboard", "router", "washing machine", "oven")
3. "visible_damage": Any damage observed (list or "none")
4. "risk_signals": Safety warnings observed (list items like: "smoke", "sparks", "fire", "water leakage", "red warning light", "burning marks", "exposed wires", "overheating", "unusual sounds visible")
5. "visible_lights": Light status if visible (e.g., "red light on", "blinking green", "all lights off", "no lights visible")
6. "condition": Overall condition ("good", "degraded", "critical")
7. "confidence": Confidence level (0.0 to 1.0)

Keep response concise and JSON-parseable.
If no device is visible or image is unclear, set confidence to 0.0 and description to "Unable to analyze image"."""
            
            # Convert base64 to image data
            import base64
            try:
                image_data = base64.b64decode(image_base64)
            except Exception as e:
                raise VisionAPIError(f"Invalid base64 image: {str(e)}")
            
            # Call Gemini Vision API
            response = self.model.generate_content(
                [
                    vision_prompt,
                    {
                        "mime_type": "image/jpeg",
                        "data": image_data,
                    }
                ]
            )
            
            # Parse response
            result_text = response.text
            
            # Extract structured data from response
            result = self._parse_vision_response(result_text)
            
            logger.info(f"Vision analysis completed: {result['device_type']}")
            return result
            
        except Exception as e:
            logger.error(f"Vision API error: {str(e)}")
            raise VisionAPIError(f"Vision analysis failed: {str(e)}")
    
    def _parse_vision_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Gemini response into structured format.
        
        Args:
            response_text: Raw response from Gemini API
        
        Returns:
            Structured analysis
        """
        import json
        import re
        
        # Try to extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        if json_match:
            try:
                data = json.loads(json_match.group())
                return {
                    "description": data.get("description", ""),
                    "device_type": data.get("device_type", "unknown"),
                    "visible_damage": data.get("visible_damage", []),
                    "risk_signals": (
                        data.get("risk_signals", [])
                        if isinstance(data.get("risk_signals"), list)
                        else []
                    ),
                    "visible_lights": data.get("visible_lights", ""),
                    "condition": data.get("condition", "unknown"),
                    "confidence": float(data.get("confidence", 0.0)),
                }
            except json.JSONDecodeError:
                pass
        
        # Fallback: parse manually
        return {
            "description": response_text[:200],
            "device_type": "unknown",
            "visible_damage": [],
            "risk_signals": self._extract_risk_signals(response_text),
            "visible_lights": "",
            "condition": "unknown",
            "confidence": 0.6,
        }
    
    def _extract_risk_signals(self, text: str) -> list:
        """Extract risk signals from text."""
        risk_keywords = [
            "smoke", "fire", "sparks", "burning", "burn marks",
            "water leak", "leaking", "water", "exposed wires",
            "red light", "warning", "overheating", "damaged"
        ]
        
        text_lower = text.lower()
        signals = [kw for kw in risk_keywords if kw in text_lower]
        return signals
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis when Vision API is not available."""
        return {
            "description": "",
            "device_type": "unknown",
            "visible_damage": [],
            "risk_signals": [],
            "visible_lights": "",
            "condition": "unknown",
            "confidence": 0.0,
        }


# Singleton instance
_vision_client = None


def get_vision_client() -> GeminiVisionClient:
    """Get or create Vision API client."""
    global _vision_client
    if _vision_client is None:
        _vision_client = GeminiVisionClient()
    return _vision_client


def reset_vision_client():
    """Reset client (for testing)."""
    global _vision_client
    _vision_client = None
