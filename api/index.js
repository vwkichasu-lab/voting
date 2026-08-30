import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../backend/src/store.js';
import { seed } from '../backend/src/seed.js';
import authRoutes from '../backend/src/routes/auth.js';
import electionRoutes from '../backend/src/routes/election.js';
import adminRoutes from '../backend/src/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database once per cold start
let dbInitialized = false;

function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    console.log('[API] Initializing database...');
    load();
    
    // Seed with default data if empty
    try {
      seed(false); // Don't force - only seed if empty
      console.log('[API] Database seeded with initial data');
    } catch (seedErr) {
      console.log('[API] Database seeding skipped:', seedErr.message);
    }
    
    dbInitialized = true;
    console.log('[API] Database initialized successfully');
  } catch (err) {
    console.error('[API] Database initialization error:', err);
    dbInitialized = true; // Mark as attempted to avoid infinite loops
  }
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize database before handling requests
app.use((req, res, next) => {
  initializeDatabase();
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: 'vercel-function'
  });
});

// Client error reporting
app.use('/api/client-error', express.json({ limit: '256kb' }), (req, res) => {
  const e = req.body || {};
  console.error('[CLIENT ERROR]', JSON.stringify({ 
    message: e.message, 
    value: e.value, 
    componentStack: e.componentStack, 
    stack: e.stack 
  }));
  res.status(200).json({ ok: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend files
const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath, { index: false }));

// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// 404 handler for API
app.use('/api', (req, res) => {
  console.log(`[API] 404 - ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'NOT_FOUND', 
    message: 'Endpoint not found' 
  });
});

// SPA fallback
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[API] Failed to send index.html:', err);
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err);
  res.status(err.status || 500).json({ 
    success: false, 
    error: 'SERVER_ERROR', 
    message: err.message || 'Internal server error'
  });
});

export default app;
