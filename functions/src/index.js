import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// ==================== INVENTORY TRIGGERS ====================

/**
 * Trigger saat akun baru ditambahkan
 * Mengirim notifikasi ke bot bahwa stok telah diperbarui
 */
export const onAccountAdded = onDocumentCreated('inventory/{accountId}', async (event) => {
  const accountData = event.data.data();
  const accountId = event.params.accountId;
  
  logger.info('New account added:', { accountId, email: accountData.email });
  
  try {
    // Update analytics
    await updateAnalytics();
    
    // Anda bisa menambahkan notifikasi ke Telegram/WhatsApp di sini
    // Contoh: await sendTelegramNotification('Stok baru ditambahkan!');
    
    logger.info('Account added successfully processed');
  } catch (error) {
    logger.error('Error processing new account:', error);
  }
});

/**
 * Trigger saat status akun berubah
 */
export const onAccountStatusChanged = onDocumentUpdated('inventory/{accountId}', async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const accountId = event.params.accountId;
  
  // Check if status changed
  if (beforeData.status !== afterData.status) {
    logger.info('Account status changed:', {
      accountId,
      from: beforeData.status,
      to: afterData.status
    });
    
    try {
      // Update analytics when account is sold
      if (afterData.status === 'sold') {
        await updateAnalytics();
      }
    } catch (error) {
      logger.error('Error processing status change:', error);
    }
  }
});

// ==================== ORDER TRIGGERS ====================

/**
 * Trigger saat order baru dibuat
 */
export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const orderData = event.data.data();
  const orderId = event.params.orderId;
  
  logger.info('New order created:', { orderId, package: orderData.package_type });
  
  try {
    // Update analytics
    await updateAnalytics();
    
    // Anda bisa menambahkan notifikasi ke admin di sini
    
    logger.info('Order created successfully processed');
  } catch (error) {
    logger.error('Error processing new order:', error);
  }
});

/**
 * Trigger saat order diupdate (payment confirmed)
 */
export const onOrderUpdated = onDocumentUpdated('orders/{orderId}', async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const orderId = event.params.orderId;
  
  // Check if payment status changed to paid
  if (beforeData.payment_status !== 'paid' && afterData.payment_status === 'paid') {
    logger.info('Order payment confirmed:', { orderId });
    
    try {
      // Update analytics
      await updateAnalytics();
      
      logger.info('Order payment successfully processed');
    } catch (error) {
      logger.error('Error processing order payment:', error);
    }
  }
});

// ==================== ANALYTICS HELPER ====================

/**
 * Update Analytics Collection
 */
async function updateAnalytics() {
  try {
    const [inventorySnapshot, ordersSnapshot] = await Promise.all([
      db.collection('inventory').get(),
      db.collection('orders').get()
    ]);
    
    const inventory = inventorySnapshot.docs.map(doc => doc.data());
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    // Calculate statistics
    const totalAccounts = inventory.length;
    const readyAccounts = inventory.filter(acc => acc.status === 'ready').length;
    const soldAccounts = inventory.filter(acc => acc.status === 'sold').length;
    
    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.payment_status === 'paid').length;
    const totalRevenue = orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.price || 0), 0);
    
    // Group by package type
    const accountsByPackage = inventory.reduce((acc, account) => {
      const pkg = account.package_type || 'premium';
      if (!acc[pkg]) {
        acc[pkg] = { total: 0, ready: 0, sold: 0 };
      }
      acc[pkg].total++;
      if (account.status === 'ready') acc[pkg].ready++;
      if (account.status === 'sold') acc[pkg].sold++;
      return acc;
    }, {});
    
    // Save to analytics collection
    const analyticsRef = db.collection('analytics').doc('current');
    await analyticsRef.set({
      totalAccounts,
      readyAccounts,
      soldAccounts,
      totalOrders,
      paidOrders,
      totalRevenue,
      accountsByPackage,
      lastUpdated: new Date()
    });
    
    logger.info('Analytics updated successfully');
  } catch (error) {
    logger.error('Error updating analytics:', error);
    throw error;
  }
}

// ==================== HTTP ENDPOINTS ====================

/**
 * Health Check Endpoint
 */
export const healthCheck = onRequest(async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Netflix Bot Functions are running'
  });
});

/**
 * Get Analytics Endpoint
 */
export const getAnalytics = onRequest(async (req, res) => {
  try {
    const analyticsDoc = await db.collection('analytics').doc('current').get();
    
    if (!analyticsDoc.exists) {
      // Generate analytics if not exists
      await updateAnalytics();
      const updatedDoc = await db.collection('analytics').doc('current').get();
      res.json(updatedDoc.data());
    } else {
      res.json(analyticsDoc.data());
    }
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manual Analytics Update Endpoint
 */
export const updateAnalyticsManual = onRequest(async (req, res) => {
  try {
    await updateAnalytics();
    res.json({
      success: true,
      message: 'Analytics updated successfully'
    });
  } catch (error) {
    logger.error('Error updating analytics manually:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Stock Status Endpoint
 */
export const getStockStatus = onRequest(async (req, res) => {
  try {
    const inventorySnapshot = await db.collection('inventory')
      .where('status', '==', 'ready')
      .get();
    
    const stockByPackage = {};
    inventorySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const pkg = data.package_type || 'premium';
      stockByPackage[pkg] = (stockByPackage[pkg] || 0) + 1;
    });
    
    res.json({
      total: inventorySnapshot.size,
      byPackage: stockByPackage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting stock status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SCHEDULED FUNCTIONS ====================

/**
 * Daily Analytics Update (Scheduled)
 * Runs every day at midnight
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const dailyAnalyticsUpdate = onSchedule('0 0 * * *', async (event) => {
  logger.info('Running daily analytics update');
  
  try {
    await updateAnalytics();
    logger.info('Daily analytics update completed');
  } catch (error) {
    logger.error('Error in daily analytics update:', error);
  }
});

/**
 * Clean Old Sessions (Scheduled)
 * Runs every hour to clean sessions older than 24 hours
 */
export const cleanOldSessions = onSchedule('0 * * * *', async (event) => {
  logger.info('Running session cleanup');
  
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const sessionsSnapshot = await db.collection('user_sessions')
      .where('updated_at', '<', oneDayAgo)
      .get();
    
    const batch = db.batch();
    sessionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    logger.info(`Cleaned ${sessionsSnapshot.size} old sessions`);
  } catch (error) {
    logger.error('Error cleaning old sessions:', error);
  }
});
