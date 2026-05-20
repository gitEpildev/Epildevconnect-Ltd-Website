import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Ban, Trash2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

interface User {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  ip_address: string;
  is_blocked: boolean;
  block_reason: string | null;
  last_login: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      setIsLoading(true);
      // Check if user is authenticated
      const authResponse = await api.get('/auth/user');
      if (!authResponse.data.user) {
        // Redirect to Discord login
        window.location.href = '/auth/discord';
        return;
      }

      // Try to fetch users (only admins can do this)
      const usersResponse = await api.get('/api/admin/users');
      setUsers(usersResponse.data.users);
      setIsAdmin(true);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError('Access Denied: Admin privileges required');
        setIsAdmin(false);
      } else if (error.response?.status === 401) {
        window.location.href = '/auth/discord';
      } else {
        setError('Failed to load admin dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (userId: string) => {
    const reason = prompt('Enter reason for blocking (optional):');
    if (reason === null) return; // User cancelled

    try {
      await api.post(`/api/admin/users/${userId}/block`, { reason });
      // Refresh users list
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      alert('Failed to block user');
    }
  };

  const handleSeedTestMessages = async () => {
    try {
      const response = await api.post('/api/admin/seed-test-messages');
      alert(response.data.message || 'Test messages added successfully!');
      // Optionally refresh page or show success message
    } catch (error) {
      alert('Failed to seed test messages');
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;

    try {
      await api.post(`/api/admin/users/${userId}/unblock`);
      // Refresh users list
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      alert('Failed to unblock user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user and all their data? This cannot be undone.')) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      // Refresh users list
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-quantum-glow animate-spin" />
          <p className="text-gray-400 font-mono">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 max-w-md text-center"
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-semibold hover:opacity-90 transition-all"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-8 h-8 text-quantum-glow" />
            <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-400 font-mono flex items-center gap-2">
              <Users className="w-5 h-5" />
              {users.length} registered users
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSeedTestMessages}
              className="px-4 py-2 rounded-xl bg-quantum-glow text-dark-900 font-mono font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Seed Test Messages
            </motion.button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white border-opacity-10">
                  <th className="text-left p-4 font-mono text-sm text-gray-400">User</th>
                  <th className="text-left p-4 font-mono text-sm text-gray-400">User ID</th>
                  <th className="text-left p-4 font-mono text-sm text-gray-400">IP Address</th>
                  <th className="text-left p-4 font-mono text-sm text-gray-400">Last Login</th>
                  <th className="text-left p-4 font-mono text-sm text-gray-400">Status</th>
                  <th className="text-left p-4 font-mono text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-all"
                  >
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.user_avatar ? (
                          <img
                            src={user.user_avatar}
                            alt={user.user_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-quantum-glow bg-opacity-20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-quantum-glow" />
                          </div>
                        )}
                        <span className="font-semibold">{user.user_name}</span>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="p-4">
                      <code className="text-xs text-gray-400 bg-white bg-opacity-5 px-2 py-1 rounded">
                        {user.user_id}
                      </code>
                    </td>

                    {/* IP Address */}
                    <td className="p-4">
                      <code className="text-sm text-quantum-glow font-mono">
                        {user.ip_address}
                      </code>
                    </td>

                    {/* Last Login */}
                    <td className="p-4 text-sm text-gray-400">
                      {formatDistanceToNow(new Date(user.last_login), { addSuffix: true })}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 bg-opacity-20 text-red-400 text-xs font-semibold">
                          <Ban className="w-3 h-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-400 text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.is_blocked ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUnblock(user.user_id)}
                            className="px-3 py-1.5 rounded-lg bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30 transition-all text-xs font-mono"
                            title="Unblock user"
                          >
                            Unblock
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBlock(user.user_id)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-500 bg-opacity-20 text-yellow-400 hover:bg-opacity-30 transition-all text-xs font-mono flex items-center gap-1"
                            title="Block user"
                          >
                            <Ban className="w-3 h-3" />
                            Block
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(user.user_id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 transition-all text-xs font-mono flex items-center gap-1"
                          title="Delete user and all data"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No users registered yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

