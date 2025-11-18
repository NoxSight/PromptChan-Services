"""Main API router that includes all sub-routers"""
from fastapi import APIRouter

from . import auth, prompts, users

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
router.include_router(users.router, prefix="/users", tags=["users"])


__all__ = ["router"]