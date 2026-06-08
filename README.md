# 🎵 MyMusic — Personal Streaming Platform

A full-stack music streaming web application with React + Vite frontend and Node.js + Express + MySQL backend. Supports PWA, admin dashboard, Google OAuth, and premium subscriptions.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Zustand |
| Backend | Node.js + Express |
| Database | MySQL 8 |
| Auth | JWT + Google OAuth 2.0 |
| PWA | vite-plugin-pwa + Workbox |
| Payments | Stripe (ready to integrate) |

---

## 📁 Project Structure

```
musicapp/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth guards
│   │   ├── models/          # DB connection + schema
│   │   ├── routes/          # API routes
│   │   └── utils/           # Upload, passport config
│   ├── uploads/             # Uploaded files (covers, audio)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Player, Layout, PWA
│   │   ├── pages/           # Home, Album, Search, Auth, Admin
│   │   ├── store/           # Zustand state stores
│   │   └── utils/           # API client, lyrics parser
│   └── vite.config.js
└── .github/workflows/       # GitHub Actions CI/CD
```

---

## ⚙️ Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/musicapp.git
cd musicapp
npm run install:all
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and secrets
```

### 3. Set Up MySQL
Create a database (the app auto-creates tables on first run):
```sql
CREATE DATABASE musicapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Create First Admin User
After running the app and registering, update your user role in MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run Locally
```bash
# Terminal 1: Backend
npm run dev:backend  # Runs on http://localhost:5000

# Terminal 2: Frontend
npm run dev:frontend  # Runs on http://localhost:5173
```

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → Enable "Google+ API"
3. Go to **Credentials → Create OAuth 2.0 Client ID**
4. Add authorized redirect URI: `https://yourdomain.com/api/auth/google/callback`
5. Copy Client ID and Secret to your `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

---

## 💳 Stripe Integration (Future)

When ready to add payments:

1. Get your Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
```
3. Uncomment the Stripe routes in `backend/src/routes/index.js`
4. The subscription logic is already structured in the DB and user model

---

## 🎵 Lyrics Format (LRC)

Upload lyrics using the **LRC format**:
```
[00:10.00] First line of the song
[00:14.50] Second line here
[00:18.20] Another line
```

Free LRC files can be found on [lrclib.net](https://lrclib.net) or [Megalobiz](https://www.megalobiz.com).

---

## 🌐 Hostinger Deployment

### Prerequisites
- Hostinger VPS (or Business Shared Hosting with SSH)
- Node.js 20+ installed on server
- PM2 for process management: `npm install -g pm2`
- MySQL database created

### Step 1: Server Setup
```bash
# SSH into your Hostinger VPS
ssh user@your-server-ip

# Clone repo
git clone https://github.com/YOUR_USERNAME/musicapp.git ~/musicapp

# Install dependencies
cd ~/musicapp/backend && npm ci --production

# Create .env from example
cp .env.example .env && nano .env  # Fill in your values

# Start with PM2
pm2 start src/index.js --name musicapp
pm2 save && pm2 startup
```

### Step 2: Build & Upload Frontend
```bash
# Locally:
cd frontend && npm run build

# The dist/ folder contains your static frontend files.
# Upload dist/* to ~/public_html/ on Hostinger via FTP or SCP.
```

### Step 3: GitHub Actions (Automatic Deploys)
Add these **Secrets** to your GitHub repository (Settings → Secrets):

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | Your Hostinger server IP |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Your private SSH key |
| `SSH_PORT` | Usually `22` |
| `VITE_API_URL` | `https://yourdomain.com/api` |

Every push to `main` will automatically build and deploy.

### Step 4: Nginx Configuration (recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    root /home/user/public_html;
    index index.html;
    try_files $uri $uri/ /index.html;  # SPA routing

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📱 PWA Features

- **Android/Desktop**: Automatic "Add to Home Screen" prompt after 3 seconds
- **iOS Safari**: Manual banner with instructions (iOS restricts automatic prompts)
- **Offline**: Static assets cached via Workbox service worker
- **Audio cache**: Recently played tracks cached for offline playback

---

## 🎛️ Admin Panel

Access at `/admin` (requires `role = 'admin'` in DB).

Features:
- 📊 Dashboard with user/track/play statistics
- 💿 Create/edit/delete albums with cover art upload
- 🎵 Upload tracks with audio files and LRC lyrics
- 👥 Manage users, toggle premium subscriptions and roles

---

## 🔌 API Endpoints

```
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me
GET   /api/auth/google
GET   /api/auth/google/callback

GET   /api/music/albums
GET   /api/music/albums/:id
GET   /api/music/tracks/:id
GET   /api/music/search?q=

POST  /api/user/tracks/:id/like
GET   /api/user/liked

GET   /api/admin/stats
POST  /api/admin/albums
PUT   /api/admin/albums/:id
DELETE /api/admin/albums/:id
POST  /api/admin/tracks
PUT   /api/admin/tracks/:id
DELETE /api/admin/tracks/:id
GET   /api/admin/users
PUT   /api/admin/users/:id
DELETE /api/admin/users/:id
```

---

## 📄 License

MIT — Personal use / modify freely.
