import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from './store.js';
import authRoutes from './routes/auth.js';
import electionRoutes from './routes/election.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve the built frontend (React SPA) from the same origin as the API,
// so there is no proxy / CORS / cold-compile overhead in the browser.
const distPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(distPath, { index: false }));

load();

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Collect browser/client-side errors from the ErrorBoundary (dev diagnostics).
app.use('/api/client-error', express.json({ limit: '256kb' }), (req, res) => {
  const e = req.body || {};
  console.error('CLIENT ERROR >>>', JSON.stringify({ message: e.message, value: e.value, componentStack: e.componentStack, stack: e.stack }));
  res.status(200).json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/election', electionRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
});

// SPA fallback for client-side routes (/login, /app, /admin, ...)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred processing your request'
    });
  }
  res.status(status).json({
    success: false,
    error: err.code || 'ERROR',
    message: err.message || 'Bad request'
  });
});

app.listen(PORT, () => {
  console.log(`Voting API listening on http://localhost:${PORT}`);
  console.log(`Frontend (production build) served from http://localhost:${PORT}/`);
});

export default app;
