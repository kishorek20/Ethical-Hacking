from dataclasses import dataclass, field
from ..config import settings


@dataclass
class ScoringInput:
    name_public: bool = False
    email_public: bool = False
    phone_public: bool = False
    home_address_public: bool = False
    id_details_public: bool = False
    accounts: list = field(default_factory=list)
    public_accounts: list = field(default_factory=list)
    password_strength: int = 3
    passwords_reused: bool = False
    uses_password_manager: bool = False
    password_pwned: bool = False
    accounts_with_2fa: list = field(default_factory=list)
    privacy_settings_reviewed: bool = False
    login_alerts_on: bool = False
    email_breached: bool = False


@dataclass
class RiskFactor:
    name: str
    contribution: float
    description: str
    recommendation: str
    priority: str
    tip_id: str


@dataclass
class ScoringResult:
    score: float
    level: str
    breakdown: dict
    top_factors: list
    recommendations: list


def _level(score: float) -> str:
    if score <= 25:
        return "Low"
    elif score <= 50:
        return "Moderate"
    elif score <= 75:
        return "High"
    return "Critical"


def calculate_score(inp: ScoringInput, config: dict | None = None) -> ScoringResult:
    if config is None:
        config = settings.get_scoring_config()

    pi = config["personal_info"]
    ex = config["exposure"]
    sec = config["security"]
    br = config["breach"]
    max_raw = config["max_raw_score"]

    factors: list[RiskFactor] = []
    breakdown = {
        "personal_info": 0.0,
        "exposure": 0.0,
        "security": 0.0,
        "breach": 0.0,
    }

    # --- Personal Info ---
    if inp.id_details_public:
        pts = float(pi["id_details_public"])
        breakdown["personal_info"] += pts
        factors.append(RiskFactor(
            name="ID Details Publicly Shared",
            contribution=pts,
            description="Your government ID details (Aadhaar/PAN/Passport) are shared publicly online.",
            recommendation="Remove your ID details from public profiles and posts immediately.",
            priority="Critical",
            tip_id="tip_id_public",
        ))
    if inp.home_address_public:
        pts = float(pi["home_address_public"])
        breakdown["personal_info"] += pts
        factors.append(RiskFactor(
            name="Home Address Publicly Shared",
            contribution=pts,
            description="Your home address is accessible to anyone online.",
            recommendation="Remove your home address from all public profiles and directories.",
            priority="Critical",
            tip_id="tip_address_public",
        ))
    if inp.phone_public:
        pts = float(pi["phone_public"])
        breakdown["personal_info"] += pts
        factors.append(RiskFactor(
            name="Phone Number Publicly Shared",
            contribution=pts,
            description="Your phone number is visible publicly and could be used for spam or SIM-swap attacks.",
            recommendation="Hide your phone number on social media profiles and directories.",
            priority="High",
            tip_id="tip_phone_public",
        ))
    if inp.email_public:
        pts = float(pi["email_public"])
        breakdown["personal_info"] += pts
        factors.append(RiskFactor(
            name="Email Publicly Shared",
            contribution=pts,
            description="Your email address is publicly visible, increasing phishing risk.",
            recommendation="Use a contact form instead of displaying your email publicly.",
            priority="High",
            tip_id="tip_email_public",
        ))
    if inp.name_public:
        pts = float(pi["name_public"])
        breakdown["personal_info"] += pts
        factors.append(RiskFactor(
            name="Full Name Publicly Shared",
            contribution=pts,
            description="Your full name is shared online. Combined with other info, this increases identity risk.",
            recommendation="Use initials or a pseudonym where privacy is desired.",
            priority="Low",
            tip_id="tip_name_public",
        ))

    # --- Exposure ---
    num_accounts = len(inp.accounts)
    num_public = len(inp.public_accounts)

    account_base_pts = num_accounts * ex["per_account_base"]
    breakdown["exposure"] += account_base_pts

    if num_public > 0:
        public_pts = num_public * ex["per_public_account"]
        breakdown["exposure"] += public_pts
        factors.append(RiskFactor(
            name=f"{num_public} Public Profile(s)",
            contribution=public_pts,
            description=f"You have {num_public} account(s) set to Public, exposing your activity to anyone.",
            recommendation=f"Set profiles on {', '.join(inp.public_accounts[:3])} to Private or Friends-only.",
            priority="High",
            tip_id="tip_public_profiles",
        ))

    if inp.password_strength <= 2:
        pts = float(ex["weak_password"])
        breakdown["exposure"] += pts
        factors.append(RiskFactor(
            name="Weak Password",
            contribution=pts,
            description="You rated your password strength as weak. Weak passwords are easily cracked.",
            recommendation="Use a password with 12+ characters including uppercase, numbers, and symbols.",
            priority="High",
            tip_id="tip_weak_password",
        ))

    if inp.passwords_reused:
        pts = float(ex["reused_password"])
        breakdown["exposure"] += pts
        factors.append(RiskFactor(
            name="Password Reuse",
            contribution=pts,
            description="Reusing passwords across accounts means one breach exposes all your accounts.",
            recommendation="Use a unique password for every account. A password manager helps.",
            priority="Critical",
            tip_id="tip_reused_password",
        ))

    if not inp.uses_password_manager:
        pts = float(ex["no_password_manager"])
        breakdown["exposure"] += pts
        factors.append(RiskFactor(
            name="No Password Manager",
            contribution=pts,
            description="Without a password manager, you are likely reusing or forgetting passwords.",
            recommendation="Install a password manager (Bitwarden, 1Password, or KeePass).",
            priority="Medium",
            tip_id="tip_no_manager",
        ))

    # --- Security ---
    accounts_without_2fa = [a for a in inp.accounts if a not in inp.accounts_with_2fa]
    if accounts_without_2fa:
        pts = len(accounts_without_2fa) * sec["missing_2fa_per_account"]
        breakdown["security"] += pts
        top3 = accounts_without_2fa[:3]
        factors.append(RiskFactor(
            name=f"2FA Missing on {len(accounts_without_2fa)} Account(s)",
            contribution=pts,
            description="Accounts without two-factor authentication are vulnerable to password-only attacks.",
            recommendation=f"Enable 2FA on {', '.join(top3)} immediately. Use an authenticator app, not SMS.",
            priority="High",
            tip_id="tip_missing_2fa",
        ))

    if not inp.privacy_settings_reviewed:
        pts = float(sec["privacy_not_reviewed"])
        breakdown["security"] += pts
        factors.append(RiskFactor(
            name="Privacy Settings Not Reviewed",
            contribution=pts,
            description="Unreviewed privacy settings often default to sharing more than you realise.",
            recommendation="Review and tighten privacy settings on all your social accounts.",
            priority="Medium",
            tip_id="tip_privacy_settings",
        ))

    if not inp.login_alerts_on:
        pts = float(sec["no_login_alerts"])
        breakdown["security"] += pts
        factors.append(RiskFactor(
            name="Login Alerts Disabled",
            contribution=pts,
            description="Without login alerts, you will not know if someone accesses your account.",
            recommendation="Enable login notifications on all accounts that offer them.",
            priority="Medium",
            tip_id="tip_login_alerts",
        ))

    # --- Breach ---
    if inp.password_pwned:
        pts = float(br["password_pwned"])
        breakdown["breach"] += pts
        factors.append(RiskFactor(
            name="Password Found in Data Breach",
            contribution=pts,
            description="Your password has appeared in known data breaches (via HaveIBeenPwned).",
            recommendation="Change this password immediately on all accounts where it is used.",
            priority="Critical",
            tip_id="tip_password_pwned",
        ))

    if inp.email_breached:
        pts = float(br["email_breached"])
        breakdown["breach"] += pts
        factors.append(RiskFactor(
            name="Email Found in Data Breach",
            contribution=pts,
            description="Your email address has appeared in known data breaches.",
            recommendation="Change passwords on affected accounts and enable 2FA. Monitor for phishing.",
            priority="Critical",
            tip_id="tip_email_breached",
        ))

    raw_score = sum(breakdown.values())
    score = round(min(raw_score / max_raw, 1.0) * 100, 1)
    level = _level(score)

    factors.sort(key=lambda f: f.contribution, reverse=True)

    top_factors = [
        {
            "name": f.name,
            "contribution": f.contribution,
            "description": f.description,
            "recommendation": f.recommendation,
            "priority": f.priority,
            "tip_id": f.tip_id,
        }
        for f in factors
    ]

    recommendations = [
        {
            "id": f.tip_id,
            "title": f.recommendation.split(".")[0],
            "description": f.recommendation,
            "priority": f.priority,
            "done": False,
            "contribution": f.contribution,
        }
        for f in factors
    ]

    return ScoringResult(
        score=score,
        level=level,
        breakdown={k: round(v, 1) for k, v in breakdown.items()},
        top_factors=top_factors,
        recommendations=recommendations,
    )


def calculate_projected_score(original_input_snapshot: dict, completed_tip_ids: list, config: dict | None = None) -> dict:
    """Recalculate score with given tips marked as done (their weights zeroed)."""
    if config is None:
        config = settings.get_scoring_config()

    snap = original_input_snapshot
    inp = ScoringInput(
        name_public=snap.get("name_public", False) and "tip_name_public" not in completed_tip_ids,
        email_public=snap.get("email_public", False) and "tip_email_public" not in completed_tip_ids,
        phone_public=snap.get("phone_public", False) and "tip_phone_public" not in completed_tip_ids,
        home_address_public=snap.get("home_address_public", False) and "tip_address_public" not in completed_tip_ids,
        id_details_public=snap.get("id_details_public", False) and "tip_id_public" not in completed_tip_ids,
        accounts=snap.get("accounts", []),
        public_accounts=[] if "tip_public_profiles" in completed_tip_ids else snap.get("public_accounts", []),
        password_strength=5 if "tip_weak_password" in completed_tip_ids else snap.get("password_strength", 3),
        passwords_reused=False if "tip_reused_password" in completed_tip_ids else snap.get("passwords_reused", False),
        uses_password_manager=True if "tip_no_manager" in completed_tip_ids else snap.get("uses_password_manager", False),
        password_pwned=False if "tip_password_pwned" in completed_tip_ids else snap.get("password_pwned", False),
        accounts_with_2fa=snap.get("accounts", []) if "tip_missing_2fa" in completed_tip_ids else snap.get("accounts_with_2fa", []),
        privacy_settings_reviewed=True if "tip_privacy_settings" in completed_tip_ids else snap.get("privacy_settings_reviewed", False),
        login_alerts_on=True if "tip_login_alerts" in completed_tip_ids else snap.get("login_alerts_on", False),
        email_breached=False if "tip_email_breached" in completed_tip_ids else snap.get("email_breached", False),
    )
    result = calculate_score(inp, config)
    return {"projected_score": result.score, "projected_level": result.level}
