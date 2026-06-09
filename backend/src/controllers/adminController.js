const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { pool } = require('../models/db');

const API_URL = process.env.API_URL || 'https://api.novaxfinity.com';

// ─── Albums ───────────────────────────────────────────────────────────────────
const createAlbum = async (req, res) => {
  try {
    const { title, artist, release_year, genre, description, is_premium } = req.body;
    if (!title || !artist) return res.status(400).json({ error: 'Title and artist required' });

    const cover_url = req.file ? `${API_URL}/uploads/covers/${req.file.filename}` : null;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO albums (id, title, artist, cover_url, release_year, genre, description, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, artist, cover_url, release_year || null, genre || null, description || null, is_premium === 'true']
    );
    const [rows] = await pool.query('SELECT * FROM albums WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const { title, artist, release_year, genre, description, is_premium } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (release_year) updates.release_year = release_year;
    if (genre) updates.genre = genre;
    if (description !== undefined) updates.description = description;
    if (is_premium !== undefined) updates.is_premium = is_premium === 'true';
    if (req.file) updates.cover_url = `${API_URL}/uploads/covers/${req.file.filename}`;

    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: 'No fields to update' });
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE albums SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    const [rows] = await pool.query('SELECT * FROM albums WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    await pool.query('DELETE FROM albums WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Tracks ───────────────────────────────────────────────────────────────────
const createTrack = async (req, res) => {
  try {
    const { album_id, title, artist, track_number, lyrics_lrc, is_premium } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const audioFile = req.files?.audio?.[0];
    if (!audioFile) return res.status(400).json({ error: 'Audio file required' });

    const audio_url = `${API_URL}/uploads/audio/${audioFile.filename}`;
    const id = uuidv4();
    const duration = req.body.duration ? parseInt(req.body.duration) : null;

    await pool.query(
      'INSERT INTO tracks (id, album_id, title, artist, track_number, audio_url, lyrics_lrc, is_premium, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, album_id || null, title, artist || null, track_number || 1, audio_url, lyrics_lrc || null, is_premium === 'true', duration]
    );
    const [rows] = await pool.query('SELECT * FROM tracks WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTrack = async (req, res) => {
  try {
    const { title, artist, track_number, lyrics_lrc, is_premium, duration } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (track_number) updates.track_number = track_number;
    if (lyrics_lrc !== undefined) updates.lyrics_lrc = lyrics_lrc;
    if (is_premium !== undefined) updates.is_premium = is_premium === 'true';
    if (duration) updates.duration = duration;
    if (req.files?.audio?.[0]) updates.audio_url = `${API_URL}/uploads/audio/${req.files.audio[0].filename}`;

    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: 'No fields to update' });
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE tracks SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    const [rows] = await pool.query('SELECT * FROM tracks WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT audio_url FROM tracks WHERE id = ?', [req.params.id]);
    if (rows.length && rows[0].audio_url) {
      const filename = path.basename(rows[0].audio_url);
      const filePath = path.join(__dirname, '../../uploads/audio', filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM tracks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = 'SELECT id, email, display_name, role, subscription, created_at FROM users WHERE 1=1';
    const params = [];
    if (search) { query += ' AND (email LIKE ? OR display_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const [users] = await pool.query(query, params);
    const [countRow] = await pool.query('SELECT COUNT(*) as total FROM users');
    res.json({ users, total: countRow[0].total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { role, subscription } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (subscription) updates.subscription = subscription;
    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: 'No fields to update' });
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Stats ────────────────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ premiumUsers }]] = await pool.query("SELECT COUNT(*) as premiumUsers FROM users WHERE subscription = 'premium'");
    const [[{ totalAlbums }]] = await pool.query('SELECT COUNT(*) as totalAlbums FROM albums');
    const [[{ totalTracks }]] = await pool.query('SELECT COUNT(*) as totalTracks FROM tracks');
    const [[{ totalPlays }]] = await pool.query('SELECT SUM(play_count) as totalPlays FROM tracks');
    const [topTracks] = await pool.query('SELECT id, title, artist, play_count FROM tracks ORDER BY play_count DESC LIMIT 5');
    res.json({ totalUsers, premiumUsers, totalAlbums, totalTracks, totalPlays: totalPlays || 0, topTracks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createAlbum, updateAlbum, deleteAlbum, createTrack, updateTrack, deleteTrack, getUsers, updateUser, deleteUser, getStats };