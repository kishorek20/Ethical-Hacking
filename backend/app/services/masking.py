import hashlib
import re


def mask_email(email: str) -> str:
    if not email or "@" not in email:
        return email
    local, domain = email.rsplit("@", 1)
    if len(local) <= 1:
        return f"{local[0]}***@{domain}"
    return f"{local[0]}***@{domain}"


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) < 4:
        return "****"
    return "*" * (len(digits) - 4) + digits[-4:]


def mask_id(id_str: str) -> str:
    if not id_str:
        return ""
    cleaned = re.sub(r"[\s\-]", "", id_str)
    if len(cleaned) < 4:
        return "XXXX"
    visible = cleaned[-4:]
    masked_len = len(cleaned) - 4
    masked_parts = "XXXX-" * (masked_len // 4) if masked_len >= 4 else "X" * masked_len
    return f"{masked_parts}{visible}"


def mask_name(name: str) -> str:
    if not name:
        return name
    parts = name.split()
    masked = [p[0] + "*" * (len(p) - 1) if len(p) > 1 else p for p in parts]
    return " ".join(masked)


def mask_address(address: str) -> str:
    if not address:
        return address
    words = address.split()
    if len(words) <= 2:
        return "***"
    return words[0] + " ***"


def sha256_hash(value: str) -> str:
    return hashlib.sha256(value.lower().strip().encode()).hexdigest()
