import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.novaxfinity.com/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
  getUserStats: () => api.get('/user/stats'),
};

export const musicAPI = {
  getAlbums: (params) => api.get('/music/albums', { params }),
  getAlbum: (id) => api.get(`/music/albums/${id}`),
  getTrack: (id) => api.get(`/music/tracks/${id}`),
  search: (q) => api.get('/music/search', { params: { q } }),
  likeTrack: (id) => api.post(`/user/tracks/${id}/like`),
  getLikedTracks: () => api.get('/user/liked'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  createAlbum: (data) => api.post('/admin/albums', data),
  updateAlbum: (id, data) => api.put(`/admin/albums/${id}`, data),
  deleteAlbum: (id) => api.delete(`/admin/albums/${id}`),
  createTrack: (data) => api.post('/admin/tracks', data),
  updateTrack: (id, data) => api.put(`/admin/tracks/${id}`, data),
  deleteTrack: (id) => api.delete(`/admin/tracks/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;