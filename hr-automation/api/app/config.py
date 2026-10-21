from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "HireMatch HR Automation API"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite+aiosqlite:///./hr_automation.db"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    n8n_webhook_secret: str = "change-me-in-production"
    hirematch_webhook_url: str | None = None
    default_timezone: str = "Asia/Kolkata"
    cors_origins: str = "http://localhost:3000,http://localhost:5678"


@lru_cache
def get_settings() -> Settings:
    return Settings()
