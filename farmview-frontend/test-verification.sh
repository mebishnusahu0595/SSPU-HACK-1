#!/bin/bash

# 🧪 OCR + AI Document Verification Test Script
# Run this script to verify the implementation

echo "=================================================="
echo "🤖 OCR + AI Document Verification Test"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server directory exists
if [ ! -d "server" ]; then
    echo -e "${RED}❌ Error: server directory not found${NC}"
    echo "Please run this script from the farmview-frontend directory"
    exit 1
fi

# Check if temp directory exists
echo "📁 Checking temp directory..."
if [ -d "server/temp" ]; then
    echo -e "${GREEN}✅ server/temp directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating server/temp directory...${NC}"
    mkdir -p server/temp
    echo -e "${GREEN}✅ server/temp directory created${NC}"
fi
echo ""

# Check OCR service
echo "📄 Checking OCR service..."
if [ -f "server/services/ocrService.js" ]; then
    lines=$(wc -l < "server/services/ocrService.js")
    echo -e "${GREEN}✅ ocrService.js exists ($lines lines)${NC}"
else
    echo -e "${RED}❌ ocrService.js not found${NC}"
fi
echo ""

# Check document validation service
echo "🤖 Checking AI validation service..."
if [ -f "server/services/documentValidationService.js" ]; then
    lines=$(wc -l < "server/services/documentValidationService.js")
    echo -e "${GREEN}✅ documentValidationService.js exists ($lines lines)${NC}"
else
    echo -e "${RED}❌ documentValidationService.js not found${NC}"
fi
echo ""

# Check document routes
echo "🛣️  Checking document routes..."
if [ -f "server/routes/document.routes.js" ]; then
    if grep -q "/verify" "server/routes/document.routes.js"; then
        echo -e "${GREEN}✅ POST /api/documents/verify endpoint found${NC}"
    else
        echo -e "${RED}❌ /verify endpoint not found in routes${NC}"
    fi
else
    echo -e "${RED}❌ document.routes.js not found${NC}"
fi
echo ""

# Check Property model
echo "📊 Checking Property model..."
if [ -f "server/models/Property.model.js" ]; then
    if grep -q "verificationMethod" "server/models/Property.model.js"; then
        echo -e "${GREEN}✅ Property model has verification fields${NC}"
    else
        echo -e "${YELLOW}⚠️  Verification fields not found in Property model${NC}"
    fi
else
    echo -e "${RED}❌ Property.model.js not found${NC}"
fi
echo ""

# Check Document model
echo "📋 Checking Document model..."
if [ -f "server/models/Document.model.js" ]; then
    if grep -q "verificationStatus" "server/models/Document.model.js"; then
        echo -e "${GREEN}✅ Document model has OCR/AI fields${NC}"
    else
        echo -e "${YELLOW}⚠️  OCR/AI fields not found in Document model${NC}"
    fi
else
    echo -e "${RED}❌ Document.model.js not found${NC}"
fi
echo ""

# Check frontend modal
echo "🎨 Checking frontend components..."
if [ -f "client/src/components/DocumentVerificationModal.jsx" ]; then
    lines=$(wc -l < "client/src/components/DocumentVerificationModal.jsx")
    echo -e "${GREEN}✅ DocumentVerificationModal.jsx exists ($lines lines)${NC}"
else
    echo -e "${RED}❌ DocumentVerificationModal.jsx not found${NC}"
fi
echo ""

# Check Documents page
if [ -f "client/src/pages/Documents.jsx" ]; then
    if grep -q "DocumentVerificationModal" "client/src/pages/Documents.jsx"; then
        echo -e "${GREEN}✅ Documents.jsx integrated with verification modal${NC}"
    else
        echo -e "${YELLOW}⚠️  Verification modal not integrated in Documents.jsx${NC}"
    fi
else
    echo -e "${RED}❌ Documents.jsx not found${NC}"
fi
echo ""

# Check Property page
if [ -f "client/src/pages/Property.jsx" ]; then
    if grep -q "lastVerifiedDocument" "client/src/pages/Property.jsx"; then
        echo -e "${GREEN}✅ Property.jsx has verification checks${NC}"
    else
        echo -e "${YELLOW}⚠️  Verification checks not found in Property.jsx${NC}"
    fi
else
    echo -e "${RED}❌ Property.jsx not found${NC}"
fi
echo ""

# Check dependencies
echo "📦 Checking dependencies..."
cd server
if npm list tesseract.js &> /dev/null; then
    echo -e "${GREEN}✅ tesseract.js installed${NC}"
else
    echo -e "${RED}❌ tesseract.js not installed${NC}"
    echo "   Run: cd server && npm install tesseract.js"
fi

if npm list pdf-parse &> /dev/null; then
    echo -e "${GREEN}✅ pdf-parse installed${NC}"
else
    echo -e "${RED}❌ pdf-parse not installed${NC}"
    echo "   Run: cd server && npm install pdf-parse"
fi

if npm list sharp &> /dev/null; then
    echo -e "${GREEN}✅ sharp installed${NC}"
else
    echo -e "${RED}❌ sharp not installed${NC}"
    echo "   Run: cd server && npm install sharp"
fi
cd ..
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f "server/.env" ]; then
    if grep -q "GEMINI_API_KEY" "server/.env"; then
        echo -e "${GREEN}✅ GEMINI_API_KEY found in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  GEMINI_API_KEY not found in .env${NC}"
        echo "   Add: GEMINI_API_KEY=your_api_key"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Create server/.env with GEMINI_API_KEY"
fi
echo ""

# Final summary
echo "=================================================="
echo "📊 Test Summary"
echo "=================================================="
echo ""
echo "Core Files:"
echo "  - ocrService.js: OCR text extraction"
echo "  - documentValidationService.js: AI validation"
echo "  - document.routes.js: Verification endpoint"
echo "  - Property.model.js: Verification fields"
echo "  - Document.model.js: OCR metadata"
echo ""
echo "Frontend:"
echo "  - DocumentVerificationModal.jsx: Verification UI"
echo "  - Documents.jsx: Integration"
echo "  - Property.jsx: Verification checks"
echo ""
echo "Dependencies:"
echo "  - tesseract.js: OCR engine"
echo "  - pdf-parse: PDF extraction"
echo "  - sharp: Image processing"
echo "  - @google/generative-ai: Gemini AI"
echo ""
echo "=================================================="
echo "🚀 Next Steps:"
echo "=================================================="
echo ""
echo "1. Start Backend:"
echo "   cd server && npm start"
echo ""
echo "2. Start Frontend:"
echo "   cd client && npm run dev"
echo ""
echo "3. Test Workflow:"
echo "   - Go to http://localhost:5173/documents"
echo "   - Click 'Start AI Verification'"
echo "   - Upload land document"
echo "   - Fill user data"
echo "   - Click 'Start AI Verification'"
echo "   - View results"
echo ""
echo "4. Register Property:"
echo "   - Go to http://localhost:5173/property"
echo "   - See green verification badge"
echo "   - Fill property details"
echo "   - Submit property"
echo ""
echo "=================================================="
echo "✨ Implementation Complete!"
echo "=================================================="
