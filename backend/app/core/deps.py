from fastapi import Depends, Header
from typing import Optional, Any, Dict

from app.auth.auth import get_current_user as auth_get_current_user
from app.auth.auth import role_required
from ..stores.user_store import user_store


def _normalize_role(role: str) -> str:
    value = role.strip().lower()
    if value in {"admin", "administrator"}:
        return "Admin"
    if value in {"technician", "tech"}:
        return "Technician"
    return "Citizen"


def _normalize_role_api(role: str) -> str:
    value = str(role or "").strip().lower()
    if value in {"admin", "administrator"}:
        return "admin"
    if value in {"technician", "tech"}:
        return "technician"
    return "customer"


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    token_user = await auth_get_current_user(authorization=authorization)
    normalized_role = _normalize_role_api(token_user.get("role", "customer"))

    # Backward-compatible enrichment for existing endpoints that expect store fields.
    stored_user = user_store.get_by_id(token_user["id"])
    if stored_user:
        stored_user["role"] = normalized_role
        stored_user["is_active"] = token_user.get("is_active", True)
        return stored_user

    return {
        "id": token_user["id"],
        "phone": "",
        "name": "",
        "email": token_user.get("email", ""),
        "role": normalized_role,
        "profile_complete": False,
        "created_at": "",
        "is_active": token_user.get("is_active", True),
    }


def require_role(*roles: str):
    # Backward compatibility: support require_role(["admin"]) and require_role("admin")
    if len(roles) == 1 and isinstance(roles[0], (list, tuple, set)):
        requested = [str(role) for role in roles[0]]
    else:
        requested = [str(role) for role in roles]

    normalized = [_normalize_role(role) for role in requested]
    return role_required(normalized)
