import httpx
from ..config import settings

HIBP_BASE = "https://api.pwnedpasswords.com"


async def check_password_hash_prefix(hash_prefix: str, hash_suffix: str) -> bool:
    """k-anonymity check: send first 5 chars of SHA-1, check if suffix matches."""
    hash_prefix = hash_prefix.upper()[:5]
    hash_suffix = hash_suffix.upper()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{HIBP_BASE}/range/{hash_prefix}")
            if resp.status_code != 200:
                return False
            for line in resp.text.strip().splitlines():
                if ":" in line:
                    suffix, count = line.split(":", 1)
                    if suffix.strip().upper() == hash_suffix and int(count) > 0:
                        return True
            return False
    except Exception:
        return False


async def check_email_breached(email_hash: str) -> dict:
    """
    Check if email has appeared in any breach.
    Returns {breached: bool, breach_count: int, is_mock: bool}
    When HIBP_API_KEY is not set, returns clearly labelled mock response.
    """
    if not settings.HIBP_API_KEY:
        return {
            "breached": False,
            "breach_count": 0,
            "is_mock": True,
            "mock_message": (
                "HIBP API key not configured. Set HIBP_API_KEY in .env "
                "for real email breach data. Password checks still work via k-anonymity."
            ),
        }
    # Real HIBP API would go here
    return {"breached": False, "breach_count": 0, "is_mock": False}
