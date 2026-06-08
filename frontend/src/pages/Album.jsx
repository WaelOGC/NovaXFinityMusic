import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { musicAPI } from '../utils/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { Play, Pause, Clock, Crown, ArrowLeft, Heart } from 'lucide-react';
import { formatTime } from '../utils/lyrics';
import toast from 'react-hot-toast';

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState({});
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const { user, isPremium } = useAuthStore();

  useEffect(() => {
    musicAPI.getAlbum(id).then(({ data }) => {
      setAlbum(data);
      setLoading(false);
    }).catch(() => { navigate('/'); });
  }, [id]);

  const handlePlayTrack = (track, index) => {
    if (!track.is_premium || isPremium()) {
      if (currentTrack?.id === track.id) togglePlay();
      else playTrack(track, album.tracks, index);
    } else {
      toast('This track requires a Premium subscription', { icon: '👑' });
      navigate('/premium');
    }
  };

  const handleLike = async (e, trackId) => {
    e.stopPropagation();
    if (!user) { toast.error('Sign in to like tracks'); return; }
    try {
      const { data } = await musicAPI.likeTrack(trackId);
      setLiked((prev) => ({ ...prev, [trackId]: data.liked }));
    } catch {}
  };

  const handlePlayAll = () => {
    const playable = album.tracks.filter(t => !t.is_premium || isPremium());
    if (playable.length) playTrack(playable[0], album.tracks, 0);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!album) return null;

  return (
    <div>
      {/* Back */}
      <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={20} />
      </button>

      {/* Album Header */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'flex-end' }}>
        <div style={{ width: 180, height: 180, borderRadius: 12, background: 'var(--bg-3)', flexShrink: 0, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {album.cover_url
            ? <img src={album.cover_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🎵</div>
          }
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Album {album.genre && `• ${album.genre}`}
          </div>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>{album.title}</h1>
          <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4 }}>{album.artist}</div>
          {album.release_year && <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>{album.release_year} • {album.tracks?.length} tracks</div>}
          {album.description && <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 500, lineHeight: 1.6, marginBottom: 16 }}>{album.description}</p>}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handlePlayAll}>
              <Play size={16} fill="currentColor" /> Play All
            </button>
            {album.is_premium && <span className="badge badge-premium"><Crown size={11} /> Premium Album</span>}
          </div>
        </div>
      </div>

      {/* Track List */}
      <div style={{ background: 'var(--bg-1)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px auto', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          <span>#</span><span>Title</span><span style={{ textAlign: 'right' }}><Clock size={13} /></span><span></span>
        </div>
        {album.tracks?.map((track, i) => {
          const isActive = currentTrack?.id === track.id;
          const isPremiumLocked = track.is_premium && !isPremium();
          return (
            <div
              key={track.id}
              className={`track-row${isActive ? ' active' : ''}`}
              onClick={() => handlePlayTrack(track, i)}
              style={{ gridTemplateColumns: '32px 1fr 80px auto', opacity: isPremiumLocked ? 0.5 : 1 }}
            >
              <div className="track-num">
                {isActive && isPlaying ? (
                  <div className="equalizer">
                    <span /><span /><span />
                  </div>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <div className="track-info">
                <div className="track-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {track.title}
                  {track.is_premium && <Crown size={11} style={{ color: 'var(--premium)', flexShrink: 0 }} />}
                </div>
                <div className="track-artist">{track.artist || album.artist}</div>
              </div>
              <div className="track-duration" style={{ textAlign: 'right' }}>
                {formatTime(track.duration)}
              </div>
              <button
                className="btn-icon"
                onClick={(e) => handleLike(e, track.id)}
                style={{ color: liked[track.id] ? '#ff6b8a' : undefined }}
              >
                <Heart size={15} fill={liked[track.id] ? 'currentColor' : 'none'} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
