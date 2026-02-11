# 🎬 Netflix Bot - Sistem Penjualan Otomatis

Sistem penjualan Netflix otomatis yang terdiri dari Dashboard POS Admin (Web), Database Real-time (Firebase), dan Bot Delivery (Telegram/WhatsApp).

## 📋 Fitur Utama

### 🖥️ Dashboard Admin

- ✅ Manajemen Inventory (Input Satuan & Bulk)
- ✅ Sales Analytics Real-time
- ✅ Dark Mode Modern UI
- ✅ Firebase Authentication
- ✅ Real-time Stock Updates

### 🤖 Bot Automation

- ✅ Telegram Bot dengan Telegraf
- ✅ WhatsApp Bot dengan whatsapp-web.js
- ✅ Auto Delivery dengan FIFO Logic
- ✅ Payment Integration (QRIS)
- ✅ Status Update Otomatis

### 🔥 Firebase Backend

- ✅ Firestore Real-time Database
- ✅ Cloud Functions Serverless
- ✅ Security Rules Ketat
- ✅ Race Condition Handling
- ✅ Transaction Support

## 🏗️ Struktur Proyek

```
netflix-bot/
├── dashboard/              # React Dashboard Admin
│   ├── src/
│   │   ├── components/    # Komponen UI
│   │   ├── pages/         # Halaman Dashboard
│   │   ├── services/      # Firebase Services
│   │   └── utils/         # Helper Functions
│   ├── public/
│   └── package.json
│
├── bot/                   # Bot Telegram & WhatsApp
│   ├── telegram/          # Telegram Bot
│   ├── whatsapp/          # WhatsApp Bot
│   ├── shared/            # Shared Logic
│   └── package.json
│
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   └── package.json
│
├── firebase/              # Firebase Configuration
│   ├── firestore.rules    # Security Rules
│   ├── firestore.indexes.json
│   └── firebase.json
│
└── docs/                  # Dokumentasi
    ├── DEPLOYMENT.md
    ├── API.md
    └── DATABASE.md
```

## 🚀 Quick Start

### 1. Prerequisites

```bash
node >= 18.x
npm >= 9.x
Firebase CLI
```

### 2. Installation

```bash
# Clone & Install Dependencies
cd netflix-bot

# Install Dashboard Dependencies
cd dashboard
npm install

# Install Bot Dependencies
cd ../bot
npm install

# Install Cloud Functions Dependencies
cd ../functions
npm install
```

### 3. Configuration

```bash
# Setup Firebase
firebase login
firebase init

# Configure Environment Variables
cp dashboard/.env.example dashboard/.env
cp bot/.env.example bot/.env
cp functions/.env.example functions/.env
```

### 4. Development

```bash
# Run Dashboard (Terminal 1)
cd dashboard
npm run dev

# Run Telegram Bot (Terminal 2)
cd bot/telegram
npm run dev

# Run WhatsApp Bot (Terminal 3)
cd bot/whatsapp
npm run dev

# Run Firebase Emulator (Terminal 4)
cd functions
npm run serve
```

### 5. Deployment

```bash
# Deploy Dashboard
cd dashboard
npm run build
firebase deploy --only hosting

# Deploy Cloud Functions
cd functions
npm run deploy

# Deploy Bot (PM2)
cd bot
pm2 start ecosystem.config.js
```

## 📚 Dokumentasi Lengkap

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Database Structure](./docs/DATABASE.md)
- [API Documentation](./docs/API.md)

## 🔐 Keamanan

- Firebase Authentication untuk Admin
- Security Rules yang ketat
- Race Condition Handling
- Transaction-based Operations
- Environment Variables untuk Secrets

## 📊 Tech Stack

- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Firebase (Firestore + Cloud Functions)
- **Bot**: Telegraf (Telegram) + whatsapp-web.js
- **Language**: Node.js (ES6+)
- **UI**: Bahasa Indonesia

## 📝 License

MIT License

## 👨‍💻 Developer

Senior Full-Stack Developer
Specialized in Firebase Ecosystem & Bot Automation
