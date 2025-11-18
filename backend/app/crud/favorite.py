"""CRUD operations for user favorites (many-to-many relationship)"""
from typing import List
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User
from ..models.prompt import PromptTemplate
from ..schemas.favorite import FavoriteCreate
from .base import CRUDBase


class CRUDFavorite(CRUDBase):
    """Favorites CRUD operations for many-to-many user-prompt relationship."""
    
    async def add_favorite(
        self, db: AsyncSession, *, user_id: int, prompt_id: int
    ) -> bool:
        """Add prompt to user's favorites (idempotent)."""
        # Check if already favorited
        existing = await db.execute(
            select(user_prompt_favorites).where(
                and_(
                    user_prompt_favorites.c.user_id == user_id,
                    user_prompt_favorites.c.prompt_id == prompt_id
                )
            )
        )
        
        if existing.scalar_one_or_none():
            return False  # Already favorited
        
        # Add favorite
        stmt = user_prompt_favorites.insert().values(
            user_id=user_id, prompt_id=prompt_id
        )
        await db.execute(stmt)
        await db.commit()
        return True
    
    async def remove_favorite(
        self, db: AsyncSession, *, user_id: int, prompt_id: int
    ) -> bool:
        """Remove prompt from user's favorites."""
        result = await db.execute(
            user_prompt_favorites.delete().where(
                and_(
                    user_prompt_favorites.c.user_id == user_id,
                    user_prompt_favorites.c.prompt_id == prompt_id
                )
            )
        )
        await db.commit()
        return result.rowcount > 0
    
    async def get_favorites_for_user(
        self, 
        db: AsyncSession, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[PromptTemplate]:
        """Get paginated list of prompts favorited by user."""
        stmt = select(PromptTemplate).join(
            user_prompt_favorites,
            PromptTemplate.id == user_prompt_favorites.c.prompt_id
        ).where(
            user_prompt_favorites.c.user_id == user_id
        ).offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def is_favorited(
        self, db: AsyncSession, *, user_id: int, prompt_id: int
    ) -> bool:
        """Check if user has favorited a specific prompt."""
        result = await db.execute(
            select(user_prompt_favorites).where(
                and_(
                    user_prompt_favorites.c.user_id == user_id,
                    user_prompt_favorites.c.prompt_id == prompt_id
                )
            )
        )
        return result.scalar_one_or_none() is not None


favorite = CRUDFavorite()


__all__ = ["favorite"]