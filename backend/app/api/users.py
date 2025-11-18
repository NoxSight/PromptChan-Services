"""User endpoints for favorites management"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_db
from ..api.deps import get_current_active_user
from ..schemas.prompt import Prompt
from ..crud.favorite import favorite
from ..models.user import User
from ..models.prompt import PromptTemplate


router = APIRouter()


@router.get("/me/favorites", response_model=List[Prompt])
async def read_user_favorites(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> List[PromptTemplate]:
    """Get paginated list of prompts favorited by current user."""
    favorites = await favorite.get_favorites_for_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return favorites


__all__ = ["router"]