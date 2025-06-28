# In config.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Define the base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    """Application settings."""
    # General settings
    APP_NAME: str = "Sales Dashboard API"
    APP_DESCRIPTION: str = "API for Sales Dashboard Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database settings
    DB_URL: str = f"sqlite:///{BASE_DIR}/data/sales.db"
    
    # CORS settings
    CORS_ORIGINS: list = ["*"]
    
    # Data file path
    DATA_FILE: str = os.path.join(BASE_DIR, "data", "superstore.csv")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    LOG_DIR: str = os.path.join(BASE_DIR, "backend", "app", "logs")

# Create settings instance
settings = Settings()

# Create logs directory if it doesn't exist
os.makedirs(settings.LOG_DIR, exist_ok=True)