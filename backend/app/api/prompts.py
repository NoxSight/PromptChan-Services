"""CRUD endpoints for PromptTemplate management"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_db
from ..api.deps import get_current_active_user
from ..schemas.prompt import PromptCreate, PromptUpdate, Prompt
from ..crud.prompt import prompt
from ..crud.favorite import favorite
from ..models.user import User
from ..models.prompt import PromptTemplate


router = APIRouter()


@router.post("/", response_model=Prompt)
async def create_prompt(
    prompt_in: PromptCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> PromptTemplate:
    """Create a new prompt template (creator set from current user)."""
    prompt_obj = await prompt.create(db, obj_in=prompt_in, creator=current_user)
    return prompt_obj


@router.get("/", response_model=List[Prompt])
async def read_prompts(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    q: str = Query(None, description="Full-text search query"),
    creator_id: int = Query(None, description="Filter by creator ID"),
    tags: str = Query(None, description="Comma-separated tags to filter by")
) -> List[PromptTemplate]:
    """List prompts with optional full-text search and filters (respects visibility)."""
    if q:
        prompts = await prompt.search(
            db, q, skip, limit, creator_id, tags, current_user.id
        )
    else:
        prompts = await prompt.get_multi(db, skip=skip, limit=limit, current_user_id=current_user.id)
    return prompts


@router.get("/{prompt_id}", response_model=Prompt)
async def read_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> PromptTemplate:
    """Get a specific prompt by ID (respects visibility)."""
    prompt_obj = await prompt.get(db, prompt_id, current_user.id)
    if not prompt_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found or not accessible"
        )
    return prompt_obj


@router.put("/{prompt_id}", response_model=Prompt)
async def update_prompt(
    prompt_id: int,
    prompt_in: PromptUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> PromptTemplate:
    """Update a prompt template (only creator can update)."""
    prompt_obj = await prompt.get(db, prompt_id, current_user.id)
    if not prompt_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    
    if prompt_obj.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    prompt_obj = await prompt.update(db, db_obj=prompt_obj, obj_in=prompt_in)
    return prompt_obj


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Delete a prompt template (only creator can delete)."""
    prompt_obj = await prompt.get(db, prompt_id, current_user.id)
    if not prompt_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )
    
    if prompt_obj.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    await prompt.remove(db, id=prompt_id)
    return {"msg": "Prompt deleted"}


@router.post("/{prompt_id}/favorite")
async def add_favorite(
    prompt_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Add prompt to current user's favorites."""
    success = await favorite.add_favorite(db, user_id=current_user.id, prompt_id=prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Prompt already in favorites"
        )
    return {"msg": "Prompt added to favorites"}


@router.delete("/{prompt_id}/favorite")
async def remove_favorite(
    prompt_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Remove prompt from current user's favorites."""
    success = await favorite.remove_favorite(db, user_id=current_user.id, prompt_id=prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    return {"msg": "Prompt removed from favorites"}


__all__ = ["router"]