"""
Database models and connection handlers for MongoDB
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from datetime import datetime
from typing import Optional, List, Dict, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    """MongoDB Database Handler"""
    
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            # Verify connection
            await cls.client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        return cls.client[settings.MONGODB_DB_NAME]


class FieldModel:
    """Field/Farm data model"""
    
    @staticmethod
    async def create_field(data: Dict[str, Any]) -> str:
        """Create a new field entry"""
        db = Database.get_database()
        collection = db["fields"]
        
        field_data = {
            **data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(field_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_field(field_id: str) -> Optional[Dict]:
        """Get field by ID"""
        db = Database.get_database()
        collection = db["fields"]
        
        field = await collection.find_one({"farmer_id": field_id})
        return field
    
    @staticmethod
    async def get_fields_by_farmer(farmer_id: str) -> List[Dict]:
        """Get all fields for a farmer"""
        db = Database.get_database()
        collection = db["fields"]
        
        cursor = collection.find({"farmer_id": farmer_id})
        fields = await cursor.to_list(length=100)
        return fields
    
    @staticmethod
    async def update_field(field_id: str, data: Dict[str, Any]) -> bool:
        """Update field information"""
        db = Database.get_database()
        collection = db["fields"]
        
        data["updated_at"] = datetime.utcnow()
        result = await collection.update_one(
            {"farmer_id": field_id},
            {"$set": data}
        )
        return result.modified_count > 0


class AnalysisModel:
    """NDVI Analysis and Damage Report model"""
    
    @staticmethod
    async def create_analysis(data: Dict[str, Any]) -> str:
        """Create a new analysis record"""
        db = Database.get_database()
        collection = db["analyses"]
        
        analysis_data = {
            **data,
            "created_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(analysis_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_analysis(analysis_id: str) -> Optional[Dict]:
        """Get analysis by ID"""
        db = Database.get_database()
        collection = db["analyses"]
        
        from bson.objectid import ObjectId
        analysis = await collection.find_one({"_id": ObjectId(analysis_id)})
        return analysis
    
    @staticmethod
    async def get_analyses_by_field(farmer_id: str) -> List[Dict]:
        """Get all analyses for a field"""
        db = Database.get_database()
        collection = db["analyses"]
        
        cursor = collection.find({"farmer_id": farmer_id}).sort("created_at", -1)
        analyses = await cursor.to_list(length=50)
        return analyses
    
    @staticmethod
    async def get_latest_analysis(farmer_id: str) -> Optional[Dict]:
        """Get the most recent analysis for a field"""
        db = Database.get_database()
        collection = db["analyses"]
        
        analysis = await collection.find_one(
            {"farmer_id": farmer_id},
            sort=[("created_at", -1)]
        )
        return analysis


class UserModel:
    """User authentication model"""
    
    @staticmethod
    async def create_user(data: Dict[str, Any]) -> str:
        """Create a new user"""
        db = Database.get_database()
        collection = db["users"]
        
        user_data = {
            **data,
            "created_at": datetime.utcnow()
        }
        
        result = await collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[Dict]:
        """Get user by email"""
        db = Database.get_database()
        collection = db["users"]
        
        user = await collection.find_one({"email": email})
        return user
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        db = Database.get_database()
        collection = db["users"]
        
        from bson.objectid import ObjectId
        user = await collection.find_one({"_id": ObjectId(user_id)})
        return user
