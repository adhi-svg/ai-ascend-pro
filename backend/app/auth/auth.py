from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, List

from fastapi import Header, HTTPException, status, Depends
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Bcrypt for new passwords; keep argon2 support for legacy hashes.
pwd_context = CryptContext(schemes=["bcrypt", "argon2"], deprecated="auto")


def _normalize_role(role: Any) -> str:
    value = str(role or "Citizen").strip().lower()
    if value in {"admin", "administrator"}:
        return "Admin"
    if value in {"technician", "tech"}:
        return "Technician"
    if value in {"citizen", "customer", "user"}:
        return "Citizen"
    return "Citizen"


def hash_password(password: str) -> str:
    """Hash raw password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create an HS256 JWT access token.

    Required claim in data: `sub` (user id).
    Recommended claims: `email`, `role`, `is_active`.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    """Verify token and return payload.

    If Cognito is configured, delegates to CognitoVerifier for RS256/JWKS
    verification.  Otherwise, uses local HS256 JWT verification.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # ── Cognito path (RS256 / JWKS) ────────────────────────────
    try:
        from .cognito_verifier import cognito_verifier

        if cognito_verifier.is_configured:
            try:
                payload = cognito_verifier.verify_token(token)
                user_info = cognito_verifier.extract_user_info(payload)
                # Return in the same format as local JWT
                return {
                    "sub": user_info["id"],
                    "email": user_info.get("email", ""),
                    "role": user_info.get("role", "Citizen"),
                    "is_active": user_info.get("is_active", True),
                }
            except Exception:
                pass  # Fall through to local HS256 verification
    except ImportError:
        pass  # cognito_verifier not available, use local JWT

    # ── Local JWT path (HS256) ─────────────────────────────────
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise credentials_exception

    if not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    """Dependency to extract current authenticated user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    payload = verify_token(token)

    user = {
        "id": payload.get("sub"),
        "email": payload.get("email", ""),
        "role": _normalize_role(payload.get("role", "Citizen")),
        "is_active": payload.get("is_active", True),
    }

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return user


def role_required(roles: List[str]):
    """RBAC dependency factory.

    Example:
        Depends(role_required(["Admin"]))
    """
    allowed = {_normalize_role(role).lower() for role in roles}

    async def checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        role = _normalize_role(current_user.get("role", "Citizen")).lower()
        if role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Allowed roles: {', '.join(roles)}",
            )
        return current_user

    return checker
