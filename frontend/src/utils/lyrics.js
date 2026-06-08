/**
 * Parse LRC format lyrics into timestamped lines
 * LRC format: [mm:ss.xx] Lyric text
 */
export const parseLRC = (lrc) => {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const parsed = [];

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      if (text) parsed.push({ time, text });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
};

/**
 * Get the current active lyric index based on currentTime
 */
export const getActiveLyricIndex = (lyrics, currentTime) => {
  if (!lyrics.length) return -1;
  let active = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) active = i;
    else break;
  }
  return active;
};

/**
 * Format seconds to mm:ss
 */
export const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
