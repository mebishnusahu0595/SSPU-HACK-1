# 🚀 Complete Setup Guide - FarmView AI with ML & Satellite

## ✅ What's Been Configured

### 1. **MongoDB Atlas Connection** ✅
- **Database**: `farmview_ai`
- **Connection String**: Added to `.env` file
- **Collections**: Ready to be created (farmers, properties, documents, insurances, weatheralerts, cropweathers)

### 2. **Sentinel Hub API** ✅
- **Client ID**: `c12ac4f0-32b4-46c1-8812-d75a1abb9d85`
- **Client Secret**: Configured in `.env`
- **Features**: Satellite imagery, NDVI crop health monitoring

### 3. **New Features Added** ✅
- ML-powered crop damage prediction
- Automatic weather alerts
- Sentinel Hub satellite imagery integration
- NDVI crop health analysis

---

## 🛠️ Setup Steps

### Step 1: Initialize MongoDB Database

Run the Python setup script to create collections and seed crop data:

```bash
# Install pymongo if not installed
pip install pymongo

# Run the setup script
python3 setup_mongodb.py
```

**What it does**:
- ✅ Connects to your MongoDB Atlas
- ✅ Creates 6 collections (farmers, properties, documents, insurances, weatheralerts, cropweathers)
- ✅ Creates indexes for better performance
- ✅ Seeds 7 crop types with weather thresholds (Wheat, Rice, Cotton, Maize, Tomato, Potato, Sugarcane)

### Step 2: Install Backend Dependencies

```bash
cd server
npm install node-cron@^3.0.3
npm install
```

### Step 3: Verify .env Configuration

Your `.env` file should have:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://mebishnusahu:Bishnu05@@cluster0.n0nc4hi.mongodb.net/?appName=Cluster0

# Sentinel Hub API
SENTINEL_CLIENT_ID=c12ac4f0-32b4-46c1-8812-d75a1abb9d85
SENTINEL_CLIENT_SECRET=NgCPggv7nZmqdQvgCiSUMAu8cz5BOXDf
SENTINEL_API_URL=https://services.sentinel-hub.com

# Weather API (get free key from openweathermap.org)
WEATHER_API_KEY=your_key_here

# JWT Secret
JWT_SECRET=farmview_ai_super_secret_key_2025_sspu_hackathon_jwt_token
```

### Step 4: Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Atlas Connected Successfully
🚀 Server running on port 5000
🤖 Starting ML-powered Weather Alert System...
✅ Weather monitoring active - checking properties every 6 hours
🌤️ Automatic weather fetch enabled when farmers add land
```

### Step 5: Start Frontend

Open new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend will open at: `http://localhost:5173`

---

## 🌐 Using the Website

### 1. **Register as Farmer**
- Go to `/signup`
- Fill in: Name, Email, Mobile, Password, Language
- Get unique Farmer ID (e.g., FV20250001)

### 2. **Login**
- Go to `/login`
- Enter email/mobile + password

### 3. **Add Your Land** (This triggers automatic weather!)
- Go to Dashboard → Add Property
- Draw polygon on map or enter coordinates
- **Select crop type** (Wheat, Rice, Cotton, etc.)
- **Select soil type** (Sandy, Loamy, Clay, etc.)
- **Select irrigation** (Drip, Sprinkler, Rainfed)
- Submit

**What happens automatically**:
1. ✅ Property saved to MongoDB
2. ✅ Weather fetched for exact location
3. ✅ ML algorithm analyzes crop risk
4. ✅ Returns risk assessment instantly
5. ✅ Creates alert if risk ≥ 5/10

### 4. **View Weather & Alerts**
- Go to Weather page → See weather for all your properties
- Go to Alerts page → See active warnings
- Dashboard → Shows alert count

### 5. **Upload Documents**
- Go to Documents page
- Upload land ownership papers, Aadhaar, PAN
- Files stored in MongoDB GridFS

### 6. **Apply for Insurance**
- Go to Insurance page
- Fill policy details
- Submit claims when needed

---

## 📡 API Endpoints You Can Use

### Weather & Alerts

```bash
# Get current weather for location
GET /api/weather/current?latitude=28.6139&longitude=77.2090

# Get all active alerts
GET /api/alerts
Authorization: Bearer YOUR_TOKEN

# Get alerts for specific property
GET /api/alerts/property/:propertyId

# Manually trigger weather check
POST /api/alerts/check-now

# Get ML prediction
POST /api/alerts/predict
{
  "cropType": "Rice",
  "temperature": 38,
  "rainfall": 0,
  "humidity": 45
}
```

### Satellite Imagery

```bash
# Get satellite image for property
GET /api/satellite/property/:propertyId
Authorization: Bearer YOUR_TOKEN

# Get NDVI crop health data
GET /api/satellite/ndvi/:propertyId
Authorization: Bearer YOUR_TOKEN

# Custom satellite image
POST /api/satellite/custom-image
{
  "bbox": [77.0, 28.5, 77.2, 28.7],
  "fromDate": "2025-01-01",
  "toDate": "2025-01-30"
}
```

---

## 🤖 ML System Details

### When Alerts are Created

Alerts automatically created when:
- **Risk Score ≥ 5/10**
- Weather check runs (every 6 hours)
- Farmer adds new property

### Risk Factors Analyzed

1. **Waterlogging**: Heavy rain + poor drainage + crop sensitivity
2. **Drought**: Low rain + high temp + irrigation type
3. **Heat Stress**: Temperature exceeds crop optimal range
4. **Cold Stress**: Frost danger or low temperature
5. **Disease Risk**: High humidity + rain + moderate temp
6. **Wind Damage**: Strong winds during vulnerable growth stages

### Alert Types

- 🌧️ Heavy Rainfall Warning
- ☀️ Drought Alert
- 🌡️ Heat Wave Warning
- ❄️ Cold Wave / Frost Alert
- 🦠 High Humidity Warning (disease risk)
- 💨 Strong Wind Alert

---

## 🛰️ Sentinel Hub Features

### True Color Satellite Images
Shows actual RGB images of your farm from space

### NDVI (Crop Health)
Normalized Difference Vegetation Index:
- **NDVI > 0.6**: Healthy, dense vegetation (Green)
- **NDVI 0.3-0.6**: Moderate vegetation (Yellow)
- **NDVI < 0.3**: Sparse vegetation or bare soil (Red)
- **NDVI < 0**: Water, clouds, or snow (Blue)

Use NDVI to:
- ✅ Detect stressed crops early
- ✅ Monitor growth over time
- ✅ Compare different field sections
- ✅ Verify insurance claims

---

## 📊 MongoDB Collections

After farmers use the website, data will be stored in:

### 1. **farmers** Collection
```javascript
{
  farmerId: "FV20250001",
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  mobile: "9876543210",
  password: "hashed_password",
  preferredLanguage: "Hindi"
}
```

### 2. **properties** Collection
```javascript
{
  farmer: ObjectId("..."),
  farmerId: "FV20250001",
  propertyName: "Sunrise Farm",
  currentCrop: "Wheat",
  location: {
    type: "Polygon",
    coordinates: [[[77.1, 28.5], [77.2, 28.5], ...]]
  },
  centerCoordinates: {
    latitude: 28.6139,
    longitude: 77.2090
  },
  soilType: "Loamy",
  irrigationType: "Drip"
}
```

### 3. **weatheralerts** Collection
```javascript
{
  farmer: ObjectId("..."),
  farmerId: "FV20250001",
  property: ObjectId("..."),
  alertType: "Heavy Rainfall Warning",
  severity: "Critical",
  riskLevel: 9,
  message: "🌧️ HEAVY RAIN ALERT! Your Wheat crop...",
  recommendations: [
    {
      action: "Improve drainage immediately",
      priority: "High",
      timeframe: "Within 24 hours"
    }
  ],
  isActive: true,
  validUntil: ISODate("2025-01-16T12:00:00Z")
}
```

### 4. **documents** Collection
```javascript
{
  farmer: ObjectId("..."),
  documentType: "Land Ownership",
  documentName: "land_deed.pdf",
  fileId: ObjectId("..."), // GridFS file ID
  uploadedAt: ISODate("2025-01-15T10:00:00Z")
}
```

### 5. **insurances** Collection
```javascript
{
  farmer: ObjectId("..."),
  property: ObjectId("..."),
  policyNumber: "INS2025001",
  insuranceCompany: "Pradhan Mantri Fasal Bima Yojana",
  coverageAmount: 50000,
  premiumAmount: 2000,
  status: "Active",
  claims: []
}
```

### 6. **cropweathers** Collection (Pre-seeded)
```javascript
{
  cropName: "Wheat",
  thresholds: {
    temperature: {min: 10, max: 40, optimal_min: 15, optimal_max: 25},
    rainfall: {min_daily: 2, max_daily: 50, optimal_daily: 4},
    humidity: {min: 30, max: 90},
    windSpeed: {max: 40, critical: 60}
  },
  damagePatterns: [...],
  bestSeasons: ["Rabi"]
}
```

---

## 🔍 Monitoring & Debugging

### Check MongoDB Data

Visit: https://cloud.mongodb.com/
- Login with your account
- Select Cluster0
- Browse Collections
- View farmers, properties, alerts data

### Check Server Logs

```bash
cd server
npm run dev
```

Look for:
- ✅ MongoDB Connected
- 🌤️ Weather fetched for property
- 🤖 ML Prediction: Risk Level X
- 🚨 Alert created for farmer
- ⏰ Running scheduled weather check

### Check Background Service

Weather alert service runs every 6 hours automatically:
- **Schedule**: 00:00, 06:00, 12:00, 18:00 daily
- **What it does**: Checks all properties → Fetches weather → Runs ML → Creates alerts

---

## 🎯 Test Scenarios

### Test 1: High Risk Waterlogging
1. Add property with crop: Wheat
2. Soil: Clay
3. Irrigation: Rainfed
4. Location: Area with heavy rain forecast
5. **Expected**: Alert created for waterlogging risk

### Test 2: Drought Alert
1. Add property with crop: Rice
2. Irrigation: Rainfed
3. Location: Area with no rain + high temp
4. **Expected**: Drought alert with irrigation recommendations

### Test 3: Frost Warning
1. Add property with crop: Cotton
2. Location: Area with low temperature forecast
3. **Expected**: Cold wave/frost alert with protection measures

---

## 🌟 What Makes This System Smart

### 1. **Location-Specific**
- Weather fetched for farmer's exact farm coordinates
- Not generic city weather
- Accurate for every field

### 2. **Crop-Specific**
- Different crops = Different vulnerabilities
- Wheat sensitive to waterlogging
- Rice sensitive to drought
- Tomato sensitive to heat

### 3. **Soil-Aware**
- Clay soil = Poor drainage = Higher waterlogging risk
- Sandy soil = Good drainage = Higher drought risk

### 4. **Growth Stage Sensitive**
- Flowering stage = Most vulnerable
- Maturity stage = Different risks

### 5. **Proactive Alerts**
- Warns BEFORE damage happens
- Uses forecast data
- Gives time to take action

### 6. **Actionable Recommendations**
- Not just "rain expected"
- Specific steps: "Improve drainage in 24 hours"
- Prioritized by urgency

---

## 📞 Troubleshooting

### MongoDB Connection Failed
```bash
# Check connection string
cat server/.env | grep MONGODB_URI

# Test connection
python3 -c "from pymongo import MongoClient; client = MongoClient('YOUR_URI'); client.admin.command('ping'); print('✅ Connected')"
```

### Sentinel Hub Token Error
```bash
# Check credentials
cat server/.env | grep SENTINEL

# Test token fetch
curl -X POST https://services.sentinel-hub.com/oauth/token \
  -d "client_id=YOUR_ID" \
  -d "client_secret=YOUR_SECRET" \
  -d "grant_type=client_credentials"
```

### Weather Alert Not Created
- Check if risk score ≥ 5
- Check server logs for errors
- Manually trigger: `POST /api/alerts/check-now`

---

## 🎉 Success Checklist

- [ ] MongoDB setup script runs successfully
- [ ] Backend server starts with no errors
- [ ] Frontend loads at localhost:5173
- [ ] Can register new farmer account
- [ ] Can add property with crop selection
- [ ] Weather data appears after adding property
- [ ] ML risk assessment shows in response
- [ ] Alerts visible on dashboard
- [ ] Documents upload works
- [ ] Satellite image can be fetched

---

## 🚀 Next Steps

1. **Get OpenWeatherMap API Key**
   - Sign up: https://openweathermap.org/api
   - Add to `.env`: `WEATHER_API_KEY=your_key`

2. **Customize ML Algorithm**
   - Edit `server/ml/cropPrediction.js`
   - Add more crop profiles
   - Adjust risk thresholds

3. **Add Notification Channels**
   - Email: Configure SMTP in `.env`
   - SMS: Integrate Twilio/MSG91
   - WhatsApp: Business API

4. **Deploy to Production**
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify
   - Use production MongoDB Atlas cluster

---

## 📚 Documentation Files

- `ML_FEATURES_GUIDE.md` - Complete ML system documentation
- `README.md` - Project overview
- `QUICKSTART.md` - Quick setup guide
- `PROJECT_STATUS.md` - Feature completion status

---

**🌾 Your intelligent farming platform is ready! Farmers can now get AI-powered crop protection! 🤖**
