const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../models/db');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const displayName = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        // Check by Google ID first
        let [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
        if (rows.length) return done(null, rows[0]);

        // Check by email
        if (email) {
          [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
          if (rows.length) {
            // Link Google ID to existing account
            await pool.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?', [googleId, avatar, rows[0].id]);
            return done(null, { ...rows[0], google_id: googleId, avatar_url: avatar });
          }
        }

        // Create new user
        const id = uuidv4();
        await pool.query(
          'INSERT INTO users (id, email, google_id, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
          [id, email, googleId, displayName, avatar]
        );
        const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return done(null, newRows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
