# 🚀 Netflix Bot System - Quick Start Scripts

Script helper untuk memudahkan menjalankan dan mengelola Netflix Bot System.

## 📋 Daftar Script

### 1. `./install-deps.sh` - Install Dependencies

Menginstall semua dependencies yang diperlukan untuk Dashboard dan Bot.

**Fitur:**

- ✅ Auto-retry jika gagal (3x percobaan)
- ✅ Install Dashboard dan Bot secara berurutan
- ✅ Menampilkan summary hasil instalasi

**Cara Pakai:**

```bash
./install-deps.sh
```

---

### 2. `./start.sh` - Start All Services

Menjalankan Dashboard dan Telegram Bot secara bersamaan.

**Fitur:**

- ✅ Auto-check dependencies sebelum start
- ✅ Validasi konfigurasi (.env files)
- ✅ Logging otomatis ke folder `logs/`
- ✅ Graceful shutdown dengan Ctrl+C

**Cara Pakai:**

```bash
./start.sh
```

**Output:**

- Dashboard akan berjalan di: `http://localhost:5173`
- Bot Telegram: `@Vellmoreee_bot`
- Logs tersimpan di:
  - `logs/dashboard.log`
  - `logs/telegram-bot.log`

**Stop Services:**
Tekan `Ctrl+C` di terminal yang menjalankan script

---

### 3. `./stop.sh` - Stop All Services

Menghentikan semua service yang sedang berjalan.

**Fitur:**

- ✅ Stop Dashboard (port 5173)
- ✅ Stop Telegram Bot
- ✅ Kill semua proses terkait (vite, nodemon, node)

**Cara Pakai:**

```bash
./stop.sh
```

---

### 4. `./status.sh` - Check Status

Mengecek status semua service dan konfigurasi.

**Fitur:**

- ✅ Status Dashboard (running/not running)
- ✅ Status Telegram Bot (running/not running)
- ✅ Status Dependencies (installed/not installed)
- ✅ Status Configuration (.env files)
- ✅ Preview logs terbaru

**Cara Pakai:**

```bash
./status.sh
```

---

## 🎯 Workflow Lengkap

### First Time Setup:

```bash
# 1. Install dependencies
./install-deps.sh

# 2. Configure environment files (jika belum)
cp dashboard/.env.example dashboard/.env
cp bot/telegram/.env.example bot/telegram/.env
# Edit .env files dengan konfigurasi Anda

# 3. Start services
./start.sh
```

### Daily Usage:

```bash
# Start
./start.sh

# Check status
./status.sh

# Stop
./stop.sh
# atau tekan Ctrl+C di terminal yang menjalankan ./start.sh
```

---

## 📝 Logs

Semua logs tersimpan di folder `logs/`:

**Lihat logs real-time:**

```bash
# Dashboard logs
tail -f logs/dashboard.log

# Bot logs
tail -f logs/telegram-bot.log

# Kedua logs sekaligus
tail -f logs/*.log
```

**Clear logs:**

```bash
rm logs/*.log
```

---

## ⚠️ Troubleshooting

### Dependencies gagal install:

```bash
# Coba dengan registry mirror
npm config set registry https://registry.npmmirror.com

# Atau install manual
cd dashboard && npm install
cd ../bot/telegram && npm install
```

### Port 5173 sudah digunakan:

```bash
# Kill proses di port 5173
./stop.sh

# Atau manual:
lsof -ti:5173 | xargs kill -9
```

### Bot tidak connect:

```bash
# Cek logs
tail -f logs/telegram-bot.log

# Cek .env
cat bot/telegram/.env

# Pastikan BOT_TOKEN dan Firebase credentials benar
```

### Dashboard tidak bisa diakses:

```bash
# Cek status
./status.sh

# Cek logs
tail -f logs/dashboard.log

# Pastikan dependencies terinstall
ls dashboard/node_modules/.bin/vite
```

---

## 🔧 Advanced Usage

### Run dengan PM2 (Production):

```bash
# Install PM2
npm install -g pm2

# Start dengan PM2
cd bot
pm2 start ecosystem.config.cjs

# Dashboard (build production)
cd dashboard
npm run build
# Deploy ke hosting (Firebase, Vercel, dll)
```

### Custom Port untuk Dashboard:

Edit `dashboard/vite.config.js`:

```javascript
export default {
  server: {
    port: 3000, // Ganti port di sini
  },
};
```

---

## 📞 Quick Reference

| Command              | Description                |
| -------------------- | -------------------------- |
| `./install-deps.sh`  | Install semua dependencies |
| `./start.sh`         | Start Dashboard + Bot      |
| `./stop.sh`          | Stop semua services        |
| `./status.sh`        | Cek status services        |
| `tail -f logs/*.log` | Lihat semua logs           |

---

## ✨ Tips

1. **Selalu cek status** sebelum start:

   ```bash
   ./status.sh
   ```

2. **Monitor logs** saat development:

   ```bash
   # Terminal 1: Start services
   ./start.sh

   # Terminal 2: Monitor logs
   tail -f logs/*.log
   ```

3. **Restart cepat**:

   ```bash
   ./stop.sh && ./start.sh
   ```

4. **Backup .env files**:
   ```bash
   cp dashboard/.env dashboard/.env.backup
   cp bot/telegram/.env bot/telegram/.env.backup
   ```

---

**Happy Coding! 🎉**
