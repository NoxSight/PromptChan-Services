"""Pydantic schemas for favorites operations"""
from pydantic import BaseModel
from typing import Optional


class FavoriteCreate(BaseModel):
    """Schema for adding a favorite (just prompt_id)."""
    prompt_id: int


class FavoriteBase(BaseModel):
    """Base favorite schema."""
    user_id: int
    prompt_id: int


class Favorite(FavoriteBase):
    """Favorite response schema."""
    id: Optional[int] = None
    
    class Config:
        from_attributes = True


__all__ = ["FavoriteCreate", "FavoriteBase", "Favorite"]