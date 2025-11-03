# 🚀 FarmView AI - Quick Start Guide

## Installation (2 minutes)

### Option 1: Automated Installation
```bash
cd farmview-frontend
chmod +x install.sh
./install.sh
```

### Option 2: Manual Installation
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install
cp .env.example .env
nano .env  # Configure MongoDB URI and API keys

# Install frontend dependencies
cd ../client
npm install

cd ..
```

## Configuration (3 minutes)

### 1. Get MongoDB Atlas URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your password

### 2. Get OpenWeatherMap API Key
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free
3. Get your API key from dashboard

### 3. Update server/.env
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmview?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_very_long_secret_key_at_least_32_characters_long
WEATHER_API_KEY=your_openweathermap_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Running the Application

### Option 1: Run Both (Recommended)
```bash
# From root directory
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

### Option 2: Run Separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## First Time Setup

### 1. Access the Application
Open your browser: http://localhost:5173

### 2. Create an Account
- Click "Sign Up"
- Fill in: Name, Email, Mobile (10 digits), Password
- System auto-generates unique Farmer ID (e.g., FV20250001)

### 3. Login
- Use your email or mobile number
- Enter password
- Get redirected to Dashboard

## Testing the Backend API

### Test with curl:
```bash
# Health Check
curl http://localhost:5000/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "test123"
  }'

# Get Profile (use token from login)
curl -X GET http://localhost:5000/api/farmer/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Test with Postman:
1. Import the API collection (endpoints listed in README)
2. Set Authorization header: `Bearer YOUR_TOKEN`
3. Test all endpoints

## Features Overview

### ✅ Implemented (Ready to Use)
1. **Authentication**: Login, Signup with JWT
2. **Farmer Profile**: View and update profile
3. **Document Management**: Upload, view, download, delete
4. **Property Management**: Add properties with map coordinates
5. **Insurance**: Create policies, submit claims
6. **Weather API**: Current weather and forecast
7. **DigiLocker Integration**: Ready for government docs

### 🔄 Frontend Components (Need to Complete)
To create a full working application, you need to add:
1. Signup.jsx - Multi-step registration form
2. Dashboard.jsx - Main dashboard with stats
3. Documents.jsx - Document list and upload
4. Property.jsx - Property map and list
5. Insurance.jsx - Insurance policies and claims
6. Weather.jsx - Weather display
7. Profile.jsx - User profile page
8. LandingPage.jsx - Homepage

## Project Structure

```
farmview-frontend/
├── server/                    ✅ COMPLETE
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth middleware
│   └── server.js             # Express server
├── client/                    🔄 IN PROGRESS
│   ├── src/
│   │   ├── pages/            # React pages (need more)
│   │   ├── components/       # Reusable components (need to create)
│   │   ├── store/            # Zustand state (auth done)
│   │   ├── utils/            # API utils (done)
│   │   └── i18n/             # Translations (en, hi done)
│   └── index.html            # Entry point
└── README.md                 # Full documentation
```

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error
**Solution**: 
- Check MongoDB Atlas whitelist (add 0.0.0.0/0 for testing)
- Verify connection string in .env
- Ensure password has no special characters or URL-encode them

### Issue 2: Port Already in Use
**Solution**:
```bash
# Kill process on port 5000
sudo lsof -t -i:5000 | xargs kill -9

# Or change PORT in server/.env
PORT=5001
```

### Issue 3: Frontend Can't Connect to Backend
**Solution**:
- Check CORS settings in server.js
- Verify CLIENT_URL in server/.env matches frontend URL
- Check proxy in client/vite.config.js

### Issue 4: JWT Token Invalid
**Solution**:
- Clear localStorage in browser DevTools
- Logout and login again
- Check JWT_SECRET is same in .env

## Next Steps

### 1. Complete Frontend Pages
Use the Login.jsx as a template to create:
- Signup.jsx with multi-step form
- Dashboard.jsx with stats and charts
- Documents.jsx with file upload
- Property.jsx with Leaflet map
- Insurance.jsx with policy forms
- Weather.jsx with weather cards
- Profile.jsx with edit form

### 2. Add More Languages
Edit `client/src/i18n/config.js` to add:
- Marathi, Telugu, Tamil, Kannada, etc.

### 3. Customize UI
- Update Tailwind colors in `tailwind.config.js`
- Modify theme in `index.css`
- Add your logo and branding

### 4. Deploy
- Backend: Deploy to Heroku, Railway, or DigitalOcean
- Frontend: Deploy to Vercel, Netlify, or Cloudflare Pages
- Database: Already on MongoDB Atlas

## Getting Help

- **Backend Working**: Yes ✅ (100% complete)
- **API Endpoints**: All working ✅
- **Database Models**: All created ✅
- **Authentication**: Fully functional ✅
- **Frontend Structure**: Ready ✅
- **Missing**: More React components for full UI

## Development Tips

1. **Test Backend First**: Make sure all APIs work with curl/Postman
2. **Build UI Gradually**: Start with one page at a time
3. **Use React DevTools**: Install browser extension for debugging
4. **Check Network Tab**: Monitor API calls in browser DevTools
5. **Use Hot-Toast**: Already configured for notifications

## Quick Commands Reference

```bash
# Install everything
npm run install-all

# Run both server and client
npm run dev

# Run server only
npm run server

# Run client only
npm run client

# Build for production
npm run build

# Test backend
cd server && npm test

# Check backend health
curl http://localhost:5000/health
```

## Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Dependencies installed (server + client)
- [ ] Backend server starts without errors
- [ ] Can access http://localhost:5000/health
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can signup a new farmer
- [ ] Can login with credentials
- [ ] JWT token stored in localStorage
- [ ] Can access protected routes

Once all checked, you're ready to develop! 🎉

---

**Need More Help?** Check the full README.md for API documentation and complete feature list.
