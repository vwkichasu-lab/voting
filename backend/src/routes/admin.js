import express from 'express';
import multer from 'multer';
import { fail, ok, nowISO } from '../helpers.js';
import {
  adminLogin,
  dashboard,
  createElection,
  updateElectionStatus,
  pauseElection,
  resumeElection,
  addCandidate,
  addPosition,
  importVoters,
  getResults,
  getAuditLogs
} from '../services/adminService.js';
import { logAudit } from '../services/authService.js';
import { authenticateAdmin } from '../middleware.js';
import { electionStatus, computeResults } from '../services/electionService.js';
import { db } from '../store.js';
import { save } from '../store.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 'MISSING_CREDENTIALS', 'Email and password are required', 400);
  const out = adminLogin(email, password, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

// Protected admin routes
router.use(authenticateAdmin);

router.get('/dashboard', (req, res) => ok(res, dashboard()));

router.post('/elections', (req, res) => {
  const { name, description, start_at, end_at } = req.body || {};
  if (!name) return fail(res, 'MISSING_NAME', 'Election name is required', 400);
  const election = createElection({ name, description, start_at, end_at }, req.admin, req.ip);
  return ok(res, election, 201);
});

router.patch('/elections/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!status) return fail(res, 'MISSING_STATUS', 'Status is required', 400);
  const out = updateElectionStatus(Number(req.params.id), status, req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.post('/elections/:id/pause', (req, res) => {
  const out = pauseElection(Number(req.params.id), req.body?.reason, req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.post('/elections/:id/resume', (req, res) => {
  const out = resumeElection(Number(req.params.id), req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.get('/elections', (req, res) => {
  const elections = db.elections
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      start_at: e.start_at,
      end_at: e.end_at,
      created_by: e.created_by || 'system'
    }));
  return ok(res, { elections });
});

router.delete('/elections/:id', (req, res) => {
  const id = Number(req.params.id);
  const election = db.elections.find((e) => e.id === id);
  if (!election) return fail(res, 'NOT_FOUND', 'Election not found', 404);
  if (election.status === 'VOTING_OPEN') {
    return fail(res, 'INVALID_STATE', 'Cannot delete an election that is open', 409);
  }
  db.elections = db.elections.filter((e) => e.id !== id);
  save();
  logAudit(req.admin.id, 'election_deleted', 'election', id, {}, req.ip);
  return ok(res, { success: true });
});

router.get('/elections/:id/voters', (req, res) => {
  const election = db.elections.find((e) => e.id === Number(req.params.id));
  if (!election) return fail(res, 'NOT_FOUND', 'Election not found', 404);
  const voters = db.students.map((s) => ({
    id: s.id,
    student_id: s.student_id,
    name: s.name,
    programme: s.programme,
    intake: s.intake,
    eligible: s.eligible,
    has_voted: !!s.has_voted,
    voted_at: s.voted_at
  }));
  return ok(res, { voters });
});

router.patch('/candidates/:id/status', (req, res) => {
  const candidate = db.candidates.find((c) => c.id === Number(req.params.id));
  if (!candidate) return fail(res, 'NOT_FOUND', 'Candidate not found', 404);
  candidate.status = req.body.status || candidate.status;
  candidate.updated_at = nowISO();
  save();
  logAudit(req.admin.id, 'candidate_status_changed', 'candidate', candidate.id, { status: candidate.status }, req.ip);
  return ok(res, candidate);
});

router.delete('/candidates/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.candidates.find((c) => c.id === id)) return fail(res, 'NOT_FOUND', 'Candidate not found', 404);
  db.candidates = db.candidates.filter((c) => c.id !== id);
  save();
  logAudit(req.admin.id, 'candidate_deleted', 'candidate', id, {}, req.ip);
  return ok(res, { success: true });
});

router.delete('/positions/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.positions.find((p) => p.id === id)) return fail(res, 'NOT_FOUND', 'Position not found', 404);
  db.positions = db.positions.filter((p) => p.id !== id);
  db.candidates = db.candidates.filter((c) => c.position_id !== id);
  save();
  logAudit(req.admin.id, 'position_deleted', 'position', id, {}, req.ip);
  return ok(res, { success: true });
});

router.patch('/positions/:id', (req, res) => {
  const position = db.positions.find((p) => p.id === Number(req.params.id));
  if (!position) return fail(res, 'NOT_FOUND', 'Position not found', 404);
  if (typeof req.body.is_required !== 'undefined') position.is_required = req.body.is_required ? 1 : 0;
  if (typeof req.body.display_order !== 'undefined') position.display_order = req.body.display_order;
  if (typeof req.body.name !== 'undefined') position.name = req.body.name;
  position.updated_at = nowISO();
  save();
  return ok(res, position);
});

router.post('/elections/:id/positions', (req, res) => {
  const out = addPosition(Number(req.params.id), req.body || {}, req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result, out.status);
});



router.post('/elections/:id/candidates', (req, res) => {
  const out = addCandidate(Number(req.params.id), req.body || {}, req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result, out.status);
});

router.post('/elections/:id/import-voters', upload.single('file'), (req, res) => {
  const text = req.file ? req.file.buffer.toString('utf8') : (req.body.csv || '');
  if (!text.trim()) return fail(res, 'NO_FILE', 'No CSV file provided', 400);
  const rows = parseCsv(text);
  const out = importVoters(Number(req.params.id), rows, req.admin, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.get('/elections/:id/results', (req, res) => {
  const out = getResults(Number(req.params.id));
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  if (req.query.format === 'csv') {
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename="results.csv"');
    return res.send(resultsToCsv(out.result));
  }
  return ok(res, out.result);
});

router.get('/elections/:id/structure', (req, res) => {
  const election = db.elections.find((e) => e.id === Number(req.params.id));
  if (!election) return fail(res, 'NOT_FOUND', 'Election not found', 404);
  const positions = db.positions
    .filter((p) => p.election_id === election.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({
      ...p,
      candidates: db.candidates.filter((c) => c.position_id === p.id)
    }));
  return ok(res, { election, positions });
});

router.get('/audit-logs', (req, res) => {
  const out = getAuditLogs({
    limit: req.query.limit || 50,
    offset: req.query.offset || 0,
    action: req.query.action,
    from: req.query.from,
    to: req.query.to
  });
  return ok(res, out.result);
});

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return [];
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter).map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cells[i]));
    return row;
  });
}

function resultsToCsv(results) {
  const lines = ['Position,Candidate,Votes,Percentage'];
  results.positions.forEach((p) => {
    p.candidates.forEach((c) => {
      lines.push(`"${p.position_name}","${c.name}",${c.votes},${c.percentage}`);
    });
  });
  return lines.join('\n');
}

export default router;
