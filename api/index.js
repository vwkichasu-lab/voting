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

load();

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

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

export default app;
