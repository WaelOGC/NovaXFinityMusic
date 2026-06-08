import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { Users, Music, Disc, TrendingUp, Crown } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const cards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#60a5fa' },
    { icon: Crown, label: 'Premium Users', value: stats?.premiumUsers ?? 0, color: 'var(--premium)' },
    { icon: Disc, label: 'Albums', value: stats?.totalAlbums ?? 0, color: 'var(--accent)' },
    { icon: Music, label: 'Tracks', value: stats?.totalTracks ?? 0, color: '#a78bfa' },
    { icon: TrendingUp, label: 'Total Plays', value: stats?.totalPlays ?? 0, color: '#34d399' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 28 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/albums" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>+ Add Album</Link>
          <Link to="/admin/users" className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>Manage Users</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 700 }}>{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {stats?.topTracks?.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>🔥 Top Tracks</h2>
          {stats.topTracks.map((track, i) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < stats.topTracks.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 24, textAlign: 'center', fontFamily: 'Syne', fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-3)', fontSize: 14 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{track.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{track.artist}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{track.play_count} plays</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        <Link to="/admin/albums" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 20, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Disc size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 4 }}>Manage Albums</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Upload albums, tracks & lyrics</div>
            </div>
          </div>
        </Link>
        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 20, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 4 }}>User Management</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>View & manage subscribers</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
