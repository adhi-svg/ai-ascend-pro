# Authentication Layer - Pluggable Architecture

## Overview

The authentication system is designed to be modular and easily replaceable. Currently implemented with JWT + Google OAuth, but structured to allow AWS Cognito or other providers without major code changes.

## Current Authentication Flow

### 1. User Registration/Login
- Phone + Password: `POST /auth/register`, `POST /auth/login`
- Google OAuth: `GET /auth/google/login`, `GET /auth/google/callback`

### 2. Token Format
```python
# Token payload
{
    "sub": "user-id",        # User ID
    "role": "customer",      # User role
    "exp": 1234567890        # Expiration
}
```

### 3. Token Validation
- Located in: `/backend/app/core/security.py`
- `decode_token(token)` → Returns payload dict or None
- Used by: `/backend/app/core/deps.py:get_current_user()`

## Design for Cognito Migration

### Step 1: Add Cognito Configuration
Update `backend/app/core/config.py`:

```python
class Settings(BaseSettings):
    # ... existing ...
    
    # Cognito configuration
    AWS_COGNITO_REGION: str = ""
    AWS_COGNITO_USER_POOL_ID: str = ""
    AWS_COGNITO_CLIENT_ID: str = ""
    AWS_COGNITO_CLIENT_SECRET: str = ""
    
    # Auth provider selection
    AUTH_PROVIDER: str = "jwt"  # or "cognito"
```

### Step 2: Create Authentication Providers

Create `/backend/app/core/auth_providers.py`:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AuthProvider(ABC):
    """Base class for authentication providers."""
    
    @abstractmethod
    async def authenticate(self, credentials: Dict) -> Dict[str, Any]:
        """Authenticate user and return token."""
        pass
    
    @abstractmethod
    async def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate token and return payload."""
        pass
    
    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> str:
        """Refresh authentication token."""
        pass
    
    @abstractmethod
    async def revoke_token(self, token: str) -> bool:
        """Revoke/logout token."""
        pass


class JWTProvider(AuthProvider):
    """JWT-based authentication provider (current)."""
    
    async def authenticate(self, credentials: Dict) -> Dict[str, Any]:
        # Current implementation
        pass
    
    async def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        # Current decode_token logic
        pass
    
    # ... other methods


class CognitoProvider(AuthProvider):
    """AWS Cognito authentication provider (future)."""
    
    def __init__(self, settings: Settings):
        import boto3
        self.cognito_client = boto3.client(
            'cognito-idp',
            region_name=settings.AWS_COGNITO_REGION
        )
        self.user_pool_id = settings.AWS_COGNITO_USER_POOL_ID
        self.client_id = settings.AWS_COGNITO_CLIENT_ID
    
    async def authenticate(self, credentials: Dict) -> Dict[str, Any]:
        # Cognito authentication logic
        response = self.cognito_client.initiate_auth(
            ClientId=self.client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': credentials['username'],
                'PASSWORD': credentials['password']
            }
        )
        return response.get('AuthenticationResult', {})
    
    async def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        # Validate Cognito JWT token
        import json
        import jwt
        
        # Get public key from Cognito
        # Verify and decode token
        pass
    
    # ... other methods
```

### Step 3: Dependency Injection in deps.py

Update `/backend/app/core/deps.py`:

```python
from .auth_providers import AuthProvider, JWTProvider, CognitoProvider
from .config import settings

# Initialize provider based on configuration
if settings.AUTH_PROVIDER == "cognito":
    auth_provider = CognitoProvider(settings)
else:
    auth_provider = JWTProvider(settings)

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Use injected auth provider to validate token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    token = authorization.split(" ")[1]
    payload = await auth_provider.validate_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Provider should return standard format
    user_id = payload.get("sub") or payload.get("username")
    role = payload.get("role") or payload.get("custom:role")
    
    return {
        "id": user_id,
        "role": role,
        # ... other fields
    }
```

### Step 4: Update Login/Register Endpoints

Update `/backend/app/api/v1/endpoints/auth.py`:

```python
@router.post("/login")
async def login(req: LoginRequest):
    """Login using configured auth provider."""
    
    token_response = await auth_provider.authenticate({
        'username': req.phone,
        'password': req.password
    })
    
    # Both JWT and Cognito should return similar structure:
    # {
    #   "access_token": "...",
    #   "token_type": "Bearer",
    #   "expires_in": 3600,
    #   "refresh_token": "..." (optional)
    # }
    
    return success_response(data=token_response, message="Login successful")
```

## Migration Path: JWT → Cognito

### Phase 1: Setup (No Code Changes)
1. Create Cognito user pool in AWS
2. Migrate users to Cognito (import from current database)
3. Deploy new code with pluggable architecture
4. Keep `AUTH_PROVIDER=jwt` (no change in behavior)

### Phase 2: Enable Cognito (Gradual)
1. Deploy with `AUTH_PROVIDER=cognito` on staging
2. Test all endpoints with Cognito tokens
3. Gradually migrate users to Cognito sign-in
4. Deprecate JWT endpoints

### Phase 3: Cleanup (Full Migration)
1. Require all users on Cognito
2. Remove JWT implementation
3. Simplify configuration

## Current JWT Implementation Details

### Token Creation
**File:** `/backend/app/core/security.py`

```python
def create_access_token(data: Dict[str, Any], 
                        expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token with user_id and role."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    # Token contains: sub (user_id), role, exp
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt
```

### Token Validation
**File:** `/backend/app/core/security.py`

```python
def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

### Role-Based Access Control
**File:** `/backend/app/core/deps.py`

```python
def require_role(*allowed_roles: str):
    """Dependency for role-based access control."""
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
```

**Usage in endpoints:**
```python
@router.get("/admin", dependencies=[Depends(require_role("admin"))])
async def admin_only_endpoint():
    pass

@router.patch("/tech", dependencies=[Depends(require_role("technician"))])
async def tech_only_endpoint():
    pass
```

## Cognito Benefits

1. **Managed Service**: AWS handles user management, scaling, compliance
2. **Advanced Security**: MFA, password policies, account lockout
3. **Social Login**: Built-in Google, Facebook OAuth integration
4. **User Analytics**: CloudWatch integration for user metrics
5. **Cost**: Pay per request (no server management)

## Key Points for Migration

- ✅ Token structure: `{"sub": user_id, "role": role, "exp": expiry}`
- ✅ Authorization header: `Bearer <token>`
- ✅ Role-based access control: Already in place
- ✅ Fallback gracefully when provider unavailable
- ✅ Database: Still used for user profiles, no changes needed

## Testing Auth Provider Changes

```python
# Test with JWT
os.environ["AUTH_PROVIDER"] = "jwt"
# All endpoints should work with JWT tokens

# Test with Cognito (after implementation)
os.environ["AUTH_PROVIDER"] = "cognito"
# All endpoints should work with Cognito tokens
```

---

For questions on implementation, refer to the specific provider classes or AWS documentation.
