import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { subscribeToInventory, deleteAccount } from '../services/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const InventoryTable = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToInventory((data) => {
      setAccounts(data);
      setFilteredAccounts(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    // Filter accounts
    let filtered = accounts;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(acc => acc.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(acc =>
        acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.package_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, filterStatus]);
  
  const handleDelete = async (accountId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      await deleteAccount(accountId);
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      ready: {
        icon: CheckCircle,
        text: 'Ready',
        className: 'bg-green-500/20 text-green-500 border-green-500/30'
      },
      sold: {
        icon: XCircle,
        text: 'Sold',
        className: 'bg-red-500/20 text-red-500 border-red-500/30'
      },
      processing: {
        icon: Clock,
        text: 'Processing',
        className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      }
    };
    
    const badge = badges[status] || badges.ready;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
  };
  
  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-hover rounded"></div>
          <div className="h-64 bg-dark-hover rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-netflix-lightGray" />
          <input
            type="text"
            placeholder="Cari email atau paket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-netflix-red text-white'
                : 'bg-dark-hover text-netflix-lightGray hover:bg-dark-border'
            }`}
          >
            Semua ({accounts.length})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'ready'
                ? 'bg-green-500 text-white'
                : 'bg-dark-hover text-netflix-lightGray hover:bg-dark-border'
            }`}
          >
            Ready ({accounts.filter(a => a.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilterStatus('sold')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'sold'
                ? 'bg-red-500 text-white'
                : 'bg-dark-hover text-netflix-lightGray hover:bg-dark-border'
            }`}
          >
            Sold ({accounts.filter(a => a.status === 'sold').length})
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">Password</th>
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">PIN</th>
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">Paket</th>
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-netflix-lightGray">Ditambahkan</th>
              <th className="text-center py-3 px-4 font-semibold text-netflix-lightGray">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-netflix-lightGray">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Tidak ada akun yang sesuai filter'
                    : 'Belum ada akun. Tambahkan akun pertama Anda!'}
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => (
                <tr key={account.id} className="table-row">
                  <td className="py-3 px-4 font-mono text-sm">{account.email}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className="bg-dark-hover px-2 py-1 rounded">
                      {account.password}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {account.profile_pin || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize bg-dark-hover px-3 py-1 rounded-full text-xs font-semibold">
                      {account.package_type || 'premium'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(account.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-netflix-lightGray">
                    {formatDate(account.created_at)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
                      title="Hapus akun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-dark-border text-sm text-netflix-lightGray">
        Menampilkan {filteredAccounts.length} dari {accounts.length} akun
      </div>
    </div>
  );
};

export default InventoryTable;
