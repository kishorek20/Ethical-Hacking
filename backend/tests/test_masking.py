from app.services.masking import mask_email, mask_phone, mask_id, sha256_hash, mask_name, mask_address


def test_mask_email_basic():
    assert mask_email("alice@gmail.com") == "a***@gmail.com"


def test_mask_email_short_local():
    result = mask_email("a@b.com")
    assert "@b.com" in result
    assert "***" in result


def test_mask_phone():
    result = mask_phone("+91 9876543210")
    assert result.endswith("3210")
    assert "*" in result


def test_mask_id():
    result = mask_id("ABCD1234")
    assert result.endswith("1234")
    assert "X" in result


def test_mask_id_empty():
    assert mask_id("") == ""


def test_mask_name():
    result = mask_name("John Doe")
    assert result.startswith("J")
    assert "D" in result


def test_mask_address():
    result = mask_address("123 Main Street City")
    assert "***" in result


def test_sha256_hash_case_insensitive():
    h1 = sha256_hash("test@email.com")
    h2 = sha256_hash("TEST@EMAIL.COM")
    assert h1 == h2
    assert len(h1) == 64


def test_sha256_different_inputs():
    assert sha256_hash("a@b.com") != sha256_hash("c@d.com")
