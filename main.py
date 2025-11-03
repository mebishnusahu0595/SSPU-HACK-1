"""
Main FastAPI Application
Backend API for FarmView AI
"""
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import asyncio
from pathlib import Path
import json

from config import settings
from database import Database, FieldModel, AnalysisModel, UserModel
from sentinel_api import SentinelHubAPI
from ndvi_processor import NDVIProcessor
from visualization import VisualizationEngine, PDFReportGenerator
from fintech_integration import InsuranceIntegration, ClaimEstimator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FarmView AI API",
    description="Satellite-based crop damage assessment platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory=str(settings.STATIC_DIR)), name="static")


# Pydantic Models
class FieldRegistration(BaseModel):
    farmer_id: str = Field(..., description="Unique farmer identifier")
    crop: str = Field(..., description="Crop type (e.g., Rice, Wheat)")
    coordinates: List[List[float]] = Field(..., description="Field boundary coordinates [[lon, lat], ...]")
    event_date: Optional[str] = Field(None, description="Date of damage event (ISO format)")
    insured_amount: Optional[float] = Field(None, description="Insured amount for claim estimation")


class AnalysisResponse(BaseModel):
    analysis_id: str
    farmer_id: str
    damage_percent: float
    risk_score: float
    area_hectares: float
    damaged_area_hectares: float
    timestamp: str
    report_url: str
    map_url: str
    estimated_claim: Optional[float] = None


class HealthCheck(BaseModel):
    status: str
    version: str
    timestamp: str


# Startup and Shutdown Events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection and create directories"""
    logger.info("🚀 Starting FarmView AI API...")
    await Database.connect_db()
    settings.create_directories()
    logger.info("✅ FarmView AI API is ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection"""
    logger.info("🛑 Shutting down FarmView AI API...")
    await Database.close_db()


# API Endpoints

@app.get("/", response_model=HealthCheck)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/register-field", response_model=Dict[str, str])
async def register_field(field: FieldRegistration):
    """
    Register a new field for monitoring
    """
    try:
        logger.info(f"📝 Registering field for farmer: {field.farmer_id}")
        
        # Calculate area
        sentinel_api = SentinelHubAPI()
        area_ha = sentinel_api.calculate_area_hectares(field.coordinates)
        
        # Create field entry
        field_data = {
            "farmer_id": field.farmer_id,
            "crop": field.crop,
            "coordinates": field.coordinates,
            "area_hectares": area_ha,
            "insured_amount": field.insured_amount
        }
        
        field_id = await FieldModel.create_field(field_data)
        
        logger.info(f"✅ Field registered successfully: {field_id}")
        
        return {
            "message": "Field registered successfully",
            "field_id": field_id,
            "area_hectares": str(area_ha)
        }
        
    except Exception as e:
        logger.error(f"❌ Error registering field: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-field", response_model=AnalysisResponse)
async def analyze_field(field: FieldRegistration):
    """
    Perform complete field analysis:
    1. Fetch satellite images
    2. Calculate NDVI
    3. Detect damage
    4. Generate visualizations
    5. Create PDF report
    6. Send to insurance API (if applicable)
    """
    try:
        logger.info(f"🔬 Starting analysis for farmer: {field.farmer_id}")
        
        # Step 1: Fetch satellite images
        logger.info("📡 Step 1: Fetching satellite images...")
        sentinel_api = SentinelHubAPI()
        images = sentinel_api.get_field_images(
            field.coordinates,
            field.event_date
        )
        
        if images['current'] is None or images['baseline'] is None:
            raise HTTPException(
                status_code=404,
                detail="Unable to fetch satellite images. Check coordinates and date range."
            )
        
        # Save images temporarily
        current_path = settings.TEMP_DIR / f"current_{field.farmer_id}_{datetime.now().timestamp()}.tif"
        baseline_path = settings.TEMP_DIR / f"baseline_{field.farmer_id}_{datetime.now().timestamp()}.tif"
        
        with open(current_path, 'wb') as f:
            f.write(images['current'])
        with open(baseline_path, 'wb') as f:
            f.write(images['baseline'])
        
        # Step 2: Process NDVI and detect damage
        logger.info("🧮 Step 2: Processing NDVI and detecting damage...")
        processor = NDVIProcessor()
        
        # Create GeoJSON polygon
        polygon_geojson = {
            "type": "Polygon",
            "coordinates": [field.coordinates]
        }
        
        analysis_results = processor.process_field_analysis(
            str(current_path),
            str(baseline_path),
            polygon_geojson
        )
        
        # Step 3: Generate visualizations
        logger.info("📊 Step 3: Generating visualizations...")
        viz_engine = VisualizationEngine()
        
        # Create damage heatmap
        damage_heatmap_path = viz_engine.create_damage_heatmap(
            analysis_results['damage_mask'],
            str(settings.STATIC_DIR / f"damage_{field.farmer_id}_{datetime.now().timestamp()}.png")
        )
        
        # Create comparison chart
        current_mean_ndvi = float(np.nanmean(analysis_results['current_ndvi']))
        baseline_mean_ndvi = float(np.nanmean(analysis_results['baseline_ndvi']))
        
        comparison_chart_path = viz_engine.create_comparison_chart(
            current_mean_ndvi,
            baseline_mean_ndvi,
            str(settings.STATIC_DIR / f"comparison_{field.farmer_id}_{datetime.now().timestamp()}.png")
        )
        
        # Create interactive map
        map_path = viz_engine.create_interactive_map(
            field.coordinates,
            analysis_results['damage_statistics']['damage_percent'],
            str(settings.STATIC_DIR / f"map_{field.farmer_id}_{datetime.now().timestamp()}.html")
        )
        
        # Step 4: Generate PDF report
        logger.info("📄 Step 4: Generating PDF report...")
        pdf_generator = PDFReportGenerator()
        
        field_data = {
            "farmer_id": field.farmer_id,
            "crop": field.crop
        }
        
        image_paths = {
            "damage_heatmap": damage_heatmap_path,
            "comparison_chart": comparison_chart_path
        }
        
        report_path = str(settings.REPORTS_DIR / f"report_{field.farmer_id}_{datetime.now().timestamp()}.pdf")
        pdf_generator.generate_report(
            analysis_results,
            field_data,
            image_paths,
            report_path
        )
        
        # Step 5: Calculate claim estimate
        estimated_claim = None
        if field.insured_amount:
            claim_estimator = ClaimEstimator()
            estimated_claim = claim_estimator.calculate_claim(
                field.insured_amount,
                analysis_results['damage_statistics']['damage_percent']
            )
        
        # Step 6: Save to database
        logger.info("💾 Step 5: Saving to database...")
        analysis_data = {
            "farmer_id": field.farmer_id,
            "crop": field.crop,
            "coordinates": field.coordinates,
            "damage_statistics": analysis_results['damage_statistics'],
            "area_statistics": analysis_results['area_statistics'],
            "current_mean_ndvi": current_mean_ndvi,
            "baseline_mean_ndvi": baseline_mean_ndvi,
            "report_path": report_path,
            "map_path": map_path,
            "estimated_claim": estimated_claim
        }
        
        analysis_id = await AnalysisModel.create_analysis(analysis_data)
        
        # Step 7: Send to insurance API
        if field.insured_amount and estimated_claim:
            logger.info("🏦 Step 6: Sending to insurance API...")
            insurance = InsuranceIntegration()
            await insurance.send_claim_report({
                "farmer_id": field.farmer_id,
                "analysis_id": analysis_id,
                "damage_percent": analysis_results['damage_statistics']['damage_percent'],
                "estimated_claim": estimated_claim,
                "report_url": f"/reports/{Path(report_path).name}"
            })
        
        # Clean up temporary files
        current_path.unlink()
        baseline_path.unlink()
        
        logger.info("✅ Analysis complete!")
        
        # Return response
        return {
            "analysis_id": analysis_id,
            "farmer_id": field.farmer_id,
            "damage_percent": analysis_results['damage_statistics']['damage_percent'],
            "risk_score": analysis_results['damage_statistics']['risk_score'],
            "area_hectares": analysis_results['area_statistics']['total_area_ha'],
            "damaged_area_hectares": analysis_results['area_statistics']['damaged_area_ha'],
            "timestamp": datetime.utcnow().isoformat(),
            "report_url": f"/reports/{Path(report_path).name}",
            "map_url": f"/static/{Path(map_path).name}",
            "estimated_claim": estimated_claim
        }
        
    except Exception as e:
        logger.error(f"❌ Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/field/{farmer_id}")
async def get_field_info(farmer_id: str):
    """Get field information"""
    try:
        field = await FieldModel.get_field(farmer_id)
        if not field:
            raise HTTPException(status_code=404, detail="Field not found")
        
        # Convert ObjectId to string
        field['_id'] = str(field['_id'])
        return field
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching field: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analyses/{farmer_id}")
async def get_field_analyses(farmer_id: str):
    """Get all analyses for a field"""
    try:
        analyses = await AnalysisModel.get_analyses_by_field(farmer_id)
        
        # Convert ObjectId to string
        for analysis in analyses:
            analysis['_id'] = str(analysis['_id'])
        
        return analyses
        
    except Exception as e:
        logger.error(f"Error fetching analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/{filename}")
async def get_report(filename: str):
    """Download PDF report"""
    report_path = settings.REPORTS_DIR / filename
    
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=filename
    )


@app.get("/api/dashboard-stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        db = Database.get_database()
        
        total_fields = await db["fields"].count_documents({})
        total_analyses = await db["analyses"].count_documents({})
        
        # Get recent analyses
        recent_analyses = await db["analyses"].find().sort("created_at", -1).limit(5).to_list(5)
        
        return {
            "total_fields": total_fields,
            "total_analyses": total_analyses,
            "recent_analyses": len(recent_analyses)
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    import numpy as np
    
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )
