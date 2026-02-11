# 📖 Panduan Penggunaan Netflix Bot System

## Untuk Admin

### 1. Login ke Dashboard

1. Buka URL dashboard: `https://your-project.web.app`
2. Masukkan email dan password admin
3. Klik "Login"

### 2. Menambah Akun Netflix

#### Metode 1: Input Satuan

1. Klik tombol "Tambah Akun" di header
2. Pilih tab "Input Satuan"
3. Isi form:
   - Email akun Netflix
   - Password akun
   - PIN Profile (opsional)
   - Pilih tipe paket (Premium/Standard/Basic)
4. Klik "Simpan Akun"

#### Metode 2: Input Bulk (Massal)

1. Klik tombol "Tambah Akun" di header
2. Pilih tab "Input Bulk"
3. Masukkan data dengan format:
   ```
   email1@netflix.com|password1|1234
   email2@netflix.com|password2|5678
   email3@netflix.com|password3|9012
   ```
   Atau menggunakan `:` sebagai separator:
   ```
   email1@netflix.com:password1:1234
   email2@netflix.com:password2:5678
   ```
4. Klik "Simpan Semua Akun"

### 3. Melihat Analytics

1. Klik tab "Analytics" di navigation
2. Lihat statistik:
   - Total Stok
   - Akun Terjual
   - Total Pendapatan
   - Total Pesanan
   - Stok per Paket

### 4. Mengelola Inventory

1. Klik tab "Inventory" di navigation
2. Gunakan search bar untuk mencari akun
3. Filter berdasarkan status:
   - Semua
   - Ready (siap jual)
   - Sold (terjual)
4. Hapus akun dengan klik icon 🗑️

### 5. Tips untuk Admin

- ✅ Tambah stok secara berkala
- ✅ Monitor analytics setiap hari
- ✅ Backup data akun di tempat aman
- ✅ Cek status bot secara rutin
- ✅ Respond customer support dengan cepat

---

## Untuk Customer (Telegram)

### 1. Memulai Bot

1. Buka Telegram
2. Cari bot: `@your_bot_username`
3. Klik "Start" atau kirim `/start`

### 2. Melihat Daftar Harga

- Klik tombol "📋 Daftar Harga"
- Atau kirim perintah `/harga`

### 3. Cek Stok

- Klik tombol "📦 Cek Stok"
- Atau kirim perintah `/stok`

### 4. Membeli Akun

1. Klik tombol "🛒 Beli Sekarang"
2. Pilih paket yang diinginkan:
   - 🌟 Premium
   - ⭐ Standard
   - ✨ Basic
3. Bot akan mengirim detail pesanan dan QRIS
4. Transfer sesuai nominal yang tertera
5. Klik tombol "✅ Sudah Bayar"
6. Akun akan dikirim otomatis!

### 5. Bantuan

- Klik tombol "❓ Bantuan"
- Atau kirim perintah `/bantuan`

---

## Untuk Customer (WhatsApp)

### 1. Memulai Chat

1. Simpan nomor WhatsApp bot
2. Kirim pesan: `menu` atau `halo`

### 2. Melihat Daftar Harga

Kirim pesan: `harga`

### 3. Cek Stok

Kirim pesan: `stok`

### 4. Membeli Akun

1. Kirim pesan: `beli`
2. Bot akan bertanya paket yang diinginkan
3. Ketik nomor pilihan:
   - `1` untuk Premium
   - `2` untuk Standard
   - `3` untuk Basic
4. Bot akan mengirim detail pesanan dan QRIS
5. Transfer sesuai nominal
6. Balas dengan: `sudah bayar`
7. Akun akan dikirim otomatis!

### 5. Membatalkan Pesanan

Kapan saja selama proses order, kirim: `batal`

### 6. Bantuan

Kirim pesan: `bantuan`

---

## FAQ (Frequently Asked Questions)

### Q: Berapa lama proses pengiriman akun?

**A:** Instant! Setelah Anda konfirmasi pembayaran, akun akan langsung dikirim oleh bot dalam hitungan detik.

### Q: Apakah ada garansi?

**A:** Ya, kami memberikan garansi replace jika akun bermasalah. Hubungi admin untuk klaim garansi.

### Q: Metode pembayaran apa saja yang diterima?

**A:** Saat ini kami menerima pembayaran via QRIS (semua e-wallet dan bank).

### Q: Apakah bisa ganti password akun?

**A:** Tidak disarankan. Akun yang dibeli adalah shared account, jadi jangan ganti password.

### Q: Bagaimana cara login ke Netflix?

**A:**

1. Buka netflix.com atau aplikasi Netflix
2. Masukkan email dan password yang diberikan
3. Pilih profile
4. Selamat menonton!

### Q: Apakah bisa digunakan di TV?

**A:** Ya, bisa! Login dengan email dan password yang sama di Smart TV atau perangkat streaming Anda.

### Q: Berapa lama masa aktif akun?

**A:** Akun aktif selama 1 bulan dari tanggal pembelian.

### Q: Bagaimana cara perpanjang?

**A:** Order ulang melalui bot sebelum masa aktif habis.

### Q: Stok habis, kapan restock?

**A:** Kami restock secara berkala. Silakan cek kembali beberapa jam kemudian atau hubungi admin.

### Q: Akun tidak bisa login, bagaimana?

**A:** Segera hubungi admin dengan menyertakan:

- Order ID
- Email akun yang bermasalah
- Screenshot error (jika ada)

### Q: Apakah data saya aman?

**A:** Ya, semua data transaksi tersimpan aman di Firebase dengan enkripsi. Kami tidak menyimpan data pembayaran Anda.

### Q: Bisa request paket khusus?

**A:** Hubungi admin untuk request paket khusus atau bulk order.

---

## Troubleshooting

### Bot Tidak Merespon

1. Cek koneksi internet Anda
2. Restart chat (Telegram: /start, WhatsApp: menu)
3. Tunggu beberapa saat, mungkin bot sedang maintenance
4. Hubungi admin jika masih bermasalah

### Pembayaran Sudah Transfer tapi Akun Belum Dikirim

1. Pastikan Anda sudah klik "Sudah Bayar" / balas "sudah bayar"
2. Tunggu beberapa detik untuk processing
3. Cek apakah nominal transfer sudah sesuai
4. Jika lebih dari 5 menit belum dikirim, hubungi admin dengan:
   - Order ID
   - Bukti transfer
   - Screenshot chat dengan bot

### Akun yang Diterima Tidak Bisa Login

1. Cek kembali email dan password (case-sensitive)
2. Pastikan tidak ada spasi di awal/akhir
3. Coba copy-paste langsung
4. Jika masih tidak bisa, hubungi admin untuk replace

### Lupa Order ID

1. Scroll chat dengan bot
2. Cari pesan yang berisi "Order ID"
3. Atau hubungi admin dengan menyertakan:
   - Waktu pembelian
   - Paket yang dibeli
   - Screenshot bukti transfer

---

## Kontak Support

📞 **Admin WhatsApp:** wa.me/628123456789

📧 **Email:** support@netflixbot.com

⏰ **Jam Operasional:** 24/7 (Response time: max 1 jam)

---

## Tips & Trik

### Untuk Customer

1. **Simpan Data Akun** - Screenshot atau catat email & password di tempat aman
2. **Jangan Share** - Jangan bagikan akun ke orang lain untuk menjaga kualitas
3. **Gunakan Profile Sendiri** - Pilih profile yang belum digunakan
4. **Jangan Ganti Password** - Ini akan membuat akun tidak bisa digunakan
5. **Order Sebelum Habis** - Perpanjang sebelum masa aktif habis agar tidak terputus

### Untuk Admin

1. **Monitor Stok** - Pastikan selalu ada stok ready untuk setiap paket
2. **Backup Data** - Export data akun secara berkala
3. **Cek Bot Status** - Monitor bot dengan PM2 atau Firebase Console
4. **Update Harga** - Sesuaikan harga di settings jika diperlukan
5. **Customer Service** - Respond customer dengan cepat dan ramah

---

## Update & Changelog

### Version 1.0.0 (2024-01-01)

- ✅ Initial release
- ✅ Dashboard Admin dengan React + Tailwind
- ✅ Telegram Bot dengan auto-delivery
- ✅ WhatsApp Bot dengan session management
- ✅ Firebase integration dengan FIFO logic
- ✅ Real-time analytics
- ✅ Race condition prevention

---

**Terima kasih telah menggunakan Netflix Bot System! 🎬✨**
