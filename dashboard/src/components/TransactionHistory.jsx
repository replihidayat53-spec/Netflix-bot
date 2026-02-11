import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { subscribeToOrders } from '../services/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const TransactionHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      .reduce((sum, o) => sum + (o.price || 0), 0)
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
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Akun Terkirim</th>
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
                    <td className="py-4 px-4">
                      {order.account_sent ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Ya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                          <XCircle className="w-4 h-4" />
                          Belum
                        </span>
                      )}
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
    </div>
  );
};

export default TransactionHistory;
