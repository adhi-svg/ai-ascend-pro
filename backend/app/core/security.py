from datetime import timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException

from app.auth.auth import (
    hash_password,
    verify_password,
    create_access_token as _create_access_token,
    verify_token,
)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    return _create_access_token(data=data, expires_delta=expires_delta)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return verify_token(token)
    except HTTPException:
        return None
