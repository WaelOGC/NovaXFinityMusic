import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicAPI } from '../utils/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { Play, Crown } from 'lucide-react';
import { formatTime } from '../utils/lyrics';

export default function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayerStore();
  const { user, isPremium } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    musicAPI.getAlbums({ limit: 20 }).then(({ data }) => {
      setAlbums(data.albums);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAlbumClick = (album) => navigate(`/album/${album.id}`);

  const handlePlayAlbum = async (e, album) => {
    e.stopPropagation();
    try {
      const { data } = await musicAPI.getAlbum(album.id);
      if (data.tracks?.length) {
        playTrack(data.tracks[0], data.tracks, 0);
      }
    } catch {}
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          {user ? `Welcome back, ${user.display_name?.split(' ')[0]} 👋` : 'Your Music, Everywhere'}
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
          {user ? 'Pick up where you left off' : 'Sign in to unlock your full library'}
        </p>
      </div>

      {/* Ad banner for free users */}
      {user && !isPremium() && (
        <div className="ad-banner">
          <div style={{ marginBottom: 8, fontSize: 13 }}>📢 Advertisement</div>
          <div>Your ad could go here • <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/premium')}>Upgrade to Premium</span> to remove ads</div>
        </div>
      )}

      {/* Recent Albums */}
      <div className="section-header">
        <h2 className="section-title">Albums</h2>
        <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => navigate('/search')}>
          See all
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : !albums.length ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
          <div>No albums yet. {user?.role === 'admin' && <span>Add some from the <a href="/admin/albums" style={{ color: 'var(--accent)' }}>admin panel</a>.</span>}</div>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map((album) => (
            <div key={album.id} className="album-card" onClick={() => handleAlbumClick(album)}>
              <div style={{ position: 'relative' }}>
                <div className="cover" style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  {album.cover_url
                    ? <img src={album.cover_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: 'var(--text-3)' }}>🎵</div>
                  }
                </div>
                <button
                  onClick={(e) => handlePlayAlbum(e, album)}
                  style={{ position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', opacity: 0, transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  className="play-btn"
                >
                  <Play size={16} fill="currentColor" />
                </button>
                {album.is_premium && (
                  <span className="badge badge-premium" style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Crown size={9} /> PRO
                  </span>
                )}
              </div>
              <div className="title" style={{ marginTop: 10 }}>{album.title}</div>
              <div className="artist">{album.artist}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`.album-card:hover .play-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}
