import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, DollarSign, Bell, Shield, Database } from 'lucide-react';
import { getSettings, updateSettings } from '../services/firestore';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    prices: {
      premium: 25000,
      standard: 20000,
      basic: 15000
    },
    notifications: {
      emailOnOrder: true,
      emailOnPayment: true,
      telegramNotifications: true
    },
    system: {
      autoDelivery: true,
      maintenanceMode: false,
      allowBulkOrders: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If settings exist, update them
      const existingSettings = await getSettings();
      if (existingSettings?.id) {
        await updateSettings(existingSettings.id, settings);
      } else {
        // Create new settings document
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        await addDoc(collection(db, 'settings'), {
          ...settings,
          created_at: new Date(),
          updated_at: new Date()
        });
        toast.success('✅ Pengaturan berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('❌ Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Pengaturan Sistem</h2>
          <p className="text-gray-400">Kelola konfigurasi dan preferensi sistem</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* Pricing Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pengaturan Harga</h3>
            <p className="text-sm text-gray-400">Atur harga untuk Customer dan Reseller</p>
          </div>
        </div>

        {/* Customer Prices */}
        <div className="mb-8">
            <h4 className="text-md font-semibold text-white mb-4 border-b border-gray-700 pb-2">👤 Harga Customer (Umum)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Premium (4K)</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.customer?.premium || settings.prices?.premium || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, customer: { ...settings.prices?.customer, premium: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12"
                    placeholder="50000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Standard (FHD)</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.customer?.standard || settings.prices?.standard || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, customer: { ...settings.prices?.customer, standard: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12"
                    placeholder="35000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Basic (HD)</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.customer?.basic || settings.prices?.basic || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, customer: { ...settings.prices?.customer, basic: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12"
                    placeholder="25000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-blue-400 mb-2">💎 Sharing (1 Device)</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.customer?.sharing || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, customer: { ...settings.prices?.customer, sharing: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-blue-500/30 focus:border-blue-500"
                    placeholder="15000"
                />
                </div>
            </div>
            </div>
        </div>

        {/* Reseller Silver Prices */}
        <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">🥈 Harga Reseller Silver</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Premium</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_silver?.premium || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_silver: { ...settings.prices?.reseller_silver, premium: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-gray-600"
                    placeholder="45000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Standard</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_silver?.standard || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_silver: { ...settings.prices?.reseller_silver, standard: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-gray-600"
                    placeholder="30000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Basic</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_silver?.basic || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_silver: { ...settings.prices?.reseller_silver, basic: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-gray-600"
                    placeholder="20000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-blue-300 mb-2">Sharing</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_silver?.sharing || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_silver: { ...settings.prices?.reseller_silver, sharing: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-blue-500/30 focus:border-blue-500"
                    placeholder="12000"
                />
                </div>
            </div>
            </div>
        </div>

        {/* Reseller Gold Prices */}
        <div>
            <h4 className="text-md font-semibold text-yellow-500 mb-4 border-b border-gray-700 pb-2">🥇 Harga Reseller Gold</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Premium</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_gold?.premium || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_gold: { ...settings.prices?.reseller_gold, premium: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-yellow-500/30 focus:border-yellow-500"
                    placeholder="35000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Standard</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_gold?.standard || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_gold: { ...settings.prices?.reseller_gold, standard: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-yellow-500/30 focus:border-yellow-500"
                    placeholder="25000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Basic</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_gold?.basic || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_gold: { ...settings.prices?.reseller_gold, basic: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-yellow-500/30 focus:border-yellow-500"
                    placeholder="15000"
                />
                </div>
            </div>
            <div>
                <label className="block text-sm text-blue-300 mb-2">Sharing</label>
                <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                <input
                    type="number"
                    value={settings.prices?.reseller_gold?.sharing || 0}
                    onChange={(e) => setSettings({
                    ...settings,
                    prices: { ...settings.prices, reseller_gold: { ...settings.prices?.reseller_gold, sharing: parseInt(e.target.value) } }
                    })}
                    className="input-field pl-12 border-blue-500/30 focus:border-blue-500"
                    placeholder="10000"
                />
                </div>
            </div>
            </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Bell className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Notifikasi</h3>
            <p className="text-sm text-gray-400">Atur preferensi notifikasi</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Email saat ada pesanan baru</p>
              <p className="text-sm text-gray-400">Terima email notifikasi untuk setiap pesanan baru</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailOnOrder}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailOnOrder: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Email saat pembayaran diterima</p>
              <p className="text-sm text-gray-400">Terima email notifikasi untuk setiap pembayaran</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailOnPayment}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailOnPayment: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Notifikasi Telegram</p>
              <p className="text-sm text-gray-400">Terima notifikasi melalui Telegram bot</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.telegramNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, telegramNotifications: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>
        </div>
      </div>

      {/* System Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sistem</h3>
            <p className="text-sm text-gray-400">Konfigurasi sistem dan fitur</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Auto Delivery</p>
              <p className="text-sm text-gray-400">Kirim akun otomatis setelah pembayaran dikonfirmasi</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.autoDelivery}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, autoDelivery: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Mode Maintenance</p>
              <p className="text-sm text-gray-400">Nonaktifkan sementara bot untuk maintenance</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.maintenanceMode}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, maintenanceMode: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div>
              <p className="font-semibold text-white">Izinkan Bulk Orders</p>
              <p className="text-sm text-gray-400">Izinkan customer memesan lebih dari 1 akun</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.allowBulkOrders}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, allowBulkOrders: e.target.checked }
              })}
              className="w-5 h-5 text-netflix-red bg-gray-700 border-gray-600 rounded focus:ring-netflix-red focus:ring-2"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
