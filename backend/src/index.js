require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const statsRoutes = require('./routes/stats');

const app = express();

// Connect to MongoDB
connectDB();

const isProduction = process.env.NODE_ENV === 'production';

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts needed for React
}));

// In production, the frontend is served from same origin — CORS only needed for local dev
if (!isProduction) {
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));
} else {
  // Allow any origin in prod that matches our domain (same-origin requests bypass CORS anyway)
  app.use(cors({ credentials: true }));
}

app.use(express.json());

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoTrack API', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ── Serve React Frontend (Production) ─────────────────────────
if (isProduction) {
  // Serve static files from the React build
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA fallback — all non-API routes return index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log(`📦 Serving React frontend from: ${frontendPath}`);
}

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌍 EcoTrack API running on http://localhost:${PORT}`);
  console.log(`📡 Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`🌿 Mode: ${process.env.NODE_ENV || 'development'}`);
});
