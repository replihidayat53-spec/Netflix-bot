import { db } from './firebase.js';
import admin from 'firebase-admin';

/**
 * Get Available Account dengan FIFO Logic
 */
export const getAvailableAccount = async (packageType = 'premium') => {
  try {
    return await db.runTransaction(async (transaction) => {
      const inventoryRef = db.collection('inventory');
      const snapshot = await inventoryRef
        .where('status', '==', 'ready')
        .where('package_type', '==', packageType)
        .orderBy('created_at', 'asc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        throw new Error(`Maaf, stok untuk paket ${packageType} sedang habis.`);
      }
      
      const accountDoc = snapshot.docs[0];
      const accountRef = inventoryRef.doc(accountDoc.id);
      
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
      buyer_number: orderData.buyer_number,
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

/**
 * Save User Session
 */
export const saveUserSession = async (userId, sessionData) => {
  try {
    const sessionRef = db.collection('user_sessions').doc(userId);
    await sessionRef.set({
      ...sessionData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error saving user session:', error);
    return false;
  }
};

/**
 * Get User Session
 */
export const getUserSession = async (userId) => {
  try {
    const sessionRef = db.collection('user_sessions').doc(userId);
    const doc = await sessionRef.get();
    
    if (doc.exists) {
      return doc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

/**
 * Clear User Session
 */
export const clearUserSession = async (userId) => {
  try {
    const sessionRef = db.collection('user_sessions').doc(userId);
    await sessionRef.delete();
    return true;
  } catch (error) {
    console.error('Error clearing user session:', error);
    return false;
  }
};
