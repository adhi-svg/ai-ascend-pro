# ============================================================
# VISION PROCESSING LAYER
# Orchestrates image analysis and integration with chat engine
# ============================================================

import logging
from typing import Dict, Any, Optional
from app.ai.vision_client import get_vision_client, VisionAPIError
from app.ai.image_utils import validate_base64_image, clean_base64_string, ImageProcessingError

logger = logging.getLogger(__name__)


class VisionProcessor:
    """Process images and prepare structured descriptions for rule engine."""
    
    # Critical risk signals that force HIGH urgency
    CRITICAL_RISK_SIGNALS = {
        "smoke", "fire", "sparks", "burning", "burn marks",
        "exposed wires", "water leak", "leaking", "flood"
    }
    
    @staticmethod
    def process_image(base64_image: str) -> Dict[str, Any]:
        """
        Analyze image and return structured result.
        
        Args:
            base64_image: Base64 encoded image string
        
        Returns:
            Vision analysis result with fallback if Vision API fails
        """
        # Validate image
        is_valid, error_msg = validate_base64_image(base64_image)
        if not is_valid:
            logger.warning(f"Image validation failed: {error_msg}")
            return VisionProcessor._create_error_analysis(error_msg)
        
        # Clean base64 string
        clean_base64 = clean_base64_string(base64_image)
        
        # Call Vision API
        try:
            vision_client = get_vision_client()
            if not vision_client.enabled:
                logger.info("Vision API not enabled, skipping image analysis")
                return VisionProcessor._create_empty_analysis()
            
            result = vision_client.analyze_home_service_image(clean_base64)
            logger.info(f"Vision analysis successful: {result.get('device_type')}")
            return result
            
        except VisionAPIError as e:
            logger.error(f"Vision API error: {str(e)}")
            return VisionProcessor._create_error_analysis(str(e))
        except Exception as e:
            logger.error(f"Unexpected error during vision analysis: {str(e)}")
            return VisionProcessor._create_error_analysis(str(e))
    
    @staticmethod
    def extract_description(vision_result: Dict[str, Any]) -> str:
        """
        Extract natural language description from vision result.
        
        Args:
            vision_result: Vision API response
        
        Returns:
            Natural language description
        """
        description = vision_result.get("description", "")
        
        if not description and vision_result.get("confidence", 0) > 0:
            # Build description from fields
            device = vision_result.get("device_type", "device")
            condition = vision_result.get("condition", "")
            
            description = f"Image shows {device}"
            if condition:
                description += f" in {condition} condition"
            description += "."
        
        return description
    
    @staticmethod
    def detect_critical_risks(vision_result: Dict[str, Any]) -> bool:
        """
        Check if vision detected critical safety risks.
        
        Args:
            vision_result: Vision analysis result
        
        Returns:
            True if critical risk detected
        """
        risk_signals = vision_result.get("risk_signals", [])
        
        for signal in risk_signals:
            if signal.lower() in VisionProcessor.CRITICAL_RISK_SIGNALS:
                return True
        
        return False
    
    @staticmethod
    def get_risk_summary(vision_result: Dict[str, Any]) -> Optional[str]:
        """
        Get human-readable risk summary.
        
        Args:
            vision_result: Vision analysis result
        
        Returns:
            Risk summary or None
        """
        risk_signals = vision_result.get("risk_signals", [])
        
        if not risk_signals:
            return None
        
        # Filter only critical risks
        critical_risks = [
            r for r in risk_signals 
            if r.lower() in VisionProcessor.CRITICAL_RISK_SIGNALS
        ]
        
        if critical_risks:
            return f"⚠️ Detected: {', '.join(critical_risks)}"
        
        return None
    
    @staticmethod
    def combine_message_with_vision(
        user_message: str,
        vision_result: Dict[str, Any]
    ) -> str:
        """
        Combine user message with vision analysis insights.
        
        Args:
            user_message: Original user message
            vision_result: Vision analysis result
        
        Returns:
            Combined text for rule engine
        """
        description = VisionProcessor.extract_description(vision_result)
        
        if not description or vision_result.get("confidence", 0) < 0.3:
            return user_message
        
        # Combine message with vision insights
        combined = f"{user_message} [Image shows: {description}]"
        
        # Add risk signals
        risk_signals = vision_result.get("risk_signals", [])
        if risk_signals:
            combined += f" [Warning: {', '.join(risk_signals)}]"
        
        return combined
    
    @staticmethod
    def _create_empty_analysis() -> Dict[str, Any]:
        """Create empty analysis when Vision API is disabled."""
        return {
            "description": "",
            "device_type": "unknown",
            "visible_damage": [],
            "risk_signals": [],
            "visible_lights": "",
            "condition": "unknown",
            "confidence": 0.0,
            "error": "Vision API not available"
        }
    
    @staticmethod
    def _create_error_analysis(error_msg: str) -> Dict[str, Any]:
        """Create error analysis."""
        return {
            "description": "",
            "device_type": "unknown",
            "visible_damage": [],
            "risk_signals": [],
            "visible_lights": "",
            "condition": "unknown",
            "confidence": 0.0,
            "error": error_msg
        }


def process_chat_with_vision(
    message: str,
    vision_result: Optional[Dict[str, Any]] = None,
    rule_engine_fn=None
) -> Dict[str, Any]:
    """
    Process chat request with optional vision analysis.
    
    Args:
        message: User message
        vision_result: Optional vision analysis result
        rule_engine_fn: Rule engine function to process combined text
    
    Returns:
        Enhanced chat response with vision metadata
    """
    combined_message = message
    
    # Process vision if provided
    if vision_result:
        combined_message = VisionProcessor.combine_message_with_vision(
            message,
            vision_result
        )
    
    # Call rule engine
    if rule_engine_fn:
        response = rule_engine_fn(combined_message)
    else:
        response = {"intent": "OTHER", "reply": message}
    
    # Enhance response with vision data
    if vision_result:
        response["vision_detected"] = {
            "device_type": vision_result.get("device_type"),
            "condition": vision_result.get("condition"),
            "risk_signals": vision_result.get("risk_signals", []),
            "visible_damage": vision_result.get("visible_damage", []),
            "confidence": vision_result.get("confidence", 0.0),
        }
        
        # Force HIGH urgency if critical risks detected
        if VisionProcessor.detect_critical_risks(vision_result):
            response["urgency"] = "HIGH"
            response["suggest_booking"] = True
            response["intent"] = "BOOK_TECHNICIAN"
            
            risk_summary = VisionProcessor.get_risk_summary(vision_result)
            if risk_summary:
                response["reply"] = f"{risk_summary}\n\n{response.get('reply', '')}"
    
    return response
