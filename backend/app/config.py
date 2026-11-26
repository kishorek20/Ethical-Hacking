from pydantic_settings import BaseSettings
from pathlib import Path
import json


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./data.db"
    HIBP_API_KEY: str = ""
    SCORING_CONFIG_PATH: str = "scoring_config.json"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def get_scoring_config(self) -> dict:
        path = Path(self.SCORING_CONFIG_PATH)
        if not path.is_absolute():
            path = Path(__file__).parent.parent / self.SCORING_CONFIG_PATH
        with open(path) as f:
            return json.load(f)


settings = Settings()
