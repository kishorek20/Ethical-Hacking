import pytest
from app.services.scoring import ScoringInput, calculate_score, calculate_projected_score, _level

CONFIG = {
    "personal_info": {
        "id_details_public": 20,
        "home_address_public": 15,
        "phone_public": 10,
        "email_public": 5,
        "name_public": 2,
    },
    "exposure": {
        "per_public_account": 3,
        "per_account_base": 1,
        "weak_password": 10,
        "reused_password": 12,
        "no_password_manager": 5,
    },
    "security": {
        "missing_2fa_per_account": 4,
        "privacy_not_reviewed": 6,
        "no_login_alerts": 4,
    },
    "breach": {"password_pwned": 15, "email_breached": 10},
    "max_raw_score": 150,
}


def test_all_clear():
    inp = ScoringInput(
        accounts=["Google"],
        accounts_with_2fa=["Google"],
        uses_password_manager=True,
        password_strength=5,
        privacy_settings_reviewed=True,
        login_alerts_on=True,
    )
    result = calculate_score(inp, CONFIG)
    assert result.score < 5
    assert result.level == "Low"


def test_all_worst_case():
    inp = ScoringInput(
        name_public=True,
        email_public=True,
        phone_public=True,
        home_address_public=True,
        id_details_public=True,
        accounts=["Instagram", "Facebook", "Google", "X", "LinkedIn"],
        public_accounts=["Instagram", "Facebook", "Google", "X", "LinkedIn"],
        password_strength=1,
        passwords_reused=True,
        uses_password_manager=False,
        password_pwned=True,
        accounts_with_2fa=[],
        privacy_settings_reviewed=False,
        login_alerts_on=False,
        email_breached=True,
    )
    result = calculate_score(inp, CONFIG)
    assert result.score >= 75
    assert result.level in ("High", "Critical")


def test_level_boundaries():
    assert _level(0) == "Low"
    assert _level(25) == "Low"
    assert _level(26) == "Moderate"
    assert _level(50) == "Moderate"
    assert _level(51) == "High"
    assert _level(75) == "High"
    assert _level(76) == "Critical"
    assert _level(100) == "Critical"


def test_id_details_contribution():
    inp_with = ScoringInput(id_details_public=True)
    inp_without = ScoringInput(id_details_public=False)
    r_with = calculate_score(inp_with, CONFIG)
    r_without = calculate_score(inp_without, CONFIG)
    assert r_with.score > r_without.score
    assert abs(r_with.breakdown["personal_info"] - 20.0) < 0.1


def test_password_pwned_contribution():
    inp = ScoringInput(password_pwned=True)
    result = calculate_score(inp, CONFIG)
    assert result.breakdown["breach"] == 15.0


def test_email_breached_contribution():
    inp = ScoringInput(email_breached=True)
    result = calculate_score(inp, CONFIG)
    assert result.breakdown["breach"] == 10.0


def test_top_factors_sorted():
    inp = ScoringInput(
        id_details_public=True,
        password_pwned=True,
        phone_public=True,
    )
    result = calculate_score(inp, CONFIG)
    contribs = [f["contribution"] for f in result.top_factors]
    assert contribs == sorted(contribs, reverse=True)


def test_recommendations_match_factors():
    inp = ScoringInput(passwords_reused=True, login_alerts_on=False)
    result = calculate_score(inp, CONFIG)
    tip_ids = [r["id"] for r in result.recommendations]
    assert "tip_reused_password" in tip_ids
    assert "tip_login_alerts" in tip_ids


def test_what_if_tip_reduces_score():
    inp_snapshot = {
        "passwords_reused": True,
        "login_alerts_on": False,
        "id_details_public": False,
        "home_address_public": False,
        "phone_public": False,
        "email_public": False,
        "name_public": False,
        "accounts": ["Google"],
        "public_accounts": [],
        "password_strength": 3,
        "uses_password_manager": False,
        "password_pwned": False,
        "accounts_with_2fa": ["Google"],
        "privacy_settings_reviewed": True,
        "email_breached": False,
    }
    original = calculate_score(
        ScoringInput(
            passwords_reused=True,
            login_alerts_on=False,
            accounts=["Google"],
            accounts_with_2fa=["Google"],
            privacy_settings_reviewed=True,
        ),
        CONFIG,
    )
    projected = calculate_projected_score(inp_snapshot, ["tip_reused_password"], CONFIG)
    assert projected["projected_score"] < original.score


def test_no_accounts():
    inp = ScoringInput()
    result = calculate_score(inp, CONFIG)
    assert result.score >= 0


def test_missing_2fa_multiple_accounts():
    inp = ScoringInput(accounts=["A", "B", "C"], accounts_with_2fa=[])
    result = calculate_score(inp, CONFIG)
    assert result.breakdown["security"] >= 12.0
