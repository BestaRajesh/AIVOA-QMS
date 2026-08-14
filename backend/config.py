import os

class Settings:
    PROJECT_NAME: str = "AIVOA Pharma QMS - AI Customer Complaint System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pharma_qms.db")
    
    # LLM Settings (Groq API)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_GROQ_MODEL: str = os.getenv("DEFAULT_GROQ_MODEL", "gemma2-9b-it") # Or llama-3.3-70b-versatile
    FALLBACK_MODEL: str = "llama-3.3-70b-versatile"

settings = Settings()
