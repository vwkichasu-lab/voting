import express from 'express';
import cors from 'cors';
import { load } from '../../backend/src/store.js';
import authRoutes from '../../backend/src/routes/auth.js';
import electionRoutes from '../../backend/src/routes/election.js';
import adminRoutes from '../../backend/src/routes/admin.js';
import serverless from 'serverless-http';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize database
try {
  load();
} catch (err) {
  console.error('Database initialization error:', err);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Client error reporting
app.post('/client-error', express.json({ limit: '256kb' }), (req, res) => {
  const e = req.body || {};
  console.error('CLIENT ERROR >>>', JSON.stringify({ 
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

// 404 handler for API
app.use((req, res) => {
  if (req.path.startsWith('/')) {
    return res.status(404).json({ 
      success: false, 
      error: 'NOT_FOUND', 
      message: 'API endpoint not found',
      path: req.path
    });
  }
  res.status(404).send('Not found');
});

// Export Netlify function handler
export const handler = serverless(app);
