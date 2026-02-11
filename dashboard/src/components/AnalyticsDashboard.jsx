import React, { useEffect, useState } from 'react';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
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
          subtitle={`${analytics.paidOrders} pesanan lunas`}
          color="green"
        />
        
        <StatCard
          icon={DollarSign}
          title="Pendapatan"
          value={formatCurrency(analytics.totalRevenue)}
          subtitle={`Rata-rata ${analytics.paidOrders > 0 ? formatCurrency(analytics.totalRevenue / analytics.paidOrders) : 'Rp 0'}/order`}
          color="netflix-red"
        />
        
        <StatCard
          icon={ShoppingCart}
          title="Total Pesanan"
          value={analytics.totalOrders}
          subtitle={`${analytics.paidOrders} lunas | ${analytics.totalOrders - analytics.paidOrders} pending`}
          color="purple"
        />
      </div>

      {/* Stock Alerts */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(analytics.accountsByPackage).some(([_, s]) => s.ready < 5) && (
          <div className="w-full flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl animate-pulse">
            <AlertTriangle className="text-yellow-500 w-5 h-5" />
            <p className="text-sm text-yellow-200">
              <span className="font-bold">Peringatan:</span> Beberapa paket memiliki stok rendah (dibawah 5). Harap segera restok!
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-netflix-red" />
            Tren Pendapatan (7 Hari Terakhir)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Rp ${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2D2D2D', borderRadius: '8px' }}
                  itemStyle={{ color: '#E50914' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E50914" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Package className="w-5 h-5 text-blue-400" />
            Distribusi Paket
          </h3>
          <div className="space-y-4">
             {Object.entries(analytics.accountsByPackage).map(([pkg, stats]) => (
               <div key={pkg} className="flex flex-col gap-2">
                 <div className="flex justify-between text-sm">
                   <span className="capitalize text-gray-400">{pkg}</span>
                   <span className="text-white font-bold">{stats.total} Akun</span>
                 </div>
                 <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                   <div 
                    className="bg-netflix-red h-full" 
                    style={{ width: `${(stats.total / analytics.totalAccounts) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Stock by Package Type Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-netflix-red" />
            Monitoring Stok Akun
          </h3>
          
          <div className="space-y-6">
            {Object.entries(analytics.accountsByPackage).map(([packageType, stats]) => (
              <div key={packageType} className="bg-gray-800/20 rounded-xl p-5 border border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold capitalize text-lg text-white">{packageType}</h4>
                    <p className="text-sm text-gray-400">
                      Total {stats.total} Akun di Database
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right border-r border-gray-700 pr-4">
                      <div className="text-xl font-black text-green-400">{stats.ready}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Ready</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-netflix-red">{stats.sold}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-500">Terjual</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full transition-all duration-1000"
                    style={{ width: `${(stats.ready / stats.total) * 100}%` }}
                    title={`Ready: ${stats.ready}`}
                  />
                  <div
                    className="bg-netflix-red h-full transition-all duration-1000 opacity-80"
                    style={{ width: `${(stats.sold / stats.total) * 100}%` }}
                    title={`Sold: ${stats.sold}`}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-gray-400">
                    Stok Tersisa: <span className={`font-bold ${stats.ready < 5 ? 'text-red-500' : 'text-green-500'}`}>{stats.ready}</span>
                  </span>
                  <span className="text-yellow-400 font-medium">
                    {stats.total - stats.ready - stats.sold} Sedang Diproses
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card h-full">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Ringkasan Keuangan
          </h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <p className="text-sm text-gray-400 mb-1">Total Omzet (Lunas)</p>
              <p className="text-2xl font-black text-white">{formatCurrency(analytics.totalRevenue)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Pesanan</span>
                <span className="text-white font-bold">{analytics.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Pesanan Berhasil</span>
                <span className="text-green-400 font-bold">{analytics.paidOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Tingkat Konversi</span>
                <span className="text-blue-400 font-bold">
                  {analytics.totalOrders > 0 ? Math.round((analytics.paidOrders / analytics.totalOrders) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-[10px] uppercase font-black text-gray-500 mb-4 tracking-widest">Informasi Tambahan</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-1">PROSES</p>
                  <p className="text-lg font-bold text-yellow-500">{analytics.totalOrders - analytics.paidOrders}</p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-1">DELIVERED</p>
                  <p className="text-lg font-bold text-green-500">{analytics.soldAccounts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
