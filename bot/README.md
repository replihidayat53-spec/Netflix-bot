# 🤖 Bots - Netflix Bot System

Telegram & WhatsApp bots untuk automated Netflix account sales.

## 📁 Structure

```
bot/
├── telegram/           # Telegram Bot
├── whatsapp/           # WhatsApp Bot
├── logs/              # PM2 logs
└── ecosystem.config.cjs  # PM2 configuration
```

## 🤖 Telegram Bot

### Features

- ✅ Interactive menu dengan keyboard
- ✅ Daftar harga real-time
- ✅ Cek stok per paket
- ✅ Auto-delivery dengan FIFO logic
- ✅ QRIS payment integration
- ✅ Error handling

### Setup

```bash
cd telegram
cp .env.example .env
# Edit .env dengan bot token
npm install
npm run dev
```

### Commands

- `/start` - Mulai bot
- `📋 Daftar Harga` - Lihat harga
- `📦 Cek Stok` - Cek ketersediaan
- `🛒 Beli Sekarang` - Mulai order
- `❓ Bantuan` - Help & FAQ

## 💬 WhatsApp Bot

### Features

- ✅ Conversational flow
- ✅ Session management
- ✅ Command-based interaction
- ✅ Auto-delivery dengan FIFO logic
- ✅ Multi-user support
- ✅ Auto-cleanup sessions

### Setup

```bash
cd whatsapp
cp .env.example .env
# Edit .env dengan Firebase credentials
npm install
npm run dev
# Scan QR code
```

### Commands

- `menu` / `halo` - Mulai chat
- `harga` - Lihat harga
- `stok` - Cek stok
- `beli` - Mulai order
- `bantuan` - Help
- `batal` - Cancel order

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start bots
pm2 start ecosystem.config.cjs

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup

# Monitor
pm2 status
pm2 logs
pm2 monit
```

### PM2 Commands

```bash
# Start
pm2 start ecosystem.config.cjs

# Stop
pm2 stop all

# Restart
pm2 restart all

# Delete
pm2 delete all

# Logs
pm2 logs telegram-bot
pm2 logs whatsapp-bot

# Monitor
pm2 monit
```

## 🔧 Configuration

### Telegram Bot (.env)

```env
BOT_TOKEN=your_telegram_bot_token
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
PRICE_PREMIUM=50000
PRICE_STANDARD=35000
PRICE_BASIC=25000
```

### WhatsApp Bot (.env)

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
ADMIN_NUMBER=628123456789
PRICE_PREMIUM=50000
```

## 📊 Monitoring

### View Logs

```bash
# All logs
pm2 logs

# Specific bot
pm2 logs telegram-bot
pm2 logs whatsapp-bot

# Error logs only
pm2 logs --err

# Follow logs
pm2 logs --follow
```

### Status Check

```bash
pm2 status
```

## 🐛 Troubleshooting

### Telegram Bot Not Responding

1. Check bot token
2. Verify Firebase credentials
3. Check PM2 status: `pm2 status`
4. View logs: `pm2 logs telegram-bot`
5. Restart: `pm2 restart telegram-bot`

### WhatsApp Bot Not Connecting

1. Delete `.wwebjs_auth` folder
2. Restart bot: `pm2 restart whatsapp-bot`
3. Scan new QR code
4. Check logs: `pm2 logs whatsapp-bot`

### Session Issues (WhatsApp)

```bash
# Clear sessions
rm -rf whatsapp/.wwebjs_auth
rm -rf whatsapp/.wwebjs_cache

# Restart bot
pm2 restart whatsapp-bot
```

## 🔐 Security

- ✅ Environment variables untuk secrets
- ✅ Firebase Admin SDK dengan service account
- ✅ Input validation
- ✅ Transaction-based operations
- ✅ Session management

## 📚 Documentation

- [Telegraf Documentation](https://telegraf.js.org/)
- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
