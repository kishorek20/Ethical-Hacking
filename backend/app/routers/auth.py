from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext

from ..database import get_db
from ..models.user import User
from ..schemas.auth import UserRegister, UserLogin, Token, UserOut
from ..services.masking import mask_email, sha256_hash
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def get_current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=Token)
def register(body: UserRegister, db: Session = Depends(get_db)):
    email_hash = sha256_hash(body.email)
    if db.query(User).filter(User.email_hash == email_hash).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email_hash=email_hash,
        email_masked=mask_email(body.email),
        hashed_password=pwd_context.hash(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_token(user.id))


@router.post("/login", response_model=Token)
def login(body: UserLogin, db: Session = Depends(get_db)):
    email_hash = sha256_hash(body.email)
    user = (
        db.query(User)
        .filter(User.email_hash == email_hash, User.is_active == True)
        .first()
    )
    if not user or not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return Token(access_token=create_token(user.id))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user_dep)):
    return UserOut(
        id=current_user.id,
        email_masked=current_user.email_masked,
        created_at=current_user.created_at.isoformat(),
    )


@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated data deleted successfully"}
