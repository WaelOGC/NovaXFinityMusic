import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { Plus, Edit, Trash2, X, Upload, Music } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAlbums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);

  useEffect(() => { loadAlbums(); }, []);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/music/albums?limit=100', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const json = await res.json();
      setAlbums(json.albums || []);
    } catch {}
    setLoading(false);
  };

  const loadTracks = async (albumId) => {
    const res = await fetch(`/api/music/albums/${albumId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    const data = await res.json();
    setTracks(data.tracks || []);
  };

  const handleDeleteAlbum = async (id) => {
    if (!confirm('Delete this album and all its tracks?')) return;
    try {
      await adminAPI.deleteAlbum(id);
      toast.success('Album deleted');
      loadAlbums();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeleteTrack = async (id) => {
    if (!confirm('Delete this track?')) return;
    try {
      await adminAPI.deleteTrack(id);
      toast.success('Track deleted');
      if (selectedAlbum) loadTracks(selectedAlbum.id);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28 }}>Albums</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/new-release')}>
          <Plus size={16} /> New Release
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {!albums.length && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>
              No albums yet. Create your first one!
            </div>
          )}
          {albums.map((album) => (
            <div key={album.id} className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--bg-3)', flexShrink: 0, overflow: 'hidden' }}>
                {album.cover_url
                  ? <img src={album.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{album.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{album.artist} {album.release_year && `• ${album.release_year}`} {album.genre && `• ${album.genre}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                  setSelectedAlbum(album);
                  loadTracks(album.id);
                  setModal('tracks');
                }}>
                  <Music size={14} /> Tracks
                </button>
                <button className="btn-icon" onClick={() => { setEditingAlbum(album); setModal('album'); }}><Edit size={15} /></button>
                <button className="btn-icon" onClick={() => handleDeleteAlbum(album.id)} style={{ color: 'var(--red)' }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'album' && (
        <AlbumModal
          album={editingAlbum}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadAlbums(); }}
        />
      )}

      {modal === 'tracks' && selectedAlbum && (
        <TracksModal
          album={selectedAlbum}
          tracks={tracks}
          onClose={() => setModal(null)}
          onAdd={() => loadTracks(selectedAlbum.id)}
          onDelete={handleDeleteTrack}
        />
      )}
    </div>
  );
}

function AlbumModal({ album, onClose, onSave }) {
  const [form, setForm] = useState({ title: album?.title || '', artist: album?.artist || '', release_year: album?.release_year || '', genre: album?.genre || '', description: album?.description || '', is_premium: album?.is_premium || false });
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cover) fd.append('cover', cover);
      if (album) await adminAPI.updateAlbum(album.id, fd);
      else await adminAPI.createAlbum(fd);
      toast.success(album ? 'Album updated' : 'Album created');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>{album ? 'Edit Album' : 'New Album'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Cover Art</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: cover ? 'var(--accent-dim)' : 'transparent' }}
              onClick={() => document.getElementById('cover-input').click()}>
              {cover ? <span style={{ color: 'var(--accent)', fontSize: 13 }}>✓ {cover.name}</span> : <span style={{ color: 'var(--text-3)', fontSize: 13 }}><Upload size={16} style={{ display: 'inline', marginRight: 6 }} />Click to upload cover image</span>}
              <input id="cover-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setCover(e.target.files[0])} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label className="label">Artist *</label>
              <input className="input" value={form.artist} onChange={set('artist')} required />
            </div>
            <div className="form-group">
              <label className="label">Year</label>
              <input className="input" type="number" value={form.release_year} onChange={set('release_year')} placeholder="2024" />
            </div>
            <div className="form-group">
              <label className="label">Genre</label>
              <input className="input" value={form.genre} onChange={set('genre')} placeholder="Pop, Rock, etc." />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" value={form.description} onChange={set('description')} rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="is_premium" checked={form.is_premium} onChange={set('is_premium')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
            <label htmlFor="is_premium" style={{ fontSize: 14, cursor: 'pointer' }}>Premium album (requires subscription)</label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Album'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TracksModal({ album, tracks, onClose, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', artist: '', track_number: tracks.length + 1, lyrics_lrc: '', is_premium: false, duration: '' });
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleAddTrack = async (e) => {
    e.preventDefault();
    if (!audio) { toast.error('Audio file required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('album_id', album.id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('audio', audio);
      await adminAPI.createTrack(fd);
      toast.success('Track added');
      setShowAdd(false);
      setForm({ title: '', artist: '', track_number: tracks.length + 2, lyrics_lrc: '', is_premium: false, duration: '' });
      setAudio(null);
      onAdd();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add track');
    } finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Tracks — {album.title}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{tracks.length} tracks</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setShowAdd(!showAdd)}>
              <Plus size={14} /> Add Track
            </button>
            <button className="btn-icon" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleAddTrack} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div><label className="label">Title *</label><input className="input" value={form.title} onChange={set('title')} required /></div>
              <div><label className="label">Artist</label><input className="input" value={form.artist} onChange={set('artist')} placeholder={album.artist} /></div>
              <div><label className="label">Track #</label><input className="input" type="number" value={form.track_number} onChange={set('track_number')} /></div>
              <div><label className="label">Duration (sec)</label><input className="input" type="number" value={form.duration} onChange={set('duration')} placeholder="240" /></div>
            </div>
            <div className="form-group">
              <label className="label">Audio File *</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: 14, textAlign: 'center', cursor: 'pointer', background: audio ? 'var(--accent-dim)' : 'transparent' }}
                onClick={() => document.getElementById('audio-input').click()}>
                {audio ? <span style={{ color: 'var(--accent)', fontSize: 13 }}>✓ {audio.name}</span> : <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Upload MP3/WAV/FLAC</span>}
                <input id="audio-input" type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setAudio(e.target.files[0])} />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Lyrics (LRC format)</label>
              <textarea className="input" value={form.lyrics_lrc} onChange={set('lyrics_lrc')} rows={4} placeholder={'[00:10.00] First line of lyrics\n[00:14.50] Second line...'} style={{ fontFamily: 'monospace', fontSize: 12 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <input type="checkbox" id="track_premium" checked={form.is_premium} onChange={set('is_premium')} style={{ accentColor: 'var(--accent)' }} />
              <label htmlFor="track_premium" style={{ fontSize: 13, cursor: 'pointer' }}>Premium only</label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }} disabled={loading}>{loading ? 'Uploading...' : 'Add Track'}</button>
            </div>
          </form>
        )}

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {!tracks.length && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>No tracks yet</div>}
          {tracks.map((track, i) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>{track.track_number || i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{track.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{track.artist}</div>
              </div>
              {track.lyrics_lrc && <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: 20 }}>LRC</span>}
              <button className="btn-icon" onClick={() => onDelete(track.id)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}