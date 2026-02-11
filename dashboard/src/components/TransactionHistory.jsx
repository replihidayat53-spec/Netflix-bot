import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Download, CheckCircle, XCircle, AlertCircle, Eye, User, Mail, Shield } from 'lucide-react';
import { subscribeToOrders } from '../services/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const TransactionHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { label: 'Lunas', class: 'badge-success', icon: CheckCircle },
      pending: { label: 'Pending', class: 'badge-warning', icon: AlertCircle },
      cancelled: { label: 'Dibatalkan', class: 'badge-danger', icon: XCircle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.payment_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.payment_status === 'paid').length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    revenue: orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (Number(o.price) || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Transaksi</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Lunas</p>
          <p className="text-3xl font-bold text-green-400">{stats.paid}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-netflix-red">{formatCurrency(stats.revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Cari nama, ID, atau paket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Tanggal</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Customer</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Paket</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Harga</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Akun</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Tidak ada transaksi ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="py-4 px-4">
                      <p className="text-sm text-white">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-white">{order.buyer_name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.buyer_id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {order.package_type?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-white">{formatCurrency(order.price || 0)}</p>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(order.payment_status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <p>Menampilkan {filteredOrders.length} dari {orders.length} transaksi</p>
        </div>
      )}
      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-netflix-red" />
                Detail Transaksi
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase font-black mb-1">Status</p>
                  {getStatusBadge(selectedOrder.payment_status)}
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase font-black mb-1">Nominal</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(selectedOrder.price || 0)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg"><User className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedOrder.buyer_name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">ID: {selectedOrder.buyer_id} @{selectedOrder.buyer_username || 'n/a'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg"><Mail className="w-5 h-5 text-purple-400" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase mb-1">Info Akun Netflix</p>
                    {selectedOrder.account_sent ? (
                      <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 font-mono text-sm">
                        <p className="text-gray-300">Email: {selectedOrder.account_email || 'Cek Database Inventory'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-500 italic">Belum ada akun yang dikirim</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/10 rounded-lg"><Clock className="w-5 h-5 text-green-400" /></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Waktu Transaksi</p>
                    <p className="text-sm text-white font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                 <div className="flex items-center gap-2 p-3 bg-netflix-red/5 border border-netflix-red/20 rounded-lg">
                    <Shield className="w-4 h-4 text-netflix-red" />
                    <p className="text-[10px] text-netflix-red leading-tight">
                      Order ID: <code>{selectedOrder.id}</code>
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
