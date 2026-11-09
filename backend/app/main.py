from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.config import settings
from app.database import engine, get_db
from app.schemas import HealthLiveResponse, HealthReadyResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run migrations on startup
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    try:
        command.upgrade(alembic_cfg, "head")
    except Exception:
        # If migrations fail, we still start the app
        # The health check will catch database issues
        pass
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health/live", response_model=HealthLiveResponse)
async def health_live():
    """Liveness probe - process is running."""
    return HealthLiveResponse()


@app.get("/health/ready", response_model=HealthReadyResponse)
async def health_ready():
    """Readiness probe - process is running and database is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return HealthReadyResponse(status="ok", database="connected")
    except Exception:
        return HealthReadyResponse(status="not ready", database="disconnected")