const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/covers');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cover_${Date.now()}${ext}`);
  },
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/audio');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `track_${Date.now()}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files allowed'), false);
};

const audioFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files allowed'), false);
  }
};

const maxSize = (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024;

const uploadCover = multer({ storage: coverStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadTrack = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: maxSize },
});
const uploadAlbumWithCover = multer({ storage: coverStorage, fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// For track upload we need both audio and optional cover
const uploadTrackFiles = multer({
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') audioFilter(req, file, cb);
    else if (file.fieldname === 'cover') imageFilter(req, file, cb);
    else cb(null, false);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = file.fieldname === 'audio'
        ? path.join(__dirname, '../../uploads/audio')
        : path.join(__dirname, '../../uploads/covers');
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'audio' ? 'track' : 'cover';
      cb(null, `${prefix}_${Date.now()}${ext}`);
    },
  }),
});

module.exports = { uploadCover, uploadTrack, uploadAlbumWithCover, uploadTrackFiles };
