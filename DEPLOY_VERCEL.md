# 🚀 Panduan Deploy ke Vercel

Panduan ini untuk men-deploy **Dashboard Admin** ke Vercel.

## ⚠️ Penting: Tentang Bot Telegram

**JANGAN men-deploy Bot Telegram (`bot/telegram`) ke Vercel.**

Alasannya:

1.  **Broadcast Loop**: Fitur broadcast otomatis (`setInterval`) membutuhkan proses yang berjalan terus menerus. Vercel Serverless Function akan "tidur" setelah beberapa detik, mematikan fitur ini.
2.  **Polling vs Webhook**: Bot Anda saat ini menggunakan mode Polling (lebih cepat & responsif untuk bot kompleks). Vercel hanya mendukung Webhook dengan batasan waktu eksekusi (timeout).
3.  **Database Realtime**: Koneksi Firestore yang persisten lebih stabil di VPS.

✅ **Solusi Terbaik**:

- **Dashboard**: Deploy ke Vercel (karena ini web statis React).
- **Bot**: Biarkan tetap berjalan di VPS/Server ini menggunakan `./start.sh`. Kedua sistem akan tetap terhubung via Firebase.

---

## 📦 Langkah 1: Persiapan Dashboard

Saya sudah membuat file konfigurasi `vercel.json` di dalam folder `dashboard/` agar routing React berjalan lancar.

Pastikan Anda memiliki akun [Vercel](https://vercel.com) dan [GitHub](https://github.com).

## 🚀 Langkah 2: Deploy Dashboard

### Cara 1: Menggunakan GitHub (Direkomendasikan)

1.  Push kode project ini ke repositori GitHub Anda.
2.  Buka Dashboard Vercel -> **Add New Project**.
3.  Import repositori GitHub Anda.
4.  Pada bagian **Root Directory**, pilih folder `dashboard` (bukan root project). Vercel akan otomatis mendeteksi Vite.
5.  Pada bagian **Environment Variables**, masukkan semua nilai dari file `dashboard/.env`:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`
6.  Klik **Deploy**.

### Cara 2: Menggunakan Vercel CLI (Manual)

Jika Anda sudah menginstall Vercel CLI (`npm i -g vercel`), jalankan perintah ini di terminal:

```bash
cd dashboard
vercel
```

Ikuti instruksi di layar:

- Set up and deploy? **Y**
- Which scope? **(Pilih akun Anda)**
- Link to existing project? **N**
- Project name? **netflix-bot-dashboard**
- In which directory? **./** (default)
- Want to modify settings? **N**

---

## ✅ Selesai!

Setelah deploy sukses:

1.  Buka URL Dashboard Vercel Anda (contoh: `https://netflix-bot-dashboard.vercel.app`).
2.  Login menggunakan akun admin yang sudah Anda buat.
3.  Bot Telegram di VPS akan otomatis membaca data dari Dashboard Vercel karena keduanya menggunakan database Firebase yang sama!

**Catatan:** Jika Anda mengubah harga atau stok di Dashboard Vercel, Bot di VPS akan langsung terupdate secara real-time.
