import React, { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { addSingleAccount, addBulkAccounts } from '../services/firestore';
import toast from 'react-hot-toast';

const AddAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [loading, setLoading] = useState(false);
  
  // Single account form
  const [singleForm, setSingleForm] = useState({
    email: '',
    password: '',
    profile_pin: '',
    profile_name: '', // Added profile name
    package_type: 'premium'
  });
  
  // Bulk accounts
  const [bulkText, setBulkText] = useState('');
  
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addSingleAccount(singleForm);
      setSingleForm({ email: '', password: '', profile_pin: '', profile_name: '', package_type: 'premium' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Parse bulk text (format: email|password|pin atau email:password:pin)
      const lines = bulkText.trim().split('\n').filter(line => line.trim());
      const accounts = lines.map(line => {
        const parts = line.includes('|') ? line.split('|') : line.split(':');
        return {
          email: parts[0]?.trim() || '',
          password: parts[1]?.trim() || '',
          profile_pin: parts[2]?.trim() || '',
          package_type: 'premium'
        };
      }).filter(acc => acc.email && acc.password);
      
      if (accounts.length === 0) {
        toast.error('❌ Format tidak valid! Gunakan: email|password|pin');
        setLoading(false);
        return;
      }
      
      await addBulkAccounts(accounts);
      setBulkText('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card max-w-2xl w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tambah Akun Netflix</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
              mode === 'single'
                ? 'bg-netflix-red text-white'
                : 'bg-dark-hover text-netflix-lightGray hover:bg-dark-border'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Input Satuan
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all ${
              mode === 'bulk'
                ? 'bg-netflix-red text-white'
                : 'bg-dark-hover text-netflix-lightGray hover:bg-dark-border'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Input Bulk
          </button>
        </div>
        
        {/* Single Account Form */}
        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">Email / No. HP</label>
                <input
                  type="text"
                  required
                  value={singleForm.email}
                  onChange={(e) => setSingleForm({...singleForm, email: e.target.value})}
                  className="input-field"
                  placeholder="email@netflix.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">Password</label>
                <input
                  type="text"
                  required
                  value={singleForm.password}
                  onChange={(e) => setSingleForm({...singleForm, password: e.target.value})}
                  className="input-field"
                  placeholder="password123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">Tipe Akun</label>
                <select
                  value={singleForm.package_type}
                  onChange={(e) => setSingleForm({...singleForm, package_type: e.target.value})}
                  className="input-field"
                >
                  <option value="premium">Premium (4K) Private</option>
                  <option value="standard">Standard (FHD) Private</option>
                  <option value="basic">Basic (HD) Private</option>
                  <option value="sharing">💎 Sharing (1 Device)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">PIN Profile (Opsional)</label>
                <input
                  type="text"
                  value={singleForm.profile_pin}
                  onChange={(e) => setSingleForm({...singleForm, profile_pin: e.target.value})}
                  className="input-field"
                  placeholder="1111"
                  maxLength={4}
                />
              </div>
            </div>
            
            {singleForm.package_type === 'sharing' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5 opacity-80">Nama Profile / No Profile</label>
                  <input
                      type="text"
                      value={singleForm.profile_name}
                      onChange={(e) => setSingleForm({...singleForm, profile_name: e.target.value})}
                      className="input-field"
                      placeholder="Contoh: Profile 1 atau User A"
                      required={singleForm.package_type === 'sharing'}
                  />
                  <p className="text-xs text-gray-400 mt-1">Wajib diisi untuk akun Sharing agar user tahu harus login ke profile mana.</p>
                </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </form>
        )}
        
        {/* Bulk Account Form */}
        {mode === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Input Akun (Satu baris per akun)
              </label>
              <div className="text-xs text-netflix-lightGray mb-2">
                Format: <code className="bg-dark-hover px-2 py-1 rounded">email|password|pin</code> atau{' '}
                <code className="bg-dark-hover px-2 py-1 rounded">email:password:pin</code>
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="input-field w-full h-64 font-mono text-sm"
                placeholder="user1@netflix.com|password123|1234&#10;user2@netflix.com|password456|5678&#10;user3@netflix.com|password789|9012"
                required
              />
              <div className="text-xs text-netflix-lightGray mt-2">
                Total baris: {bulkText.trim().split('\n').filter(line => line.trim()).length}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Semua Akun'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddAccountModal;
