# ============================================================
# AI MODULE
# Vision processing + Rule-based chat engine
# ============================================================

from app.ai.vision import VisionProcessor, process_chat_with_vision
from app.ai.vision_client import get_vision_client, GeminiVisionClient
from app.ai.image_utils import validate_base64_image, clean_base64_string

__all__ = [
    "VisionProcessor",
    "process_chat_with_vision",
    "get_vision_client",
    "GeminiVisionClient",
    "validate_base64_image",
    "clean_base64_string",
]
