#!/bin/bash

# Netflix Bot System - Status Checker
# Cek status semua service yang berjalan

# Warna
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}   Netflix Bot System - Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Dashboard
echo -e "${BLUE}📊 Dashboard Status:${NC}"
DASHBOARD_PID=$(lsof -ti:5173 2>/dev/null)
if [ -n "$DASHBOARD_PID" ]; then
    echo -e "   ${GREEN}✅ Running${NC} (PID: $DASHBOARD_PID)"
    echo -e "   ${BLUE}URL:${NC} http://localhost:5173"
else
    echo -e "   ${RED}❌ Not Running${NC}"
fi
echo ""

# Check Telegram Bot
echo -e "${BLUE}🤖 Telegram Bot Status:${NC}"
BOT_PID=$(pgrep -f "node.*telegram.*index.js" 2>/dev/null | head -1)
if [ -n "$BOT_PID" ]; then
    echo -e "   ${GREEN}✅ Running${NC} (PID: $BOT_PID)"
    echo -e "   ${BLUE}Bot:${NC} @Vellmoreee_bot"
else
    echo -e "   ${RED}❌ Not Running${NC}"
fi
echo ""

# Check Dependencies
echo -e "${BLUE}📦 Dependencies:${NC}"
if [ -f "dashboard/node_modules/.bin/vite" ]; then
    echo -e "   Dashboard: ${GREEN}✅ Installed${NC}"
else
    echo -e "   Dashboard: ${RED}❌ Not Installed${NC}"
fi

if [ -d "bot/telegram/node_modules" ]; then
    echo -e "   Bot:       ${GREEN}✅ Installed${NC}"
else
    echo -e "   Bot:       ${RED}❌ Not Installed${NC}"
fi
echo ""

# Check Configuration
echo -e "${BLUE}🔧 Configuration:${NC}"
if [ -f "dashboard/.env" ]; then
    echo -e "   Dashboard .env: ${GREEN}✅ Found${NC}"
else
    echo -e "   Dashboard .env: ${RED}❌ Missing${NC}"
fi

if [ -f "bot/telegram/.env" ]; then
    echo -e "   Bot .env:       ${GREEN}✅ Found${NC}"
else
    echo -e "   Bot .env:       ${RED}❌ Missing${NC}"
fi
echo ""

# Check Logs
echo -e "${BLUE}📝 Recent Logs:${NC}"
if [ -f "logs/dashboard.log" ]; then
    echo -e "   ${BLUE}Dashboard (last 3 lines):${NC}"
    tail -3 logs/dashboard.log 2>/dev/null | sed 's/^/   /'
else
    echo -e "   ${YELLOW}No dashboard logs${NC}"
fi
echo ""

if [ -f "logs/telegram-bot.log" ]; then
    echo -e "   ${BLUE}Bot (last 3 lines):${NC}"
    tail -3 logs/telegram-bot.log 2>/dev/null | sed 's/^/   /'
else
    echo -e "   ${YELLOW}No bot logs${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
