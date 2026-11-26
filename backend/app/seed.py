"""Seed demo data: demo@example.com / Demo@1234 with 5 historical assessments."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.assessment import Assessment
from app.services.masking import sha256_hash, mask_email
from app.services.scoring import ScoringInput, calculate_score

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "Demo@1234"

HISTORICAL_INPUTS = [
    ScoringInput(
        name_public=True, email_public=True, phone_public=True,
        home_address_public=True, id_details_public=True,
        accounts=["Instagram", "Facebook", "Google", "X/Twitter", "LinkedIn"],
        public_accounts=["Instagram", "Facebook", "X/Twitter"],
        password_strength=1, passwords_reused=True, uses_password_manager=False,
        password_pwned=True, accounts_with_2fa=[],
        privacy_settings_reviewed=False, login_alerts_on=False, email_breached=True,
    ),
    ScoringInput(
        name_public=True, email_public=True, phone_public=True,
        home_address_public=True, id_details_public=False,
        accounts=["Instagram", "Facebook", "Google", "X/Twitter", "LinkedIn"],
        public_accounts=["Instagram", "Facebook"],
        password_strength=2, passwords_reused=True, uses_password_manager=False,
        password_pwned=False, accounts_with_2fa=["Google"],
        privacy_settings_reviewed=False, login_alerts_on=False, email_breached=False,
    ),
    ScoringInput(
        name_public=True, email_public=True, phone_public=False,
        home_address_public=False, id_details_public=False,
        accounts=["Instagram", "Facebook", "Google", "X/Twitter", "LinkedIn"],
        public_accounts=["Instagram"],
        password_strength=3, passwords_reused=True, uses_password_manager=False,
        password_pwned=False, accounts_with_2fa=["Google", "Facebook"],
        privacy_settings_reviewed=True, login_alerts_on=False, email_breached=False,
    ),
    ScoringInput(
        name_public=True, email_public=False, phone_public=False,
        home_address_public=False, id_details_public=False,
        accounts=["Instagram", "Facebook", "Google", "X/Twitter", "LinkedIn"],
        public_accounts=[],
        password_strength=4, passwords_reused=False, uses_password_manager=True,
        password_pwned=False, accounts_with_2fa=["Google", "Facebook", "Instagram"],
        privacy_settings_reviewed=True, login_alerts_on=True, email_breached=False,
    ),
    ScoringInput(
        name_public=False, email_public=False, phone_public=False,
        home_address_public=False, id_details_public=False,
        accounts=["Instagram", "Facebook", "Google", "X/Twitter", "LinkedIn"],
        public_accounts=[],
        password_strength=5, passwords_reused=False, uses_password_manager=True,
        password_pwned=False,
        accounts_with_2fa=["Google", "Facebook", "Instagram", "X/Twitter", "LinkedIn"],
        privacy_settings_reviewed=True, login_alerts_on=True, email_breached=False,
    ),
]

DAYS_AGO = [60, 45, 30, 14, 1]


def make_snapshot(inp: ScoringInput) -> dict:
    return {
        "name_public": inp.name_public,
        "email_public": inp.email_public,
        "phone_public": inp.phone_public,
        "home_address_public": inp.home_address_public,
        "id_details_public": inp.id_details_public,
        "accounts": inp.accounts,
        "public_accounts": inp.public_accounts,
        "password_strength": inp.password_strength,
        "passwords_reused": inp.passwords_reused,
        "uses_password_manager": inp.uses_password_manager,
        "password_pwned": inp.password_pwned,
        "accounts_with_2fa": inp.accounts_with_2fa,
        "privacy_settings_reviewed": inp.privacy_settings_reviewed,
        "login_alerts_on": inp.login_alerts_on,
        "email_breached": inp.email_breached,
        "name": "J*** D***",
        "email": "d***@example.com",
        "phone": "******0000",
        "home_address": "123 ***",
        "id_type": "Passport",
        "id_number": "XXXX1234",
    }


def seed():
    db = SessionLocal()
    email_hash = sha256_hash(DEMO_EMAIL)
    existing = db.query(User).filter(User.email_hash == email_hash).first()
    if existing:
        print("Demo user already exists, skipping seed.")
        db.close()
        return

    user = User(
        email_hash=email_hash,
        email_masked=mask_email(DEMO_EMAIL),
        hashed_password=pwd_context.hash(DEMO_PASSWORD),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    for inp, days in zip(HISTORICAL_INPUTS, DAYS_AGO):
        result = calculate_score(inp)
        snapshot = make_snapshot(inp)
        a = Assessment(
            user_id=user.id,
            score=result.score,
            level=result.level,
            breakdown=result.breakdown,
            top_factors=result.top_factors,
            recommendations=result.recommendations,
            input_snapshot=snapshot,
        )
        a.created_at = datetime.now(timezone.utc) - timedelta(days=days)
        db.add(a)

    db.commit()
    db.close()
    print(f"Seeded demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    print(f"Created {len(HISTORICAL_INPUTS)} historical assessments showing score improvement.")


if __name__ == "__main__":
    seed()
