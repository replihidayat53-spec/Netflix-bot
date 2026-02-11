# 🌐 Panduan Deploy Bot 24 Jam (Tanpa Komputer Nyala)

Panduan ini akan membantu Anda memindahkan Bot dan Dashboard dari komputer lokal ke Cloud Server Gratis agar bisa berjalan 24 jam non-stop.

## 📋 Ringkasan Arsitektur

1.  **Database (Firebase)**: Menyimpan data user & stok (Sudah ada).
2.  **Dashboard (Admin Panel)**: Di-host di **Vercel** (Gratis).
3.  **Bot Telegram**: Di-host di **Render.com** atau **Railway.app** (Gratis/Low Cost).

---

## 🛠 Langkah 1: Persiapan GitHub Settings

Pastikan Anda sudah mengupload kode terbaru ke GitHub.
Kode Anda harus memiliki struktur folder seperti saat ini:

- `/dashboard` (Website Admin)
- `/bot/telegram` (Bot Telegram)

---

## 🚀 Langkah 2: Deploy Dashboard ke Vercel

1.  Buka [Vercel.com](https://vercel.com) dan Login dengan GitHub.
2.  Klik **Add New Project**.
3.  Pilih repositori Anda.
4.  **PENTING**: Pada bagian **Root Directory**, klik Edit dan pilih folder `dashboard`.
5.  Pada bagian **Framework Preset**, pilih **Vite**.
6.  Pada **Environment Variables**, masukkan semua isi dari file `dashboard/.env`.
7.  Klik **Deploy**.
8.  ✅ Dashboard Admin Anda sudah online! Salin URL-nya.

---

## 🤖 Langkah 3: Deploy Bot ke Render (Gratis)

Render sangat cocok untuk menjalankan Bot Telegram karena mendukung "Background Worker".

1.  Buka [Render.com](https://render.com) dan Daftar/Login.
2.  Klik **New +** -> Pilih **Web Service**.
3.  Hubungkan repositori GitHub Anda.
4.  Isi form dengan detail berikut:
    - **Name**: `netflix-bot` (bebas)
    - **Region**: Singapore (supaya cepat ke Indonesia)
    - **Branch**: `main` (atau master)
    - **Root Directory**: `bot/telegram` (Sangat Penting!)
    - **Runtime**: Node
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Instance Type**: Free

5.  Scroll ke bawah ke bagian **Environment Variables** (Advanced).
6.  Klik **Add Environment Variable** dan masukkan data dari file `bot/telegram/.env`:
    - `BOT_TOKEN`: (Token Bot Anda)
    - `ADMIN_TELEGRAM_ID`: (ID Telegram Anda)
    - `FIREBASE_SERVICE_ACCOUNT`: (Isi file serviceAccountKey.json Anda. _Lihat Cara di Bawah_)
    - `QRIS_IMAGE_URL`: (Link Gambar QRIS)
    - `PAYMENT_ACCOUNT_NAME`: (Nama Rekening)

    > **💡 Tips untuk Firebase Key:**
    > Karena Render tidak bisa upload file JSON, Anda bisa mengubah isi `serviceAccountKey.json` menjadi satu baris string (minified) dan menyimpannya di variabel `FIREBASE_SERVICE_ACCOUNT`.
    > Atau, ubah kode `firebase.js` agar membaca env var satu per satu. (Opsi termudah: Copy paste isi JSON ke value ENV di Render).

7.  Klik **Create Web Service**.
8.  Tunggu proses build selesai.
9.  ✅ Bot Anda sekarang berjalan di Cloud! Anda boleh mematikan komputer.

---

## 💡 Tips Penting

- **Firebase**: Pastikan aturan `Firestore Rules` Anda mengizinkan akses dari mana saja atau public read/write sementara jika mengalami kendala koneksi, tapi sebaiknya diamankan.
- **Render Free Tier**: Render versi gratis akan "Tidur" (spin down) jika tidak ada aktivitas selama 15 menit.
  - **Solusi**: Gunakan layanan gratis seperti `UptimeRobot` untuk melakukan "Ping" ke URL Render Anda setiap 5 menit agar bot tidak pernah tidur.

Selamat! Sekarang bisnis Anda berjalan otomatis 24/7! 🚀
