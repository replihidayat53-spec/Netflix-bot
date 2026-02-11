#!/bin/bash

# Netflix Bot System - Startup Script
# Menjalankan Dashboard dan Bot Telegram secara bersamaan

echo "🚀 Starting Netflix Bot System..."
echo ""

# Warna untuk output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fungsi untuk cek apakah dependencies sudah terinstall
check_dependencies() {
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    
    # Cek dashboard dependencies
    if [ ! -d "dashboard/node_modules" ] || [ ! -f "dashboard/node_modules/.bin/vite" ]; then
        echo -e "${YELLOW}⚠️  Dashboard dependencies not installed${NC}"
        echo -e "${BLUE}Installing dashboard dependencies...${NC}"
        cd dashboard
        npm install
        cd ..
    else
        echo -e "${GREEN}✅ Dashboard dependencies OK${NC}"
    fi
    
    # Cek bot dependencies
    if [ ! -d "bot/telegram/node_modules" ]; then
        echo -e "${YELLOW}⚠️  Bot dependencies not installed${NC}"
        echo -e "${BLUE}Installing bot dependencies...${NC}"
        cd bot/telegram
        npm install
        cd ../..
    else
        echo -e "${GREEN}✅ Bot dependencies OK${NC}"
    fi
    
    echo ""
}

# Fungsi untuk cek konfigurasi
check_config() {
    echo -e "${BLUE}🔧 Checking configuration...${NC}"
    
    # Cek .env files
    if [ ! -f "dashboard/.env" ]; then
        echo -e "${RED}❌ dashboard/.env not found${NC}"
        echo -e "${YELLOW}Please copy dashboard/.env.example to dashboard/.env and configure it${NC}"
        exit 1
    fi
    
    if [ ! -f "bot/telegram/.env" ]; then
        echo -e "${RED}❌ bot/telegram/.env not found${NC}"
        echo -e "${YELLOW}Please copy bot/telegram/.env.example to bot/telegram/.env and configure it${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Configuration files OK${NC}"
    echo ""
}

# Fungsi untuk kill proses yang sedang berjalan
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all processes...${NC}"
    kill 0
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Main execution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}   Netflix Bot System Launcher${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cek dependencies dan konfigurasi
check_dependencies
check_config

echo -e "${GREEN}🎬 Starting services...${NC}"
echo ""

# Start Dashboard
echo -e "${BLUE}📊 Starting Dashboard...${NC}"
cd dashboard
npm run dev > ../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
cd ..
echo -e "${GREEN}✅ Dashboard started (PID: $DASHBOARD_PID)${NC}"
echo -e "${BLUE}   URL: http://localhost:5173${NC}"
echo ""

# Wait a bit for dashboard to start
sleep 2

# Start Telegram Bot
echo -e "${BLUE}🤖 Starting Telegram Bot...${NC}"
cd bot/telegram
npm run dev > ../../logs/telegram-bot.log 2>&1 &
BOT_PID=$!
cd ../..
echo -e "${GREEN}✅ Telegram Bot started (PID: $BOT_PID)${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ All services are running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📊 Dashboard:${NC}      http://localhost:5173"
echo -e "${BLUE}🤖 Telegram Bot:${NC}   @Vellmoreee_bot"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Dashboard:     tail -f logs/dashboard.log"
echo -e "   Telegram Bot:  tail -f logs/telegram-bot.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait
