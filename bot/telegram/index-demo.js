import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Admin Telegram ID
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID;

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

// ==================== COMMANDS ====================

/**
 * /start Command
 */
bot.command('start', async (ctx) => {
  const userName = ctx.from.first_name || 'Kawan';
  
  const welcomeMessage = `
🎬 *Selamat Datang di Netflix Bot!*

Halo ${userName}! 👋

Kami menyediakan akun Netflix Premium dengan harga terjangkau dan pengiriman otomatis instant!

✨ *Keunggulan Kami:*
• Pengiriman Otomatis & Instant
• Akun Premium Berkualitas
• Harga Terjangkau
• Support 24/7

Gunakan menu di bawah untuk memulai:
  `;
  
  await ctx.replyWithMarkdown(welcomeMessage, 
    Markup.keyboard([
      ['📋 Daftar Harga', '🛒 Beli Sekarang'],
      ['📦 Cek Stok', '❓ Bantuan']
    ]).resize()
  );
});

/**
 * Daftar Harga
 */
bot.hears('📋 Daftar Harga', async (ctx) => {
  const priceList = `
💰 *DAFTAR HARGA NETFLIX*

┌─────────────────────────
│ 🌟 *PREMIUM*
│ ${formatCurrency(PRICES.premium)}/bulan
│ • 4K Ultra HD
│ • 4 Devices
│ • Stok: Ready ✅
└─────────────────────────

┌─────────────────────────
│ ⭐ *STANDARD*
│ ${formatCurrency(PRICES.standard)}/bulan
│ • Full HD
│ • 2 Devices
│ • Stok: Ready ✅
└─────────────────────────

┌─────────────────────────
│ ✨ *BASIC*
│ ${formatCurrency(PRICES.basic)}/bulan
│ • HD
│ • 1 Device
│ • Stok: Ready ✅
└─────────────────────────

📌 *Semua paket sudah termasuk:*
✅ Akun Netflix Original
✅ Garansi Replace
✅ Pengiriman Instant
✅ Support 24/7

Klik "🛒 Beli Sekarang" untuk order!
  `;
  
  await ctx.replyWithMarkdown(priceList);
});

/**
 * Cek Stok
 */
bot.hears('📦 Cek Stok', async (ctx) => {
  const stockMessage = `
📦 *KETERSEDIAAN STOK*

🌟 Premium: *Ready* ✅
⭐ Standard: *Ready* ✅
✨ Basic: *Ready* ✅

✅ Stok tersedia! Silakan order sekarang.

⚠️ *Note:* Bot sedang dalam mode DEMO.
Untuk order real, hubungi admin.
  `;
  
  await ctx.replyWithMarkdown(stockMessage);
});

/**
 * Beli Sekarang
 */
bot.hears('🛒 Beli Sekarang', async (ctx) => {
  await ctx.replyWithMarkdown(
    '🛒 *Pilih Paket Netflix:*\n\nSilakan pilih paket yang Anda inginkan:',
    Markup.inlineKeyboard([
      [Markup.button.callback(`🌟 Premium - ${formatCurrency(PRICES.premium)}`, 'buy_premium')],
      [Markup.button.callback(`⭐ Standard - ${formatCurrency(PRICES.standard)}`, 'buy_standard')],
      [Markup.button.callback(`✨ Basic - ${formatCurrency(PRICES.basic)}`, 'buy_basic')],
      [Markup.button.callback('❌ Batal', 'cancel')]
    ])
  );
});

/**
 * Bantuan
 */
bot.hears('❓ Bantuan', async (ctx) => {
  const helpMessage = `
❓ *BANTUAN & FAQ*

*Q: Bagaimana cara order?*
A: Klik "🛒 Beli Sekarang" → Pilih paket → Transfer → Akun dikirim otomatis

*Q: Berapa lama proses pengiriman?*
A: Instant! Setelah pembayaran dikonfirmasi, akun langsung dikirim.

*Q: Apakah ada garansi?*
A: Ya, kami berikan garansi replace jika akun bermasalah.

*Q: Metode pembayaran apa saja?*
A: Saat ini kami menerima QRIS (semua e-wallet & bank).

*Q: Bagaimana cara konfirmasi pembayaran?*
A: Setelah transfer, klik tombol "Sudah Bayar" yang muncul.

📞 *Butuh bantuan lebih lanjut?*
Hubungi admin: @admin_username

⚠️ *Note:* Bot sedang dalam mode DEMO.
Database Firebase belum terhubung.
  `;
  
  await ctx.replyWithMarkdown(helpMessage);
});

// ==================== CALLBACK QUERIES ====================

/**
 * Handle Buy Package
 */
bot.action(/buy_(premium|standard|basic)/, async (ctx) => {
  const packageType = ctx.match[1];
  const price = PRICES[packageType];
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'Customer';
  const userUsername = ctx.from.username || '';
  
  try {
    // Generate fake order ID for demo
    const orderId = 'DEMO-' + Date.now();
    
    // Send payment instruction
    const paymentMessage = `
🛒 *DETAIL PESANAN*

📦 Paket: *${packageType.toUpperCase()}*
💰 Harga: *${formatCurrency(price)}*
🆔 Order ID: \`${orderId}\`

━━━━━━━━━━━━━━━━━━━━
💳 *PEMBAYARAN*

Silakan transfer ke:
📱 QRIS (akan dikirim)

Atas Nama: *${process.env.PAYMENT_ACCOUNT_NAME || 'Netflix Bot Store'}*

━━━━━━━━━━━━━━━━━━━━

⏰ Setelah transfer, klik tombol "Sudah Bayar" di bawah.

⚠️ *DEMO MODE:*
Bot ini sedang dalam mode demo.
Untuk order real, hubungi admin.
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Sudah Bayar (DEMO)', `confirm_${orderId}`)],
      [Markup.button.callback('❌ Batalkan Pesanan', `cancel_${orderId}`)]
    ]);
    
    await ctx.replyWithMarkdown(paymentMessage, keyboard);
    await ctx.answerCbQuery('✅ Pesanan dibuat (DEMO)!');
    
    // Send notification to admin
    if (ADMIN_ID) {
      try {
        await bot.telegram.sendMessage(
          ADMIN_ID,
          `🔔 *PESANAN BARU (DEMO)!*\n\n` +
          `👤 Customer: ${userName} (@${userUsername || 'no username'})\n` +
          `📦 Paket: ${packageType.toUpperCase()}\n` +
          `💰 Harga: ${formatCurrency(price)}\n` +
          `🆔 Order ID: \`${orderId}\`\n` +
          `⏰ Status: Demo Mode`,
          { parse_mode: 'Markdown' }
        );
      } catch (adminError) {
        console.error('Error sending admin notification:', adminError);
      }
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    await ctx.answerCbQuery('❌ Terjadi kesalahan!');
    await ctx.replyWithMarkdown('❌ Maaf, terjadi kesalahan. Silakan coba lagi.');
  }
});

/**
 * Handle Payment Confirmation
 */
bot.action(/confirm_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'Customer';
  
  try {
    await ctx.answerCbQuery('⏳ Memproses pembayaran (DEMO)...');
    await ctx.replyWithMarkdown('⏳ *Memproses pembayaran Anda...*\n\nMohon tunggu sebentar.');
    
    // Demo account
    const demoAccount = {
      email: 'demo@netflix.com',
      password: 'DemoPassword123',
      profile_pin: '1234'
    };
    
    // Send account details
    const accountMessage = `
✅ *PEMBAYARAN BERHASIL (DEMO)!*

Terima kasih atas pembelian Anda! 🎉

━━━━━━━━━━━━━━━━━━━━
🎬 *DETAIL AKUN NETFLIX*

📧 Email: \`${demoAccount.email}\`
🔑 Password: \`${demoAccount.password}\`
📌 PIN: \`${demoAccount.profile_pin}\`

━━━━━━━━━━━━━━━━━━━━

📱 *Cara Login:*
1. Buka netflix.com
2. Masukkan email & password di atas
3. Pilih profile
4. Selamat menonton! 🍿

⚠️ *DEMO MODE:*
Ini adalah akun demo untuk testing.
Untuk akun real, hubungi admin.

⚠️ *PENTING:*
• Jangan ganti password
• Jangan share ke orang lain
• Simpan data ini baik-baik

💡 Jika ada masalah, hubungi admin.

Terima kasih & selamat menikmati! 🎬✨
    `;
    
    await ctx.replyWithMarkdown(accountMessage);
    
    // Send notification to admin
    if (ADMIN_ID) {
      try {
        await bot.telegram.sendMessage(
          ADMIN_ID,
          `✅ *PEMBAYARAN BERHASIL (DEMO)!*\n\n` +
          `👤 Customer: ${userName} (ID: ${userId})\n` +
          `🆔 Order ID: \`${orderId}\`\n` +
          `📧 Akun: ${demoAccount.email}\n` +
          `✅ Status: Demo - Akun Terkirim`,
          { parse_mode: 'Markdown' }
        );
      } catch (adminError) {
        console.error('Error sending admin notification:', adminError);
      }
    }
    
  } catch (error) {
    console.error('Error processing payment:', error);
    await ctx.replyWithMarkdown(
      `❌ *Maaf, terjadi kesalahan!*\n\n${error.message}\n\nSilakan hubungi admin untuk bantuan.`
    );
  }
});

/**
 * Handle Cancel Order
 */
bot.action(/cancel_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  
  try {
    await ctx.answerCbQuery('✅ Pesanan dibatalkan');
    await ctx.replyWithMarkdown('✅ Pesanan Anda telah dibatalkan.\n\nSilakan order kembali jika berminat.');
  } catch (error) {
    console.error('Error cancelling order:', error);
    await ctx.answerCbQuery('❌ Gagal membatalkan');
  }
});

/**
 * Handle Cancel Button
 */
bot.action('cancel', async (ctx) => {
  await ctx.answerCbQuery('Dibatalkan');
  await ctx.deleteMessage();
});

// ==================== ERROR HANDLING ====================

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi atau hubungi admin.');
});

// ==================== START BOT ====================

bot.launch()
  .then(() => {
    console.log('🤖 Telegram Bot started successfully! (DEMO MODE)');
    console.log('Bot username:', bot.botInfo.username);
    console.log('⚠️  Firebase not connected - running in DEMO mode');
    console.log('📝 To connect Firebase, add Service Account key to .env');
  })
  .catch((error) => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
