#!/bin/bash

# FarmView AI - Complete Installation Script
# This script will install all dependencies for both backend and frontend

echo "=================================="
echo "🚀 FarmView AI Installation"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
echo ""

# Install Backend Dependencies
echo -e "${YELLOW}📦 Installing Backend Dependencies...${NC}"
cd server
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Server directory not found${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend dependencies installed successfully${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env file with your MongoDB URI and API keys${NC}"
fi

cd ..

# Install Frontend Dependencies
echo -e "${YELLOW}📦 Installing Frontend Dependencies...${NC}"
cd client
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Client directory not found${NC}"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend dependencies installed successfully${NC}"
echo ""

cd ..

echo "=================================="
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Configure MongoDB Atlas:"
echo "   - Edit server/.env"
echo "   - Add your MONGODB_URI connection string"
echo ""
echo "2. Configure API Keys:"
echo "   - Add WEATHER_API_KEY (from OpenWeatherMap)"
echo "   - Add other optional API keys"
echo ""
echo "3. Start the application:"
echo "   ${GREEN}npm run dev${NC}  (from root directory)"
echo "   or"
echo "   ${GREEN}cd server && npm run dev${NC}  (backend only)"
echo "   ${GREEN}cd client && npm run dev${NC}  (frontend only)"
echo ""
echo "4. Access the application:"
echo "   Backend:  ${GREEN}http://localhost:5000${NC}"
echo "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}📚 Read README.md for detailed documentation${NC}"
echo ""
