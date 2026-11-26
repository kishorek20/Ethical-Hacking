from pydantic import BaseModel
from typing import Any


class AssessmentInput(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    home_address: str = ""
    id_type: str = ""
    id_number: str = ""
    name_public: bool = False
    email_public: bool = False
    phone_public: bool = False
    home_address_public: bool = False
    id_details_public: bool = False
    accounts: list[str] = []
    password_strength: int = 3
    passwords_reused: bool = False
    uses_password_manager: bool = False
    password_hash_prefix: str = ""
    password_hash_suffix: str = ""
    accounts_with_2fa: list[str] = []
    privacy_settings_reviewed: bool = False
    login_alerts_on: bool = False
    public_accounts: list[str] = []


class AssessmentOut(BaseModel):
    id: int
    score: float
    level: str
    breakdown: dict
    top_factors: list[dict]
    recommendations: list[dict]
    input_snapshot: dict
    created_at: str


class TipUpdate(BaseModel):
    done: bool


class ProjectedScore(BaseModel):
    projected_score: float
    projected_level: str
