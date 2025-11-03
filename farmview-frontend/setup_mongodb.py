#!/usr/bin/env python3
"""
FarmView AI - MongoDB Database Initialization Script
Creates collections and indexes for the FarmView platform
"""

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, CollectionInvalid
from datetime import datetime
import sys
from urllib.parse import quote_plus

# MongoDB Connection - Local MongoDB
MONGODB_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "farmview_ai"

def connect_to_mongodb():
    """Connect to MongoDB Atlas"""
    try:
        print("🔌 Connecting to MongoDB Atlas...")
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        return client
    except ConnectionFailure as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

def create_collections(db):
    """Create all required collections"""
    collections = [
        'farmers',
        'properties',
        'documents',
        'insurances',
        'weatheralerts',
        'cropweathers'
    ]
    
    print("\n📦 Creating collections...")
    for collection_name in collections:
        try:
            db.create_collection(collection_name)
            print(f"   ✅ Created collection: {collection_name}")
        except CollectionInvalid:
            print(f"   ℹ️  Collection already exists: {collection_name}")

def create_indexes(db):
    """Create indexes for better query performance"""
    print("\n🔍 Creating indexes...")
    
    # Farmers collection indexes
    db.farmers.create_index([("farmerId", ASCENDING)], unique=True)
    db.farmers.create_index([("email", ASCENDING)], unique=True)
    db.farmers.create_index([("mobile", ASCENDING)], unique=True)
    print("   ✅ Farmers indexes created")
    
    # Properties collection indexes
    db.properties.create_index([("farmer", ASCENDING)])
    db.properties.create_index([("farmerId", ASCENDING)])
    db.properties.create_index([("currentCrop", ASCENDING)])
    db.properties.create_index([("location", "2dsphere")])  # Geospatial index
    print("   ✅ Properties indexes created")
    
    # Documents collection indexes
    db.documents.create_index([("farmer", ASCENDING)])
    db.documents.create_index([("documentType", ASCENDING)])
    print("   ✅ Documents indexes created")
    
    # Insurance collection indexes
    db.insurances.create_index([("farmer", ASCENDING)])
    db.insurances.create_index([("property", ASCENDING)])
    db.insurances.create_index([("policyNumber", ASCENDING)], unique=True)
    print("   ✅ Insurance indexes created")
    
    # Weather Alerts collection indexes
    db.weatheralerts.create_index([("farmer", ASCENDING)])
    db.weatheralerts.create_index([("farmerId", ASCENDING)])
    db.weatheralerts.create_index([("property", ASCENDING)])
    db.weatheralerts.create_index([("isActive", ASCENDING)])
    db.weatheralerts.create_index([("createdAt", DESCENDING)])
    db.weatheralerts.create_index([
        ("farmer", ASCENDING),
        ("isActive", ASCENDING),
        ("createdAt", DESCENDING)
    ])
    print("   ✅ Weather Alerts indexes created")
    
    # Crop Weather collection indexes
    db.cropweathers.create_index([("cropName", ASCENDING)])
    print("   ✅ Crop Weather indexes created")

def seed_crop_data(db):
    """Seed initial crop weather threshold data"""
    print("\n🌾 Seeding crop weather data...")
    
    crops_data = [
        {
            "cropName": "Wheat",
            "thresholds": {
                "temperature": {"min": 10, "max": 40, "optimal_min": 15, "optimal_max": 25},
                "rainfall": {"min_daily": 2, "max_daily": 50, "max_weekly": 150, "optimal_daily": 4},
                "humidity": {"min": 30, "max": 90, "optimal_min": 50, "optimal_max": 70},
                "windSpeed": {"max": 40, "critical": 60}
            },
            "bestSeasons": ["Rabi"],
            "damagePatterns": [
                {
                    "weatherCondition": "Heavy Rain",
                    "description": "Waterlogging damage to roots, fungal diseases",
                    "severity": "High",
                    "preventiveMeasures": ["Improve drainage", "Apply fungicide", "Avoid irrigation"]
                },
                {
                    "weatherCondition": "Cold Wave",
                    "description": "Frost damage to leaves and stems",
                    "severity": "Critical",
                    "preventiveMeasures": ["Light irrigation", "Smoke generation", "Frost covers"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Rice",
            "thresholds": {
                "temperature": {"min": 15, "max": 42, "optimal_min": 20, "optimal_max": 35},
                "rainfall": {"min_daily": 5, "max_daily": 100, "max_weekly": 300, "optimal_daily": 12},
                "humidity": {"min": 40, "max": 95, "optimal_min": 60, "optimal_max": 80},
                "windSpeed": {"max": 45, "critical": 70}
            },
            "bestSeasons": ["Kharif"],
            "damagePatterns": [
                {
                    "weatherCondition": "Drought",
                    "description": "Water stress leading to poor grain filling",
                    "severity": "Critical",
                    "preventiveMeasures": ["Increase irrigation", "Mulching", "Drought-tolerant varieties"]
                },
                {
                    "weatherCondition": "Cold Wave",
                    "description": "Sterility of flowers during reproductive stage",
                    "severity": "High",
                    "preventiveMeasures": ["Maintain water level", "Avoid cold water irrigation"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Cotton",
            "thresholds": {
                "temperature": {"min": 15, "max": 45, "optimal_min": 21, "optimal_max": 35},
                "rainfall": {"min_daily": 3, "max_daily": 60, "max_weekly": 180, "optimal_daily": 6},
                "humidity": {"min": 30, "max": 85, "optimal_min": 50, "optimal_max": 70},
                "windSpeed": {"max": 40, "critical": 60}
            },
            "bestSeasons": ["Kharif"],
            "damagePatterns": [
                {
                    "weatherCondition": "High Humidity",
                    "description": "Fungal diseases like boll rot",
                    "severity": "High",
                    "preventiveMeasures": ["Fungicide spray", "Proper spacing", "Pruning"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Maize",
            "thresholds": {
                "temperature": {"min": 12, "max": 40, "optimal_min": 18, "optimal_max": 32},
                "rainfall": {"min_daily": 3, "max_daily": 55, "max_weekly": 170, "optimal_daily": 7},
                "humidity": {"min": 35, "max": 90, "optimal_min": 55, "optimal_max": 75},
                "windSpeed": {"max": 45, "critical": 65}
            },
            "bestSeasons": ["Kharif", "Rabi"],
            "damagePatterns": [
                {
                    "weatherCondition": "Strong Wind",
                    "description": "Lodging (falling) of tall plants",
                    "severity": "Medium",
                    "preventiveMeasures": ["Staking", "Wind breaks", "Proper spacing"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Tomato",
            "thresholds": {
                "temperature": {"min": 10, "max": 38, "optimal_min": 18, "optimal_max": 27},
                "rainfall": {"min_daily": 2, "max_daily": 40, "max_weekly": 120, "optimal_daily": 5},
                "humidity": {"min": 30, "max": 85, "optimal_min": 50, "optimal_max": 70},
                "windSpeed": {"max": 35, "critical": 55}
            },
            "bestSeasons": ["Rabi", "Zaid"],
            "damagePatterns": [
                {
                    "weatherCondition": "Heat Wave",
                    "description": "Flower drop, poor fruit setting",
                    "severity": "Critical",
                    "preventiveMeasures": ["Shade nets", "Mulching", "Frequent irrigation"]
                },
                {
                    "weatherCondition": "High Humidity",
                    "description": "Late blight and other fungal diseases",
                    "severity": "High",
                    "preventiveMeasures": ["Fungicide spray", "Good air circulation", "Drip irrigation"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Potato",
            "thresholds": {
                "temperature": {"min": 8, "max": 35, "optimal_min": 15, "optimal_max": 25},
                "rainfall": {"min_daily": 2, "max_daily": 45, "max_weekly": 140, "optimal_daily": 5},
                "humidity": {"min": 35, "max": 90, "optimal_min": 60, "optimal_max": 75},
                "windSpeed": {"max": 40, "critical": 60}
            },
            "bestSeasons": ["Rabi"],
            "damagePatterns": [
                {
                    "weatherCondition": "Heavy Rain",
                    "description": "Waterlogging, tuber rot",
                    "severity": "High",
                    "preventiveMeasures": ["Improve drainage", "Ridge planting", "Avoid irrigation"]
                }
            ],
            "createdAt": datetime.utcnow()
        },
        {
            "cropName": "Sugarcane",
            "thresholds": {
                "temperature": {"min": 15, "max": 40, "optimal_min": 20, "optimal_max": 30},
                "rainfall": {"min_daily": 5, "max_daily": 70, "max_weekly": 220, "optimal_daily": 10},
                "humidity": {"min": 40, "max": 90, "optimal_min": 60, "optimal_max": 80},
                "windSpeed": {"max": 50, "critical": 70}
            },
            "bestSeasons": ["Kharif"],
            "damagePatterns": [
                {
                    "weatherCondition": "Cold Wave",
                    "description": "Growth retardation, reduced sugar content",
                    "severity": "Medium",
                    "preventiveMeasures": ["Trash mulching", "Avoid irrigation with cold water"]
                }
            ],
            "createdAt": datetime.utcnow()
        }
    ]
    
    # Insert or update crop data
    for crop in crops_data:
        result = db.cropweathers.update_one(
            {"cropName": crop["cropName"]},
            {"$set": crop},
            upsert=True
        )
        if result.upserted_id:
            print(f"   ✅ Added crop data: {crop['cropName']}")
        else:
            print(f"   ℹ️  Updated crop data: {crop['cropName']}")

def display_stats(db):
    """Display database statistics"""
    print("\n📊 Database Statistics:")
    print(f"   Database: {db.name}")
    
    collections = ['farmers', 'properties', 'documents', 'insurances', 'weatheralerts', 'cropweathers']
    for collection_name in collections:
        count = db[collection_name].count_documents({})
        print(f"   📦 {collection_name}: {count} documents")

def main():
    """Main execution function"""
    print("=" * 60)
    print("🌾 FarmView AI - MongoDB Database Setup")
    print("=" * 60)
    
    # Connect to MongoDB
    client = connect_to_mongodb()
    db = client[DATABASE_NAME]
    
    # Create collections
    create_collections(db)
    
    # Create indexes
    create_indexes(db)
    
    # Seed crop data
    seed_crop_data(db)
    
    # Display statistics
    display_stats(db)
    
    print("\n" + "=" * 60)
    print("✅ Database setup completed successfully!")
    print("=" * 60)
    print("\n💡 Next Steps:")
    print("   1. Start your backend server: cd server && npm run dev")
    print("   2. Start your frontend: cd client && npm run dev")
    print("   3. Register farmers and add properties through the website")
    print("   4. Data will be automatically stored in MongoDB Atlas")
    print("\n🔗 MongoDB Atlas Dashboard:")
    print("   https://cloud.mongodb.com/")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
