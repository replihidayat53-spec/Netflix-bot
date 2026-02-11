import React, { useState, useEffect } from 'react';
import { Search, Filter, User, UserCheck, CreditCard, Edit, Users, Plus, X } from 'lucide-react';
import { subscribeToUsers, updateUser, createUser } from '../services/firestore';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState('customer');

  // Add State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '', // Telegram ID
    first_name: '',
    username: '',
    role: 'customer',
    balance: 0
  });

  useEffect(() => {
    const unsubscribe = subscribeToUsers((usersData) => {
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setBalance(user.balance || 0);
    setRole(user.role || 'customer');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, {
        balance: Number(balance),
        role: role
      });
      setEditingUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.id || !newUser.first_name) {
      toast.error('ID Telegram dan Nama wajib diisi!');
      return;
    }

    try {
      await createUser({
        ...newUser,
        balance: Number(newUser.balance)
      });
      setIsAddOpen(false);
      setNewUser({
        id: '',
        first_name: '',
        username: '',
        role: 'customer',
        balance: 0
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-red-500/10 text-red-500 border border-red-500/30">Admin</span>;
      case 'reseller_gold':
        return <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Gold Reseller</span>;
      case 'reseller_silver':
        return <span className="badge bg-gray-400/10 text-gray-300 border border-gray-400/30">Silver Reseller</span>;
      default:
        return <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/30">Customer</span>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || 
      (filterRole === 'reseller' ? user.role?.includes('reseller') : user.role === filterRole);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="text-center py-10 text-gray-400">Loading users...</div>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Reseller</p>
          <p className="text-3xl font-bold text-yellow-400">
            {users.filter(u => u.role?.includes('reseller')).length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Saldo Member</p>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(users.reduce((sum, u) => sum + (u.balance || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Cari nama, username, atau ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field"
              >
                <option value="all">Semua Role</option>
                <option value="customer">Customer</option>
                <option value="reseller">Reseller (All)</option>
                <option value="reseller_gold">Gold Reseller</option>
                <option value="reseller_silver">Silver Reseller</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">User</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Role</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Saldo</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.first_name || 'No Name'}</p>
                        <p className="text-xs text-gray-400">@{user.username || '-'}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-green-400">{formatCurrency(user.balance)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-blue-400"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    Tidak ada user ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <p className="text-gray-400 mb-6 font-mono text-sm">
              {editingUser.first_name} (@{editingUser.username || '-'})
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="customer">Customer</option>
                  <option value="reseller_silver">Silver Reseller</option>
                  <option value="reseller_gold">Gold Reseller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Saldo (IDR)</label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="input-field w-full"
                  min="0"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Tambah User Baru</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telegram ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newUser.id}
                  onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                  className="input-field w-full"
                  placeholder="Contoh: 12345678"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">ID numeric user dari Telegram</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Username (Optional)</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="input-field w-full"
                  placeholder="tanpa @"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="input-field w-full"
                >
                  <option value="customer">Customer</option>
                  <option value="reseller_silver">Silver Reseller</option>
                  <option value="reseller_gold">Gold Reseller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Saldo Awal</label>
                <input
                  type="number"
                  value={newUser.balance}
                  onChange={(e) => setNewUser({...newUser, balance: e.target.value})}
                  className="input-field w-full"
                  min="0"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Buat User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
