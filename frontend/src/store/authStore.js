import { create } from 'zustand';
import { authAPI } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) { set({ loading: false }); return; }
    try {
      const { data } = await authAPI.me();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  register: async (email, password, display_name) => {
    const { data } = await authAPI.register({ email, password, display_name });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  loginWithToken: (token, user) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAdmin: () => get().user?.role === 'admin',
  isPremium: () => get().user?.subscription === 'premium' || get().user?.role === 'admin',
}));
