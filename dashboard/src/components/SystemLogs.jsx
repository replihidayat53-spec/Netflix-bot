import React, { useEffect, useState } from 'react';
import { Terminal, Info, AlertTriangle, XCircle, ShieldCheck, Clock } from 'lucide-react';
import { subscribeToLogs } from '../services/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getLogIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm:ss', { locale: id });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-netflix-red/10 rounded-xl">
            <Terminal className="w-6 h-6 text-netflix-red" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Log Aktivitas Sistem</h3>
            <p className="text-sm text-gray-400">Monitoring aktivitas bot dan admin secara real-time</p>
          </div>
        </div>

        <div className="bg-black/40 rounded-xl border border-gray-800 font-mono text-sm overflow-hidden">
          <div className="p-3 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">System Terminal v1.0</span>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {logs.length === 0 && (
              <p className="text-gray-600 italic">Menunggu aktivitas baru...</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group hover:bg-white/5 p-1 rounded transition-colors">
                <span className="text-gray-600 shrink-0">[{formatDate(log.created_at)}]</span>
                <span className="flex items-center gap-2 shrink-0">
                  {getLogIcon(log.type)}
                  <span className={`uppercase text-[10px] font-bold px-1.5 rounded border ${
                    log.type === 'error' ? 'text-red-500 border-red-500/30 bg-red-500/5' :
                    log.type === 'warning' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5' :
                    log.type === 'admin' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' :
                    'text-gray-400 border-gray-400/30 bg-gray-400/5'
                  }`}>
                    {log.type || 'info'}
                  </span>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-200">{log.action}</span>
                  {log.details && (
                    <span className="text-gray-500 text-xs italic">{log.details}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
