#!/bin/bash

# Netflix Bot System - Installation Script
# This script will help you set up the entire system

set -e  # Exit on error

echo "🎬 Netflix Bot System - Installation Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js >= 18.x from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18.x${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found${NC}"
    echo "Installing Firebase CLI globally..."
    npm install -g firebase-tools
fi

echo -e "${GREEN}✅ Firebase CLI detected${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "1️⃣  Installing Dashboard dependencies..."
cd dashboard
npm install
cd ..
echo -e "${GREEN}✅ Dashboard dependencies installed${NC}"
echo ""

echo "2️⃣  Installing Telegram Bot dependencies..."
cd bot/telegram
npm install
cd ../..
echo -e "${GREEN}✅ Telegram Bot dependencies installed${NC}"
echo ""

echo "3️⃣  Installing WhatsApp Bot dependencies..."
cd bot/whatsapp
npm install
cd ../..
echo -e "${GREEN}✅ WhatsApp Bot dependencies installed${NC}"
echo ""

echo "4️⃣  Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..
echo -e "${GREEN}✅ Cloud Functions dependencies installed${NC}"
echo ""

# Create .env files
echo "🔧 Setting up environment files..."
echo ""

if [ ! -f "dashboard/.env" ]; then
    cp dashboard/.env.example dashboard/.env
    echo -e "${YELLOW}⚠️  Created dashboard/.env - Please configure it!${NC}"
else
    echo -e "${GREEN}✅ dashboard/.env already exists${NC}"
fi

if [ ! -f "bot/telegram/.env" ]; then
    cp bot/telegram/.env.example bot/telegram/.env
    echo -e "${YELLOW}⚠️  Created bot/telegram/.env - Please configure it!${NC}"
else
    echo -e "${GREEN}✅ bot/telegram/.env already exists${NC}"
fi

if [ ! -f "bot/whatsapp/.env" ]; then
    cp bot/whatsapp/.env.example bot/whatsapp/.env
    echo -e "${YELLOW}⚠️  Created bot/whatsapp/.env - Please configure it!${NC}"
else
    echo -e "${GREEN}✅ bot/whatsapp/.env already exists${NC}"
fi

if [ ! -f "functions/.env" ]; then
    cp functions/.env.example functions/.env
    echo -e "${YELLOW}⚠️  Created functions/.env - Please configure it!${NC}"
else
    echo -e "${GREEN}✅ functions/.env already exists${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure Firebase:"
echo "   - Run: firebase login"
echo "   - Run: firebase init"
echo "   - Select your Firebase project"
echo ""
echo "2. Configure Environment Variables:"
echo "   - Edit dashboard/.env with Firebase config"
echo "   - Edit bot/telegram/.env with bot token"
echo "   - Edit bot/whatsapp/.env with Firebase credentials"
echo ""
echo "3. Deploy Firebase:"
echo "   - Run: firebase deploy --only firestore:rules,firestore:indexes"
echo ""
echo "4. Create Admin User:"
echo "   - Go to Firebase Console → Authentication"
echo "   - Add user and copy UID"
echo "   - Add to Firestore collection 'admins'"
echo ""
echo "5. Start Development:"
echo "   - Dashboard: npm run dev-dashboard"
echo "   - Telegram: npm run dev-telegram"
echo "   - WhatsApp: npm run dev-whatsapp"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full Guide: docs/DEPLOYMENT.md"
echo "   - Database: docs/DATABASE.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
