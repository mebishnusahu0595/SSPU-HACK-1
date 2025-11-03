# FarmView AI - API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Health Check

**GET** `/`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-26T10:30:00Z"
}
```

---

### 2. Register Field

**POST** `/api/register-field`

Register a new farm field for monitoring.

**Request Body:**
```json
{
  "farmer_id": "FARM001",
  "crop": "Rice",
  "coordinates": [
    [81.6542, 21.2234],
    [81.6555, 21.2241],
    [81.6571, 21.2237],
    [81.6560, 21.2229]
  ],
  "event_date": "2025-10-20",
  "insured_amount": 500000
}
```

**Parameters:**
- `farmer_id` (string, required): Unique farmer identifier
- `crop` (string, required): Crop type (Rice, Wheat, Maize, Cotton, etc.)
- `coordinates` (array, required): Polygon vertices as [longitude, latitude]
- `event_date` (string, optional): Damage event date in ISO format (YYYY-MM-DD)
- `insured_amount` (number, optional): Insured amount in INR for claim estimation

**Response:**
```json
{
  "message": "Field registered successfully",
  "field_id": "507f1f77bcf86cd799439011",
  "area_hectares": "2.73"
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### 3. Analyze Field

**POST** `/api/analyze-field`

Perform complete satellite-based damage analysis.

**Request Body:** (Same as register-field)

**Response:**
```json
{
  "analysis_id": "507f1f77bcf86cd799439012",
  "farmer_id": "FARM001",
  "damage_percent": 74.3,
  "risk_score": 8.5,
  "area_hectares": 2.73,
  "damaged_area_hectares": 2.03,
  "timestamp": "2025-10-26T10:30:00Z",
  "report_url": "/reports/report_FARM001_1698321000.pdf",
  "map_url": "/static/map_FARM001_1698321000.html",
  "estimated_claim": 371500
}
```

**Processing Steps:**
1. Fetch current satellite imagery (±3 days from event)
2. Fetch baseline imagery (60-90 days before event)
3. Calculate NDVI for both periods
4. Detect damage using threshold analysis
5. Generate visualizations and PDF report
6. Send to insurance API (if configured)

**Processing Time:** 30-60 seconds

**Status Codes:**
- `200`: Analysis successful
- `404`: Unable to fetch satellite images
- `500`: Processing error

---

### 4. Get Field Information

**GET** `/api/field/{farmer_id}`

Retrieve field information by farmer ID.

**Path Parameters:**
- `farmer_id` (string): Unique farmer identifier

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "farmer_id": "FARM001",
  "crop": "Rice",
  "coordinates": [[81.6542, 21.2234], ...],
  "area_hectares": 2.73,
  "insured_amount": 500000,
  "created_at": "2025-10-26T10:00:00Z",
  "updated_at": "2025-10-26T10:00:00Z"
}
```

**Status Codes:**
- `200`: Success
- `404`: Field not found
- `500`: Server error

---

### 5. Get Field Analyses

**GET** `/api/analyses/{farmer_id}`

Get all analyses for a specific field.

**Path Parameters:**
- `farmer_id` (string): Unique farmer identifier

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "farmer_id": "FARM001",
    "crop": "Rice",
    "damage_statistics": {
      "damage_percent": 74.3,
      "risk_score": 8.5,
      "damaged_pixels": 182400,
      "total_pixels": 245600
    },
    "area_statistics": {
      "total_area_ha": 2.73,
      "damaged_area_ha": 2.03
    },
    "created_at": "2025-10-26T10:30:00Z"
  }
]
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### 6. Download Report

**GET** `/reports/{filename}`

Download generated PDF report.

**Path Parameters:**
- `filename` (string): Report filename

**Response:** PDF file download

**Status Codes:**
- `200`: Success
- `404`: Report not found

---

### 7. Dashboard Statistics

**GET** `/api/dashboard-stats`

Get overall dashboard statistics.

**Response:**
```json
{
  "total_fields": 15,
  "total_analyses": 42,
  "recent_analyses": 5
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid authentication
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error

---

## Data Models

### FieldRegistration
```json
{
  "farmer_id": "string",
  "crop": "string",
  "coordinates": [[lon, lat], ...],
  "event_date": "string (ISO format, optional)",
  "insured_amount": "number (optional)"
}
```

### AnalysisResponse
```json
{
  "analysis_id": "string",
  "farmer_id": "string",
  "damage_percent": "number",
  "risk_score": "number",
  "area_hectares": "number",
  "damaged_area_hectares": "number",
  "timestamp": "string (ISO format)",
  "report_url": "string",
  "map_url": "string",
  "estimated_claim": "number (optional)"
}
```

---

## Rate Limits

Currently no rate limits are enforced, but recommended usage:
- Max 10 requests per minute per field
- Max 100 analyses per day per account

---

## NDVI Interpretation

| NDVI Range | Vegetation Health |
|------------|-------------------|
| 0.6 - 1.0  | Healthy, dense vegetation |
| 0.3 - 0.6  | Moderate vegetation |
| 0.1 - 0.3  | Sparse vegetation |
| -0.1 - 0.1 | Bare soil, water |
| < -0.1     | Non-vegetated |

### Damage Thresholds
- **Damaged**: NDVI drop > 0.2
- **Severe Damage**: NDVI drop > 0.4

---

## Example Usage

### cURL Examples

**1. Register a field:**
```bash
curl -X POST http://localhost:8000/api/register-field \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "FARM001",
    "crop": "Rice",
    "coordinates": [
      [81.6542, 21.2234],
      [81.6555, 21.2241],
      [81.6571, 21.2237],
      [81.6560, 21.2229]
    ]
  }'
```

**2. Analyze field:**
```bash
curl -X POST http://localhost:8000/api/analyze-field \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "FARM001",
    "crop": "Rice",
    "coordinates": [
      [81.6542, 21.2234],
      [81.6555, 21.2241],
      [81.6571, 21.2237],
      [81.6560, 21.2229]
    ],
    "insured_amount": 500000
  }'
```

**3. Get field info:**
```bash
curl http://localhost:8000/api/field/FARM001
```

### Python Example

```python
import requests

# Analyze field
url = "http://localhost:8000/api/analyze-field"
payload = {
    "farmer_id": "FARM001",
    "crop": "Rice",
    "coordinates": [
        [81.6542, 21.2234],
        [81.6555, 21.2241],
        [81.6571, 21.2237],
        [81.6560, 21.2229]
    ],
    "insured_amount": 500000
}

response = requests.post(url, json=payload)
result = response.json()

print(f"Damage: {result['damage_percent']}%")
print(f"Risk Score: {result['risk_score']}/10")
print(f"Report: {result['report_url']}")
```

### JavaScript Example

```javascript
// Analyze field
const response = await fetch('http://localhost:8000/api/analyze-field', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    farmer_id: 'FARM001',
    crop: 'Rice',
    coordinates: [
      [81.6542, 21.2234],
      [81.6555, 21.2241],
      [81.6571, 21.2237],
      [81.6560, 21.2229]
    ],
    insured_amount: 500000
  })
});

const result = await response.json();
console.log(`Damage: ${result.damage_percent}%`);
console.log(`Risk Score: ${result.risk_score}/10`);
```

---

## Interactive API Documentation

Visit the auto-generated interactive API docs:

**Swagger UI:** `http://localhost:8000/docs`

**ReDoc:** `http://localhost:8000/redoc`

---

## Support

For API issues or questions:
- Create an issue on GitHub
- Check logs in application output
- Verify environment configuration in `.env`
