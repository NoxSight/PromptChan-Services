"""CRUD operations for User model"""
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from ..core.security import get_password_hash, verify_password
from ..schemas.user import UserCreate, User
from ..models.user import User as UserModel
from .base import CRUDBase


class CRUDUser(CRUDBase[UserModel, UserCreate, User]):
    """User CRUD operations with password handling."""
    
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[UserModel]:
        """Get user by email address."""
        return await db.execute(
            select(UserModel).where(UserModel.email == email)
        ).scalars().first()
    
    async def get_by_username(self, db: AsyncSession, *, username: str) -> Optional[UserModel]:
        """Get user by username."""
        return await db.get(UserModel, username)
    
    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> UserModel:
        """Create new user with hashed password."""
        db_obj = UserModel(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password)
        )
        db.add(db_obj)
        await db.flush()
        return db_obj
    
    def is_active(self, user: UserModel) -> bool:
        """Check if user is active."""
        return True


user = CRUDUser(UserModel)


__all__ = ["user", "CRUDUser"]