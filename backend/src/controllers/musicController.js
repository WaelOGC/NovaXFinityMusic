const { v4: uuidv4 } = require('uuid');
const { pool } = require('../models/db');

// ─── Albums ───────────────────────────────────────────────────────────────────
const getAlbums = async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM albums WHERE 1=1';
    const params = [];
    if (genre) { query += ' AND genre = ?'; params.push(genre); }
    if (search) { query += ' AND (title LIKE ? OR artist LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));
    const [albums] = await pool.query(query, params);
    const [countRow] = await pool.query('SELECT COUNT(*) as total FROM albums', []);
    res.json({ albums, total: countRow[0].total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAlbum = async (req, res) => {
  try {
    const [albums] = await pool.query('SELECT * FROM albums WHERE id = ?', [req.params.id]);
    if (!albums.length) return res.status(404).json({ error: 'Album not found' });
    const [tracks] = await pool.query(
      'SELECT * FROM tracks WHERE album_id = ? ORDER BY track_number ASC',
      [req.params.id]
    );
    res.json({ ...albums[0], tracks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Tracks ───────────────────────────────────────────────────────────────────
const getTrack = async (req, res) => {
  try {
    const [tracks] = await pool.query('SELECT * FROM tracks WHERE id = ?', [req.params.id]);
    if (!tracks.length) return res.status(404).json({ error: 'Track not found' });
    const track = tracks[0];

    // Premium check
    if (track.is_premium && req.user?.subscription !== 'premium' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    // Increment play count
    await pool.query('UPDATE tracks SET play_count = play_count + 1 WHERE id = ?', [track.id]);

    // Log play history
    if (req.user) {
      await pool.query(
        'INSERT INTO play_history (id, user_id, track_id) VALUES (?, ?, ?)',
        [uuidv4(), req.user.id, track.id]
      );
    }

    res.json(track);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Likes ────────────────────────────────────────────────────────────────────
const likeTrack = async (req, res) => {
  try {
    const { track_id } = req.params;
    const [existing] = await pool.query(
      'SELECT 1 FROM liked_tracks WHERE user_id = ? AND track_id = ?',
      [req.user.id, track_id]
    );
    if (existing.length) {
      await pool.query('DELETE FROM liked_tracks WHERE user_id = ? AND track_id = ?', [req.user.id, track_id]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO liked_tracks (user_id, track_id) VALUES (?, ?)', [req.user.id, track_id]);
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getLikedTracks = async (req, res) => {
  try {
    const [tracks] = await pool.query(
      `SELECT t.*, lt.created_at as liked_at FROM tracks t
       JOIN liked_tracks lt ON t.id = lt.track_id
       WHERE lt.user_id = ? ORDER BY lt.created_at DESC`,
      [req.user.id]
    );
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Search ───────────────────────────────────────────────────────────────────
const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ albums: [], tracks: [] });
    const like = `%${q}%`;
    const [albums] = await pool.query('SELECT * FROM albums WHERE title LIKE ? OR artist LIKE ? LIMIT 10', [like, like]);
    const [tracks] = await pool.query('SELECT * FROM tracks WHERE title LIKE ? OR artist LIKE ? LIMIT 10', [like, like]);
    res.json({ albums, tracks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAlbums, getAlbum, getTrack, likeTrack, getLikedTracks, search };
