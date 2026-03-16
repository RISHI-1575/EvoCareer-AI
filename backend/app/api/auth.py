from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_refresh_token, get_current_user
from app.models.user import User
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, RefreshRequest, UserOut

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, full_name=data.full_name, hashed_password=get_password_hash(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}), refresh_token=create_refresh_token({"sub": str(user.id)}))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}), refresh_token=create_refresh_token({"sub": str(user.id)}))


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(data.refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}), refresh_token=create_refresh_token({"sub": str(user.id)}))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user