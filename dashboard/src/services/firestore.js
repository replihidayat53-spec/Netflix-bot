import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import toast from 'react-hot-toast';

// ==================== INVENTORY MANAGEMENT ====================

/**
 * Tambah Akun Satuan
 */
export const addSingleAccount = async (accountData) => {
  try {
    const docRef = await addDoc(collection(db, 'inventory'), {
      email: accountData.email,
      password: accountData.password,
      profile_pin: accountData.profile_pin || '',
      package_type: accountData.package_type || 'premium',
      status: 'ready',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    toast.success('✅ Akun berhasil ditambahkan!');
    return docRef.id;
  } catch (error) {
    console.error('Error adding account:', error);
    toast.error('❌ Gagal menambahkan akun: ' + error.message);
    throw error;
  }
};

/**
 * Tambah Akun Bulk (Massal)
 */
export const addBulkAccounts = async (accountsArray) => {
  try {
    const batch = writeBatch(db);
    const inventoryRef = collection(db, 'inventory');
    
    accountsArray.forEach((account) => {
      const newDocRef = doc(inventoryRef);
      batch.set(newDocRef, {
        email: account.email,
        password: account.password,
        profile_pin: account.profile_pin || '',
        package_type: account.package_type || 'premium',
        status: 'ready',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    });
    
    await batch.commit();
    toast.success(`✅ ${accountsArray.length} akun berhasil ditambahkan!`);
    return true;
  } catch (error) {
    console.error('Error adding bulk accounts:', error);
    toast.error('❌ Gagal menambahkan akun bulk: ' + error.message);
    throw error;
  }
};

/**
 * Update Status Akun
 */
export const updateAccountStatus = async (accountId, status, additionalData = {}) => {
  try {
    const accountRef = doc(db, 'inventory', accountId);
    await updateDoc(accountRef, {
      status,
      updated_at: serverTimestamp(),
      ...additionalData
    });
    
    return true;
  } catch (error) {
    console.error('Error updating account status:', error);
    throw error;
  }
};

/**
 * Hapus Akun
 */
export const deleteAccount = async (accountId) => {
  try {
    await deleteDoc(doc(db, 'inventory', accountId));
    toast.success('✅ Akun berhasil dihapus!');
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    toast.error('❌ Gagal menghapus akun: ' + error.message);
    throw error;
  }
};

/**
 * Get Inventory dengan Real-time Listener
 */
export const subscribeToInventory = (callback) => {
  const q = query(
    collection(db, 'inventory'),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(accounts);
  });
};

/**
 * Get Available Account (FIFO) - Untuk Bot
 */
export const getAvailableAccount = async (packageType = 'premium') => {
  try {
    return await runTransaction(db, async (transaction) => {
      // Query untuk mendapatkan akun ready dengan FIFO (created_at ASC)
      const q = query(
        collection(db, 'inventory'),
        where('status', '==', 'ready'),
        where('package_type', '==', packageType),
        orderBy('created_at', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Stok habis untuk paket ' + packageType);
      }
      
      // Ambil akun pertama (FIFO)
      const accountDoc = snapshot.docs[0];
      const accountRef = doc(db, 'inventory', accountDoc.id);
      
      // Update status menjadi 'processing' untuk mencegah race condition
      transaction.update(accountRef, {
        status: 'processing',
        updated_at: serverTimestamp()
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

// ==================== ORDERS MANAGEMENT ====================

/**
 * Create Order
 */
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      buyer_id: orderData.buyer_id,
      buyer_name: orderData.buyer_name || '',
      package_type: orderData.package_type,
      price: orderData.price,
      payment_status: 'pending',
      account_sent: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update Order
 */
export const updateOrder = async (orderId, updateData) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updateData,
      updated_at: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Subscribe to Orders
 */
export const subscribeToOrders = (callback) => {
  const q = query(
    collection(db, 'orders'),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

// ==================== ANALYTICS ====================

/**
 * Get Analytics Data
 */
export const getAnalytics = async () => {
  try {
    const [inventorySnapshot, ordersSnapshot] = await Promise.all([
      getDocs(collection(db, 'inventory')),
      getDocs(collection(db, 'orders'))
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
    
    return {
      totalAccounts,
      readyAccounts,
      soldAccounts,
      totalOrders,
      paidOrders,
      totalRevenue,
      accountsByPackage
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================

/**
 * Get Settings
 */
export const getSettings = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'settings'));
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

/**
 * Update Settings
 */
export const updateSettings = async (settingsId, settingsData) => {
  try {
    const settingsRef = doc(db, 'settings', settingsId);
    await updateDoc(settingsRef, {
      ...settingsData,
      updated_at: serverTimestamp()
    });
    
    toast.success('✅ Pengaturan berhasil diperbarui!');
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    toast.error('❌ Gagal memperbarui pengaturan: ' + error.message);
    throw error;
  }
};

// ==================== USER & RESELLER MANAGEMENT ====================

/**
 * Get All Users (Real-time)
 */
export const subscribeToUsers = (callback) => {
  const q = query(
    collection(db, 'users'),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  });
};

/**
 * Update User (Set Reseller/Balance)
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updated_at: serverTimestamp()
    });
    toast.success('✅ Data user berhasil diupdate!');
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    toast.error('❌ Gagal update user: ' + error.message);
    throw error;
  }
};

/**
 * Create New User (Manual Add)
 */
export const createUser = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.id);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      throw new Error('User dengan ID ini sudah ada!');
    }
    
    await setDoc(userRef, {
      ...userData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    toast.success('✅ User baru berhasil ditambahkan!');
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    toast.error('❌ Gagal membuat user: ' + error.message);
    throw error;
  }
};

// ==================== BROADCAST SYSTEM ====================

/**
 * Create Broadcast (Triggered by Dashboard, Picked up by Bot)
 */
export const createBroadcast = async (message, target = 'all', imageUrl = null) => {
  try {
    await addDoc(collection(db, 'broadcasts'), {
      message,
      target, // 'all', 'resellers', 'customers'
      imageUrl,
      status: 'pending', // Bot will listen to 'pending' broadcasts
      created_by: 'admin',
      created_at: serverTimestamp(),
      sent_count: 0,
      total_target: 0
    });
    toast.success('✅ Broadcast dijadwalkan! Bot akan segera mengirimnya.');
    return true;
  } catch (error) {
    console.error('Error creating broadcast:', error);
    toast.error('❌ Gagal membuat broadcast: ' + error.message);
    throw error;
  }
};

/**
 * Subscribe to Broadcast History
 */
export const subscribeToBroadcasts = (callback) => {
  const q = query(
    collection(db, 'broadcasts'),
    orderBy('created_at', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const broadcasts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(broadcasts);
  });
};
