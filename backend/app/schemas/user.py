"""Pydantic schemas for User model and OAuth2 tokens"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    username: str


class UserCreate(UserBase):
    """User schema for registration."""
    password: str


class User(UserBase):
    """User response schema."""
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserInDBBase(UserBase):
    """Base user schema for database operations."""
    id: int
    hashed_password: str


class UserInDB(UserInDBBase):
    """User schema for database with ORM mode."""
    class Config:
        from_attributes = True


class Token(BaseModel):
    """OAuth2 token response."""
    access_token: str
    refresh_token: str
    token_type: str


class TokenRefresh(BaseModel):
    """Refresh token request."""
    refresh_token: str


__all__ = ["UserBase", "UserCreate", "User", "UserInDBBase", "UserInDB", "Token", "TokenRefresh"]