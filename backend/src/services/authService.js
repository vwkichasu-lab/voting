import crypto from 'node:crypto';
import { db, load, save, nextId, uid, randomOtp } from '../store.js';
import { nowISO } from '../helpers.js';

const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10)) * 60 * 1000;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const SESSION_MS = 30 * 60 * 1000;

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function findStudentById(studentId) {
  return db.students.find((s) => s.student_id === studentId);
}

export function requestCode(studentId, ip) {
  const student = findStudentById(studentId);
  if (!student) {
    return { error: { code: 'STUDENT_NOT_FOUND', message: 'Student ID not found', status: 404 } };
  }
  if (student.eligible !== 'YES') {
    return { error: { code: 'STUDENT_INELIGIBLE', message: 'Student is not eligible to vote', status: 403 } };
  }
  if (student.has_voted) {
    return { error: { code: 'ALREADY_VOTED', message: 'This student has already voted', status: 409 } };
  }

  const election = getActiveElection();
  if (!election || election.status !== 'VOTING_OPEN' || election.paused_at) {
    return { error: { code: 'VOTING_CLOSED', message: 'Voting is not currently open', status: 503 } };
  }

  // Invalidate previous codes for this student.
  db.otp_challenges = db.otp_challenges.filter((c) => c.student_id !== student.id);

  const code = randomOtp(parseInt(process.env.OTP_LENGTH || '6', 10));
  db.otp_challenges.push({
    id: nextId('otp_challenges'),
    student_id: student.id,
    code_hash: hashOtp(code),
    expires_at: nowISO(OTP_EXPIRY_MS / 60000),
    attempts: 0,
    used_at: null,
    created_at: nowISO()
  });
  save();

  logAudit(null, 'otp_requested', 'student', student.id, {}, ip);

  return {
    result: {
      expires_in_seconds: OTP_EXPIRY_MS / 1000,
      code_delivery_masked: maskFor(student),
      dev_otp: process.env.NODE_ENV === 'production' ? undefined : code
    }
  };
}

function maskFor(student) {
  const digits = String(student.contact || '').replace(/\D/g, '');
  return '****' + (digits.length >= 2 ? digits.slice(-2) : '');
}

export function verifyCode(studentId, code, ip) {
  const student = findStudentById(studentId);
  if (!student) {
    return { error: { code: 'STUDENT_NOT_FOUND', message: 'Student ID not found', status: 404 } };
  }
  if (!/^\d{6}$/.test(code)) {
    return { error: { code: 'INVALID_CODE_FORMAT', message: 'Code must be 6 digits', status: 400 } };
  }

  const challenge = db.otp_challenges
    .filter((c) => c.student_id === student.id && !c.used_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  if (!challenge) {
    return { error: { code: 'NO_CODE', message: 'No verification code requested', status: 401 } };
  }
  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return { error: { code: 'CODE_EXPIRED', message: 'Verification code has expired', status: 401 } };
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    return { error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Request a new code.', status: 429 } };
  }
  if (challenge.code_hash !== hashOtp(code)) {
    challenge.attempts += 1;
    save();
    return { error: { code: 'CODE_INCORRECT', message: 'Verification code is incorrect', status: 401 } };
  }

  challenge.used_at = nowISO();
  save();
  return createStudentSession(student, ip);
}

function createStudentSession(student, ip) {
  const election = getActiveElection();
  db.sessions = db.sessions.filter((s) => s.student_id !== student.id);
  const sessionId = uid('sess_');
  const now = nowISO();
  db.sessions.push({
    id: sessionId,
    student_id: student.id,
    election_id: election ? election.id : null,
    expires_at: nowISO(SESSION_MS / 60000),
    created_at: now
  });
  save();
  logAudit(null, 'session_created', 'student', student.id, {}, ip);
  return {
    result: {
      session_id: sessionId,
      expires_at: db.sessions[db.sessions.length - 1].expires_at,
      student: {
        student_id: student.student_id,
        name: student.name,
        programme: student.programme,
        intake: student.intake
      }
    }
  };
}

// Student login using the Student ID as both username and password.
// A Student ID that has already been used to vote cannot log in again.
export function studentLogin(username, password, ip) {
  const normalized = username ? username.trim().toUpperCase() : '';
  if (!/^PUIT\/\d{8}$/.test(normalized)) {
    return { error: { code: 'INVALID_STUDENT_ID', message: 'Student ID must be PUIT/ followed by 8 digits (e.g. PUIT/10000001)', status: 400 } };
  }
  const student = findStudentById(normalized);
  if (!student) {
    return { error: { code: 'STUDENT_NOT_FOUND', message: 'Student ID not found', status: 404 } };
  }
  if (student.eligible !== 'YES') {
    return { error: { code: 'STUDENT_INELIGIBLE', message: 'Student is not eligible to vote', status: 403 } };
  }
  if (password !== normalized) {
    return { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', status: 401 } };
  }
  if (student.has_voted) {
    return { error: { code: 'ALREADY_VOTED', message: 'This ID has already been used to vote', status: 409 } };
  }
  const election = getActiveElection();
  if (!election || election.status !== 'VOTING_OPEN' || election.paused_at) {
    return { error: { code: 'VOTING_CLOSED', message: 'Voting is not currently open', status: 503 } };
  }
  return createStudentSession(student, ip);
}

export function getSession(sessionId) {
  if (!sessionId) return null;
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;
  return session;
}

function getActiveElection() {
  return db.elections.find((e) => e.status === 'VOTING_OPEN') || db.elections[db.elections.length - 1];
}

export function logAudit(adminUserId, action, entityType, entityId, metadata = {}, ip = '0.0.0.0') {
  db.audit_logs.push({
    id: nextId('audit_logs'),
    admin_user_id: adminUserId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata,
    ip_address: ip,
    created_at: nowISO()
  });
  save();
}

export { OTP_EXPIRY_MS };
