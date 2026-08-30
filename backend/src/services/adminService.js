import crypto from 'node:crypto';
import { db, load, save, nextId } from '../store.js';
import { nowISO } from '../helpers.js';
import { electionStatus, computeResults, getActiveElection } from './electionService.js';
import { logAudit } from './authService.js';

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = (stored || '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

const tokenStore = new Map();

export function adminLogin(email, password, ip) {
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', status: 401 } };
  }
  const token = crypto.randomBytes(24).toString('hex');
  tokenStore.set(token, { user_id: user.id, role: user.role, expires_at: Date.now() + 15 * 60 * 1000 });
  logAudit(user.id, 'admin_login', 'user', user.id, {}, ip);
  return { result: { user_id: user.id, role: user.role, token } };
}

export function getAdminByToken(token) {
  if (!token) return null;
  const rec = tokenStore.get(token);
  if (!rec) return null;
  if (rec.expires_at < Date.now()) {
    tokenStore.delete(token);
    return null;
  }
  return db.users.find((u) => u.id === rec.user_id) || null;
}

export function dashboard() {
  const status = electionStatus();
  const activity = db.audit_logs
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map((l) => ({ timestamp: l.created_at, action: l.action, entity_type: l.entity_type }));
  return { election: status, recent_activity: activity };
}

export function createElection(data, admin, ip) {
  const election = {
    id: nextId('elections'),
    name: data.name,
    description: data.description || '',
    status: 'DRAFT',
    start_at: data.start_at || null,
    end_at: data.end_at || null,
    paused_at: null,
    pause_reason: null,
    created_at: nowISO(),
    updated_at: nowISO()
  };
  db.elections.push(election);
  save();
  logAudit(admin.id, 'election_created', 'election', election.id, {}, ip);
  return election;
}

export function updateElectionStatus(id, status, admin, ip) {
  const election = db.elections.find((e) => e.id === id);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  election.status = status;
  election.updated_at = nowISO();
  save();
  logAudit(admin.id, 'election_status_changed', 'election', id, { status }, ip);
  return { result: { success: true, status } };
}

export function pauseElection(id, reason, admin, ip) {
  const election = db.elections.find((e) => e.id === id);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  if (election.status !== 'VOTING_OPEN') {
    return { error: { code: 'INVALID_STATE', message: 'Election is not open', status: 409 } };
  }
  election.paused_at = nowISO();
  election.pause_reason = reason || 'No reason provided';
  election.updated_at = nowISO();
  save();
  logAudit(admin.id, 'election_paused', 'election', id, { reason }, ip);
  return { result: { success: true, is_paused: true, pause_reason: election.pause_reason } };
}

export function resumeElection(id, admin, ip) {
  const election = db.elections.find((e) => e.id === id);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  election.paused_at = null;
  election.pause_reason = null;
  election.updated_at = nowISO();
  save();
  logAudit(admin.id, 'election_resumed', 'election', id, {}, ip);
  return { result: { success: true, is_paused: false } };
}

export function addCandidate(electionId, data, admin, ip) {
  const election = db.elections.find((e) => e.id === electionId);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  const position = db.positions.find((p) => p.id === data.position_id && p.election_id === electionId);
  if (!position) {
    return { error: { code: 'INVALID_POSITION', message: 'Position not in this election', status: 400 } };
  }
  const candidate = {
    id: nextId('candidates'),
    election_id: electionId,
    position_id: data.position_id,
    name: data.name,
    intake: data.intake || 'January',
    manifesto: data.manifesto || '',
    photo_path: null,
    status: 'ACTIVE',
    created_at: nowISO(),
    updated_at: nowISO()
  };
  db.candidates.push(candidate);
  save();
  logAudit(admin.id, 'candidate_added', 'candidate', candidate.id, {}, ip);
  return { result: candidate, status: 201 };
}

export function addPosition(electionId, data, admin, ip) {
  const election = db.elections.find((e) => e.id === electionId);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  const count = db.positions.filter((p) => p.election_id === electionId).length;
  const position = {
    id: nextId('positions'),
    election_id: electionId,
    name: data.name,
    description: data.description || '',
    display_order: data.display_order || count + 1,
    is_required: data.is_required ? 1 : 0,
    created_at: nowISO(),
    updated_at: nowISO()
  };
  db.positions.push(position);
  save();
  logAudit(admin.id, 'position_added', 'position', position.id, {}, ip);
  return { result: position, status: 201 };
}

export function importVoters(electionId, rows, admin, ip) {
  let imported = 0;
  const errors = [];
  rows.forEach((row, i) => {
    const studentId = String(row.student_id || row.studentId || '').trim().toUpperCase();
    const name = String(row.name || '').trim();
    const intake = String(row.intake || '').trim();
    const programme = String(row.programme || row.program || '').trim();
    if (!/^PUIT\/\d{8}$/.test(studentId)) {
      errors.push({ row: i + 1, error: 'Invalid student_id format (expected PUIT/ + 8 digits)' });
      return;
    }
    if (!name) {
      errors.push({ row: i + 1, error: 'Missing name' });
      return;
    }
    if (!['January', 'September'].includes(intake)) {
      errors.push({ row: i + 1, error: 'Intake must be January or September' });
      return;
    }
    const existing = db.students.find((s) => s.student_id === studentId);
    if (existing) {
      existing.name = name;
      existing.intake = intake;
      existing.programme = programme;
      existing.eligible = 'YES';
      existing.updated_at = nowISO();
    } else {
      db.students.push({
        id: nextId('students'),
        student_id: studentId,
        name,
        intake,
        programme,
        contact: String(row.contact || '').trim() || null,
        eligible: 'YES',
        has_voted: 0,
        voted_at: null,
        created_at: nowISO(),
        updated_at: nowISO()
      });
    }
    imported++;
  });
  save();
  logAudit(admin.id, 'voters_imported', 'election', electionId, { imported, errors: errors.length }, ip);
  return { result: { success: true, imported, skipped: errors.length, errors } };
}

export function getResults(electionId) {
  const election = db.elections.find((e) => e.id === electionId);
  if (!election) return { error: { code: 'NOT_FOUND', message: 'Election not found', status: 404 } };
  return { result: computeResults(electionId) };
}

export function getAuditLogs({ limit = 50, offset = 0, action, from, to } = {}) {
  let logs = db.audit_logs.slice();
  if (action) logs = logs.filter((l) => l.action === action);
  if (from) logs = logs.filter((l) => new Date(l.created_at) >= new Date(from));
  if (to) logs = logs.filter((l) => new Date(l.created_at) <= new Date(to));
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = logs.length;
  const paged = logs.slice(Number(offset), Number(offset) + Number(limit));
  const admins = Object.fromEntries(db.users.map((u) => [u.id, u.email]));
  const out = paged.map((l) => ({
    id: l.id,
    timestamp: l.created_at,
    admin: l.admin_user_id ? admins[l.admin_user_id] || null : null,
    action: l.action,
    entity_type: l.entity_type,
    entity_id: l.entity_id,
    ip_address: l.ip_address
  }));
  return { result: { total, logs: out } };
}
