"""Authentication endpoints for OAuth2.0 with access and refresh tokens"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.session import get_db
from ..core.security import (
    create_access_token, 
    create_refresh_token, 
    verify_password
)
from ..schemas.user import UserCreate, Token
from ..crud.user import user


router = APIRouter()


@router.post("/register", response_model=dict)
async def register(
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Register a new user."""
    user_in = UserCreate(email=email, username=username, password=password)
    
    # Check if user already exists
    db_user = await user.get_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = await user.get_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    user_obj = await user.create(db, obj_in=user_in)
    return {"user_id": user_obj.id, "username": user_obj.username, "msg": "User created successfully"}


@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """OAuth2.0 login - returns access and refresh tokens."""
    # Try email first, then username
    user_obj = await user.get_by_email(db, email=username)
    if not user_obj:
        user_obj = await user.get_by_username(db, username=username)
    
    if not user_obj or not verify_password(password, user_obj.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user_obj.username})
    refresh_token = create_refresh_token(data={"sub": user_obj.username})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token_str: str = Form(...),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """Refresh access token using refresh token."""
    try:
        payload = jwt.decode(
            refresh_token_str, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Verify it's a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        token_data = TokenData(username=payload.get("sub"))
        if token_data.username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Verify user still exists
        user_obj = await user.get_by_username(db, username=token_data.username)
        if not user_obj:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new tokens
        new_access_token = create_access_token(data={"sub": user_obj.username})
        new_refresh_token = create_refresh_token(data={"sub": user_obj.username})
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


__all__ = ["router"]