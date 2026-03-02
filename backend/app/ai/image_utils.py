# ============================================================
# IMAGE PROCESSING UTILITIES
# Safe base64 handling and validation
# ============================================================

import base64
import logging
from typing import Optional, Tuple
from io import BytesIO

logger = logging.getLogger(__name__)

# Max image size: 5MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024

# Supported image formats
SUPPORTED_FORMATS = {"image/jpeg", "image/png", "image/webp", "image/gif"}


class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass


def validate_base64_image(base64_string: str) -> Tuple[bool, Optional[str]]:
    """
    Validate base64 image string.
    
    Args:
        base64_string: Base64 encoded image
    
    Returns:
        (is_valid, error_message)
    """
    if not base64_string or not isinstance(base64_string, str):
        return False, "Invalid base64 string"
    
    # Remove data URL prefix if present
    if base64_string.startswith("data:"):
        try:
            base64_string = base64_string.split(",")[1]
        except (IndexError, AttributeError):
            return False, "Invalid data URL format"
    
    # Validate base64
    try:
        decoded = base64.b64decode(base64_string, validate=True)
        
        # Check size
        if len(decoded) > MAX_IMAGE_SIZE:
            return False, f"Image exceeds maximum size of {MAX_IMAGE_SIZE / 1024 / 1024}MB"
        
        return True, None
        
    except Exception as e:
        return False, f"Invalid base64 encoding: {str(e)}"


def extract_image_format(base64_string: str) -> Optional[str]:
    """
    Extract image format from base64 or data URL.
    
    Args:
        base64_string: Base64 encoded image
    
    Returns:
        Image MIME type or None
    """
    # Check if it's a data URL
    if base64_string.startswith("data:"):
        try:
            mime_type = base64_string.split(":")[1].split(";")[0]
            if mime_type in SUPPORTED_FORMATS:
                return mime_type
        except (IndexError, AttributeError):
            pass
    
    # Default to JPEG if not specified
    return "image/jpeg"


def clean_base64_string(base64_string: str) -> str:
    """
    Clean base64 string by removing data URL prefix.
    
    Args:
        base64_string: Raw base64 string or data URL
    
    Returns:
        Clean base64 string
    """
    if base64_string.startswith("data:"):
        try:
            return base64_string.split(",")[1]
        except IndexError:
            pass
    
    return base64_string


def get_image_size(base64_string: str) -> Tuple[int, int]:
    """
    Get image dimensions.
    
    Args:
        base64_string: Base64 encoded image
    
    Returns:
        (width, height) or (0, 0) if unable to determine
    """
    try:
        from PIL import Image
        
        decoded = base64.b64decode(base64_string)
        img = Image.open(BytesIO(decoded))
        return img.size
    except Exception as e:
        logger.warning(f"Unable to get image dimensions: {str(e)}")
        return 0, 0


def convert_image_to_base64(file_path: str) -> str:
    """
    Convert image file to base64 string.
    
    Args:
        file_path: Path to image file
    
    Returns:
        Base64 encoded string
    """
    try:
        with open(file_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode()
    except Exception as e:
        raise ImageProcessingError(f"Failed to convert image: {str(e)}")


def describe_image_metadata(base64_string: str) -> dict:
    """
    Get metadata about an image.
    
    Args:
        base64_string: Base64 encoded image
    
    Returns:
        Image metadata
    """
    width, height = get_image_size(base64_string)
    mime_type = extract_image_format(base64_string)
    
    try:
        decoded = base64.b64decode(base64_string)
        size_kb = len(decoded) / 1024
    except Exception:
        size_kb = 0
    
    return {
        "width": width,
        "height": height,
        "mime_type": mime_type,
        "size_kb": round(size_kb, 2),
        "aspect_ratio": f"{width}:{height}" if width and height else "unknown",
    }
