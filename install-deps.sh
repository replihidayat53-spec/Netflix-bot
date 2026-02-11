#!/bin/bash

# Netflix Bot System - Install Dependencies
# Install semua dependencies yang diperlukan

# Warna
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}   Netflix Bot System - Install Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to install with retry
install_with_retry() {
    local dir=$1
    local name=$2
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}📦 Installing $name (attempt $attempt/$max_attempts)...${NC}"
        cd "$dir"
        
        if npm install; then
            echo -e "${GREEN}✅ $name installed successfully!${NC}"
            cd - > /dev/null
            return 0
        else
            echo -e "${YELLOW}⚠️  Attempt $attempt failed${NC}"
            attempt=$((attempt + 1))
            
            if [ $attempt -le $max_attempts ]; then
                echo -e "${BLUE}Retrying in 5 seconds...${NC}"
                sleep 5
            fi
        fi
    done
    
    echo -e "${RED}❌ Failed to install $name after $max_attempts attempts${NC}"
    cd - > /dev/null
    return 1
}

# Create logs directory
mkdir -p logs

# Install Dashboard Dependencies
echo -e "${BLUE}1/2 Installing Dashboard Dependencies...${NC}"
echo ""
if install_with_retry "dashboard" "Dashboard"; then
    DASHBOARD_OK=true
else
    DASHBOARD_OK=false
fi
echo ""

# Install Bot Dependencies
echo -e "${BLUE}2/2 Installing Bot Dependencies...${NC}"
echo ""
if install_with_retry "bot/telegram" "Telegram Bot"; then
    BOT_OK=true
else
    BOT_OK=false
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}   Installation Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DASHBOARD_OK" = true ]; then
    echo -e "📊 Dashboard:     ${GREEN}✅ Success${NC}"
else
    echo -e "📊 Dashboard:     ${RED}❌ Failed${NC}"
fi

if [ "$BOT_OK" = true ]; then
    echo -e "🤖 Telegram Bot:  ${GREEN}✅ Success${NC}"
else
    echo -e "🤖 Telegram Bot:  ${RED}❌ Failed${NC}"
fi

echo ""

if [ "$DASHBOARD_OK" = true ] && [ "$BOT_OK" = true ]; then
    echo -e "${GREEN}✨ All dependencies installed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Configure .env files if not already done"
    echo "2. Run: ./start.sh"
    exit 0
else
    echo -e "${RED}⚠️  Some installations failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "1. Check your internet connection"
    echo "2. Try running: npm config set registry https://registry.npmmirror.com"
    echo "3. Or install manually:"
    if [ "$DASHBOARD_OK" = false ]; then
        echo "   cd dashboard && npm install"
    fi
    if [ "$BOT_OK" = false ]; then
        echo "   cd bot/telegram && npm install"
    fi
    exit 1
fi
