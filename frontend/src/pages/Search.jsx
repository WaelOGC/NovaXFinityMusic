import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicAPI } from '../utils/api';
import { usePlayerStore } from '../store/playerStore';
import { Search, Play } from 'lucide-react';
import { formatTime } from '../utils/lyrics';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ albums: [], tracks: [] });
  const [loading, setLoading] = useState(false);
  const { playTrack } = usePlayerStore();
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults({ albums: [], tracks: [] }); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await musicAPI.search(query);
        setResults(data);
      } catch {}
      setLoading(false);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Search</h1>
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          className="input"
          placeholder="Search albums, artists, tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: 42, fontSize: 16, padding: '14px 14px 14px 42px' }}
          autoFocus
        />
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>}

      {!loading && query && !results.albums.length && !results.tracks.length && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>No results found for "{query}"</div>
      )}

      {results.albums.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Albums</h2>
          <div className="albums-grid">
            {results.albums.map((album) => (
              <div key={album.id} className="album-card" onClick={() => navigate(`/album/${album.id}`)}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: 'var(--bg-3)', overflow: 'hidden', marginBottom: 10 }}>
                  {album.cover_url
                    ? <img src={album.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎵</div>
                  }
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{album.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{album.artist}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.tracks.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Tracks</h2>
          <div style={{ background: 'var(--bg-1)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {results.tracks.map((track, i) => (
              <div key={track.id} className="track-row" onClick={() => playTrack(track, results.tracks, i)}>
                <div className="track-num">{i + 1}</div>
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <div className="track-duration">{formatTime(track.duration)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!query && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
          <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <div>Start typing to search your music</div>
        </div>
      )}
    </div>
  );
}
