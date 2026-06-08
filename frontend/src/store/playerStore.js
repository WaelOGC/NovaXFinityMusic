import { create } from 'zustand';

let audioElement = null;

const getAudio = () => {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'metadata';
  }
  return audioElement;
};

export const usePlayerStore = create((set, get) => ({
  // State
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'none', // 'none' | 'one' | 'all'
  isLoading: false,

  // Actions
  playTrack: (track, queue = [], index = 0) => {
    const audio = getAudio();
    const src = track.audio_url?.startsWith('http') ? track.audio_url : track.audio_url;
    audio.src = src;
    audio.volume = get().volume;
    audio.play().catch(console.error);
    set({ currentTrack: track, queue: queue.length ? queue : [track], queueIndex: index, isPlaying: true, isLoading: true });
  },

  togglePlay: () => {
    const audio = getAudio();
    const { isPlaying } = get();
    if (isPlaying) { audio.pause(); set({ isPlaying: false }); }
    else { audio.play().catch(console.error); set({ isPlaying: true }); }
  },

  seek: (time) => {
    const audio = getAudio();
    audio.currentTime = time;
    set({ currentTime: time });
  },

  setVolume: (vol) => {
    const audio = getAudio();
    audio.volume = vol;
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const audio = getAudio();
    const { isMuted, volume } = get();
    if (isMuted) { audio.volume = volume || 0.8; set({ isMuted: false }); }
    else { audio.volume = 0; set({ isMuted: true }); }
  },

  next: () => {
    const { queue, queueIndex, repeatMode, isShuffled } = get();
    if (!queue.length) return;
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else return;
      }
    }
    get().playTrack(queue[nextIndex], queue, nextIndex);
  },

  prev: () => {
    const audio = getAudio();
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    const { queue, queueIndex } = get();
    if (queueIndex <= 0) return;
    const prevIndex = queueIndex - 1;
    get().playTrack(queue[prevIndex], queue, prevIndex);
  },

  toggleShuffle: () => set((s) => ({ isShuffled: !s.isShuffled })),
  toggleRepeat: () => set((s) => {
    const modes = ['none', 'one', 'all'];
    const next = modes[(modes.indexOf(s.repeatMode) + 1) % modes.length];
    return { repeatMode: next };
  }),

  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setLoading: (v) => set({ isLoading: v }),

  // Initialize audio event listeners
  initAudio: () => {
    const audio = getAudio();
    const store = get();
    audio.ontimeupdate = () => set({ currentTime: audio.currentTime });
    audio.ondurationchange = () => set({ duration: audio.duration || 0 });
    audio.onended = () => {
      const { repeatMode } = get();
      if (repeatMode === 'one') { audio.currentTime = 0; audio.play(); }
      else get().next();
    };
    audio.oncanplay = () => set({ isLoading: false });
    audio.onwaiting = () => set({ isLoading: true });
    audio.volume = store.volume;
  },
}));
