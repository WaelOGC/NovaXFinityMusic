const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../models/db');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [id, email, hash, display_name || email.split('@')[0]]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const token = signToken(rows[0]);
    res.status(201).json({ token, user: sanitizeUser(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (!user.password_hash) return res.status(401).json({ error: 'Please sign in with Google' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

const googleCallback = async (req, res) => {
  try {
    const token = signToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { display_name } = req.body;
    const avatar_url = req.file ? `/uploads/covers/${req.file.filename}` : null;
    const updates = {};
    if (display_name) updates.display_name = display_name;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
    const keys = Object.keys(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.user.id]);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'All fields required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user.password_hash) return res.status(400).json({ error: 'Cannot change password for Google accounts' });
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const [[{ totalPlays }]] = await pool.query('SELECT COUNT(*) as totalPlays FROM play_history WHERE user_id = ?', [req.user.id]);
    const [[{ likedTracks }]] = await pool.query('SELECT COUNT(*) as likedTracks FROM liked_tracks WHERE user_id = ?', [req.user.id]);
    const [recentTracks] = await pool.query(
      `SELECT t.id, t.title, t.artist, ph.played_at 
       FROM play_history ph JOIN tracks t ON ph.track_id = t.id 
       WHERE ph.user_id = ? ORDER BY ph.played_at DESC LIMIT 5`,
      [req.user.id]
    );
    res.json({ totalPlays, likedTracks, recentTracks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  display_name: user.display_name,
  avatar_url: user.avatar_url,
  role: user.role,
  subscription: user.subscription,
});

module.exports = { register, login, getMe, googleCallback, updateProfile, changePassword, getUserStats };