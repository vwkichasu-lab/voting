import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function emptyDb() {
  return {
    users: [],
    students: [],
    elections: [],
    positions: [],
    candidates: [],
    otp_challenges: [],
    sessions: [],
    ballots: [],
    votes: [],
    audit_logs: [],
    counters: { ballot_seq: 0 }
  };
}

let db = emptyDb();

function ensureLoaded() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
      db = emptyDb();
    }
  }
  // Ensure all collections exist for forward compatibility.
  const fresh = emptyDb();
  for (const key of Object.keys(fresh)) {
    if (db[key] === undefined) db[key] = fresh[key];
  }
}

function persist() {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function load() {
  ensureLoaded();
  return db;
}

export function save() {
  persist();
  return db;
}

export function reset() {
  const fresh = emptyDb();
  for (const key of Object.keys(fresh)) {
    db[key] = fresh[key];
  }
  persist();
  return db;
}

export function nextId(collection) {
  const max = db[collection].reduce((m, r) => Math.max(m, r.id || 0), 0);
  return max + 1;
}

export function nextBallotSeq() {
  db.counters.ballot_seq = (db.counters.ballot_seq || 0) + 1;
  return db.counters.ballot_seq;
}

export function uid(prefix = '') {
  return prefix + crypto.randomBytes(12).toString('hex');
}

export function hashToken(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomOtp(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

export function randomReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return 'ELX-' + out;
}

export { db };
