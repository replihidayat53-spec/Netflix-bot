# 📡 API Documentation - Netflix Bot System

## Overview

Netflix Bot System menyediakan beberapa API endpoints melalui Firebase Cloud Functions untuk integrasi dan monitoring.

Base URL: `https://[region]-[project-id].cloudfunctions.net`

## Authentication

Untuk endpoint yang memerlukan authentication, gunakan Firebase ID Token di header:

```
Authorization: Bearer [firebase_id_token]
```

## Endpoints

### 1. Health Check

**GET** `/healthCheck`

Mengecek status Cloud Functions.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Netflix Bot Functions are running"
}
```

---

### 2. Get Analytics

**GET** `/getAnalytics`

Mendapatkan data analytics sistem.

**Response:**

```json
{
  "totalAccounts": 150,
  "readyAccounts": 45,
  "soldAccounts": 100,
  "totalOrders": 95,
  "paidOrders": 90,
  "totalRevenue": 4500000,
  "accountsByPackage": {
    "premium": {
      "total": 80,
      "ready": 20,
      "sold": 55
    },
    "standard": {
      "total": 50,
      "ready": 15,
      "sold": 30
    },
    "basic": {
      "total": 20,
      "ready": 10,
      "sold": 15
    }
  },
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

---

### 3. Update Analytics (Manual)

**POST** `/updateAnalyticsManual`

Memaksa update analytics secara manual.

**Response:**

```json
{
  "success": true,
  "message": "Analytics updated successfully"
}
```

---

### 4. Get Stock Status

**GET** `/getStockStatus`

Mendapatkan status stok real-time.

**Response:**

```json
{
  "total": 45,
  "byPackage": {
    "premium": 20,
    "standard": 15,
    "basic": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Firestore REST API

Anda juga bisa mengakses Firestore langsung via REST API.

Base URL: `https://firestore.googleapis.com/v1/projects/[project-id]/databases/(default)/documents`

### Get All Inventory

**GET** `/inventory`

**Headers:**

```
Authorization: Bearer [firebase_id_token]
```

### Create Order

**POST** `/orders`

**Headers:**

```
Authorization: Bearer [firebase_id_token]
Content-Type: application/json
```

**Body:**

```json
{
  "fields": {
    "buyer_id": { "stringValue": "123456789" },
    "buyer_name": { "stringValue": "Customer Name" },
    "package_type": { "stringValue": "premium" },
    "price": { "integerValue": "50000" },
    "payment_status": { "stringValue": "pending" },
    "account_sent": { "booleanValue": false }
  }
}
```

---

## Webhook Integration

### Inventory Update Webhook

Ketika ada akun baru ditambahkan, Cloud Function `onAccountAdded` akan trigger.

Anda bisa menambahkan webhook notification di function ini:

```javascript
export const onAccountAdded = onDocumentCreated(
  "inventory/{accountId}",
  async (event) => {
    const accountData = event.data.data();

    // Send webhook notification
    await fetch("https://your-webhook-url.com/inventory-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "inventory_added",
        account_id: event.params.accountId,
        package_type: accountData.package_type,
        timestamp: new Date().toISOString(),
      }),
    });
  },
);
```

### Order Created Webhook

```javascript
export const onOrderCreated = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const orderData = event.data.data();

    // Send webhook notification
    await fetch("https://your-webhook-url.com/order-created", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "order_created",
        order_id: event.params.orderId,
        buyer_id: orderData.buyer_id,
        package_type: orderData.package_type,
        price: orderData.price,
        timestamp: new Date().toISOString(),
      }),
    });
  },
);
```

---

## Bot API Integration

### Telegram Bot Webhook (Optional)

Jika ingin menggunakan webhook instead of polling:

```javascript
// Set webhook
await bot.telegram.setWebhook("https://your-domain.com/telegram-webhook");

// Cloud Function handler
export const telegramWebhook = onRequest(async (req, res) => {
  await bot.handleUpdate(req.body);
  res.sendStatus(200);
});
```

### WhatsApp Business API (Optional)

Untuk production WhatsApp, gunakan WhatsApp Business API:

```javascript
// Send message via WhatsApp Business API
await fetch("https://graph.facebook.com/v17.0/[phone-id]/messages", {
  method: "POST",
  headers: {
    Authorization: "Bearer [access-token]",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messaging_product: "whatsapp",
    to: "628123456789",
    type: "text",
    text: {
      body: "Your Netflix account: ...",
    },
  }),
});
```

---

## Rate Limiting

Untuk mencegah abuse, implementasikan rate limiting:

```javascript
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
});

export const protectedEndpoint = onRequest(async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);
    // Process request
  } catch (error) {
    res.status(429).json({ error: "Too many requests" });
  }
});
```

---

## Error Codes

| Code | Message               | Description              |
| ---- | --------------------- | ------------------------ |
| 200  | OK                    | Request berhasil         |
| 400  | Bad Request           | Request tidak valid      |
| 401  | Unauthorized          | Token tidak valid        |
| 403  | Forbidden             | Tidak ada permission     |
| 404  | Not Found             | Resource tidak ditemukan |
| 429  | Too Many Requests     | Rate limit exceeded      |
| 500  | Internal Server Error | Server error             |

---

## SDK Examples

### JavaScript/Node.js

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get all inventory
const inventorySnapshot = await getDocs(collection(db, "inventory"));
const accounts = inventorySnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

### Python

```python
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

# Get all inventory
inventory_ref = db.collection('inventory')
docs = inventory_ref.stream()

for doc in docs:
    print(f'{doc.id} => {doc.to_dict()}')
```

### cURL

```bash
# Get Analytics
curl -X GET \
  https://[region]-[project-id].cloudfunctions.net/getAnalytics

# Get Stock Status
curl -X GET \
  https://[region]-[project-id].cloudfunctions.net/getStockStatus

# Update Analytics
curl -X POST \
  https://[region]-[project-id].cloudfunctions.net/updateAnalyticsManual
```

---

## Monitoring & Logging

### View Cloud Functions Logs

```bash
firebase functions:log
```

### View Specific Function Logs

```bash
firebase functions:log --only onAccountAdded
```

### Real-time Logs

```bash
firebase functions:log --follow
```

---

## Best Practices

1. **Always use HTTPS** untuk semua API calls
2. **Validate input** sebelum processing
3. **Implement rate limiting** untuk mencegah abuse
4. **Use transactions** untuk operasi critical
5. **Log all errors** untuk debugging
6. **Cache responses** jika memungkinkan
7. **Use environment variables** untuk secrets
8. **Implement retry logic** untuk external API calls

---

## Support

Untuk pertanyaan atau issue terkait API:

- Check Firebase Console Logs
- Review Cloud Functions documentation
- Contact system administrator
