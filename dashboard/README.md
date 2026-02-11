# 📱 Dashboard Admin - Netflix Bot System

Dashboard admin untuk mengelola inventory, melihat analytics, dan monitoring sistem penjualan Netflix.

## 🎨 Features

- ✅ **Authentication** - Login dengan Firebase Auth
- ✅ **Inventory Management** - Tambah, edit, hapus akun (satuan & bulk)
- ✅ **Real-time Updates** - Auto-update dengan Firestore listeners
- ✅ **Analytics Dashboard** - Statistik penjualan & stok
- ✅ **Search & Filter** - Cari dan filter inventory
- ✅ **Dark Mode** - Modern dark theme dengan Tailwind CSS
- ✅ **Responsive** - Mobile-friendly design

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling & dark mode
- **Firebase** - Backend (Auth, Firestore)
- **React Router** - Routing
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

1. Copy environment file:

```bash
cp .env.example .env
```

2. Edit `.env` dengan Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🚀 Development

```bash
npm run dev
```

Dashboard akan berjalan di: `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

Output akan ada di folder `dist/`

## 📁 Structure

```
src/
├── components/          # Reusable components
│   ├── AddAccountModal.jsx
│   ├── AnalyticsDashboard.jsx
│   └── InventoryTable.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   └── Login.jsx
├── services/           # Firebase services
│   ├── firebase.js
│   └── firestore.js
├── App.jsx             # Main app
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Components

### AddAccountModal

Modal untuk menambah akun dengan 2 mode:

- **Input Satuan** - Tambah 1 akun
- **Input Bulk** - Tambah banyak akun sekaligus

### AnalyticsDashboard

Dashboard analytics dengan:

- Total stok & terjual
- Total pendapatan
- Stok per paket
- Progress bars

### InventoryTable

Tabel inventory dengan:

- Real-time updates
- Search functionality
- Filter by status
- Delete action

## 🔐 Authentication

Login menggunakan Firebase Authentication:

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

## 💾 Firestore Operations

### Add Account (Single)

```javascript
await addSingleAccount({
  email: 'account@netflix.com',
  password: 'password123',
  profile_pin: '1234',
  package_type: 'premium',
});
```

### Add Accounts (Bulk)

```javascript
await addBulkAccounts([
  { email: 'acc1@netflix.com', password: 'pass1', ... },
  { email: 'acc2@netflix.com', password: 'pass2', ... }
]);
```

### Subscribe to Inventory

```javascript
const unsubscribe = subscribeToInventory((accounts) => {
  setAccounts(accounts);
});
```

## 🎨 Styling

Menggunakan Tailwind CSS dengan custom theme:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      netflix: {
        red: '#E50914',
        black: '#141414',
      },
      dark: {
        bg: '#0F0F0F',
        card: '#1A1A1A',
      }
    }
  }
}
```

## 🚀 Deployment

Deploy ke Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## 📝 Environment Variables

| Variable                            | Description                  |
| ----------------------------------- | ---------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API Key             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain         |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID              |

## 🐛 Troubleshooting

### Build Error

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Connection Error

- Check `.env` configuration
- Verify Firebase project settings
- Check internet connection

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
