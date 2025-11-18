"""Security module for OAuth2.0 JWT handling (Access + Refresh tokens) and password hashing"""
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from .config import settings
from ..db.session import get_db
from ..models.user import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token (short-lived)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token (long-lived)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)  # 7 days
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def get_current_user(
    db=Depends(get_db), 
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current user from JWT access token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenData(username=payload.get("sub"))
        if token_data.username is None:
            raise credentials_exception
        
        # Verify it's an access token
        if payload.get("type") != "access":
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.get(User, token_data.username)
    if user is None:
        raise credentials_exception
    return user


def authenticate_user(db, username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password."""
    user = db.get(User, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


__all__ = [
    "verify_password",
    "get_password_hash", 
    "create_access_token",
    "create_refresh_token",
    "Token",
    "TokenData",
    "get_current_user",
    "authenticate_user",
]