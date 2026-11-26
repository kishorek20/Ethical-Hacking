from fastapi import APIRouter
from pydantic import BaseModel
from ..services import breach as breach_svc

router = APIRouter(prefix="/api/breach", tags=["breach"])


class PasswordHashCheck(BaseModel):
    hash_prefix: str
    hash_suffix: str


class EmailCheck(BaseModel):
    email_hash: str


@router.post("/password")
async def check_password(body: PasswordHashCheck):
    is_pwned = await breach_svc.check_password_hash_prefix(body.hash_prefix, body.hash_suffix)
    return {"pwned": is_pwned}


@router.post("/email")
async def check_email(body: EmailCheck):
    result = await breach_svc.check_email_breached(body.email_hash)
    return result
