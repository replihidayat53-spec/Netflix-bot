# 🚀 Panduan Deployment Netflix Bot

## Prerequisites

Sebelum memulai deployment, pastikan Anda sudah menginstall:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Firebase CLI**: `npm install -g firebase-tools`
- **PM2** (untuk production bot): `npm install -g pm2`

## 1️⃣ Setup Firebase Project

### 1.1 Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add Project"
3. Masukkan nama project: `netflix-bot-system`
4. Enable Google Analytics (optional)
5. Klik "Create Project"

### 1.2 Enable Firestore

1. Di Firebase Console, pilih project Anda
2. Klik "Firestore Database" di sidebar
3. Klik "Create Database"
4. Pilih mode: **Production mode**
5. Pilih location: `asia-southeast1` (Singapore)
6. Klik "Enable"

### 1.3 Enable Authentication

1. Klik "Authentication" di sidebar
2. Klik "Get Started"
3. Enable "Email/Password" provider
4. Klik "Save"

### 1.4 Create Admin User

1. Di Authentication tab, klik "Users"
2. Klik "Add User"
3. Masukkan email dan password admin
4. Copy UID yang dihasilkan

### 1.5 Add Admin to Firestore

1. Buka Firestore Database
2. Buat collection baru: `admins`
3. Document ID: [paste UID dari step 1.4]
4. Add fields:
   ```
   email: "admin@example.com"
   name: "Admin"
   role: "admin"
   can_add_accounts: true
   can_delete_accounts: true
   can_view_analytics: true
   can_manage_settings: true
   created_at: [timestamp]
   ```

### 1.6 Get Firebase Config

1. Klik ⚙️ (Settings) → Project Settings
2. Scroll ke "Your apps"
3. Klik Web icon (</>) untuk add web app
4. Register app dengan nama "Netflix Bot Dashboard"
5. Copy Firebase config (akan digunakan di `.env`)

### 1.7 Generate Service Account Key

1. Di Project Settings, klik "Service Accounts"
2. Klik "Generate New Private Key"
3. Download file JSON
4. **SIMPAN FILE INI DENGAN AMAN!**

## 2️⃣ Setup Telegram Bot

### 2.1 Create Bot dengan BotFather

1. Buka Telegram, cari `@BotFather`
2. Kirim `/newbot`
3. Masukkan nama bot: `Netflix Bot`
4. Masukkan username: `netflix_store_bot` (harus unik)
5. Copy **Bot Token** yang diberikan

### 2.2 Setup Bot Commands

Kirim ke BotFather:

```
/setcommands

start - Mulai menggunakan bot
harga - Lihat daftar harga
stok - Cek ketersediaan stok
beli - Mulai order
bantuan - Panduan & FAQ
```

### 2.3 Setup Bot Description

```
/setdescription

Bot penjualan akun Netflix otomatis dengan pengiriman instant!
```

## 3️⃣ Clone & Install Dependencies

```bash
cd /home/fearles/netflix-bot

# Install Dashboard Dependencies
cd dashboard
npm install

# Install Telegram Bot Dependencies
cd ../bot/telegram
npm install

# Install WhatsApp Bot Dependencies
cd ../bot/whatsapp
npm install

# Install Cloud Functions Dependencies
cd ../../functions
npm install
```

## 4️⃣ Configure Environment Variables

### 4.1 Dashboard (.env)

```bash
cd /home/fearles/netflix-bot/dashboard
cp .env.example .env
nano .env
```

Isi dengan Firebase config dari step 1.6:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4.2 Telegram Bot (.env)

```bash
cd /home/fearles/netflix-bot/bot/telegram
cp .env.example .env
nano .env
```

Isi dengan data dari Service Account Key (step 1.7) dan Bot Token (step 2.1):

```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

PRICE_PREMIUM=50000
PRICE_STANDARD=35000
PRICE_BASIC=25000

QRIS_IMAGE_URL=https://example.com/qris.png
PAYMENT_ACCOUNT_NAME=Netflix Bot Store
```

### 4.3 WhatsApp Bot (.env)

```bash
cd /home/fearles/netflix-bot/bot/whatsapp
cp .env.example .env
nano .env
```

Sama seperti Telegram Bot, plus:

```env
ADMIN_NUMBER=628123456789
```

## 5️⃣ Deploy Firebase

### 5.1 Login to Firebase

```bash
cd /home/fearles/netflix-bot
firebase login
```

### 5.2 Initialize Firebase

```bash
firebase init
```

Pilih:

- ✅ Firestore
- ✅ Functions
- ✅ Hosting

Konfigurasi:

- Firestore rules: `firebase/firestore.rules`
- Firestore indexes: `firebase/firestore.indexes.json`
- Functions language: JavaScript
- Functions source: `functions`
- Hosting public: `dashboard/dist`

### 5.3 Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5.4 Build Dashboard

```bash
cd dashboard
npm run build
```

### 5.5 Deploy Dashboard

```bash
cd ..
firebase deploy --only hosting
```

Dashboard akan tersedia di: `https://your_project.web.app`

### 5.6 Deploy Cloud Functions

```bash
firebase deploy --only functions
```

## 6️⃣ Run Bots (Development)

### 6.1 Telegram Bot

```bash
cd /home/fearles/netflix-bot/bot/telegram
npm run dev
```

### 6.2 WhatsApp Bot

```bash
cd /home/fearles/netflix-bot/bot/whatsapp
npm run dev
```

Scan QR code yang muncul dengan WhatsApp Anda.

## 7️⃣ Run Bots (Production dengan PM2)

### 7.1 Create PM2 Ecosystem File

```bash
cd /home/fearles/netflix-bot/bot
nano ecosystem.config.cjs
```

```javascript
module.exports = {
  apps: [
    {
      name: "telegram-bot",
      script: "./telegram/index.js",
      cwd: "./telegram",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "whatsapp-bot",
      script: "./whatsapp/index.js",
      cwd: "./whatsapp",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### 7.2 Start Bots dengan PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 7.3 Monitor Bots

```bash
pm2 status
pm2 logs
pm2 monit
```

## 8️⃣ Initial Data Setup

### 8.1 Create Settings Document

Di Firestore Console, buat collection `settings`:

```javascript
{
  id: "main_settings",
  prices: {
    premium: 50000,
    standard: 35000,
    basic: 25000
  },
  telegram_bot_token: "your_bot_token",
  whatsapp_enabled: true,
  qris_image_url: "https://example.com/qris.png",
  payment_account_name: "Netflix Bot Store",
  admin_number: "628123456789",
  auto_delivery: true,
  maintenance_mode: false,
  created_at: [timestamp],
  updated_at: [timestamp]
}
```

### 8.2 Add Sample Accounts (Optional)

Gunakan Dashboard untuk menambah akun pertama Anda!

## 9️⃣ Testing

### 9.1 Test Dashboard

1. Buka `https://your_project.web.app`
2. Login dengan email/password admin
3. Tambah akun test
4. Cek analytics

### 9.2 Test Telegram Bot

1. Buka bot di Telegram
2. Kirim `/start`
3. Test flow pembelian

### 9.3 Test WhatsApp Bot

1. Kirim "menu" ke nomor WhatsApp bot
2. Test flow pembelian

## 🔟 Maintenance

### Update Dashboard

```bash
cd dashboard
npm run build
firebase deploy --only hosting
```

### Update Cloud Functions

```bash
cd functions
firebase deploy --only functions
```

### Restart Bots

```bash
pm2 restart all
```

### View Logs

```bash
# Bot logs
pm2 logs

# Cloud Functions logs
firebase functions:log
```

### Backup Database

```bash
# Export Firestore
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)
```

## ⚠️ Troubleshooting

### Bot tidak merespon

- Cek PM2 status: `pm2 status`
- Cek logs: `pm2 logs`
- Pastikan .env sudah benar
- Restart bot: `pm2 restart all`

### Dashboard tidak bisa login

- Cek Firebase Authentication enabled
- Cek user sudah ada di collection `admins`
- Cek .env dashboard sudah benar

### Stok tidak update

- Cek Firestore rules
- Cek Cloud Functions deployed
- Cek logs: `firebase functions:log`

### Race condition masih terjadi

- Pastikan menggunakan Transaction
- Cek index Firestore sudah dibuat
- Monitor di Firestore Console

## 📞 Support

Jika ada masalah, cek:

1. Firebase Console → Logs
2. PM2 logs: `pm2 logs`
3. Browser Console (untuk Dashboard)

## 🎉 Selesai!

Sistem Netflix Bot Anda sudah siap digunakan! 🚀
