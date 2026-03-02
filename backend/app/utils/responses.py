from typing import Any, Dict, Optional
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    details: str

class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = ""
    error: Optional[ErrorDetail] = None

def success_response(data: Any = None, message: str = "") -> Dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "message": message,
    }

def error_response(code: str, details: str, message: str = "") -> Dict[str, Any]:
    return {
        "success": False,
        "error": {
            "code": code,
            "details": details,
        },
        "message": message or details,
    }
