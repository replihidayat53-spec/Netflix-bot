import React, { useState } from 'react';
import { Plus, BarChart3, Package, Settings, LogOut, Bell, Clock, Users, Megaphone, Ticket, Terminal } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import AddAccountModal from '../components/AddAccountModal';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import InventoryTable from '../components/InventoryTable';
import UserManagement from '../components/UserManagement';
import BroadcastPage from '../components/BroadcastPage';
import SettingsPage from '../components/SettingsPage';
import TransactionHistory from '../components/TransactionHistory';
import VoucherManager from '../components/VoucherManager';
import SystemLogs from '../components/SystemLogs';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('✅ Berhasil logout');
    } catch (error) {
      toast.error('❌ Gagal logout: ' + error.message);
    }
  };

  const tabs = [
    { id: 'analytics', label: 'Dashboard', icon: BarChart3, description: 'Lihat statistik & analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Pengaturan sistem' },
    { id: 'logs', label: 'Logs', icon: Terminal, description: 'Aktivitas sistem' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Kelola akun Netflix' },
    { id: 'users', label: 'Users', icon: Users, description: 'Manajemen Reseller & Member' },
    { id: 'transactions', label: 'Transaksi', icon: Clock, description: 'Riwayat transaksi' },
    { id: 'vouchers', label: 'Voucher', icon: Ticket, description: 'Kelola kode promo' },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone, description: 'Kirim pesan massal' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-netflix-red to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-black text-white">N</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Netflix Bot</h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Add Account Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-netflix-red text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>

              {/* Mobile Add Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="sm:hidden p-2.5 bg-gradient-to-r from-netflix-red to-red-600 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button 
                onClick={() => setActiveTab('settings')}
                className={`p-2.5 rounded-xl transition-colors relative ${activeTab === 'settings' ? 'bg-netflix-red/20 text-netflix-red' : 'hover:bg-gray-800 text-gray-400'}`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-white">Admin</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-400 group-hover:text-netflix-red transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {currentTab?.label}
              </h2>
              <p className="text-sm text-gray-400">
                {currentTab?.description}
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-sm font-bold text-green-400">● Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/30 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-thin pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-3 font-semibold transition-all relative whitespace-nowrap group ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-all ${
                    isActive ? 'text-netflix-red' : 'text-gray-500 group-hover:text-gray-300'
                  }`} />
                  <span className="text-[11px] sm:text-xs">{tab.label}</span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-netflix-red to-red-600 rounded-t-full"></div>
                  )}
                </button>
              );
            })}
            {/* Spacer for better scrolling on mobile */}
            <div className="w-10 shrink-0"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'inventory' && <InventoryTable />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'transactions' && <TransactionHistory />}
          {activeTab === 'vouchers' && <VoucherManager />}
          {activeTab === 'broadcast' && <BroadcastPage />}
          {activeTab === 'logs' && <SystemLogs />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Refresh akan otomatis karena real-time listener
        }}
      />
    </div>
  );
};

export default Dashboard;
