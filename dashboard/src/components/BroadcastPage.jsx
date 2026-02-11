import React, { useState, useEffect } from 'react';
import { Send, Image, RefreshCw, Users, AlertTriangle } from 'lucide-react';
import { createBroadcast, subscribeToBroadcasts } from '../services/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const BroadcastPage = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToBroadcasts((data) => {
      setBroadcasts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await createBroadcast(message, target, imageUrl);
      setMessage('');
      setImageUrl('');
      setTarget('all');
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Pending</span>;
      case 'processing':
        return <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/30">Sending...</span>;
      case 'completed':
        return <span className="badge bg-green-500/10 text-green-400 border border-green-500/30">Selesai</span>;
      case 'failed':
        return <span className="badge bg-red-500/10 text-red-400 border border-red-500/30">Gagal</span>;
      default:
        return <span className="badge bg-gray-500/10 text-gray-400 border border-gray-500/30">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading broadcasts...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Broadcast */}
      <div className="card h-fit">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Send className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Buat Broadcast Baru</h3>
            <p className="text-sm text-gray-400">Kirim pesan massal ke pengguna bot</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  target === 'all'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Semua User
              </button>
              <button
                type="button"
                onClick={() => setTarget('reseller')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  target === 'reseller'
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Hanya Reseller
              </button>
              <button
                type="button"
                onClick={() => setTarget('customer')}
                className={`p-3 rounded-lg border text-sm font-semibold transition-all ${
                  target === 'customer'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Hanya Customer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pesan Broadcast</label>
            <textarea
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan promo atau pengumuman di sini..."
              className="input-field w-full resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Tips: Gunakan format Markdown (*bold*, _italic_, `code`) untuk mempercantik pesan.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL Gambar (Opsional)</label>
            <div className="relative">
              <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/promo.jpg"
                className="input-field pl-12 w-full"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Broadcast Sekarang
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
              Pesan akan dikirim secara bertahap oleh Bot
            </p>
          </div>
        </form>
      </div>

      {/* Riwayat Broadcast */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Riwayat Broadcast</h3>
        {broadcasts.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
            <Send className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada riwayat broadcast</p>
          </div>
        ) : (
          broadcasts.map((broadcast) => (
            <div key={broadcast.id} className="card group hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge(broadcast.status)}
                  <span className="text-xs text-gray-500">
                    {broadcast.created_at?.toDate 
                      ? format(broadcast.created_at.toDate(), 'dd MMM yyyy, HH:mm', { locale: id })
                      : '-'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-400">Target</p>
                  <p className="text-sm text-white capitalize">{broadcast.target}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 mb-3">
                <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono line-clamp-3 group-hover:line-clamp-none transition-all">
                  {broadcast.message}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Progress Pengiriman</p>
                  <div className="flex items-center gap-2 h-2 w-32 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((broadcast.sent_count || 0) / (broadcast.total_target || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {broadcast.sent_count || 0} terkirim
                  </p>
                </div>
                
                {broadcast.imageUrl && (
                  <a 
                    href={broadcast.imageUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Image className="w-3 h-3" />
                    Lihat Gambar
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BroadcastPage;
