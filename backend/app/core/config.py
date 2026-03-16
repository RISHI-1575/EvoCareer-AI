import os
from pydantic_settings import BaseSettings
from typing import List

# Compute the absolute path to the .env file (backend/.env)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_ENV_FILE = os.path.join(_BACKEND_DIR, ".env")


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./evocareer.db"
    SECRET_KEY: str = "evocareer-dev-secret-key-change-me-in-production"
    REFRESH_SECRET_KEY: str = "evocareer-dev-refresh-secret-change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8000"
    ENVIRONMENT: str = "development"

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = _ENV_FILE


settings = Settings()