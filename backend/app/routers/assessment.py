from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.assessment import Assessment
from ..models.user import User
from ..schemas.assessment import AssessmentInput, AssessmentOut, TipUpdate
from ..services.scoring import calculate_score, calculate_projected_score, ScoringInput
from ..services.masking import mask_email, mask_phone, mask_id, mask_name, mask_address
from ..services import breach as breach_svc
from ..routers.auth import get_current_user_dep

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


def _build_snapshot(inp: AssessmentInput, password_pwned: bool = False, email_breached: bool = False) -> dict:
    return {
        "name": mask_name(inp.name) if inp.name else "",
        "email": mask_email(inp.email) if inp.email else "",
        "phone": mask_phone(inp.phone) if inp.phone else "",
        "home_address": mask_address(inp.home_address) if inp.home_address else "",
        "id_type": inp.id_type,
        "id_number": mask_id(inp.id_number) if inp.id_number else "",
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
        "accounts_with_2fa": inp.accounts_with_2fa,
        "privacy_settings_reviewed": inp.privacy_settings_reviewed,
        "login_alerts_on": inp.login_alerts_on,
        "password_pwned": password_pwned,
        "email_breached": email_breached,
    }


@router.post("", response_model=AssessmentOut)
async def create_assessment(
    body: AssessmentInput,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    password_pwned = False
    email_breached = False

    if body.password_hash_prefix and body.password_hash_suffix:
        password_pwned = await breach_svc.check_password_hash_prefix(
            body.password_hash_prefix, body.password_hash_suffix
        )

    breach_result = await breach_svc.check_email_breached("ignored_in_mock")
    email_breached = breach_result.get("breached", False)

    scoring_input = ScoringInput(
        name_public=body.name_public,
        email_public=body.email_public,
        phone_public=body.phone_public,
        home_address_public=body.home_address_public,
        id_details_public=body.id_details_public,
        accounts=body.accounts,
        public_accounts=body.public_accounts,
        password_strength=body.password_strength,
        passwords_reused=body.passwords_reused,
        uses_password_manager=body.uses_password_manager,
        password_pwned=password_pwned,
        accounts_with_2fa=body.accounts_with_2fa,
        privacy_settings_reviewed=body.privacy_settings_reviewed,
        login_alerts_on=body.login_alerts_on,
        email_breached=email_breached,
    )

    result = calculate_score(scoring_input)
    snapshot = _build_snapshot(body, password_pwned, email_breached)

    assessment = Assessment(
        user_id=current_user.id,
        score=result.score,
        level=result.level,
        breakdown=result.breakdown,
        top_factors=result.top_factors,
        recommendations=result.recommendations,
        input_snapshot=snapshot,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return AssessmentOut(
        id=assessment.id,
        score=assessment.score,
        level=assessment.level,
        breakdown=assessment.breakdown,
        top_factors=assessment.top_factors,
        recommendations=assessment.recommendations,
        input_snapshot=assessment.input_snapshot,
        created_at=assessment.created_at.isoformat(),
    )


@router.get("", response_model=list[AssessmentOut])
def list_assessments(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )
    return [
        AssessmentOut(
            id=a.id,
            score=a.score,
            level=a.level,
            breakdown=a.breakdown,
            top_factors=a.top_factors,
            recommendations=a.recommendations,
            input_snapshot=a.input_snapshot,
            created_at=a.created_at.isoformat(),
        )
        for a in items
    ]


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    a = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return AssessmentOut(
        id=a.id,
        score=a.score,
        level=a.level,
        breakdown=a.breakdown,
        top_factors=a.top_factors,
        recommendations=a.recommendations,
        input_snapshot=a.input_snapshot,
        created_at=a.created_at.isoformat(),
    )


@router.patch("/{assessment_id}/tips/{tip_id}")
def update_tip(
    assessment_id: int,
    tip_id: str,
    body: TipUpdate,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    a = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id)
        .first()
    )
    if not a:
        raise HTTPException(status_code=404, detail="Assessment not found")

    recs = list(a.recommendations)
    for rec in recs:
        if rec["id"] == tip_id:
            rec["done"] = body.done
    a.recommendations = recs
    db.commit()

    done_tips = [r["id"] for r in recs if r.get("done")]
    projected = calculate_projected_score(a.input_snapshot, done_tips)
    return {"recommendations": recs, **projected}
