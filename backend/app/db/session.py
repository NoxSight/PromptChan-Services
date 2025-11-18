"""Async SQLAlchemy session factory and engine"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from ..core.config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncSession:
    """Get async database session dependency for FastAPI."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Legacy sync sessionmaker for Alembic (if needed)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine.sync_engine)


__all__ = ["get_db", "engine", "AsyncSessionLocal"]