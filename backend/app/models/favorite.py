"""Favorites association table for many-to-many user-prompt relationship"""
from sqlalchemy import Table, Integer, ForeignKey, Column

from ..db.base import Base
from .user import User
from .prompt import PromptTemplate


user_prompt_favorites = Table(
    "user_prompt_favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("prompt_id", Integer, ForeignKey("prompt_template.id"), primary_key=True),
)


__all__ = ["user_prompt_favorites"]