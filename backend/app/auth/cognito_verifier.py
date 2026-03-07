"""AWS Cognito JWT token verifier.

When Cognito is configured (COGNITO_USER_POOL_ID + COGNITO_APP_CLIENT_ID are set),
this module verifies JWT tokens issued by Cognito using the JWKS (JSON Web Key Set)
endpoint. It caches the public keys to avoid repeated network calls.

Usage:
    The `verify_token()` function in `auth/auth.py` automatically delegates to
    this module when Cognito settings are present in the config.
"""
import json
import logging
import time
from typing import Any, Dict, Optional

import requests
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode

from app.core.config import settings

logger = logging.getLogger(__name__)


class CognitoVerifier:
    """Verifies JWT tokens issued by AWS Cognito."""

    def __init__(self):
        self.region = settings.COGNITO_REGION
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.app_client_id = settings.COGNITO_APP_CLIENT_ID
        self.issuer = (
            f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}"
            if self.user_pool_id else ""
        )
        self.jwks_url = settings.COGNITO_JWKS_URL or ""

        # Cache
        self._jwks_keys: Optional[list] = None
        self._jwks_fetched_at: float = 0
        self._cache_ttl: int = 3600  # Re-fetch keys every hour

    @property
    def is_configured(self) -> bool:
        return bool(self.user_pool_id and self.app_client_id)

    def _fetch_jwks(self) -> list:
        """Fetch and cache JWKS keys from Cognito."""
        now = time.time()
        if self._jwks_keys and (now - self._jwks_fetched_at) < self._cache_ttl:
            return self._jwks_keys

        if not self.jwks_url:
            raise ValueError("Cognito JWKS URL not configured")

        try:
            response = requests.get(self.jwks_url, timeout=10)
            response.raise_for_status()
            self._jwks_keys = response.json().get("keys", [])
            self._jwks_fetched_at = now
            logger.info(f"✓ Fetched {len(self._jwks_keys)} Cognito JWKS keys")
            return self._jwks_keys
        except Exception as e:
            logger.error(f"Failed to fetch Cognito JWKS: {e}")
            if self._jwks_keys:
                return self._jwks_keys  # Use stale cache
            raise

    def _get_signing_key(self, token: str) -> Dict:
        """Extract the correct signing key for a given token."""
        headers = jwt.get_unverified_headers(token)
        kid = headers.get("kid")

        if not kid:
            raise JWTError("Token header missing 'kid'")

        keys = self._fetch_jwks()
        for key in keys:
            if key.get("kid") == kid:
                return key

        # Key not found — force refresh and try again
        self._jwks_fetched_at = 0
        keys = self._fetch_jwks()
        for key in keys:
            if key.get("kid") == kid:
                return key

        raise JWTError(f"Signing key '{kid}' not found in Cognito JWKS")

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify a Cognito-issued JWT token.

        Returns the decoded payload with standard claims:
            - sub: user ID (Cognito UUID)
            - email: user email
            - token_use: 'id' or 'access'
            - cognito:groups: list of groups

        Raises JWTError if verification fails.
        """
        if not self.is_configured:
            raise JWTError("Cognito is not configured")

        try:
            signing_key = self._get_signing_key(token)

            # Verify the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.app_client_id,
                issuer=self.issuer,
                options={
                    "verify_at_hash": False,
                },
            )

            # Validate token_use
            token_use = payload.get("token_use", "")
            if token_use not in ("id", "access"):
                raise JWTError(f"Invalid token_use: {token_use}")

            logger.debug(f"Cognito token verified for sub: {payload.get('sub')}")
            return payload

        except JWTError:
            raise
        except Exception as e:
            raise JWTError(f"Cognito token verification failed: {e}")

    def extract_user_info(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Extract standardized user info from a Cognito token payload.

        Maps Cognito claims to the app's internal user format so the rest
        of the code doesn't need to know about Cognito-specific claim names.
        """
        groups = payload.get("cognito:groups", [])

        # Map Cognito groups to app roles
        if "admin" in groups or "Admin" in groups:
            role = "Admin"
        elif "technician" in groups or "Technician" in groups:
            role = "Technician"
        else:
            role = "Citizen"

        return {
            "id": payload.get("sub", ""),
            "email": payload.get("email", ""),
            "name": payload.get("name", payload.get("cognito:username", "")),
            "role": role,
            "is_active": True,
            "cognito_groups": groups,
        }


# Singleton instance
cognito_verifier = CognitoVerifier()
