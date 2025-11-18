"""PromptTemplate model with full-text search support"""
from sqlalchemy import (
    String, Integer, Text, DateTime, ForeignKey, Column, Index, Enum
)
from sqlalchemy.dialects.postgresql import TSVector
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum

from ..db.base import Base


class Visibility(str, PyEnum):
    """Prompt visibility enum."""
    PUBLIC = "public"
    PRIVATE = "private"


class PromptTemplate(Base):
    """PromptTemplate model with full-text search capabilities."""
    
    __tablename__ = "prompt_template"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    short_description = Column(String, index=True, nullable=False)
    long_description = Column(Text)
    template = Column(Text, nullable=False)
    inputs = Column(Text)  # YAML string of input definitions
    tags = Column(Text)  # Comma-separated tags
    visibility = Column(Enum(Visibility), default=Visibility.PUBLIC, nullable=False)
    search_vector = Column(TSVector)
    
    creator_id = Column(Integer, ForeignKey("user.id"))
    creator = relationship("User", back_populates="created_prompts")
    favorited_by = relationship("User", secondary="user_prompt_favorites", back_populates="favorites")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # GIN index for full-text search will be created by Alembic migration


__all__ = ["PromptTemplate", "Visibility"]