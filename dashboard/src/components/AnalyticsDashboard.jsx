import React, { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { getAnalytics } from '../services/firestore';

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = 'netflix-red' }) => {
  const colorMap = {
    'netflix-red': {
      bg: 'from-netflix-red/20 to-netflix-red/5',
      border: 'border-netflix-red/30',
      icon: 'text-netflix-red',
      glow: 'shadow-netflix-red/20'
    },
    'green': {
      bg: 'from-green-500/20 to-green-500/5',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      glow: 'shadow-green-500/20'
    },
    'blue': {
      bg: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/20'
    },
    'purple': {
      bg: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/20'
    }
  };

  const colors = colorMap[color] || colorMap['netflix-red'];

  return (
    <div className={`stat-card group ${colors.glow} hover:shadow-2xl`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon with gradient background */}
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          
          <div className="text-sm text-netflix-lightGray/70 mb-2 font-medium">{title}</div>
          <div className="text-4xl font-black mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-netflix-lightGray/60">{subtitle}</div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
            trend > 0 
              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAnalytics();
    
    // Refresh setiap 30 detik
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-slow text-netflix-lightGray">
          Memuat data analytics...
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="card text-center text-netflix-lightGray">
        Tidak ada data analytics
      </div>
    );
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Stok"
          value={analytics.totalAccounts}
          subtitle={`${analytics.readyAccounts} siap jual`}
          color="blue"
        />
        
        <StatCard
          icon={CheckCircle}
          title="Akun Terjual"
          value={analytics.soldAccounts}
          subtitle={`${analytics.paidOrders} transaksi lunas`}
          color="green"
        />
        
        <StatCard
          icon={DollarSign}
          title="Total Pendapatan"
          value={formatCurrency(analytics.totalRevenue)}
          subtitle="Dari penjualan"
          color="netflix-red"
        />
        
        <StatCard
          icon={ShoppingCart}
          title="Total Pesanan"
          value={analytics.totalOrders}
          subtitle={`${analytics.paidOrders} lunas`}
          color="purple"
        />
      </div>
      
      {/* Stock by Package Type */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Stok per Paket
        </h3>
        
        <div className="space-y-4">
          {Object.entries(analytics.accountsByPackage).map(([packageType, stats]) => (
            <div key={packageType} className="border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold capitalize text-lg">{packageType}</h4>
                  <p className="text-sm text-netflix-lightGray">
                    Total: {stats.total} akun
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">{stats.ready}</div>
                  <div className="text-xs text-netflix-lightGray">Siap Jual</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-dark-hover rounded-full h-2 overflow-hidden">
                <div
                  className="bg-netflix-red h-full transition-all duration-500"
                  style={{ width: `${(stats.ready / stats.total) * 100}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-netflix-lightGray">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {stats.ready} Ready
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  {stats.sold} Sold
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  {stats.total - stats.ready - stats.sold} Processing
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
