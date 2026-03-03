from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://qa_dashboard_svc:qa_dashboard_pass@localhost:5432/qa_dashboard"
    api_key: str = "qa-agent-secret-key"
    cors_origins: str = "*"
    db_min_pool: int = 2
    db_max_pool: int = 10

    model_config = {"env_prefix": "QA_DASHBOARD_"}


settings = Settings()
