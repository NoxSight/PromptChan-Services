"""User model for the Prompt Catalog application"""
from sqlalchemy import String, Integer, Column
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.base import Base


class User(Base):
    """User model with relationships to prompts and favorites."""
    
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Relationships
    created_prompts = relationship("PromptTemplate", back_populates="creator")
    favorites = relationship("PromptTemplate", secondary="user_prompt_favorites", back_populates="favorited_by")


__all__ = ["User"]