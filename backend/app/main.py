from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.schemas import HealthLiveResponse, HealthReadyResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Run migrations on startup
    alembic_cfg = Config("alembic.ini")
    with suppress(Exception):
        command.upgrade(alembic_cfg, "head")
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health/live", response_model=HealthLiveResponse)
async def health_live() -> HealthLiveResponse:
    """Liveness probe - process is running."""
    return HealthLiveResponse()


@app.get("/health/ready", response_model=HealthReadyResponse)
async def health_ready() -> HealthReadyResponse:
    """Readiness probe - process is running and database is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return HealthReadyResponse(status="ok", database="connected")
    except Exception:
        return HealthReadyResponse(status="not ready", database="disconnected")