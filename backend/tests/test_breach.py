import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.breach import check_email_breached, check_password_hash_prefix


@pytest.mark.asyncio
async def test_email_breach_mock_mode():
    with patch("app.services.breach.settings") as mock_settings:
        mock_settings.HIBP_API_KEY = ""
        result = await check_email_breached("any_hash")
        assert result["is_mock"] is True
        assert "breached" in result
        assert result["breached"] is False


@pytest.mark.asyncio
async def test_password_check_not_in_breach():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "AAAAABBBBB:5\r\nCCCCCDDDDD:3\r\n"

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_response)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await check_password_hash_prefix("ABCDE", "FFFFF")
        assert result is False


@pytest.mark.asyncio
async def test_password_check_found_in_breach():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "AAAAABBBBB:5\r\nTARGETSUFFIX:12\r\nCCCCCDDDDD:3\r\n"

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_response)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await check_password_hash_prefix("ABCDE", "TARGETSUFFIX")
        assert result is True
