#!/bin/bash

# FarmView AI - Complete Setup and Start Script
# Run this script to set up and start the entire application

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║     FarmView AI - Complete Setup           ║"
echo "║     SSPU Hackathon 2025                    ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"
echo ""

# Step 1: Install Backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 1: Installing Backend Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd server
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Create .env if needed
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit server/.env with your MongoDB URI!${NC}"
    echo ""
fi

cd ..

# Step 2: Install Frontend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📦 Step 2: Installing Frontend Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

cd ..

# Installation Complete
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 Installation Complete!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Configuration Check
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 CONFIGURATION CHECKLIST${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Before running, ensure you have:"
echo ""
echo "1. MongoDB Atlas Setup:"
echo "   ▸ Visit: https://www.mongodb.com/cloud/atlas"
echo "   ▸ Create FREE cluster"
echo "   ▸ Get connection string"
echo "   ▸ Update server/.env with MONGODB_URI"
echo ""
echo "2. Weather API Key:"
echo "   ▸ Visit: https://openweathermap.org/api"
echo "   ▸ Sign up FREE"
echo "   ▸ Get API key"
echo "   ▸ Update server/.env with WEATHER_API_KEY"
echo ""
echo "3. JWT Secret:"
echo "   ▸ Update server/.env with a long random string"
echo "   ▸ Minimum 32 characters recommended"
echo ""

# Ask if user wants to start
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "Have you configured server/.env? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Starting FarmView AI...${NC}"
    echo ""
    echo -e "${BLUE}Backend will run on: ${GREEN}http://localhost:5000${NC}"
    echo -e "${BLUE}Frontend will run on: ${GREEN}http://localhost:5173${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
    echo ""
    sleep 2
    
    # Start both servers
    trap 'kill $(jobs -p)' EXIT
    
    cd server && npm run dev &
    cd client && npm run dev &
    
    wait
else
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📝 NEXT STEPS:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. Edit configuration:"
    echo "   ${GREEN}nano server/.env${NC}"
    echo ""
    echo "2. Start the application:"
    echo "   ${GREEN}npm run dev${NC}"
    echo ""
    echo "3. Or start separately:"
    echo "   ${GREEN}cd server && npm run dev${NC}  (Terminal 1)"
    echo "   ${GREEN}cd client && npm run dev${NC}  (Terminal 2)"
    echo ""
    echo "4. Open browser:"
    echo "   ${GREEN}http://localhost:5173${NC}"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   ▸ README.md - Complete documentation"
    echo "   ▸ QUICKSTART.md - Quick setup guide"
    echo "   ▸ PROJECT_STATUS.md - Feature list"
    echo ""
fi
