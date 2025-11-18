"""SQLAlchemy declarative base and metadata"""
from typing import Any
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

from ..core.config import settings


Base = declarative_base()


def get_db() -> Session:
    """Dependency to get async SQLAlchemy session."""
    # This will be implemented with engine in session.py
    pass


__all__ = ["Base", "get_db"]