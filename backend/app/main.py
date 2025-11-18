"""FastAPI main application with all routers included"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.base import Base  # Import to register models
from .db.session import engine
from .api import api


# Create FastAPI app
app = FastAPI(
    title="Prompt Catalog API",
    description="RESTful API for managing prompt templates with full-text search, favorites, and visibility control",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers - now at /api (no v1)
app.include_router(api.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Prompt Catalog API is running"}

@app.on_event("startup")
async def startup():
    """Startup event - create tables if they don't exist."""
    # Note: In production, use Alembic migrations instead
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


__all__ = ["app"]