# 📚 Struktur Database Netflix Bot

## Collections

### 1. `settings`

Menyimpan konfigurasi sistem, harga paket, dan token bot.

```javascript
{
  id: "main_settings",

  // Harga Paket
  prices: {
    premium: 50000,
    standard: 35000,
    basic: 25000
  },

  // Bot Configuration
  telegram_bot_token: "your_bot_token",
  whatsapp_enabled: true,

  // Payment Configuration
  qris_image_url: "https://example.com/qris.png",
  payment_account_name: "Netflix Bot Store",
  admin_number: "628123456789",

  // System Settings
  auto_delivery: true,
  maintenance_mode: false,

  // Timestamps
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### 2. `inventory`

Menyimpan data akun Netflix yang tersedia untuk dijual.

```javascript
{
  id: "auto_generated_id",

  // Account Details
  email: "account@netflix.com",
  password: "password123",
  profile_pin: "1234", // Optional

  // Package Info
  package_type: "premium", // premium | standard | basic

  // Status
  status: "ready", // ready | processing | sold

  // Buyer Info (filled when sold)
  buyer_id: "telegram_or_wa_id",
  buyer_name: "Customer Name",
  sold_at: Timestamp, // When sold

  // Timestamps
  created_at: Timestamp,
  updated_at: Timestamp
}
```

**Indexes:**

- `status` (ASC) + `created_at` (ASC) - For FIFO query
- `package_type` (ASC) + `status` (ASC)

### 3. `orders`

Menyimpan data transaksi pembelian.

```javascript
{
  id: "auto_generated_id",

  // Buyer Info
  buyer_id: "telegram_or_wa_id",
  buyer_name: "Customer Name",
  buyer_username: "telegram_username", // Optional
  buyer_number: "628123456789", // For WhatsApp

  // Order Details
  package_type: "premium",
  price: 50000,

  // Payment Status
  payment_status: "pending", // pending | paid | cancelled
  account_sent: false, // true when account delivered

  // Account Info (filled when delivered)
  account_id: "inventory_doc_id",
  account_email: "delivered@netflix.com",

  // Timestamps
  created_at: Timestamp,
  updated_at: Timestamp
}
```

**Indexes:**

- `payment_status` (ASC) + `created_at` (DESC)
- `buyer_id` (ASC) + `created_at` (DESC)

### 4. `admins`

Menyimpan data admin yang dapat mengakses dashboard.

```javascript
{
  id: "firebase_auth_uid",

  // Admin Info
  email: "admin@example.com",
  name: "Admin Name",
  role: "admin", // admin | super_admin

  // Permissions
  can_add_accounts: true,
  can_delete_accounts: true,
  can_view_analytics: true,
  can_manage_settings: true,

  // Timestamps
  created_at: Timestamp,
  updated_at: Timestamp,
  last_login: Timestamp
}
```

### 5. `analytics`

Menyimpan data analytics yang di-cache untuk performa.

```javascript
{
  id: "current",

  // Account Statistics
  totalAccounts: 150,
  readyAccounts: 45,
  soldAccounts: 100,

  // Order Statistics
  totalOrders: 95,
  paidOrders: 90,
  totalRevenue: 4500000,

  // Stock by Package
  accountsByPackage: {
    premium: {
      total: 80,
      ready: 20,
      sold: 55
    },
    standard: {
      total: 50,
      ready: 15,
      sold: 30
    },
    basic: {
      total: 20,
      ready: 10,
      sold: 15
    }
  },

  // Timestamps
  lastUpdated: Timestamp
}
```

### 6. `user_sessions`

Menyimpan session user untuk bot (WhatsApp).

```javascript
{
  id: "user_whatsapp_id",

  // Session Data
  step: "choosing_package", // choosing_package | waiting_payment
  order_id: "order_doc_id",
  package_type: "premium",
  price: 50000,

  // Timestamps
  started_at: "2024-01-01T00:00:00Z",
  updated_at: Timestamp
}
```

### 7. `transactions`

Untuk mencegah race condition saat multiple request bersamaan.

```javascript
{
  id: "transaction_id",

  // Transaction Info
  type: "account_purchase",
  account_id: "inventory_doc_id",
  buyer_id: "user_id",

  // Status
  status: "processing", // processing | completed | failed

  // Timestamps
  created_at: Timestamp,
  completed_at: Timestamp
}
```

## Data Flow

### 1. Admin Menambah Stok

```
Admin Dashboard → Firestore (inventory) → Cloud Function Trigger → Update Analytics
```

### 2. User Membeli Akun

```
Bot (Telegram/WA) → Create Order → User Transfer → Confirm Payment →
Get Available Account (FIFO + Transaction) → Mark as Sold →
Update Order → Send Account to User → Update Analytics
```

### 3. FIFO Logic (First In First Out)

```javascript
// Query untuk mendapatkan akun tertua yang ready
db.collection("inventory")
  .where("status", "==", "ready")
  .where("package_type", "==", "premium")
  .orderBy("created_at", "asc") // Oldest first
  .limit(1);
```

### 4. Race Condition Prevention

```javascript
// Menggunakan Firestore Transaction
db.runTransaction(async (transaction) => {
  // 1. Get account
  const account = await getOldestReadyAccount();

  // 2. Update status to 'processing' immediately
  transaction.update(accountRef, { status: "processing" });

  // 3. Return account
  return account;
});
```

## Security Rules Summary

- **settings**: Admin only (read & write)
- **inventory**:
  - Read: Authenticated users
  - Write: Admin only
  - Update status: Admin or Bot (limited fields)
- **orders**:
  - Create: Anyone (bot)
  - Read: Admin or owner
  - Update: Admin or owner (limited fields)
- **admins**: Admin only
- **analytics**: Admin only (read)
- **user_sessions**: Authenticated users (own session only)

## Best Practices

1. **Always use transactions** when getting available accounts
2. **Update analytics** after every inventory/order change
3. **Clean old sessions** regularly (Cloud Function scheduled)
4. **Validate data** before writing to Firestore
5. **Use server timestamps** for consistency
6. **Index frequently queried fields** for performance
7. **Implement proper error handling** in all operations
