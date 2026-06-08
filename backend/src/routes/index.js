const express = require('express');
const passport = require('passport');
const { register, login, getMe, googleCallback, updateProfile, changePassword, getUserStats } = require('../controllers/authController');
const { getAlbums, getAlbum, getTrack, likeTrack, getLikedTracks, search } = require('../controllers/musicController');
const { createAlbum, updateAlbum, deleteAlbum, createTrack, updateTrack, deleteTrack, getUsers, updateUser, deleteUser, getStats } = require('../controllers/adminController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadCover, uploadAlbumWithCover, uploadTrackFiles } = require('../utils/upload');

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

// ─── Music ────────────────────────────────────────────────────────────────────
router.get('/music/albums', getAlbums);
router.get('/music/albums/:id', getAlbum);
router.get('/music/tracks/:id', optionalAuth, getTrack);
router.get('/music/search', search);

// ─── User ─────────────────────────────────────────────────────────────────────
router.post('/user/tracks/:track_id/like', authenticate, likeTrack);
router.get('/user/liked', authenticate, getLikedTracks);
router.put('/user/profile', authenticate, uploadCover.single('avatar'), updateProfile);
router.put('/user/password', authenticate, changePassword);
router.get('/user/stats', authenticate, getUserStats);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/stats', authenticate, requireAdmin, getStats);
router.post('/admin/albums', authenticate, requireAdmin, uploadCover.single('cover'), createAlbum);
router.put('/admin/albums/:id', authenticate, requireAdmin, uploadCover.single('cover'), updateAlbum);
router.delete('/admin/albums/:id', authenticate, requireAdmin, deleteAlbum);
router.post('/admin/tracks', authenticate, requireAdmin, uploadTrackFiles.fields([{ name: 'audio', maxCount: 1 }]), createTrack);
router.put('/admin/tracks/:id', authenticate, requireAdmin, uploadTrackFiles.fields([{ name: 'audio', maxCount: 1 }]), updateTrack);
router.delete('/admin/tracks/:id', authenticate, requireAdmin, deleteTrack);
router.get('/admin/users', authenticate, requireAdmin, getUsers);
router.put('/admin/users/:id', authenticate, requireAdmin, updateUser);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;