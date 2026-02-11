import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import {
  getAvailableAccount,
  markAccountAsSold,
  createOrder,
  updateOrderStatus,
  getStockCount,
  saveUserSession,
  getUserSession,
  clearUserSession
} from './database.js';

dotenv.config();

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Prices
const PRICES = {
  premium: parseInt(process.env.PRICE_PREMIUM) || 50000,
  standard: parseInt(process.env.PRICE_STANDARD) || 35000,
  basic: parseInt(process.env.PRICE_BASIC) || 25000
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// ==================== EVENT HANDLERS ====================

client.on('qr', (qr) => {
  console.log('📱 Scan QR Code di bawah ini:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authenticated!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);
});

// ==================== MESSAGE HANDLER ====================

client.on('message', async (message) => {
  const chat = await message.getChat();
  const contact = await message.getContact();
  const userId = message.from;
  const userName = contact.pushname || contact.name || 'Customer';
  const userNumber = message.from.replace('@c.us', '');
  
  // Ignore group messages
  if (chat.isGroup) return;
  
  const text = message.body.trim().toLowerCase();
  
  try {
    // ==================== MENU COMMANDS ====================
    
    if (text === 'menu' || text === 'start' || text === 'hi' || text === 'halo') {
      const welcomeMessage = `
🎬 *Selamat Datang di Netflix Bot!*

Halo *${userName}*! 👋

Kami menyediakan akun Netflix Premium dengan harga terjangkau dan pengiriman otomatis instant!

✨ *Keunggulan Kami:*
• Pengiriman Otomatis & Instant
• Akun Premium Berkualitas
• Harga Terjangkau
• Support 24/7

━━━━━━━━━━━━━━━━━━━━
📋 *MENU UTAMA*

Ketik salah satu perintah:
• *harga* - Lihat daftar harga
• *stok* - Cek ketersediaan stok
• *beli* - Mulai order
• *bantuan* - Panduan & FAQ

━━━━━━━━━━━━━━━━━━━━

Silakan ketik perintah untuk memulai! 😊
      `;
      
      await message.reply(welcomeMessage);
      return;
    }
    
    // ==================== HARGA ====================
    
    if (text === 'harga' || text === 'price' || text === 'list') {
      const stockPremium = await getStockCount('premium');
      const stockStandard = await getStockCount('standard');
      const stockBasic = await getStockCount('basic');
      
      const priceList = `
💰 *DAFTAR HARGA NETFLIX*

┌─────────────────────────
│ 🌟 *PREMIUM*
│ ${formatCurrency(PRICES.premium)}/bulan
│ • 4K Ultra HD
│ • 4 Devices
│ • Stok: ${stockPremium} akun
└─────────────────────────

┌─────────────────────────
│ ⭐ *STANDARD*
│ ${formatCurrency(PRICES.standard)}/bulan
│ • Full HD
│ • 2 Devices
│ • Stok: ${stockStandard} akun
└─────────────────────────

┌─────────────────────────
│ ✨ *BASIC*
│ ${formatCurrency(PRICES.basic)}/bulan
│ • HD
│ • 1 Device
│ • Stok: ${stockBasic} akun
└─────────────────────────

📌 *Semua paket sudah termasuk:*
✅ Akun Netflix Original
✅ Garansi Replace
✅ Pengiriman Instant
✅ Support 24/7

Ketik *beli* untuk order!
      `;
      
      await message.reply(priceList);
      return;
    }
    
    // ==================== STOK ====================
    
    if (text === 'stok' || text === 'stock' || text === 'cek stok') {
      const stockPremium = await getStockCount('premium');
      const stockStandard = await getStockCount('standard');
      const stockBasic = await getStockCount('basic');
      
      const stockMessage = `
📦 *KETERSEDIAAN STOK*

🌟 Premium: *${stockPremium} akun*
⭐ Standard: *${stockStandard} akun*
✨ Basic: *${stockBasic} akun*

${stockPremium > 0 || stockStandard > 0 || stockBasic > 0 
  ? '✅ Stok tersedia! Silakan order sekarang.' 
  : '❌ Stok sedang habis. Mohon tunggu restock.'}

Ketik *beli* untuk order!
      `;
      
      await message.reply(stockMessage);
      return;
    }
    
    // ==================== BELI ====================
    
    if (text === 'beli' || text === 'order' || text === 'buy') {
      const buyMessage = `
🛒 *PILIH PAKET NETFLIX*

Silakan pilih paket dengan mengetik nomor:

1️⃣ Premium - ${formatCurrency(PRICES.premium)}
2️⃣ Standard - ${formatCurrency(PRICES.standard)}
3️⃣ Basic - ${formatCurrency(PRICES.basic)}

Contoh: Ketik *1* untuk Premium

Atau ketik *batal* untuk membatalkan.
      `;
      
      await saveUserSession(userId, {
        step: 'choosing_package',
        started_at: new Date().toISOString()
      });
      
      await message.reply(buyMessage);
      return;
    }
    
    // ==================== BANTUAN ====================
    
    if (text === 'bantuan' || text === 'help' || text === 'faq') {
      const helpMessage = `
❓ *BANTUAN & FAQ*

*Q: Bagaimana cara order?*
A: Ketik *beli* → Pilih paket → Transfer → Akun dikirim otomatis

*Q: Berapa lama proses pengiriman?*
A: Instant! Setelah pembayaran dikonfirmasi, akun langsung dikirim.

*Q: Apakah ada garansi?*
A: Ya, kami berikan garansi replace jika akun bermasalah.

*Q: Metode pembayaran apa saja?*
A: Saat ini kami menerima QRIS (semua e-wallet & bank).

*Q: Bagaimana cara konfirmasi pembayaran?*
A: Setelah transfer, balas dengan *sudah bayar*

━━━━━━━━━━━━━━━━━━━━

📞 *Butuh bantuan lebih lanjut?*
Hubungi admin: wa.me/${process.env.ADMIN_NUMBER}

💡 *Tips:*
• Pastikan saldo cukup sebelum order
• Screenshot bukti transfer untuk jaga-jaga
• Jangan share akun ke orang lain

Ketik *menu* untuk kembali ke menu utama.
      `;
      
      await message.reply(helpMessage);
      return;
    }
    
    // ==================== SESSION HANDLING ====================
    
    const session = await getUserSession(userId);
    
    if (session) {
      // User is in a session
      
      if (text === 'batal' || text === 'cancel') {
        await clearUserSession(userId);
        await message.reply('✅ Proses dibatalkan.\n\nKetik *menu* untuk memulai lagi.');
        return;
      }
      
      // ==================== CHOOSING PACKAGE ====================
      
      if (session.step === 'choosing_package') {
        let packageType = null;
        
        if (text === '1' || text === 'premium') {
          packageType = 'premium';
        } else if (text === '2' || text === 'standard') {
          packageType = 'standard';
        } else if (text === '3' || text === 'basic') {
          packageType = 'basic';
        } else {
          await message.reply('❌ Pilihan tidak valid.\n\nSilakan ketik 1, 2, atau 3.\nAtau ketik *batal* untuk membatalkan.');
          return;
        }
        
        // Check stock
        const stock = await getStockCount(packageType);
        if (stock === 0) {
          await message.reply(`❌ Maaf, stok untuk paket *${packageType}* sedang habis.\n\nSilakan pilih paket lain atau ketik *batal*.`);
          return;
        }
        
        const price = PRICES[packageType];
        
        // Create order
        const orderId = await createOrder({
          buyer_id: userId,
          buyer_name: userName,
          buyer_number: userNumber,
          package_type: packageType,
          price: price
        });
        
        // Send payment instruction
        const paymentMessage = `
🛒 *DETAIL PESANAN*

📦 Paket: *${packageType.toUpperCase()}*
💰 Harga: *${formatCurrency(price)}*
🆔 Order ID: ${orderId}

━━━━━━━━━━━━━━━━━━━━
💳 *PEMBAYARAN*

Silakan transfer ke:
📱 QRIS (Scan gambar yang dikirim)

Atas Nama: *${process.env.PAYMENT_ACCOUNT_NAME || 'Netflix Bot Store'}*

━━━━━━━━━━━━━━━━━━━━

⏰ Setelah transfer, balas dengan:
*sudah bayar*

⚠️ *Penting:*
• Pastikan nominal transfer sesuai
• Simpan bukti transfer
• Akun akan dikirim otomatis setelah konfirmasi

Ketik *batal* untuk membatalkan pesanan.
        `;
        
        await message.reply(paymentMessage);
        
        // Send QRIS image if available
        if (process.env.QRIS_IMAGE_URL) {
          // Note: You might need to use MessageMedia for images
          await message.reply('📱 QRIS akan dikirim terpisah oleh admin.');
        }
        
        // Update session
        await saveUserSession(userId, {
          step: 'waiting_payment',
          order_id: orderId,
          package_type: packageType,
          price: price
        });
        
        return;
      }
      
      // ==================== WAITING PAYMENT ====================
      
      if (session.step === 'waiting_payment') {
        if (text === 'sudah bayar' || text === 'bayar' || text === 'paid' || text === 'lunas') {
          await message.reply('⏳ *Memproses pembayaran Anda...*\n\nMohon tunggu sebentar.');
          
          try {
            // Get available account with FIFO
            const account = await getAvailableAccount(session.package_type);
            
            // Mark account as sold
            await markAccountAsSold(account.id, userId, userName);
            
            // Update order status
            await updateOrderStatus(session.order_id, 'paid', true);
            
            // Send account details
            const accountMessage = `
✅ *PEMBAYARAN BERHASIL!*

Terima kasih atas pembelian Anda! 🎉

━━━━━━━━━━━━━━━━━━━━
🎬 *DETAIL AKUN NETFLIX*

📧 Email: \`${account.email}\`
🔑 Password: \`${account.password}\`
${account.profile_pin ? `📌 PIN: \`${account.profile_pin}\`` : ''}

━━━━━━━━━━━━━━━━━━━━

📱 *Cara Login:*
1. Buka netflix.com
2. Masukkan email & password di atas
3. Pilih profile
4. Selamat menonton! 🍿

⚠️ *PENTING:*
• Jangan ganti password
• Jangan share ke orang lain
• Simpan data ini baik-baik

💡 Jika ada masalah, hubungi admin.

Terima kasih & selamat menikmati! 🎬✨

━━━━━━━━━━━━━━━━━━━━
Ketik *menu* untuk order lagi.
            `;
            
            await message.reply(accountMessage);
            
            // Clear session
            await clearUserSession(userId);
            
          } catch (error) {
            console.error('Error processing payment:', error);
            await message.reply(`❌ *Maaf, terjadi kesalahan!*\n\n${error.message}\n\nSilakan hubungi admin untuk bantuan.`);
          }
          
          return;
        } else {
          await message.reply('⏳ Menunggu konfirmasi pembayaran.\n\nSetelah transfer, balas dengan *sudah bayar*\n\nAtau ketik *batal* untuk membatalkan.');
          return;
        }
      }
    }
    
    // ==================== DEFAULT RESPONSE ====================
    
    await message.reply(`
Maaf, saya tidak mengerti perintah "${message.body}" 🤔

Ketik *menu* untuk melihat daftar perintah.
    `);
    
  } catch (error) {
    console.error('Error handling message:', error);
    await message.reply('❌ Terjadi kesalahan. Silakan coba lagi atau hubungi admin.');
  }
});

// ==================== START CLIENT ====================

client.initialize()
  .then(() => {
    console.log('🚀 WhatsApp Bot initializing...');
  })
  .catch((error) => {
    console.error('Failed to initialize WhatsApp client:', error);
    process.exit(1);
  });

export default client;
