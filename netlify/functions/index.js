import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, reset } from '../../backend/src/store.js';
import { seed } from '../../backend/src/seed.js';
import authRoutes from '../../backend/src/routes/auth.js';
import electionRoutes from '../../backend/src/routes/election.js';
import adminRoutes from '../../backend/src/routes/admin.js';
import serverless from 'serverless-http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize database once per cold start
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  try {
    console.log('[API] Initializing database...');
    load();
    
    // Seed with default data if empty
    try {
      seed(false); // Don't force - only seed if empty
      console.log('[API] Database seeded with initial data');
    } catch (seedErr) {
      console.log('[API] Database seeding skipped or completed:', seedErr.message);
    }
    
    dbInitialized = true;
    console.log('[API] Database initialized successfully');
  } catch (err) {
    console.error('[API] Database initialization error:', err);
    throw err;
  }
}

const app = express();

// Initialize before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    console.error('[API] Init middleware error:', err);
    res.status(503).json({ 
      success: false, 
      error: 'SERVICE_UNAVAILABLE', 
      message: 'Database initialization failed' 
    });
  }
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: 'netlify-function'
  });
});

// Client error reporting
app.post('/client-error', express.json({ limit: '256kb' }), (req, res) => {
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
app.use('/auth', authRoutes);
app.use('/election', electionRoutes);
app.use('/admin', adminRoutes);

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// 404 handler for API
app.use((req, res) => {
  console.log(`[API] 404 - ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'NOT_FOUND', 
    message: 'API endpoint not found',
    path: req.path
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

// Export Netlify function handler
export const handler = serverless(app);
