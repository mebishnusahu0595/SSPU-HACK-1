# FarmView AI - Professional Full-Stack Platform

## 🚀 Complete Node.js + React Application

A modern, professional full-stack web application for farmers with authentication, document management, insurance, weather API, multilingual support, and MongoDB Atlas integration.

## 📋 Features

### ✅ Implemented Backend Features
- **Authentication System**: JWT-based login/signup with bcrypt password hashing
- **Unique Farmer IDs**: Auto-generated unique IDs (e.g., FV20250001)
- **MongoDB Models**: Farmer, Property, Document, Insurance with full relationships
- **Document Management**: GridFS file storage with CRUD operations
- **Property Management**: GeoJSON polygon coordinates, map integration ready
- **Insurance System**: Policy management with claim submission
- **Weather API**: OpenWeatherMap integration for current weather & forecast
- **DigiLocker API**: Government document integration (ready for credentials)
- **File Upload**: Multer + GridFS for secure document storage
- **Protected Routes**: JWT middleware for authentication
- **Input Validation**: Express-validator for all inputs
- **Security**: Helmet, CORS, rate limiting, compression

### 🎨 Frontend Features (React + Vite)
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS
- **Responsive Design**: Mobile-first approach
- **Multilingual**: React-i18next for 9+ Indian languages
- **Interactive Maps**: Leaflet.js with polygon drawing
- **State Management**: Zustand for global state
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Chart.js for data visualization
- **Toast Notifications**: React-hot-toast for user feedback

## 📁 Project Structure

```
farmview-frontend/
├── server/                    # Node.js Backend
│   ├── models/               # MongoDB Models
│   │   ├── Farmer.model.js
│   │   ├── Property.model.js
│   │   ├── Document.model.js
│   │   └── Insurance.model.js
│   ├── routes/               # API Routes
│   │   ├── auth.routes.js
│   │   ├── farmer.routes.js
│   │   ├── document.routes.js
│   │   ├── property.routes.js
│   │   ├── weather.routes.js
│   │   ├── insurance.routes.js
│   │   └── digilocker.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env.example
│
└── client/                   # React Frontend
    ├── src/
    │   ├── components/      # React components (to be created)
    │   ├── pages/           # Page components (to be created)
    │   ├── store/           # Zustand stores
    │   ├── utils/           # Utilities
    │   ├── i18n/            # Translations (to be created)
    │   └── App.jsx          # Main app (to be created)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- OpenWeatherMap API key
- (Optional) Sentinel Hub account
- (Optional) DigiLocker credentials

### Step 1: Install Dependencies

#### Backend (Server)
```bash
cd farmview-frontend/server
npm install
```

#### Frontend (Client)
```bash
cd farmview-frontend/client
npm install
```

### Step 2: Configure Environment Variables

#### Server Configuration
```bash
cd farmview-frontend/server
cp .env.example .env
nano .env
```

Fill in the following:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmview?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

# Weather API (Get from https://openweathermap.org/api)
WEATHER_API_KEY=your_openweathermap_api_key

# Optional: Sentinel Hub (for satellite imagery)
SENTINEL_CLIENT_ID=your_client_id
SENTINEL_CLIENT_SECRET=your_client_secret

# Optional: DigiLocker (for government documents)
DIGILOCKER_CLIENT_ID=your_digilocker_client_id
DIGILOCKER_CLIENT_SECRET=your_digilocker_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:5000/api/digilocker/callback

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Client Configuration (Optional)
```bash
cd farmview-frontend/client
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 3: Start the Application

#### Terminal 1: Start Backend Server
```bash
cd farmview-frontend/server
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2: Start Frontend (After completing React components)
```bash
cd farmview-frontend/client
npm run dev
# Client runs on http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new farmer
- `POST /api/auth/login` - Login farmer
- `POST /api/auth/verify-token` - Verify JWT token

### Farmer Profile
- `GET /api/farmer/profile` - Get profile (Protected)
- `PUT /api/farmer/profile` - Update profile (Protected)
- `PUT /api/farmer/change-password` - Change password (Protected)
- `DELETE /api/farmer/account` - Deactivate account (Protected)

### Documents
- `POST /api/documents/upload` - Upload document (Protected)
- `GET /api/documents` - Get all documents (Protected)
- `GET /api/documents/:id` - Get single document (Protected)
- `GET /api/documents/file/:id` - Download/view file (Protected)
- `PUT /api/documents/:id` - Update document (Protected)
- `DELETE /api/documents/:id` - Delete document (Protected)

### Property
- `POST /api/property` - Add property (Protected)
- `GET /api/property` - Get all properties (Protected)
- `GET /api/property/:id` - Get single property (Protected)
- `PUT /api/property/:id` - Update property (Protected)
- `DELETE /api/property/:id` - Delete property (Protected)

### Weather
- `GET /api/weather/current?latitude=X&longitude=Y` - Current weather (Protected)
- `GET /api/weather/forecast?latitude=X&longitude=Y` - 5-day forecast (Protected)
- `GET /api/weather/alerts?latitude=X&longitude=Y` - Weather alerts (Protected)

### Insurance
- `POST /api/insurance` - Create policy (Protected)
- `GET /api/insurance` - Get all policies (Protected)
- `GET /api/insurance/:id` - Get single policy (Protected)
- `POST /api/insurance/:id/claim` - Submit claim (Protected)
- `GET /api/insurance/:id/claims` - Get all claims (Protected)
- `PUT /api/insurance/:id` - Update policy (Protected)
- `DELETE /api/insurance/:id` - Delete policy (Protected)

### DigiLocker
- `GET /api/digilocker/auth-url` - Get authorization URL (Protected)
- `POST /api/digilocker/callback` - OAuth callback
- `GET /api/digilocker/documents` - Fetch documents (Protected)
- `POST /api/digilocker/import` - Import document (Protected)

## 🔐 Authentication Flow

1. **Signup**: User registers with name, email, mobile, password
2. **Auto-generate Farmer ID**: System creates unique ID (e.g., FV20250001)
3. **JWT Token**: Server returns JWT token
4. **Store Token**: Frontend stores token in localStorage
5. **Protected Routes**: All subsequent requests include Bearer token
6. **Token Verification**: Middleware verifies token on every protected route

## 📦 Database Schema

### Farmer Model
- `farmerId` (String, Unique, Auto-generated)
- `name`, `email`, `mobile`, `password`
- `address` (Object: village, district, state, pincode)
- `preferredLanguage` (en, hi, mr, te, ta, kn, gu, bn, pa)
- `profilePicture`, `isVerified`, `isActive`

### Property Model
- `farmer` (ObjectId ref Farmer)
- `farmerId` (String)
- `propertyName`, `propertyType`, `area`
- `location` (GeoJSON Polygon)
- `centerCoordinates` (lat, lon)
- `soilType`, `currentCrop`, `irrigationType`
- `documents` (Array of uploaded docs)

### Document Model
- `farmer` (ObjectId ref Farmer)
- `farmerId` (String)
- `documentType` (PAN, Aadhaar, Land Documents, etc.)
- `fileId` (GridFS ObjectId)
- `filename`, `mimeType`, `fileSize`
- `category`, `tags`, `status`, `expiryDate`
- `isFromDigilocker`, `digilockerUri`

### Insurance Model
- `farmer` (ObjectId ref Farmer)
- `farmerId`, `property` (ObjectId ref Property)
- `policyNumber`, `policyType`, `provider`
- `coverageAmount`, `premium`, `startDate`, `endDate`
- `claims` (Array of claim objects)
- `status`, `autoRenewal`

## 🌍 Multilingual Support

Supported Languages:
- **en**: English
- **hi**: Hindi (हिंदी)
- **mr**: Marathi (मराठी)
- **te**: Telugu (తెలుగు)
- **ta**: Tamil (தமிழ்)
- **kn**: Kannada (ಕನ್ನಡ)
- **gu**: Gujarati (ગુજરાતી)
- **bn**: Bengali (বাংলা)
- **pa**: Punjabi (ਪੰਜਾਬੀ)

## 🎯 Next Steps to Complete Frontend

The backend is 100% complete! To finish the frontend, you need to create:

1. **React Components** (20-30 files):
   - `Login.jsx`, `Signup.jsx`
   - `Dashboard.jsx`, `DashboardLayout.jsx`
   - `Documents.jsx`, `DocumentUpload.jsx`, `DocumentList.jsx`
   - `PropertyMap.jsx`, `PropertyForm.jsx`, `PropertyList.jsx`
   - `Insurance.jsx`, `InsuranceList.jsx`, `ClaimForm.jsx`
   - `Weather.jsx`, `WeatherCard.jsx`, `WeatherForecast.jsx`
   - `Profile.jsx`, `Settings.jsx`
   - `LanguageSelector.jsx`, `Navbar.jsx`, `Sidebar.jsx`
   - `ProtectedRoute.jsx`, `LoadingSpinner.jsx`

2. **i18n Translation Files**:
   - `en.json`, `hi.json`, `mr.json`, etc.
   - i18n configuration file

3. **Main App Files**:
   - `App.jsx` with React Router
   - `main.jsx` entry point

4. **API Service Functions**:
   - `authService.js`, `documentService.js`
   - `propertyService.js`, `insuranceService.js`
   - `weatherService.js`

## 🚀 Quick Start Commands

```bash
# In one terminal - Start backend
cd farmview-frontend/server && npm run dev

# In another terminal - Start frontend (after creating React components)
cd farmview-frontend/client && npm run dev

# Open browser
http://localhost:5173
```

## 📝 Testing the Backend

Test with curl or Postman:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@example.com","mobile":"9876543210","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'

# Get Profile (use token from login response)
curl -X GET http://localhost:5000/api/farmer/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 💡 Key Features Summary

✅ **NO DUMMY DATA** - All data stored in MongoDB Atlas
✅ **Unique Farmer IDs** - Auto-generated to avoid conflicts
✅ **Complete Authentication** - JWT with bcrypt
✅ **Document Management** - GridFS with CRUD operations
✅ **Property Management** - GeoJSON polygons ready for maps
✅ **Insurance System** - Full policy and claim management
✅ **Weather Integration** - Real-time weather data
✅ **DigiLocker Ready** - Government document API integration
✅ **Multilingual Ready** - Backend supports language preferences
✅ **Responsive Ready** - Tailwind CSS configured
✅ **Production Ready** - Security, validation, error handling

## 🆘 Need Help?

The backend server is complete and production-ready. Once you add the remaining React components and translations, you'll have a fully functional professional farming platform!

---

**Status**: Backend ✅ Complete | Frontend 🔄 In Progress (Structure Ready)
**Last Updated**: October 26, 2025
