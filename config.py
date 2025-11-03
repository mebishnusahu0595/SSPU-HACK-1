"""
Configuration module for FarmView AI
Loads environment variables and application settings
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

class Settings:
    """Application Settings"""
    
    # Application
    APP_NAME = "FarmView AI"
    APP_VERSION = "1.0.0"
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    
    # Sentinel Hub
    SENTINEL_CLIENT_ID = os.getenv("SENTINEL_CLIENT_ID")
    SENTINEL_CLIENT_SECRET = os.getenv("SENTINEL_CLIENT_SECRET")
    
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "farmview_ai")
    
    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # AWS S3
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "farmview-reports")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    
    # Insurance Integration
    INSURANCE_WEBHOOK_URL = os.getenv("INSURANCE_WEBHOOK_URL")
    INSURANCE_API_KEY = os.getenv("INSURANCE_API_KEY")
    
    # NDVI Thresholds
    NDVI_DAMAGE_THRESHOLD = -0.2  # NDVI drop threshold for damage detection
    NDVI_SEVERE_DAMAGE_THRESHOLD = -0.4  # Severe damage threshold
    
    # File Paths
    BASE_DIR = Path(__file__).parent
    TEMP_DIR = BASE_DIR / "temp"
    REPORTS_DIR = BASE_DIR / "reports"
    STATIC_DIR = BASE_DIR / "static"
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories if they don't exist"""
        cls.TEMP_DIR.mkdir(exist_ok=True)
        cls.REPORTS_DIR.mkdir(exist_ok=True)
        cls.STATIC_DIR.mkdir(exist_ok=True)

settings = Settings()
settings.create_directories()
