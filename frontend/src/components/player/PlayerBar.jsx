import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { formatTime, parseLRC, getActiveLyricIndex } from '../../utils/lyrics';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Mic2, X, ChevronDown
} from 'lucide-react';

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, duration, currentTime, volume, isMuted,
    isShuffled, repeatMode, isLoading,
    togglePlay, seek, setVolume, toggleMute, next, prev,
    toggleShuffle, toggleRepeat, initAudio,
  } = usePlayerStore();

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const progressRef = useRef(null);
  const lyricsRef = useRef(null);
  const activeLineRef = useRef(null);

  useEffect(() => { initAudio(); }, []);

  useEffect(() => {
    if (currentTrack?.lyrics_lrc) {
      setLyrics(parseLRC(currentTrack.lyrics_lrc));
    } else {
      setLyrics([]);
    }
  }, [currentTrack]);

  useEffect(() => {
    const idx = getActiveLyricIndex(lyrics, currentTime);
    setActiveLyricIndex(idx);
    if (activeLineRef.current && showLyrics) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, lyrics]);

  const handleProgressClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <div className="player-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Select a track to start playing</span>
      </div>
    );
  }

  return (
    <>
      {/* Lyrics Panel */}
      {showLyrics && (
        <div className="lyrics-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 16 }}>Lyrics</h3>
            <button className="btn-icon" onClick={() => setShowLyrics(false)}>
              <X size={16} />
            </button>
          </div>
          <div ref={lyricsRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
            {!lyrics.length ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-3)', fontSize: 14 }}>
                No synchronized lyrics available
              </div>
            ) : lyrics.map((line, i) => (
              <div
                key={i}
                ref={i === activeLyricIndex ? activeLineRef : null}
                className={`lyrics-line${i === activeLyricIndex ? ' active' : ''}`}
                onClick={() => seek(line.time)}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Bar */}
      <div className="player-bar">
        {/* Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-3)', flexShrink: 0, overflow: 'hidden' }}>
            {currentTrack.cover_url
              ? <img src={currentTrack.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {currentTrack.artist || 'Unknown artist'}
            </div>
          </div>
        </div>

        {/* Controls + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn-icon" onClick={toggleShuffle} style={{ color: isShuffled ? 'var(--accent)' : undefined }}>
              <Shuffle size={16} />
            </button>
            <button className="btn-icon" onClick={prev}><SkipBack size={18} /></button>
            <button
              onClick={togglePlay}
              style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {isLoading ? <div className="spinner" style={{ borderTopColor: '#000' }} /> : isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>
            <button className="btn-icon" onClick={next}><SkipForward size={18} /></button>
            <button className="btn-icon" onClick={toggleRepeat} style={{ color: repeatMode !== 'none' ? 'var(--accent)' : undefined }}>
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 480 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(currentTime)}
            </span>
            <div ref={progressRef} className="progress-bar" onClick={handleProgressClick} style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', width: 36, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume + Extras */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-icon" onClick={() => setShowLyrics(!showLyrics)} title="Lyrics" style={{ color: showLyrics ? 'var(--accent)' : undefined }}>
            <Mic2 size={16} />
          </button>
          <button className="btn-icon" onClick={toggleMute}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 80, accentColor: 'var(--accent)' }}
          />
        </div>
      </div>
    </>
  );
}
