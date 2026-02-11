import { db } from './firebase.js';
import admin from 'firebase-admin'; // Ensure admin is imported for FieldValue

/**
 * Get Available Account dengan FIFO Logic
 * Menggunakan Transaction untuk mencegah race condition
 */
export const getAvailableAccount = async (packageType = 'premium') => {
  try {
    return await db.runTransaction(async (transaction) => {
      // Query untuk mendapatkan akun ready dengan FIFO (created_at ASC)
      const inventoryRef = db.collection('inventory');
      const query = inventoryRef
        .where('status', '==', 'ready')
        .where('package_type', '==', packageType)
        .orderBy('created_at', 'asc')
        .limit(1);
      
      const snapshot = await transaction.get(query);
      
      if (snapshot.empty) {
        throw new Error(`❌ Maaf, stok untuk paket ${packageType} sedang habis.`);
      }
      
      // Ambil akun pertama (FIFO)
      const accountDoc = snapshot.docs[0];
      const accountRef = inventoryRef.doc(accountDoc.id);
      
      // Update status menjadi 'processing' untuk mencegah race condition
      transaction.update(accountRef, {
        status: 'processing',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        id: accountDoc.id,
        ...accountDoc.data()
      };
    });
  } catch (error) {
    console.error('Error getting available account:', error);
    throw error;
  }
};

/**
 * Mark Account as Sold
 */
export const markAccountAsSold = async (accountId, buyerId, buyerName) => {
  try {
    const accountRef = db.collection('inventory').doc(accountId);
    await accountRef.update({
      status: 'sold',
      buyer_id: buyerId,
      buyer_name: buyerName,
      sold_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error marking account as sold:', error);
    throw error;
  }
};

/**
 * Create Order
 */
export const createOrder = async (orderData) => {
  try {
    const orderRef = await db.collection('orders').add({
      buyer_id: orderData.buyer_id,
      buyer_name: orderData.buyer_name,
      buyer_username: orderData.buyer_username,
      package_type: orderData.package_type,
      price: orderData.price,
      payment_status: 'pending',
      account_sent: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update Order Status
 */
export const updateOrderStatus = async (orderId, status, accountSent = false) => {
  try {
    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({
      payment_status: status,
      account_sent: accountSent,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Get Order by ID
 */
export const getOrder = async (orderId) => {
  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      throw new Error('Order tidak ditemukan');
    }
    
    return {
      id: orderDoc.id,
      ...orderDoc.data()
    };
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

/**
 * Get Settings
 */
export const getSettings = async () => {
  try {
    const snapshot = await db.collection('settings').limit(1).get();
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

/**
 * Get Stock Count
 */
export const getStockCount = async (packageType = null) => {
  try {
    let query = db.collection('inventory').where('status', '==', 'ready');
    
    if (packageType) {
      query = query.where('package_type', '==', packageType);
    }
    
    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    console.error('Error getting stock count:', error);
    return 0;
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get or Create User
 */
export const getUser = async (telegramId, userData = {}) => {
  try {
    const userRef = db.collection('users').doc(telegramId.toString());
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create new user
      const newUser = {
        id: telegramId.toString(),
        first_name: userData.first_name || '',
        username: userData.username || '',
        role: 'customer',
        balance: 0,
        // Optional: referral code, etc.
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      await userRef.set(newUser);
      return newUser;
    } else {
      // Update user data if provided (e.g. name changed)
      if (userData.first_name || userData.username) {
        await userRef.update({
          first_name: userData.first_name || userDoc.data().first_name,
          username: userData.username || userDoc.data().username,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Get All Users (for Broadcast)
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// ==================== BROADCAST SYSTEM ====================

/**
 * Get Pending Broadcasts
 */
export const getPendingBroadcasts = async () => {
  try {
    const snapshot = await db.collection('broadcasts')
      .where('status', '==', 'pending')
      .orderBy('created_at', 'asc')
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting pending broadcasts:', error);
    return null;
  }
};

/**
 * Update Broadcast Status
 */
export const updateBroadcastStatus = async (broadcastId, status, sentCount, totalTarget) => {
  try {
    await db.collection('broadcasts').doc(broadcastId).update({
      status,
      sent_count: sentCount,
      total_target: totalTarget,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating broadcast:', error);
  }
};

// ==================== SETTINGS (PRICES) ====================

/**
 * Get Prices from Database (Real-time Sync)
 */
export const getPrices = async () => {
  try {
    // Get first document from settings collection (matching Dashboard logic)
    const settingsSnapshot = await db.collection('settings').limit(1).get();
    
    // Default prices if settings not found
    const defaultPrices = {
      premium: 50000,
      standard: 35000,
      basic: 25000,
      sharing: 20000
    };
    
    if (!settingsSnapshot.empty) {
        const data = settingsSnapshot.docs[0].data();
        
        // Helper to safely get price
        const getPrice = (role, type, def) => {
            if (data.prices && data.prices[role] && data.prices[role][type]) {
                return parseInt(data.prices[role][type]);
            }
            // Fallback for backward compatibility (flat structure)
            if (role === 'customer') {
                if (data.prices && data.prices[type]) return parseInt(data.prices[type]); // Old nested
                if (data[`price_${type}`]) return parseInt(data[`price_${type}`]); // Old flat
            }
            return def; 
        };

        const customerPrices = {
            premium: getPrice('customer', 'premium', defaultPrices.premium),
            standard: getPrice('customer', 'standard', defaultPrices.standard),
            basic: getPrice('customer', 'basic', defaultPrices.basic),
            sharing: getPrice('customer', 'sharing', defaultPrices.sharing)
        };

        return {
            customer: customerPrices,
            reseller_silver: {
                premium: getPrice('reseller_silver', 'premium', customerPrices.premium - 5000),
                standard: getPrice('reseller_silver', 'standard', customerPrices.standard - 5000),
                basic: getPrice('reseller_silver', 'basic', customerPrices.basic - 5000),
                sharing: getPrice('reseller_silver', 'sharing', customerPrices.sharing - 5000)
            },
            reseller_gold: {
                premium: getPrice('reseller_gold', 'premium', customerPrices.premium - 15000),
                standard: getPrice('reseller_gold', 'standard', customerPrices.standard - 15000),
                basic: getPrice('reseller_gold', 'basic', customerPrices.basic - 15000),
                sharing: getPrice('reseller_gold', 'sharing', customerPrices.sharing - 8000)
            }
        };
    }
    
    // Default structure if no settings found
    return {
        customer: defaultPrices,
        reseller_silver: defaultPrices,
        reseller_gold: defaultPrices
    };
  } catch (error) {
    console.error('Error getting prices:', error);
    const def = {
      premium: 50000,
      standard: 35000,
      basic: 25000
    };
    return {
        customer: def,
        reseller_silver: def,
        reseller_gold: def
    };
  }
};
/**
 * Deduct User Balance safely inside Transaction
 */
export const deductUserBalance = async (userId, amount) => {
  try {
    return await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId.toString());
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User tidak ditemukan.');
      }

      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;

      if (currentBalance < amount) {
        throw new Error(`Saldo tidak mencukupi. Saldo saat ini: ${currentBalance}`);
      }

      const newBalance = currentBalance - amount;

      // Update User Balance
      transaction.update(userRef, {
        balance: newBalance,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Add Balance History Logic could be added here later

      return newBalance;
    });
  } catch (error) {
    console.error('Error deducting balance:', error);
    throw error;
  }
};

// ==================== VOUCHER SYSTEM ====================

/**
 * Get Voucher by Code (Case Insensitive)
 */
export const getVoucher = async (code) => {
    try {
        const snapshot = await db.collection('vouchers').where('code', '==', code.toUpperCase()).limit(1).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
        console.error('Error getting voucher:', error);
        return null;
    }
};

/**
 * Redeem Voucher
 */
export const redeemVoucher = async (userId, code) => {
    // 1. Get Voucher Ref
    const snapshot = await db.collection('vouchers').where('code', '==', code.toUpperCase()).limit(1).get();
    
    if (snapshot.empty) {
        return { success: false, message: '❌ Kode Voucher tidak valid.' };
    }

    const voucherDoc = snapshot.docs[0];
    const voucherRef = voucherDoc.ref;
    const voucher = voucherDoc.data();

    return await db.runTransaction(async (transaction) => {
        // Re-read inside transaction for consistency
        const tVoucherDoc = await transaction.get(voucherRef);
        if (!tVoucherDoc.exists) { throw new Error('Voucher hilang saat transaksi.'); }
        
        const tVoucher = tVoucherDoc.data();

        // Check Quota
        if (tVoucher.quota > 0 && (tVoucher.used || 0) >= tVoucher.quota) {
             throw new Error('❌ Kuota voucher sudah habis.');
        }

        // Check Claimed
        if (tVoucher.claimed_by && (tVoucher.claimed_by.includes(userId) || tVoucher.claimed_by.includes(userId.toString()))) {
             throw new Error('❌ Anda sudah mengklaim voucher ini.');
        }
        
        // Get User
        const userRef = db.collection('users').doc(userId.toString());
        const userDoc = await transaction.get(userRef);
        let currentBalance = 0;
        
        if (userDoc.exists) {
            currentBalance = userDoc.data().balance || 0;
        } else {
             transaction.set(userRef, {
                id: userId,
                role: 'customer',
                balance: 0,
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        const newBalance = currentBalance + (tVoucher.amount || 0);

        // Updates
        transaction.update(userRef, { balance: newBalance });
        transaction.update(voucherRef, {
            used: admin.firestore.FieldValue.increment(1),
            claimed_by: admin.firestore.FieldValue.arrayUnion(userId.toString())
        });
        
        return { success: true, amount: tVoucher.amount, newBalance };
    });
};

// ==================== USER & REFERRAL SYSTEM ====================

/**
 * Get or Create User
 */
export const getOrCreateUser = async (user) => {
    try {
        const userRef = db.collection('users').doc(user.id.toString());
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            const userData = {
                id: user.id,
                username: user.username || '',
                first_name: user.first_name || '',
                balance: 0,
                role: 'customer',
                referred_by: null,
                is_first_buy: true,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            };
            await userRef.set(userData);
            return userData;
        }
        
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        console.error('Error in getOrCreateUser:', error);
        return null;
    }
};

/**
 * Set Referrer
 */
export const setReferrer = async (userId, referrerId) => {
    try {
        if (userId.toString() === referrerId.toString()) return false;
        
        const userRef = db.collection('users').doc(userId.toString());
        const userDoc = await userRef.get();
        
        if (userDoc.exists && !userDoc.data().referred_by) {
            await userRef.update({
                referred_by: referrerId.toString(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error setting referrer:', error);
        return false;
    }
};

/**
 * Reward Referrer (Commission)
 */
export const rewardReferrer = async (userId, commissionAmount = 1000) => {
    try {
        const userRef = db.collection('users').doc(userId.toString());
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const referrerId = userData.referred_by;
        
        if (referrerId && userData.is_first_buy) {
            const referrerRef = db.collection('users').doc(referrerId);
            await db.runTransaction(async (t) => {
                const rDoc = await t.get(referrerRef);
                if (rDoc.exists) {
                    const rData = rDoc.data();
                    t.update(referrerRef, {
                        balance: (rData.balance || 0) + commissionAmount,
                        updated_at: admin.firestore.FieldValue.serverTimestamp()
                    });
                    
                    // Log referral commission
                    await db.collection('system_logs').add({
                        action: 'REFERRAL_COMMISSION',
                        details: `User ${userId} first buy rewarded ${referrerId} with Rp ${commissionAmount}`,
                        type: 'info',
                        created_at: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            });
            
            // Mark as no longer first buy
            await userRef.update({ is_first_buy: false });
        }
    } catch (error) {
        console.error('Error rewarding referrer:', error);
    }
};
