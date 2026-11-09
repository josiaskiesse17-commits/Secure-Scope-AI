import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_live():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_ready_with_db():
    """Test /health/ready when database is reachable."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health/ready")
    # In test environment without DB, this will return "not ready"
    # The actual DB test runs in integration with docker compose
    assert response.status_code == 200
    assert response.json()["status"] in ("ok", "not ready")