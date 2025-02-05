import os

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_USERNAME: str = os.environ.get("DATABASE_USERNAME","postgres")
    DATABASE_PASSWORD: str = os.environ.get("DATABASE_PASSWORD","example")
    DATABASE_HOSTNAME: str = os.environ.get("DATABASE_HOSTNAME","localhost")
    DATABASE_PORT: int = os.environ.get("DATABASE_PORT", 5432)
    DATABASE_NAME: str = os.environ.get("DATABASE_NAME","database")
    DATABASE_URL: str = f"postgresql+asyncpg://{DATABASE_USERNAME}:{DATABASE_PASSWORD}@{DATABASE_HOSTNAME}:{DATABASE_PORT}/{DATABASE_NAME}"
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "8d65a445dcab153404f9864e99067f8e10848cde32164e1584ba8e4547d90fbd")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    LOG_LEVEL: str = "DEBUG"

    class Config:
        env_file = ".env"

settings = Settings()
