#!/bin/bash

# 🚀 Quick Start for ML-Powered FarmView AI
# This script installs new ML dependencies and starts the server

echo "🤖 FarmView AI - ML Weather Alert System Setup"
echo "=============================================="
echo ""

# Navigate to server directory
cd "$(dirname "$0")/server" || exit 1

echo "📦 Installing new ML dependencies..."
npm install node-cron@^3.0.3

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🌤️ Starting ML-powered backend server..."
echo "   - Automatic weather fetching when land added ✅"
echo "   - ML crop damage prediction algorithm ✅"
echo "   - Automated weather alerts every 6 hours ✅"
echo ""

# Start the server
npm run dev
