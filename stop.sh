#!/bin/bash

# Netflix Bot System - Stop Script
# Menghentikan semua proses yang berjalan

echo "🛑 Stopping Netflix Bot System..."

# Kill processes by port
echo "📊 Stopping Dashboard (port 5173)..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "   No process found on port 5173"

# Kill node processes related to the bot
echo "🤖 Stopping Telegram Bot..."
pkill -f "node.*telegram.*index.js" 2>/dev/null || echo "   No bot process found"
pkill -f "nodemon.*index.js" 2>/dev/null || echo "   No nodemon process found"

# Kill vite processes
echo "🔧 Stopping Vite..."
pkill -f "vite" 2>/dev/null || echo "   No vite process found"

echo ""
echo "✅ All processes stopped!"
