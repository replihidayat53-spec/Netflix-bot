# 🚨 ACTION REQUIRED: Create Firestore Index

Bot mengalami error saat konsumen mencoba membeli karena **Index Firestore belum dibuat**.

Query yang gagal:

- **Collection:** `inventory`
- **Fields:** `status`, `package_type`, `created_at`

## ✅ Solusi: Buat Index (1 Klik)

Klik link di bawah ini untuk membuat index secara otomatis di Firebase Console:

👉 **[KLIK DI SINI UNTUK MEMBUAT INDEX KE FIRESTORE](https://console.firebase.google.com/v1/r/project/netflix-bot-edf05/firestore/indexes?create_composite=ClNwcm9qZWN0cy9uZXRmbGl4LWJvdC1lZGYwNS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvaW52ZW50b3J5L2luZGV4ZXMvXxABGhAKDHBhY2thZ2VfdHlwZRABGgoKBnN0YXR1cxABGg4KCmNyZWF0ZWRfYXQQARoMCghfX25hbWVfXxAB)** 👈

### Langkah-langkah:

1. Klik link di atas.
2. Anda akan diarahkan ke Firebase Console.
3. Klik tombol **"Create Index"** atau **"Save"**.
4. Tunggu hingga status Index berubah dari **"Building"** menjadi **"Enabled"** (biasanya 2-5 menit).
5. Setelah selesai, coba lakukan pembelian lagi di Bot.

⚠️ **PENTING:** Bot TIDAK AKAN bisa memproses pembelian sebelum index ini dibuat.
