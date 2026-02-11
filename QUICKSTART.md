# 🎯 Quick Start Guide - Netflix Bot System

## ⚡ Instalasi Cepat (5 Menit)

### 1. Clone & Install

```bash
cd /home/fearles/netflix-bot

# Install semua dependencies
npm run install-all
```

### 2. Setup Firebase

```bash
# Login ke Firebase
firebase login

# Initialize project
firebase init

# Deploy rules
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Configure Environment

```bash
# Dashboard
cp dashboard/.env.example dashboard/.env
# Edit dashboard/.env dengan Firebase config

# Telegram Bot
cp bot/telegram/.env.example bot/telegram/.env
# Edit bot/telegram/.env dengan bot token & Firebase credentials

# WhatsApp Bot
cp bot/whatsapp/.env.example bot/whatsapp/.env
# Edit bot/whatsapp/.env dengan Firebase credentials
```

### 4. Run Development

```bash
# Terminal 1: Dashboard
cd dashboard && npm run dev

# Terminal 2: Telegram Bot
cd bot/telegram && npm run dev

# Terminal 3: WhatsApp Bot
cd bot/whatsapp && npm run dev
```

### 5. Create Admin User

1. Buka Firebase Console → Authentication
2. Add user dengan email & password
3. Copy UID
4. Buka Firestore → Create collection `admins`
5. Add document dengan UID sebagai ID
6. Add fields: `role: "admin"`, `email: "your@email.com"`

## 🚀 Production Deployment

```bash
# Build Dashboard
cd dashboard && npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions

# Start Bots dengan PM2
cd bot
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## ✅ Verification

### Test Dashboard

- Buka: `https://your-project.web.app`
- Login dengan admin credentials
- Add test account

### Test Telegram Bot

- Buka bot di Telegram
- Send `/start`
- Test menu & flow

### Test WhatsApp Bot

- Send "menu" ke bot
- Test conversation flow

## 📞 Need Help?

Check:

- 📚 [Full Deployment Guide](./docs/DEPLOYMENT.md)
- 💾 [Database Documentation](./docs/DATABASE.md)
- 📡 [API Documentation](./docs/API.md)
- 📖 [User Guide](./docs/USER_GUIDE.md)

## 🎉 You're Ready!

Sistem Netflix Bot Anda sudah siap digunakan! 🚀
