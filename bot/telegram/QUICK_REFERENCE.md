# 🤖 Telegram Bot - Quick Reference

## 📋 Bot Information

**Bot Token:** `7882704092:AAFVEHdZCqnk17bKcH0nEsqnjxiNrcYSD58`  
**Admin ID:** `7295461097`  
**Bot Username:** `@your_bot_username` (check after first run)

---

## ⚙️ Configuration

### Environment Variables (.env)

```bash
BOT_TOKEN=7882704092:AAFVEHdZCqnk17bKcH0nEsqnjxiNrcYSD58
ADMIN_TELEGRAM_ID=7295461097

# Firebase (TODO: Configure these)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Prices
PRICE_PREMIUM=50000
PRICE_STANDARD=35000
PRICE_BASIC=25000

# Payment
QRIS_IMAGE_URL=https://example.com/qris.png
PAYMENT_ACCOUNT_NAME=Netflix Bot Store
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Run production (PM2)
pm2 start ../ecosystem.config.cjs
```

---

## 💬 User Commands

| Command            | Description                |
| ------------------ | -------------------------- |
| `/start`           | Mulai bot & tampilkan menu |
| `📋 Daftar Harga`  | Lihat harga semua paket    |
| `📦 Cek Stok`      | Cek ketersediaan stok      |
| `🛒 Beli Sekarang` | Mulai proses pembelian     |
| `❓ Bantuan`       | FAQ & bantuan              |

---

## 🔔 Admin Notifications

Admin akan menerima notifikasi untuk:

- ✅ Pesanan baru dibuat
- ✅ Pembayaran berhasil & akun terkirim

---

## 🛠️ Troubleshooting

### Bot tidak start?

```bash
# Check logs
npm run dev

# Verify bot token
echo $BOT_TOKEN

# Test Firebase connection
node -e "require('./firebase.js')"
```

### Admin tidak dapat notifikasi?

1. Pastikan admin sudah `/start` bot minimal 1x
2. Verify ADMIN_TELEGRAM_ID benar
3. Check console logs untuk errors

---

## 📞 Support

- Check logs: `npm run dev`
- PM2 logs: `pm2 logs telegram-bot`
- Firebase Console: Check Firestore data

---

**Ready to go! 🚀**
