"""CRUD operations for PromptTemplate model with full-text search and visibility"""
from typing import List, Optional
from sqlalchemy import select, and_, func, or_
from sqlalchemy.dialects.postgresql import tsquery
from sqlalchemy.ext.asyncio import AsyncSession
import yaml

from ..schemas.prompt import PromptCreate, PromptUpdate, Prompt
from ..models.prompt import PromptTemplate, Visibility
from ..models.user import User
from .base import CRUDBase


class CRUDPrompt(CRUDBase[PromptTemplate, PromptCreate, PromptUpdate]):
    """PromptTemplate CRUD operations with advanced search and visibility control."""
    
    async def get_by_creator(
        self, db: AsyncSession, creator_id: int, skip: int = 0, limit: int = 100
    ) -> List[PromptTemplate]:
        """Get prompts by creator with pagination (includes private prompts)."""
        return await db.execute(
            select(PromptTemplate)
            .where(PromptTemplate.creator_id == creator_id)
            .offset(skip)
            .limit(limit)
        ).scalars().all()
    
    async def create(self, db: AsyncSession, *, obj_in: PromptCreate, creator: User) -> PromptTemplate:
        """Create new prompt template with YAML inputs serialization."""
        inputs_yaml = yaml.dump(obj_in.inputs) if obj_in.inputs else None
        
        # Build search vector from searchable fields
        search_text = f"{obj_in.title} {obj_in.short_description} {obj_in.long_description or ''} {obj_in.tags or ''}"
        
        db_obj = PromptTemplate(
            title=obj_in.title,
            short_description=obj_in.short_description,
            long_description=obj_in.long_description,
            template=obj_in.template,
            inputs=inputs_yaml,
            tags=obj_in.tags,
            visibility=obj_in.visibility,
            search_vector=func.to_tsvector('english', search_text),
            creator_id=creator.id
        )
        db.add(db_obj)
        await db.flush()
        return db_obj
    
    async def search(
        self, 
        db: AsyncSession, 
        query: str, 
        skip: int = 0, 
        limit: int = 100,
        creator_id: Optional[int] = None,
        tags: Optional[str] = None,
        current_user_id: Optional[int] = None
    ) -> List[PromptTemplate]:
        """Full-text search with visibility filtering."""
        ts_query = func.to_tsquery('english', f"{query}:*")
        
        # Base query with visibility filter
        visibility_filter = PromptTemplate.visibility == Visibility.PUBLIC
        if current_user_id:
            visibility_filter = or_(
                visibility_filter,
                PromptTemplate.creator_id == current_user_id
            )
        
        stmt = select(PromptTemplate)\
            .where(
                and_(
                    PromptTemplate.search_vector.op('@@')(ts_query),
                    visibility_filter
                )
            )\
            .order_by(PromptTemplate.search_vector.op('⇐→')(ts_query))\
            .offset(skip)\
            .limit(limit)
        
        if creator_id:
            stmt = stmt.where(PromptTemplate.creator_id == creator_id)
        
        if tags:
            tag_conditions = [PromptTemplate.tags.ilike(f"%{tag.strip()}%") for tag in tags.split(',')]
            stmt = stmt.where(and_(*tag_conditions))
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100, current_user_id: Optional[int] = None
    ) -> List[PromptTemplate]:
        """Get multiple prompts with visibility filtering."""
        visibility_filter = PromptTemplate.visibility == Visibility.PUBLIC
        if current_user_id:
            visibility_filter = or_(
                visibility_filter,
                PromptTemplate.creator_id == current_user_id
            )
        
        stmt = select(PromptTemplate)\
            .where(visibility_filter)\
            .offset(skip)\
            .limit(limit)
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def get(self, db: AsyncSession, id: int, current_user_id: Optional[int] = None) -> Optional[PromptTemplate]:
        """Get single prompt with visibility check."""
        prompt_obj = await super().get(db, id)
        if prompt_obj:
            visibility_ok = prompt_obj.visibility == Visibility.PUBLIC or prompt_obj.creator_id == current_user_id
            if not visibility_ok:
                return None
        return prompt_obj
    
    async def update_search_vector(self, db: AsyncSession, prompt: PromptTemplate) -> PromptTemplate:
        """Update the full-text search vector for a prompt."""
        search_text = f"{prompt.title} {prompt.short_description} {prompt.long_description or ''} {prompt.tags or ''}"
        prompt.search_vector = func.to_tsvector('english', search_text)
        await db.commit()
        return prompt


prompt = CRUDPrompt(PromptTemplate)


__all__ = ["prompt", "CRUDPrompt"]