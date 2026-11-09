from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Application
    app_name: str = "SecureScope AI"
    environment: str = "development"
    debug: bool = True

    # Database
    database_url: str = "postgresql://postgres:postgres@db:5432/securescope"
    database_pool_size: int = 5
    database_max_overflow: int = 10

    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:5173"

    # Demo mode
    uploads_enabled: bool = False
    demo_token: str = ""


settings = Settings()