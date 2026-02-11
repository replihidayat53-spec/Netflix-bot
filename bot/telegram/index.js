import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import {
  getAvailableAccount,
  markAccountAsSold,
  createOrder,
  updateOrderStatus,
  getStockCount,
  getOrder,
  getUser,
  getAllUsers,
  getPendingBroadcasts,
  updateBroadcastStatus,
  getPrices,
  deductUserBalance,
  redeemVoucher
} from './database.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Admin Telegram ID
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID;

// Channel ID for auto-posting
const CHANNEL_ID = process.env.CHANNEL_ID;

// Helper: Post to Channel
const postToChannel = async (message) => {
  if (!CHANNEL_ID) return;
  try {
    await bot.telegram.sendMessage(CHANNEL_ID, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error posting to channel:', error.message);
  }
};

// Helper: Get Pricing Role Key
const getRoleKey = (role) => {
    if (!role) return 'customer';
    const r = role.toLowerCase();
    if (r === 'admin') return 'reseller_gold'; // Admin gets gold pricing
    if (r.includes('gold')) return 'reseller_gold';
    // Default reseller fallback to silver if not specified
    if (r.includes('silver') || r.includes('reseller')) return 'reseller_silver';
    return 'customer';
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper: Clean Role Text
const formatRole = (role) => {
    if (!role) return 'Customer';
    if (role === 'admin') return 'Admin 👑';
    return role.toUpperCase().replace(/_/g, ' ');
};

// ==================== MIDDLEWARE DEBUG ====================
bot.use((ctx, next) => {
  if (ctx.message && ctx.message.text) {
    console.log(`[DEBUG] Incoming Text: "${ctx.message.text}"`);
  }
  return next();
});

// ==================== COMMANDS ====================

/**
 * /start Command (HTML)
 */
bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'Kawan';
  let userRole = 'customer';
  
  try {
    const user = await getUser(ctx.from.id, {
      first_name: ctx.from.first_name,
      username: ctx.from.username
    });
    userRole = user.role || 'customer';
  } catch (err) {
    console.error('Error registering user:', err);
  }
  
  const safeUserName = userName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let welcomeMessage = `
🎬 <b>Selamat Datang di Netflix Bot!</b>

Halo <b>${safeUserName}</b>! 👋
Kami menyediakan akun Netflix Premium Legal & Bergaransi.
`;

  const isResellerOrAdmin = userRole.includes('reseller') || userRole.includes('gold') || userRole.includes('silver') || userRole === 'admin';

  if (isResellerOrAdmin) {
      welcomeMessage += `\n💎 <b>Status: ${formatRole(userRole)}</b> 💎\nNikmati harga spesial termurah!`;
  } else {
      welcomeMessage += `\n🤖 <b>Fitur Bot:</b>\n• Beli akun otomatis 24 jam\n• Cek stok real-time\n• Pembayaran QRIS otomatis\n• Garansi & Support`;
  }

  welcomeMessage += `\n\n👇 <b>Silakan pilih menu di bawah ini:</b>`;

  let buttons = [
      ['🛒 Beli Sekarang', '📦 Cek Stok'],
      ['💰 Daftar Harga', '👤 Profile Saya'],
      ['🎟️ Redeem Voucher']
  ];

  if (isResellerOrAdmin) {
      buttons.push(['💳 Topup Saldo', '💎 Info Reseller']);
  }
  
  // Admin logic: Check .env ID OR Firestore role
  const isAdmin = userId.toString() === ADMIN_ID || userRole === 'admin';
  
  if (isAdmin) {
      buttons.push(['📢 Post Stok ke Channel']);
  }

  buttons.push(['❓ Bantuan', '📞 Hubungi Admin']);

  await ctx.replyWithHTML(welcomeMessage, 
    Markup.keyboard(buttons).resize()
  );
});

/**
 * 💳 Topup Saldo Handler
 */
bot.hears([/Topup/i, /Saldo/i, '💳 Topup Saldo'], async (ctx) => {
  try {
    await ctx.replyWithHTML(
        `💳 <b>TOPUP SALDO RESELLER</b>\n\n` +
        `Untuk melakukan isi ulang saldo, silakan transfer ke rekening admin dan kirim bukti transfer.\n\n` +
        `Minimal Topup: <b>Rp 50.000</b>\n\n` +
        `Konfirmasi ke Admin:\n` +
        `👨‍💻 @Revmore16\n\n` +
        `<i>Saldo akan bertambah otomatis setelah dikonfirmasi admin.</i>`
    );
  } catch (error) {
      console.error('Error in Topup Handler:', error);
      ctx.reply('❌ Terjadi kesalahan format pesan.');
  }
});

/**
 * 💎 Info Reseller Handler
 */
bot.hears(/Info Reseller/i, async (ctx) => {
  await ctx.replyWithHTML(
    `💎 <b>KEUNTUNGAN RESELLER</b>\n\n` +
    `1.  <b>Harga Lebih Murah</b> (Potongan s/d 15rb/akun)\n` +
    `2.  <b>Prioritas Support</b>\n` +
    `3.  <b>Tanpa Repot Transfer</b> (Potong Saldo)\n` +
    `4.  <b>Akses Stok Prioritas</b>\n\n` +
    `Ingin Upgrade jadi Reseller?\n` +
    `Hubungi Admin: @Revmore16`
  );
});

/**
 * 💰 Daftar Harga Handler (Updated for Role)
 */
bot.hears(/Daftar Harga/i, async (ctx) => {
  const userId = ctx.from.id;
  try {
    const user = await getUser(userId);
    const role = user.role || 'customer';
    const roleKey = getRoleKey(role);
    
    // Get full pricing structure
    const allPrices = await getPrices();
    // Select prices based on role
    const prices = allPrices[roleKey] || allPrices.customer;
    
    let msg = `💰 <b>DAFTAR HARGA NETFLIX</b>\n`;
    if (roleKey !== 'customer') {
        msg += `💎 <b>Special Price for ${formatRole(role)}</b>\n\n`;
    } else {
        msg += `👤 <b>Harga Customer</b>\n\n`;
    }

    msg += `🌟 <b>Premium (4K UHD)</b>\n`;
    msg += `   └ Harga: ${formatCurrency(prices.premium)} / bulan\n`;
    msg += `   └ Fitur: 4 Device, Ultra HD, Download\n\n`;
    
    msg += `⭐ <b>Standard (FHD)</b>\n`;
    msg += `   └ Harga: ${formatCurrency(prices.standard)} / bulan\n`;
    msg += `   └ Fitur: 2 Device, Full HD\n\n`;
    
    msg += `✨ <b>Basic (HD)</b>\n`;
    msg += `   └ Harga: ${formatCurrency(prices.basic)} / bulan\n`;
    msg += `   └ Fitur: 1 Device, HD\n\n`;

    msg += `💎 <b>Sharing (1 Device)</b>\n`;
    msg += `   └ Harga: ${formatCurrency(prices.sharing || 0)} / bulan\n`;
    msg += `   └ Fitur: 1 Profile, 4K UHD, Sharing\n\n`;
    
    if (roleKey === 'customer') {
        msg += `<i>💎 Gabung Reseller untuk dapatkan harga lebih murah!</i>\n\n`;
    }
    msg += `👇 <b>Klik "🛒 Beli Sekarang" untuk order.</b>`;
    
    await ctx.replyWithHTML(msg);
  } catch (error) {
    console.error('Error fetching prices:', error);
    ctx.reply('❌ Gagal memuat data harga.');
  }
});

/**
 * � Post Stok ke Channel (Admin Only)
 */
bot.command('poststok', async (ctx) => {
  const userId = ctx.from.id.toString();
  if (userId !== ADMIN_ID) return;

  try {
    const stockPremium = await getStockCount('premium');
    const stockStandard = await getStockCount('standard');
    const stockBasic = await getStockCount('basic');
    const stockSharing = await getStockCount('sharing');

    let msg = `📢 <b>UPDATE STOK NETFLIX HARI INI</b>\n\n`;
    msg += `🌟 <b>Premium (4K UHD)</b>: <code>${stockPremium}</code> Akun\n`;
    msg += `⭐ <b>Standard (FHD)</b>: <code>${stockStandard}</code> Akun\n`;
    msg += `✨ <b>Basic (HD)</b>: <code>${stockBasic}</code> Akun\n`;
    msg += `💎 <b>Sharing Profile</b>: <code>${stockSharing}</code> Akun\n\n`;
    
    msg += `✅ <b>Status:</b> ${ (stockPremium + stockStandard + stockBasic + stockSharing > 0) ? 'READY STOK! 🚀' : 'MENUNGGU RESTOK ⏳' }\n\n`;
    msg += `🛒 <b>Order Otomatis 24 Jam:</b>\n`;
    msg += `👉 @${ctx.botInfo.username}\n\n`;
    msg += `🛡️ <i>Legal & Bergaransi Full!</i>`;

    await postToChannel(msg);
    await ctx.reply('✅ Stok berhasil diposting ke channel!');
  } catch (error) {
    console.error('Error posting stock to channel:', error);
    ctx.reply('❌ Gagal posting ke channel.');
  }
});

/**
 * 📢 Post Stok Button Handler (Admin Only)
 */
bot.hears('📢 Post Stok ke Channel', async (ctx) => {
  const userId = ctx.from.id.toString();
  if (userId !== ADMIN_ID) return;

  try {
    const stockPremium = await getStockCount('premium');
    const stockStandard = await getStockCount('standard');
    const stockBasic = await getStockCount('basic');
    const stockSharing = await getStockCount('sharing');

    let msg = `📢 <b>UPDATE STOK NETFLIX HARI INI</b>\n\n`;
    msg += `🌟 <b>Premium (4K UHD)</b>: <code>${stockPremium}</code> Akun\n`;
    msg += `⭐ <b>Standard (FHD)</b>: <code>${stockStandard}</code> Akun\n`;
    msg += `✨ <b>Basic (HD)</b>: <code>${stockBasic}</code> Akun\n`;
    msg += `💎 <b>Sharing Profile</b>: <code>${stockSharing}</code> Akun\n\n`;
    
    msg += `✅ <b>Status:</b> ${ (stockPremium + stockStandard + stockBasic + stockSharing > 0) ? 'READY STOK! 🚀' : 'MENUNGGU RESTOK ⏳' }\n\n`;
    msg += `🛒 <b>Order Otomatis 24 Jam:</b>\n`;
    msg += `👉 @${ctx.botInfo.username}\n\n`;
    msg += `🛡️ <i>Legal & Bergaransi Full!</i>`;

    await postToChannel(msg);
    await ctx.reply('✅ Stok berhasil diposting ke channel!');
  } catch (error) {
    console.error('Error info channel:', error);
    ctx.reply('❌ Gagal posting. Pastikan Bot sudah jadi Admin di Channel.');
  }
});

/**
 * �📦 Cek Stok Handler
 */
bot.hears([/Cek Stok/i, /stok/i], async (ctx) => {
  try {
    const stockPremium = await getStockCount('premium');
    const stockStandard = await getStockCount('standard');
    const stockBasic = await getStockCount('basic');
    const stockSharing = await getStockCount('sharing');
    
    let msg = `📦 <b>INFO STOK REAL-TIME</b>\n\n`;
    msg += `🌟 Premium: <b>${stockPremium}</b> akun\n`;
    msg += `⭐ Standard: <b>${stockStandard}</b> akun\n`;
    msg += `✨ Basic: <b>${stockBasic}</b> akun\n`;
    msg += `💎 Sharing: <b>${stockSharing}</b> akun\n\n`;
    
    if (stockPremium > 0 || stockStandard > 0 || stockBasic > 0 || stockSharing > 0) {
       msg += `✅ <i>Stok tersedia! Silakan order sekarang.</i>`;
    } else {
       msg += `❌ <i>Stok sedang habis. Mohon tunggu restock.</i>`;
    }
    
    await ctx.replyWithHTML(msg);
  } catch (error) {
    console.error('Error fetching stock:', error);
    ctx.reply('❌ Gagal memuat info stok.');
  }
});

/**
 * 👤 Profile Saya Handler
 */
bot.hears([/Profile Saya/i, /Profil Saya/i], async (ctx) => {
  const userId = ctx.from.id;
  try {
    const user = await getUser(userId);
    let role = user.role || 'customer';
    const balance = user.balance || 0;
    const safeName = (user.first_name || 'User').replace(/</g, '&lt;');
    
    let joinDate = '-';
    // Robust date handling
    if (user.created_at) {
        if (typeof user.created_at.toDate === 'function') {
            joinDate = user.created_at.toDate().toLocaleDateString('id-ID');
        } else if (user.created_at.seconds) {
            joinDate = new Date(user.created_at.seconds * 1000).toLocaleDateString('id-ID');
        } else {
             try { joinDate = new Date(user.created_at).toLocaleDateString('id-ID'); } catch(e){}
        }
    }
    
    let msg = `👤 <b>PROFILE PENGGUNA</b>\n\n`;
    msg += `📛 Nama: ${safeName}\n`;
    msg += `🆔 ID: <code>${user.id}</code>\n`;
    msg += `🏷️ Status: <b>${formatRole(role)}</b>\n`;
    
    if (role.toLowerCase().includes('reseller') || role.toLowerCase().includes('gold') || role.toLowerCase().includes('silver') || role === 'admin') {
      msg += `💰 Saldo: <b>${formatCurrency(balance)}</b>\n`;
    }
    
    msg += `\n📅 Bergabung: ${joinDate}`;
    
    // Explicit Admin/Reseller info
    if (userId.toString() === ADMIN_ID || role === 'admin') {
        msg += `\n\n🔧 <b>Akses Admin Aktif</b>`;
    }
    
    await ctx.replyWithHTML(msg);
  } catch (error) {
    console.error('Error in Profile handler:', error);
    ctx.reply(`❌ Gagal memuat profile: ${error.message}`);
  }
});

/**
 * 📞 Hubungi Admin
 */
bot.hears(/Hubungi Admin/i, async (ctx) => {
  await ctx.replyWithHTML(
    `📞 <b>HUBUNGI ADMIN</b>\n\n` +
    `Jika ada kendala pembayaran, akun bermasalah, atau ingin mendaftar Reseller, silakan hubungi admin kami:\n\n` +
    `👨‍💻 Admin: @Revmore16\n` +
    `🕒 Jam Operasional: 09.00 - 22.00 WIB\n\n` +
    `<i>Harap chat dengan sopan agar segera dibalas.</i>`
  );
});

/**
 * ❓ Bantuan Handler (Interactive)
 */
bot.hears([/Bantuan/i, /\/help/i], async (ctx) => {
  const helpMessage = `
🤖 <b>PUSAT BANTUAN NETFLIX BOT</b>

Halo! Ada yang bisa kami bantu?
Silakan pilih topik bantuan di bawah ini untuk solusi cepat:

👇 <b>Pilih Topik:</b>
`;

  await ctx.replyWithHTML(helpMessage, Markup.inlineKeyboard([
    [Markup.button.callback('💳 Cara Order & Bayar', 'help_order')],
    [Markup.button.callback('🔑 Masalah Login / Password', 'help_login')],
    [Markup.button.callback('🛡️ Klaim Garansi', 'help_warranty')],
    [Markup.button.callback('💎 Info Reseller', 'help_reseller')],
    [Markup.button.callback('👨‍💻 Chat Admin Live', 'help_admin')]
  ]));
});

// ==================== HELP CALLBACKS ====================

bot.action('help_order', async (ctx) => {
    const msg = `
💳 <b>CARA ORDER OTOMATIS</b>

1. Klik menu <b>🛒 Beli Sekarang</b>
2. Pilih Paket (Premium/Standard/Basic/Sharing)
3. Bot akan memberikan QRIS / Info Transfer
4. Lakukan pembayaran & kirim bukti (jika manual)
5. Akun akan dikirim <b>OTOMATIS</b> oleh bot

<i>Proses 24 Jam Non-stop!</i>
`;
    await ctx.replyWithHTML(msg, Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Kembali', 'help_main')]
    ]));
    await ctx.answerCbQuery();
});

bot.action('help_login', async (ctx) => {
    const msg = `
🔑 <b>SOLUSI MASALAH LOGIN</b>

<b>Q: Password Salah / Incorrect Password?</b>
A: Pastikan copy-paste password dengan benar. Jangan ada spasi tambahan.

<b>Q: Diminta Update Household / Rumah Tangga?</b>
A: Ini pembatasan Netflix. Silakan hubungi admin untuk update link household (gratis dalam masa garansi).

<b>Q: Layar Penuh / Screen Limit?</b>
A: Jika beli paket Sharing, pastikan hanya login di 1 device. Jika beli Private, cek jumlah device yang login.
`;
    await ctx.replyWithHTML(msg, Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Kembali', 'help_main')]
    ]));
    await ctx.answerCbQuery();
});

bot.action('help_warranty', async (ctx) => {
    const msg = `
🛡️ <b>SYARAT KLAIM GARANSI</b>

✅ <b>Garansi Berlaku Jika:</b>
- Akun kembali free/kena hold sebelum masa aktif habis.
- Password salah (dan bukan karena diganti user).
- Kena pembatasan Household (diperbaiki admin).

❌ <b>Garansi HANGUS Jika:</b>
- Mengubah Email/Password akun.
- Menambah profile baru (untuk akun sharing).
- Login melebihi batas device.
- Melanggar aturan pemakaian.

<i>Klaim garansi? Hubungi Admin dengan menyertakan Nomor Order.</i>
`;
    await ctx.replyWithHTML(msg, Markup.inlineKeyboard([
        [Markup.button.callback('👨‍💻 Hubungi Admin', 'help_admin')],
        [Markup.button.callback('🔙 Kembali', 'help_main')]
    ]));
    await ctx.answerCbQuery();
});

bot.action('help_reseller', async (ctx) => {
    const msg = `
💎 <b>GABUNG RESELLER</b>

Mau dapat harga lebih murah dan jual kembali?
Gabung jadi Reseller kami!

<b>Keuntungan:</b>
✅ Harga Termurah (Potongan s/d 15rb)
✅ Prioritas Support
✅ Transaksi Cepat (Potong Saldo)

<i>Minat? Chat Admin sekarang!</i>
`;
    await ctx.replyWithHTML(msg, Markup.inlineKeyboard([
        [Markup.button.callback('👨‍💻 Chat Admin', 'help_admin')],
        [Markup.button.callback('🔙 Kembali', 'help_main')]
    ]));
    await ctx.answerCbQuery();
});

bot.action('help_admin', async (ctx) => {
   await ctx.replyWithHTML(
       `👨‍💻 <b>KONTAK ADMIN</b>\n\nSilakan chat admin kami di: @Revmore16\n(Klik username untuk chat langsung)\n\n<i>Mohon antri, pesan dibalas satu per satu.</i>`
   );
   await ctx.answerCbQuery();
});

bot.action('help_main', async (ctx) => {
    await ctx.deleteMessage(); // Delete old submenu
    const helpMessage = `
🤖 <b>PUSAT BANTUAN NETFLIX BOT</b>

Silakan pilih topik bantuan di bawah ini:
`;
    await ctx.replyWithHTML(helpMessage, Markup.inlineKeyboard([
        [Markup.button.callback('💳 Cara Order & Bayar', 'help_order')],
        [Markup.button.callback('🔑 Masalah Login', 'help_login')],
        [Markup.button.callback('🛡️ Klaim Garansi', 'help_warranty')],
        [Markup.button.callback('💎 Info Reseller', 'help_reseller')],
        [Markup.button.callback('👨‍💻 Chat Admin Live', 'help_admin')]
    ]));
    await ctx.answerCbQuery();
});

/**
 * 🎟️ Redeem Voucher Command
 */
bot.command('redeem', async (ctx) => {
  const text = ctx.message.text;
  const args = text.split(' ');
  
  if (args.length < 2) {
    return ctx.replyWithHTML(
      '❌ <b>Format Salah!</b>\n\n' +
      'Gunakan format:\n' +
      '<code>/redeem KODE_VOUCHER</code>\n\n' +
      'Contoh:\n' +
      '<code>/redeem PROMO2024</code>'
    );
  }
  
  const code = args[1].toUpperCase();
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'User';
  
  await ctx.replyWithHTML('⏳ <i>Memproses voucher...</i>');
  
  try {
    const result = await redeemVoucher(userId, code);
    
    if (result.success) {
      await ctx.replyWithHTML(
        `🎉 <b>SELAMAT! VOUCHER BERHASIL DIKLAIM!</b>\n\n` +
        `👤 Nama: ${userName}\n` +
        `🎟️ Kode: <code>${code}</code>\n\n` +
        `💰 Saldo Bertambah: <b>${formatCurrency(result.amount)}</b>\n` +
        `💳 Total Saldo: <b>${formatCurrency(result.newBalance)}</b>\n\n` +
        `✅ <i>Saldo sudah bisa digunakan untuk transaksi!</i>`
      );
    } else {
      await ctx.replyWithHTML(result.message || '❌ Gagal mengklaim voucher.');
    }
  } catch (error) {
    console.error('Redeem error:', error);
    await ctx.replyWithHTML(
      '❌ <b>Terjadi kesalahan sistem.</b>\n\n' +
      'Silakan coba lagi atau hubungi admin.'
    );
  }
});

/**
 * 🎟️ Redeem Voucher Button Handler
 */
bot.hears(/Redeem Voucher/i, async (ctx) => {
  await ctx.replyWithHTML(
    `🎟️ <b>REDEEM VOUCHER</b>\n\n` +
    `Punya kode voucher? Dapatkan saldo gratis!\n\n` +
    `<b>Cara Redeem:</b>\n` +
    `Ketik: <code>/redeem KODE_VOUCHER</code>\n\n` +
    `<b>Contoh:</b>\n` +
    `<code>/redeem PROMO2024</code>\n\n` +
    `💡 <i>Kode voucher bisa didapat dari promo channel atau giveaway.</i>`
  );
});

/**
 * 🛒 Beli Sekarang (UPDATED PRICING LOGIC)
 */
bot.hears(/Beli Sekarang/i, async (ctx) => {
  const userId = ctx.from.id;
  let userRole = 'customer';
  let userBalance = 0;
  
  try {
    const user = await getUser(userId);
    userRole = user.role || 'customer';
    userBalance = user.balance || 0;
  } catch (err) {
    console.error('Error getting user:', err);
  }

  const roleKey = getRoleKey(userRole);
  const allPrices = await getPrices();
  const prices = allPrices[roleKey] || allPrices.customer;

  // New Pricing Logic
  const pPremium = prices.premium;
  const pStandard = prices.standard;
  const pBasic = prices.basic;
  const pSharing = prices.sharing || 0;

  let msg = '🛒 <b>Pilih Paket Netflix:</b>\n\nSilakan pilih paket yang Anda inginkan:';
  
  if (roleKey !== 'customer') {
    msg += `\n\n🌟 <b>${formatRole(userRole)}</b>\n✅ Anda mendapatkan harga spesial reseller.`;
  }

  await ctx.replyWithHTML(
    msg,
    Markup.inlineKeyboard([
      [Markup.button.callback(`🌟 Premium - ${formatCurrency(pPremium)}`, 'buy_premium')],
      [Markup.button.callback(`⭐ Standard - ${formatCurrency(pStandard)}`, 'buy_standard')],
      [Markup.button.callback(`✨ Basic - ${formatCurrency(pBasic)}`, 'buy_basic')],
      [Markup.button.callback(`💎 Sharing - ${formatCurrency(pSharing)}`, 'buy_sharing')],
      [Markup.button.callback('❌ Batal', 'cancel')]
    ])
  );
});

// ... (Command handlers - No major changes needed, skipping to Callback)

// ==================== CALLBACK QUERIES ====================

/**
 * Handle Buy Package (Updated Price Logic)
 */
bot.action(/buy_(premium|standard|basic|sharing)/, async (ctx) => {
  const packageType = ctx.match[1];
  const userId = ctx.from.id;
  
  let userRole = 'customer';
  let userBalance = 0;
  let userName = ctx.from.first_name || 'Customer';
  let userUsername = ctx.from.username || '';

  try {
      const user = await getUser(userId);
      userRole = user.role || 'customer';
      userBalance = user.balance || 0;
  } catch(e) {}
  
  // Get Correct Price
  const roleKey = getRoleKey(userRole);
  const allPrices = await getPrices();
  const prices = allPrices[roleKey] || allPrices.customer;
  const price = prices[packageType];
  
  try {
    const stock = await getStockCount(packageType);
    if (stock === 0) {
      await ctx.answerCbQuery('❌ Maaf, stok sedang habis!');
      await ctx.replyWithHTML(`❌ Maaf, stok untuk paket <b>${packageType}</b> sedang habis.\n\nSilakan coba paket lain atau tunggu restock.`);
      return;
    }
    
    const orderId = await createOrder({
      buyer_id: userId.toString(),
      buyer_name: userName,
      buyer_username: userUsername,
      package_type: packageType,
      price: price
    });
    
    const paymentMessage = `
🛒 <b>DETAIL PESANAN</b>

📦 Paket: <b>${packageType.toUpperCase()}</b>
💰 Harga: <b>${formatCurrency(price)}</b>
🆔 Order ID: <code>${orderId}</code>

━━━━━━━━━━━━━━━━━━━━
💳 <b>METODE PEMBAYARAN</b>

Silakan pilih metode pembayaran di bawah ini.
    `;
    
    const canPayWithBalance = (roleKey !== 'customer') && userBalance >= price;

    const keyboardButtons = [];
    if (canPayWithBalance) {
        keyboardButtons.push([Markup.button.callback(`💎 Bayar Pakai Saldo (Sisa: ${formatCurrency(userBalance)})`, `pay_balance_${orderId}`)]);
    }
    
    keyboardButtons.push([Markup.button.callback('📱 QRIS / Transfer', `show_qris_${orderId}`)]);
    keyboardButtons.push([Markup.button.callback('❌ Batal', `cancel_${orderId}`)]);
    
    await ctx.replyWithHTML(paymentMessage, Markup.inlineKeyboard(keyboardButtons));
    await ctx.answerCbQuery('✅ Pesanan dibuat!');
    
  } catch (error) {
    console.error('Error creating order:', error);
    await ctx.answerCbQuery('❌ Terjadi kesalahan!');
    await ctx.replyWithHTML('❌ Maaf, terjadi kesalahan. Silakan coba lagi.');
  }
});

bot.action(/show_qris_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    const order = await getOrder(orderId);
    if (!order) return ctx.reply('Order expired');
    
    const paymentMessage = `
💳 <b>PEMBAYARAN QRIS</b>

Silakan transfer ke:
📱 <b>QRIS (Semua E-Wallet & Bank)</b>

Atas Nama: <b>${process.env.PAYMENT_ACCOUNT_NAME || 'Netflix Bot Store'}</b>
Nominal: <b>${formatCurrency(order.price)}</b>

━━━━━━━━━━━━━━━━━━━━
⏰ Setelah transfer, klik tombol "Sudah Bayar" di bawah.
    `;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('✅ Sudah Bayar', `confirm_${orderId}`)],
      [Markup.button.callback('⬅️ Kembali', `cancel_${orderId}`)]
    ]);
    
    const qrisUrl = process.env.QRIS_IMAGE_URL;
    const isValidQrisUrl = qrisUrl && qrisUrl.startsWith('http') && !qrisUrl.includes('example.com');
    
    if (isValidQrisUrl) {
      await ctx.replyWithPhoto(qrisUrl, { caption: paymentMessage, parse_mode: 'HTML', ...keyboard });
    } else {
      await ctx.replyWithHTML(paymentMessage + '\n\n📱 <b>QRIS akan dikirim oleh admin</b>', keyboard);
    }
});

bot.action(/pay_balance_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    const userId = ctx.from.id;
    const userName = ctx.from.first_name || 'Customer';
    
    try {
        await ctx.answerCbQuery('💎 Memproses pembayaran saldo...');
        const order = await getOrder(orderId);
        if (order.status === 'paid') return ctx.replyWithHTML('⚠️ Pesanan ini sudah dibayar sebelumnya.');
        
        await deductUserBalance(userId, order.price);
        const account = await getAvailableAccount(order.package_type);
        await markAccountAsSold(account.id, userId.toString(), userName);
        await updateOrderStatus(orderId, 'paid', true);
        
        const accountMessage = `
✅ <b>PEMBAYARAN BERHASIL! (SALDO)</b>

Terima kasih atas pembelian Anda! 🎉
Saldo Anda telah dipotong sebesar <b>${formatCurrency(order.price)}</b>.

━━━━━━━━━━━━━━━━━━━━
🎬 <b>DETAIL AKUN NETFLIX</b>

📧 Email: <code>${account.email}</code>
🔑 Password: <code>${account.password}</code>
${account.profile_name ? `👤 Profile: <b>${account.profile_name}</b>` : ''}
${account.profile_pin ? `📌 PIN: <code>${account.profile_pin}</code>` : ''}

📱 <b>Cara Login:</b>
1. Buka netflix.com atau Aplikasi Netflix
2. Masukkan email & password di atas
${account.profile_name ? `3. Pilih Profile: <b>${account.profile_name}</b>` : '3. Pilih Profile yang tersedia'}
${account.profile_pin ? `4. Masukkan PIN: <b>${account.profile_pin}</b>` : '4. Selamat menonton!'}
5. Enjoy! 🍿

⚠️ <b>PENTING:</b>
• DILARANG mengganti Email/Password
${account.profile_name ? '• DILARANG masuk/mengganggu profile orang lain' : ''}
${account.profile_name ? '• DILARANG mengubah PIN profile' : ''}
• Garansi hangus jika melanggar aturan
• Simpan data ini baik-baik

Terima kasih & selamat menikmati! 🎬✨
        `;
        
        await ctx.replyWithHTML(accountMessage);
        
        if (ADMIN_ID) {
            await bot.telegram.sendMessage(ADMIN_ID, 
                `💎 <b>PEMBELIAN VIA SALDO</b>\n\n` +
                `👤 User: ${userName}\n` +
                `📦 Paket: ${order.package_type}\n` +
                `💰 Harga: ${formatCurrency(order.price)}\n` +
                `✅ Status: Sukses`
            , { parse_mode: 'HTML'});
        }
        
    } catch (error) {
        console.error('Error paying with balance:', error);
        await ctx.replyWithHTML(`❌ <b>Gagal Membayar via Saldo</b>\n\n${error.message}`);
    }
});

bot.action(/confirm_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'Customer';
  
  try {
    await ctx.answerCbQuery('⏳ Memproses pembayaran...');
    await ctx.replyWithHTML('⏳ <b>Memproses pembayaran Anda...</b>\n\nMohon tunggu sebentar.');
    
    const order = await getOrder(orderId);
    const packageType = order.package_type;
    const account = await getAvailableAccount(packageType);
    
    await markAccountAsSold(account.id, userId.toString(), userName);
    await updateOrderStatus(orderId, 'paid', true);
    
    const accountMessage = `
✅ <b>PEMBAYARAN BERHASIL!</b>

Terima kasih atas pembelian Anda! 🎉

━━━━━━━━━━━━━━━━━━━━
🎬 <b>DETAIL AKUN NETFLIX</b>

📧 Email: <code>${account.email}</code>
🔑 Password: <code>${account.password}</code>
${account.profile_name ? `👤 Profile: <b>${account.profile_name}</b>` : ''}
${account.profile_pin ? `📌 PIN: <code>${account.profile_pin}</code>` : ''}

📱 <b>Cara Login:</b>
1. Buka netflix.com atau Aplikasi Netflix
2. Masukkan email & password di atas
${account.profile_name ? `3. Pilih Profile: <b>${account.profile_name}</b>` : '3. Pilih Profile yang tersedia'}
${account.profile_pin ? `4. Masukkan PIN: <b>${account.profile_pin}</b>` : '4. Selamat menonton!'}
5. Enjoy! 🍿

⚠️ <b>PENTING:</b>
• DILARANG mengganti Email/Password
${account.profile_name ? '• DILARANG masuk/mengganggu profile orang lain' : ''}
${account.profile_name ? '• DILARANG mengubah PIN profile orang lain' : ''}
• Garansi hangus jika melanggar aturan
• Simpan data ini baik-baik

Terima kasih & selamat menikmati! 🎬✨
    `;
    
    await ctx.replyWithHTML(accountMessage);
    
    // 📢 NEW: Post Sale to Channel (Anonymized)
    const saleAnnouncement = `
🎉 <b>ALHAMDULILLAH! SATU AKUN TERJUAL!</b>

📦 Paket: <b>${order.package_type.toUpperCase()}</b>
💰 Harga: <b>${formatCurrency(order.price)}</b>
⏰ Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB

✅ Akun telah terkirim otomatis ke pembeli!

🛒 <b>Mau langganan juga? Langsung order di:</b>
👉 @${ctx.botInfo.username}
    `;
    await postToChannel(saleAnnouncement);

    if (ADMIN_ID) {
      try {
        await bot.telegram.sendMessage(
          ADMIN_ID,
          `✅ <b>PEMBAYARAN BERHASIL! (TRANSFER)</b>\n\n` +
          `👤 Customer: ${userName} (ID: ${userId})\n` +
          `📦 Paket: ${packageType.toUpperCase()}\n` +
          `💰 Harga: ${formatCurrency(order.price)}\n` +
          `🆔 Order ID: <code>${orderId}</code>\n` +
          `📧 Akun: ${account.email}\n` +
          `✅ Status: Akun Terkirim`,
          { parse_mode: 'HTML' }
        );
      } catch (adminError) { console.error(adminError); }
    }
    
  } catch (error) {
    console.error('Error processing payment:', error);
    await ctx.replyWithHTML(
      `❌ <b>Maaf, terjadi kesalahan!</b>\n\n${error.message}\n\nSilakan hubungi admin untuk bantuan.`
    );
  }
});

bot.action(/cancel_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  try {
    await updateOrderStatus(orderId, 'cancelled', false);
    await ctx.answerCbQuery('✅ Pesanan dibatalkan');
    await ctx.replyWithHTML('✅ Pesanan Anda telah dibatalkan.\n\nSilakan order kembali jika berminat.');
  } catch (error) {
    console.error('Error cancelling order:', error);
    await ctx.answerCbQuery('❌ Gagal membatalkan');
  }
});

bot.action('cancel', async (ctx) => {
  await ctx.answerCbQuery('Dibatalkan');
  await ctx.deleteMessage();
});

// ==================== ERROR HANDLING ====================
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi atau hubungi admin.');
});

// ==================== BROADCAST LOOP ====================
const runBroadcastLoop = async () => {
  try {
    const broadcast = await getPendingBroadcasts();
    if (!broadcast) return;
    
    await updateBroadcastStatus(broadcast.id, 'processing', broadcast.sent_count, broadcast.total_target);
    const users = await getAllUsers(broadcast.target); // 'all', 'reseller', 'customer'
    let sentCount = 0;
    
    if (ADMIN_ID) {
       await bot.telegram.sendMessage(ADMIN_ID, `📣 <b>BROADCAST STARTED</b>\nTarget: ${users.length} users\nPesan: ${broadcast.message.substring(0, 50)}...`, { parse_mode: 'HTML' });
    }

    await updateBroadcastStatus(broadcast.id, 'processing', 0, users.length);
    
    for (const user of users) {
      try {
        if (broadcast.imageUrl) {
          await bot.telegram.sendPhoto(user.id, broadcast.imageUrl, {
            caption: broadcast.message,
            parse_mode: 'HTML'
          });
        } else {
          await bot.telegram.sendMessage(user.id, broadcast.message, {
            parse_mode: 'HTML'
          });
        }
        sentCount++;
        if (sentCount % 10 === 0) await updateBroadcastStatus(broadcast.id, 'processing', sentCount, users.length);
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        if (error.response && error.response.error_code === 403) {
            // User blocked bot
        } else {
            console.error(`Failed to send broadcast to ${user.id}:`, error.message);
        }
      }
    }
    
    await updateBroadcastStatus(broadcast.id, 'completed', sentCount, users.length);
    if (ADMIN_ID) {
       await bot.telegram.sendMessage(ADMIN_ID, `✅ <b>BROADCAST COMPLETED</b>\nTerkirim: ${sentCount}/${users.length}`, { parse_mode: 'HTML' });
    }
  } catch (error) {
    console.error('Broadcast loop error:', error);
  }
};
setInterval(runBroadcastLoop, 30000);

// ==================== START BOT ====================
bot.launch()
  .then(() => {
    console.log('🤖 Telegram Bot started successfully!');
    console.log('Bot username:', bot.botInfo.username);
  })
  .catch((error) => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
