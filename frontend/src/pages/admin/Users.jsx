import { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { Crown, Shield, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(), 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, page, limit: 20 });
      setUsers(data.users);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  const handleUpdate = async (id, updates) => {
    try {
      await adminAPI.updateUser(id, updates);
      toast.success('User updated');
      loadUsers();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28 }}>Users <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 400 }}>({total})</span></h1>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input className="input" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 38 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Role', 'Subscription', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!users.length && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>No users found</td></tr>
              )}
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{user.display_name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={user.role} onChange={e => handleUpdate(user.id, { role: e.target.value })}
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, color: user.role === 'admin' ? 'var(--accent)' : 'var(--text)', padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select value={user.subscription} onChange={e => handleUpdate(user.id, { subscription: e.target.value })}
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, color: user.subscription === 'premium' ? 'var(--premium)' : 'var(--text-2)', padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-2)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn-icon" onClick={() => handleDelete(user.id)} style={{ color: 'var(--red)' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
