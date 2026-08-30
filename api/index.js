import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../backend/src/store.js';
import authRoutes from '../backend/src/routes/auth.js';
import electionRoutes from '../backend/src/routes/election.js';
import adminRoutes from '../backend/src/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize database
load();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Client error reporting
app.use('/api/client-error', express.json({ limit: '256kb' }), (req, res) => {
  const e = req.body || {};
  console.error('CLIENT ERROR >>>', JSON.stringify({ message: e.message, value: e.value, componentStack: e.componentStack, stack: e.stack }));
  res.status(200).json({ ok: true });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend files in development
const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath, { index: false }));

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
});

// SPA fallback - serve index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: 'SERVER_ERROR',
    message: status >= 500 ? 'Internal server error' : err.message
  });
});

export default app;
