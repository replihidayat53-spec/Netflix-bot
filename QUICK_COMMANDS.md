# 🎯 Netflix Bot System - Quick Commands

## 🚀 Cara Cepat Menjalankan

### Pertama Kali (First Time Setup):

```bash
# 1. Install dependencies
npm run setup
# atau: ./install-deps.sh

# 2. Jalankan semua services
npm start
# atau: ./start.sh
```

### Penggunaan Sehari-hari:

```bash
# Start semua (Dashboard + Bot)
npm start

# Cek status
npm run status

# Stop semua
npm run stop
```

---

## 📋 Semua Commands

| Command          | Fungsi                | Alias               |
| ---------------- | --------------------- | ------------------- |
| `npm run setup`  | Install dependencies  | `./install-deps.sh` |
| `npm start`      | Start Dashboard + Bot | `./start.sh`        |
| `npm run status` | Cek status services   | `./status.sh`       |
| `npm run stop`   | Stop semua services   | `./stop.sh`         |

---

## 🔍 Commands Individual

### Dashboard Only:

```bash
cd dashboard
npm run dev          # Start dashboard
npm run build        # Build production
```

### Bot Only:

```bash
cd bot/telegram
npm run dev          # Start bot
npm start            # Start bot (production)
```

---

## 📊 Akses Services

| Service            | URL/Info                        |
| ------------------ | ------------------------------- |
| **Dashboard**      | http://localhost:5173           |
| **Telegram Bot**   | @Vellmoreee_bot                 |
| **Dashboard Logs** | `tail -f logs/dashboard.log`    |
| **Bot Logs**       | `tail -f logs/telegram-bot.log` |

---

## ⚡ Quick Tips

**Monitor logs real-time:**

```bash
tail -f logs/*.log
```

**Restart cepat:**

```bash
npm run stop && npm start
```

**Cek apakah services berjalan:**

```bash
npm run status
```

---

## 🆘 Troubleshooting Cepat

**Dependencies error:**

```bash
npm run setup
```

**Port sudah digunakan:**

```bash
npm run stop
```

**Bot tidak connect:**

```bash
# Cek logs
tail -f logs/telegram-bot.log

# Cek konfigurasi
cat bot/telegram/.env
```

**Dashboard tidak bisa diakses:**

```bash
# Cek status
npm run status

# Cek logs
tail -f logs/dashboard.log
```

---

## 📖 Dokumentasi Lengkap

- **Scripts Guide:** `SCRIPTS_GUIDE.md`
- **Quick Start:** `QUICKSTART.md`
- **Status Info:** `STATUS.md`
- **Project Summary:** `PROJECT_SUMMARY.md`

---

**Selamat menggunakan Netflix Bot System! 🎉**
