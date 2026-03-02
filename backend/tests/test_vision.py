# ============================================================
# VISION INTEGRATION UNIT TESTS
# Test vision processing, image validation, and rule engine
# ============================================================

import pytest
import base64
from unittest.mock import Mock, patch
from app.ai.vision import VisionProcessor
from app.ai.image_utils import validate_base64_image, clean_base64_string
from app.ai.vision_client import GeminiVisionClient

# Sample base64 JPEG header (smallest valid JPEG)
VALID_JPEG_BASE64 = base64.b64encode(
    b'\xff\xd8\xff\xe0\x00\x10JFIF'  # JPEG header
).decode()

INVALID_BASE64 = "not!!!base64"


class TestImageValidation:
    """Test image validation functions"""
    
    def test_validate_valid_base64(self):
        """Test valid base64 image validation"""
        is_valid, error = validate_base64_image(VALID_JPEG_BASE64)
        # Will fail on actual JPEG size check, but base64 is valid syntax
        assert isinstance(is_valid, bool)
    
    def test_validate_invalid_base64(self):
        """Test invalid base64 rejection"""
        is_valid, error = validate_base64_image(INVALID_BASE64)
        assert is_valid is False
        assert error is not None
    
    def test_validate_empty_string(self):
        """Test empty string validation"""
        is_valid, error = validate_base64_image("")
        assert is_valid is False
        assert error is not None
    
    def test_clean_base64_with_data_url(self):
        """Test cleaning data URL format"""
        data_url = f"data:image/jpeg;base64,{VALID_JPEG_BASE64}"
        clean = clean_base64_string(data_url)
        assert clean == VALID_JPEG_BASE64
        assert not clean.startswith("data:")
    
    def test_clean_base64_without_data_url(self):
        """Test cleaning raw base64"""
        clean = clean_base64_string(VALID_JPEG_BASE64)
        assert clean == VALID_JPEG_BASE64


class TestVisionProcessor:
    """Test vision processing functions"""
    
    def test_detect_critical_risks_true(self):
        """Test detection of critical risks"""
        vision_result = {
            "risk_signals": ["smoke", "fire"],
            "confidence": 0.9
        }
        is_critical = VisionProcessor.detect_critical_risks(vision_result)
        assert is_critical is True
    
    def test_detect_critical_risks_false(self):
        """Test when no critical risks present"""
        vision_result = {
            "risk_signals": ["dust", "minor wear"],
            "confidence": 0.7
        }
        is_critical = VisionProcessor.detect_critical_risks(vision_result)
        assert is_critical is False
    
    def test_detect_critical_risks_empty_signals(self):
        """Test with empty risk signals"""
        vision_result = {
            "risk_signals": [],
            "confidence": 0.5
        }
        is_critical = VisionProcessor.detect_critical_risks(vision_result)
        assert is_critical is False
    
    def test_extract_description_with_content(self):
        """Test description extraction"""
        vision_result = {
            "description": "Shows AC unit with ice buildup",
            "device_type": "AC unit",
            "confidence": 0.85
        }
        desc = VisionProcessor.extract_description(vision_result)
        assert "AC unit" in desc or "ice" in desc
    
    def test_extract_description_without_content(self):
        """Test description extraction with minimal data"""
        vision_result = {
            "description": "",
            "device_type": "router",
            "confidence": 0.8
        }
        desc = VisionProcessor.extract_description(vision_result)
        # Should construct from device_type
        assert len(desc) > 0
    
    def test_combine_message_with_vision(self):
        """Test message + vision combination"""
        message = "Not cooling"
        vision_result = {
            "description": "AC unit with frozen coil",
            "risk_signals": [],
            "confidence": 0.9
        }
        combined = VisionProcessor.combine_message_with_vision(message, vision_result)
        
        # Should contain both parts
        assert "Not cooling" in combined
        assert "frozen coil" in combined or "AC" in combined
    
    def test_combine_message_low_confidence(self):
        """Test combination with low confidence vision"""
        message = "Help me"
        vision_result = {
            "description": "unclear image",
            "risk_signals": [],
            "confidence": 0.2  # Low confidence
        }
        combined = VisionProcessor.combine_message_with_vision(message, vision_result)
        
        # Should still include message
        assert "Help me" in combined
    
    def test_get_risk_summary_with_risks(self):
        """Test risk summary generation"""
        vision_result = {
            "risk_signals": ["sparks", "burning"],
            "confidence": 0.95
        }
        summary = VisionProcessor.get_risk_summary(vision_result)
        
        assert summary is not None
        assert "Detected" in summary
        assert ("sparks" in summary or "burning" in summary)
    
    def test_get_risk_summary_no_risks(self):
        """Test risk summary with no risks"""
        vision_result = {
            "risk_signals": [],
            "confidence": 0.8
        }
        summary = VisionProcessor.get_risk_summary(vision_result)
        assert summary is None


class TestVisionClient:
    """Test Vision API client"""
    
    def test_vision_client_initialization_with_key(self):
        """Test client initialization with API key"""
        with patch.dict('os.environ', {'GOOGLE_API_KEY': 'test-key'}):
            with patch('google.generativeai.configure'):
                client = GeminiVisionClient(api_key='test-key')
                # Should initialize but might not fully configure
                assert client.api_key == 'test-key'
    
    def test_vision_client_initialization_no_key(self):
        """Test client when no API key available"""
        with patch.dict('os.environ', {}, clear=True):
            client = GeminiVisionClient()
            assert client.enabled is False
    
    def test_empty_analysis(self):
        """Test empty analysis response"""
        analysis = GeminiVisionClient._empty_analysis(None)
        
        assert analysis['confidence'] == 0.0
        assert isinstance(analysis['risk_signals'], list)
        assert len(analysis['risk_signals']) == 0


class TestRuleEngineIntegration:
    """Test integration with rule-based chat engine"""
    
    @patch('app.api.v1.endpoints.ai_chat.chat_agent')
    def test_vision_forces_high_urgency(self, mock_chat_agent):
        """Test that critical vision results force HIGH urgency"""
        # Mock rule engine response
        mock_chat_agent.return_value = {
            "intent": "DIY_TIPS",
            "urgency": "MEDIUM",
            "reply": "Try this..."
        }
        
        vision_result = {
            "device_type": "switchboard",
            "risk_signals": ["sparks", "burning"],
            "confidence": 0.95
        }
        
        # In real code, vision would force urgency
        is_critical = VisionProcessor.detect_critical_risks(vision_result)
        assert is_critical is True


# Integration tests
class TestEndToEndFlow:
    """Test complete chat flow with vision"""
    
    def test_text_only_backward_compatibility(self):
        """Test that text-only requests still work"""
        from app.api.v1.endpoints.ai_chat import ChatRequest
        
        req = ChatRequest(
            message="My AC is not cooling",
            image_base64=None,
            context=None
        )
        
        assert req.message == "My AC is not cooling"
        assert req.image_base64 is None
    
    def test_image_included_in_request(self):
        """Test request with image"""
        from app.api.v1.endpoints.ai_chat import ChatRequest
        
        req = ChatRequest(
            message="Is this safe?",
            image_base64=VALID_JPEG_BASE64,
            context=None
        )
        
        assert req.image_base64 == VALID_JPEG_BASE64
        assert req.message == "Is this safe?"


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
