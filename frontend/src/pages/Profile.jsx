import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../utils/api';
import { User, Lock, Music, Heart, Crown, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, loginWithToken } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [profileForm, setProfileForm] = useState({ display_name: user?.display_name || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authAPI.getUserStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (profileForm.display_name) fd.append('display_name', profileForm.display_name);
      if (avatar) fd.append('avatar', avatar);
      const { data } = await authAPI.updateProfile(fd);
      loginWithToken(localStorage.getItem('token'), data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally { setLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      toast.success('Password changed!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'info', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'stats', label: 'My Stats', icon: Music },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: 24, background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
            {avatar
              ? <img src={URL.createObjectURL(avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.display_name || user?.email)?.[0]?.toUpperCase()
            }
          </div>
          <button
            onClick={() => document.getElementById('avatar-input').click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={12} style={{ color: 'var(--text-2)' }} />
          </button>
          <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAvatar(e.target.files[0])} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>{user?.display_name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {user?.subscription === 'premium'
              ? <span className="badge badge-premium"><Crown size={10} /> Premium</span>
              : <span className="badge badge-free">Free Plan</span>
            }
            {user?.role === 'admin' && <span className="badge badge-admin">Admin</span>}
          </div>
        </div>
        {user?.subscription !== 'premium' && (
          <div style={{ marginLeft: 'auto', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <Crown size={20} style={{ color: 'var(--accent)', margin: '0 auto 6px' }} />
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Upgrade to Premium</div>
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => navigate('/premium')}>
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-1)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeTab === id ? 'var(--accent)' : 'transparent', color: activeTab === id ? '#fff' : 'var(--text-2)', transition: 'all 0.2s' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Profile Info */}
      {activeTab === 'info' && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 20 }}>Personal Information</h2>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="label">Display Name</label>
              <input className="input" value={profileForm.display_name} onChange={e => setProfileForm({ display_name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Password */}
      {activeTab === 'password' && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 20 }}>Change Password</h2>
          {user?.google_id && !user?.password_hash ? (
            <div style={{ color: 'var(--text-2)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
              You signed in with Google. Password change is not available.
            </div>
          ) : (
            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label className="label">Current Password</label>
                <input className="input" type="password" value={passwordForm.current_password} onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="label">New Password</label>
                <input className="input" type="password" value={passwordForm.new_password} onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))} minLength={6} required />
              </div>
              <div className="form-group">
                <label className="label">Confirm New Password</label>
                <input className="input" type="password" value={passwordForm.confirm_password} onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <Music size={24} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 700 }}>{stats?.totalPlays ?? 0}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Total Plays</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <Heart size={24} style={{ color: '#ff6b8a', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 700 }}>{stats?.likedTracks ?? 0}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Liked Songs</div>
            </div>
          </div>
          {stats?.recentTracks?.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>Recently Played</h3>
              {stats.recentTracks.map((track, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < stats.recentTracks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={14} style={{ color: 'var(--text-3)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{track.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{track.artist}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(track.played_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}