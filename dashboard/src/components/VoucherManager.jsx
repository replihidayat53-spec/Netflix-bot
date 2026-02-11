import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    quota: ''
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'vouchers'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVouchers(data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      alert('Gagal memuat data voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.amount || !formData.quota) {
      alert('Semua field wajib diisi!');
      return;
    }

    try {
      await addDoc(collection(db, 'vouchers'), {
        code: formData.code.toUpperCase(),
        amount: parseInt(formData.amount),
        quota: parseInt(formData.quota),
        used: 0,
        claimed_by: [],
        created_at: serverTimestamp()
      });

      alert('✅ Voucher berhasil dibuat!');
      setShowModal(false);
      setFormData({ code: '', amount: '', quota: '' });
      fetchVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('❌ Gagal membuat voucher');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;

    try {
      await deleteDoc(doc(db, 'vouchers', id));
      alert('✅ Voucher berhasil dihapus');
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('❌ Gagal menghapus voucher');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🎟️ Voucher Manager</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
        >
          + Buat Voucher Baru
        </button>
      </div>

      {/* Voucher List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            Belum ada voucher. Buat voucher pertama Anda!
          </div>
        ) : (
          vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg font-mono font-bold text-sm">
                  {voucher.code}
                </div>
                <button
                  onClick={() => handleDelete(voucher.id)}
                  className="text-red-400 hover:text-red-300 transition"
                  title="Hapus Voucher"
                >
                  🗑️
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nominal:</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(voucher.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kuota:</span>
                  <span className="text-white font-semibold">{voucher.quota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Terpakai:</span>
                  <span className={`font-semibold ${voucher.used >= voucher.quota ? 'text-red-400' : 'text-yellow-400'}`}>
                    {voucher.used || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sisa:</span>
                  <span className="text-blue-400 font-semibold">{voucher.quota - (voucher.used || 0)}</span>
                </div>
              </div>

              {voucher.used >= voucher.quota && (
                <div className="mt-3 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded text-center">
                  ❌ Kuota Habis
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Create Voucher */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Buat Voucher Baru</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Kode Voucher</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO2024"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Nominal Saldo (Rp)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                  min="1000"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Kuota Pengguna</label>
                <input
                  type="number"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                  placeholder="100"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-400 mt-1">Maksimal berapa orang yang bisa klaim voucher ini</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ code: '', amount: '', quota: '' });
                  }}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Buat Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
