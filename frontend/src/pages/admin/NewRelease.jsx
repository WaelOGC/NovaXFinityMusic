import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import { Upload, Music, Image, X, Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const GENRES = {
  'Pop': ['Dance Pop', 'Electropop', 'Indie Pop', 'Synth Pop', 'Teen Pop'],
  'Rock': ['Classic Rock', 'Hard Rock', 'Indie Rock', 'Punk', 'Grunge', 'Progressive Rock'],
  'Hip-Hop/Rap': ['Trap', 'Boom Bap', 'Drill', 'Conscious', 'Old School', 'Cloud Rap'],
  'R&B/Soul': ['Contemporary R&B', 'Neo Soul', 'Funk', 'Motown', 'Gospel'],
  'Electronic': ['House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass', 'Ambient', 'EDM', 'Lo-Fi', 'Synthwave', 'Future Bass', 'Garage', 'Hardstyle'],
  'Jazz': ['Smooth Jazz', 'Bebop', 'Fusion', 'Swing', 'Blues Jazz'],
  'Classical': ['Orchestral', 'Chamber Music', 'Opera', 'Piano', 'Baroque'],
  'Metal': ['Heavy Metal', 'Death Metal', 'Black Metal', 'Thrash', 'Doom', 'Metalcore'],
  'Country': ['Classic Country', 'Country Pop', 'Bluegrass', 'Americana'],
  'Latin': ['Reggaeton', 'Salsa', 'Bachata', 'Latin Pop', 'Cumbia'],
  'Reggae': ['Dancehall', 'Roots Reggae', 'Dub'],
  'Folk': ['Indie Folk', 'Traditional Folk', 'Acoustic'],
  'Blues': ['Delta Blues', 'Chicago Blues', 'Electric Blues'],
  'Soundtrack': ['Film Score', 'Video Game', 'TV Series'],
  'Alternative': ['Indie', 'Post-Rock', 'Shoegaze', 'Dream Pop'],
  'World Music': ['African', 'Middle Eastern', 'Asian', 'Celtic'],
};

const steps = ['Type & Cover', 'Details', 'Tracks', 'Review'];

export default function NewRelease() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [releaseType, setReleaseType] = useState('album'); // 'album' | 'single'
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Step 2
  const [details, setDetails] = useState({
    title: '', artist: '', release_year: new Date().getFullYear(),
    genre: '', sub_genre: '', description: '', is_premium: false,
  });

  // Step 3
  const [tracks, setTracks] = useState([{ title: '', audio: null, lyrics_lrc: '', duration: '', is_premium: false }]);

  const setDetail = (k) => (e) => setDetails(d => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleCover = (file) => {
    if (!file) return;
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleCover(file);
  };

  const addTrack = () => setTracks(t => [...t, { title: '', audio: null, lyrics_lrc: '', duration: '', is_premium: false }]);
  const removeTrack = (i) => setTracks(t => t.filter((_, idx) => idx !== i));
  const updateTrack = (i, k, v) => setTracks(t => t.map((tr, idx) => idx === i ? { ...tr, [k]: v } : tr));

  const handleAudioDrop = (e, i) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) updateTrack(i, 'audio', file);
  };

  const validateStep = () => {
    if (step === 0 && !cover) { toast.error('Please upload cover art'); return false; }
    if (step === 1 && (!details.title || !details.artist)) { toast.error('Title and artist are required'); return false; }
    if (step === 1 && !details.genre) { toast.error('Please select a genre'); return false; }
    if (step === 2 && tracks.some(t => !t.title || !t.audio)) { toast.error('Each track needs a title and audio file'); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handlePublish = async () => {
    setLoading(true);
    try {
      // Create album
      const albumFd = new FormData();
      albumFd.append('title', details.title);
      albumFd.append('artist', details.artist);
      albumFd.append('release_year', details.release_year);
      albumFd.append('genre', details.sub_genre || details.genre);
      albumFd.append('description', details.description);
      albumFd.append('is_premium', details.is_premium);
      albumFd.append('cover', cover);
      const { data: album } = await adminAPI.createAlbum(albumFd);

      // Upload tracks
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        const trackFd = new FormData();
        trackFd.append('album_id', album.id);
        trackFd.append('title', t.title);
        trackFd.append('artist', details.artist);
        trackFd.append('track_number', i + 1);
        trackFd.append('lyrics_lrc', t.lyrics_lrc || '');
        trackFd.append('is_premium', t.is_premium);
        if (t.duration) trackFd.append('duration', t.duration);
        trackFd.append('audio', t.audio);
        await adminAPI.createTrack(trackFd);
      }

      toast.success('Release published successfully! 🎉');
      navigate('/admin/albums');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button className="btn-icon" onClick={() => navigate('/admin/albums')}><ChevronLeft size={20} /></button>
        <h1 style={{ fontSize: 24 }}>New Release</h1>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'var(--bg-3)', color: i <= step ? '#fff' : 'var(--text-3)', transition: 'all 0.3s' }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--text)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--accent)' : 'var(--border)', margin: '0 12px', transition: 'all 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Type & Cover */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Choose Release Type & Cover</h2>

          {/* Release type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {['album', 'single'].map(type => (
              <div key={type} onClick={() => setReleaseType(type)}
                style={{ padding: 20, borderRadius: 12, border: `2px solid ${releaseType === type ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', textAlign: 'center', background: releaseType === type ? 'var(--accent-dim)' : 'var(--bg-1)', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{type === 'album' ? '💿' : '🎵'}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{type === 'album' ? 'Album' : 'Single'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{type === 'album' ? 'Multiple tracks' : 'One track'}</div>
              </div>
            ))}
          </div>

          {/* Cover upload */}
          <div
            onDrop={handleCoverDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('cover-upload').click()}
            style={{ border: `2px dashed ${coverPreview ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-1)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {coverPreview ? (
              <div style={{ position: 'relative' }}>
                <img src={coverPreview} alt="" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }} />
                <button onClick={e => { e.stopPropagation(); setCover(null); setCoverPreview(null); }}
                  style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div>
                <Image size={40} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Drag & Drop Cover Art</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>or click to browse • JPG, PNG, WEBP</div>
              </div>
            )}
            <input id="cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleCover(e.target.files[0])} />
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Release Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Release Title *</label>
              <input className="input" value={details.title} onChange={setDetail('title')} placeholder="Enter title" required />
            </div>
            <div className="form-group">
              <label className="label">Artist *</label>
              <input className="input" value={details.artist} onChange={setDetail('artist')} placeholder="Artist name" required />
            </div>
            <div className="form-group">
              <label className="label">Release Year</label>
              <input className="input" type="number" value={details.release_year} onChange={setDetail('release_year')} />
            </div>
            <div className="form-group">
              <label className="label">Primary Genre *</label>
              <select className="input" value={details.genre} onChange={e => { setDetail('genre')(e); setDetails(d => ({ ...d, sub_genre: '' })); }}>
                <option value="">Select genre</option>
                {Object.keys(GENRES).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Sub-Genre</label>
              <select className="input" value={details.sub_genre} onChange={setDetail('sub_genre')} disabled={!details.genre}>
                <option value="">Select sub-genre</option>
                {details.genre && GENRES[details.genre]?.map(sg => <option key={sg} value={sg}>{sg}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Description</label>
              <textarea className="input" value={details.description} onChange={setDetail('description')} rows={3} style={{ resize: 'vertical' }} placeholder="Tell us about this release..." />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input type="checkbox" id="is_premium" checked={details.is_premium} onChange={setDetail('is_premium')} style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
            <label htmlFor="is_premium" style={{ fontSize: 14, cursor: 'pointer' }}>Premium release (requires subscription)</label>
          </div>
        </div>
      )}

      {/* Step 3: Tracks */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 20 }}>Tracks {releaseType === 'single' ? '(1 track)' : ''}</h2>
            {releaseType === 'album' && (
              <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={addTrack}>
                <Plus size={14} /> Add Track
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tracks.map((track, i) => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)' }}>Track {i + 1}</span>
                  {tracks.length > 1 && (
                    <button className="btn-icon" onClick={() => removeTrack(i)} style={{ color: 'var(--red)' }}><Trash2 size={14} /></button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="label">Track Title *</label>
                    <input className="input" value={track.title} onChange={e => updateTrack(i, 'title', e.target.value)} placeholder="Track name" />
                  </div>
                  <div>
                    <label className="label">Duration (seconds)</label>
                    <input className="input" type="number" value={track.duration} onChange={e => updateTrack(i, 'duration', e.target.value)} placeholder="240" />
                  </div>
                </div>

                {/* Audio upload */}
                <div
                  onDrop={e => handleAudioDrop(e, i)}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById(`audio-${i}`).click()}
                  style={{ border: `2px dashed ${track.audio ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', background: track.audio ? 'var(--accent-dim)' : 'transparent', marginBottom: 12, transition: 'all 0.2s' }}>
                  {track.audio ? (
                    <div style={{ color: 'var(--accent)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Music size={16} /> {track.audio.name}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-3)', fontSize: 13 }}>
                      <Upload size={16} style={{ display: 'inline', marginRight: 6 }} />
                      Drag & Drop audio or click to browse • MP3, WAV, FLAC
                    </div>
                  )}
                  <input id={`audio-${i}`} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => updateTrack(i, 'audio', e.target.files[0])} />
                </div>

                {/* Lyrics */}
                <div>
                  <label className="label">Lyrics (LRC format - optional)</label>
                  <textarea className="input" value={track.lyrics_lrc} onChange={e => updateTrack(i, 'lyrics_lrc', e.target.value)} rows={3} placeholder={'[00:10.00] First line\n[00:14.50] Second line...'} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <input type="checkbox" id={`premium-${i}`} checked={track.is_premium} onChange={e => updateTrack(i, 'is_premium', e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
                  <label htmlFor={`premium-${i}`} style={{ fontSize: 13, cursor: 'pointer' }}>Premium track only</label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Review & Publish</h2>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {coverPreview && <img src={coverPreview} alt="" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{releaseType}</div>
                <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{details.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>{details.artist} • {details.release_year}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {details.genre && <span style={{ fontSize: 12, background: 'var(--bg-3)', padding: '3px 10px', borderRadius: 20 }}>{details.genre}</span>}
                  {details.sub_genre && <span style={{ fontSize: 12, background: 'var(--bg-3)', padding: '3px 10px', borderRadius: 20 }}>{details.sub_genre}</span>}
                  {details.is_premium && <span className="badge badge-premium">Premium</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Tracks ({tracks.length})</h3>
            {tracks.map((track, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < tracks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{track.audio?.name}</div>
                </div>
                {track.lyrics_lrc && <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 7px', borderRadius: 20 }}>LRC</span>}
                {track.is_premium && <span className="badge badge-premium" style={{ fontSize: 10 }}>Premium</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={step === 0 ? () => navigate('/admin/albums') : handleBack}>
          <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        {step < steps.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handlePublish} disabled={loading} style={{ padding: '10px 28px' }}>
            {loading ? 'Publishing...' : '🚀 Publish Release'}
          </button>
        )}
      </div>
    </div>
  );
}