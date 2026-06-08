const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'musicapp',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const initDB = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'musicapp'}\``);
    await conn.query(`USE \`${process.env.DB_NAME || 'musicapp'}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        display_name VARCHAR(255),
        avatar_url VARCHAR(500),
        role ENUM('user','admin') DEFAULT 'user',
        subscription ENUM('free','premium') DEFAULT 'free',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS albums (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        cover_url VARCHAR(500),
        release_year INT,
        genre VARCHAR(100),
        description TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id VARCHAR(36) PRIMARY KEY,
        album_id VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        duration INT,
        track_number INT,
        audio_url VARCHAR(500) NOT NULL,
        lyrics_lrc TEXT,
        is_premium BOOLEAN DEFAULT FALSE,
        play_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cover_url VARCHAR(500),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlist_id VARCHAR(36) NOT NULL,
        track_id VARCHAR(36) NOT NULL,
        position INT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (playlist_id, track_id),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS liked_tracks (
        user_id VARCHAR(36) NOT NULL,
        track_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, track_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS play_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        track_id VARCHAR(36) NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database initialized successfully');
  } finally {
    conn.release();
  }
};

module.exports = { pool, initDB };
