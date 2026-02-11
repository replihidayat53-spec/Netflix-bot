# 🔥 Firestore Rules untuk Netflix Bot

## ⚠️ Masalah Umum: Permission Denied

Jika Anda mendapat error **"Permission denied"** saat menambahkan akun, ini karena Firestore Rules belum dikonfigurasi dengan benar.

## ✅ Solusi: Update Firestore Rules

### **Cara 1: Via Firebase Console (Recommended)**

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project: **netflix-bot-edf05**
3. Klik **Firestore Database** di menu kiri
4. Klik tab **Rules**
5. Replace semua rules dengan kode berikut:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function untuk cek apakah user adalah admin
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Inventory Collection - Hanya admin yang bisa akses
    match /inventory/{accountId} {
      allow read, write: if isAdmin();
    }

    // Orders Collection - Admin bisa full access
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }

    // Admins Collection - Hanya admin yang bisa baca
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if false; // Tidak ada yang bisa write (hanya via Admin SDK)
    }

    // Settings Collection - Hanya admin
    match /settings/{settingId} {
      allow read, write: if isAdmin();
    }
  }
}
```

6. Klik **Publish**

---

### **Cara 2: Rules Sementara untuk Development (TIDAK AMAN untuk Production)**

Jika Anda ingin testing cepat tanpa authentication, gunakan rules ini:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** Rules ini mengizinkan semua user yang ter-autentikasi untuk read/write semua data. Jangan gunakan di production!

---

### **Cara 3: Rules Production (Paling Aman)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Inventory - Admin only
    match /inventory/{accountId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Orders - Admin full access, users can read their own
    match /orders/{orderId} {
      allow read: if isAdmin() ||
                     (isAuthenticated() && resource.data.buyer_id == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Admins - Read only for admins
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // Settings - Admin only
    match /settings/{settingId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

---

## 🔍 Cara Cek Error

Buka **Browser Console** (F12) dan lihat error message. Jika ada:

- **"Missing or insufficient permissions"** → Rules belum dikonfigurasi
- **"PERMISSION_DENIED"** → User tidak punya akses
- **"Unauthenticated"** → User belum login

---

## ✅ Verifikasi

Setelah update rules:

1. Refresh dashboard
2. Coba tambah akun lagi
3. Jika masih error, cek console browser untuk detail error

---

## 📝 Catatan Penting

1. **Admin Collection**: Pastikan Anda sudah membuat document di collection `admins` dengan UID user sebagai document ID
2. **Authentication**: User harus login terlebih dahulu
3. **Rules Propagation**: Perubahan rules bisa memakan waktu beberapa detik

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"

**Solusi:**

1. Pastikan Firestore Rules sudah di-publish
2. Pastikan user sudah login
3. Pastikan ada document di `admins` collection dengan UID user

### Error: "Document doesn't exist"

**Solusi:**

1. Buat admin user terlebih dahulu
2. Pastikan document ID di `admins` collection sama dengan UID user

### Error: "Network error"

**Solusi:**

1. Cek koneksi internet
2. Pastikan Firebase project sudah aktif
3. Cek Firebase Console untuk status service

---

**Last Updated:** 2026-02-10
**Status:** Ready to Use
