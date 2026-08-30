import { load, save, reset, nextId } from './store.js';
import crypto from 'node:crypto';

function nowISO(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function seed(force = false) {
  const db = load();
  if (force) reset();
  if (db.elections.length > 0 && !force) {
    console.log('Database already seeded. Use --force to reseed.');
    return db;
  }
  reset();

  // Admin user
  db.users.push({
    id: nextId('users'),
    email: 'admin@level200.local',
    password_hash: hashPassword('Admin@123456'),
    role: 'SUPER_ADMIN',
    created_at: nowISO(),
    updated_at: nowISO()
  });

  // Students (eligible voters) are NOT seeded here. The admin imports them via CSV
  // from the Voters page (POST /admin/elections/:id/import-voters), so the roster
  // is fully managed by the election administrator.

  // Election (open)
  const cohorts = ['January', 'September'];
  const electionId = nextId('elections');
  db.elections.push({
    id: electionId,
    name: 'Level 200 Combined Class Executive Election',
    description: 'Election for the Level 200 combined January and September class executive positions.',
    status: 'VOTING_OPEN',
    start_at: nowISO(-30),
    end_at: nowISO(360),
    paused_at: null,
    pause_reason: null,
    created_at: nowISO(-1440),
    updated_at: nowISO(-30)
  });

  // Positions
  const positionDefs = [
    { name: 'Class President / Representative', description: 'Provides overall leadership and represents the class to faculty.', is_required: 1 },
    { name: 'Vice President', description: 'Supports the president and acts in their absence.', is_required: 1 },
    { name: 'Secretary', description: 'Keeps records, minutes, and handles correspondence.', is_required: 1 },
    { name: 'Treasurer', description: 'Manages class funds and financial records.', is_required: 1 },
    { name: 'Sports Coordinator', description: 'Organizes sporting activities and inter-class events.', is_required: 0 }
  ];
  const positions = [];
  positionDefs.forEach((p, idx) => {
    const id = nextId('positions');
    db.positions.push({
      id,
      election_id: electionId,
      name: p.name,
      description: p.description,
      display_order: idx + 1,
      is_required: p.is_required,
      created_at: nowISO(),
      updated_at: nowISO()
    });
    positions.push({ id, ...p });
  });

  // Candidates (2-3 per required position, split across intakes)
  const firstNames = ['Kwame', 'Ama', 'Kofi', 'Yaa', 'Esi', 'Yaw', 'Akosua', 'Kwesi', 'Abena', 'Kojo'];
  const lastNames = ['Mensah', 'Owusu', 'Boateng', 'Agyeman', 'Addo', 'Amponsah', 'Baidoo', 'Frimpong'];
  let candSeq = 1;
  positions.forEach((pos) => {
    const count = pos.is_required ? 3 : 2;
    for (let c = 0; c < count; c++) {
      const name = `${firstNames[(candSeq) % firstNames.length]} ${lastNames[(candSeq * 3) % lastNames.length]}`;
      db.candidates.push({
        id: nextId('candidates'),
        election_id: electionId,
        position_id: pos.id,
        name,
        intake: cohorts[candSeq % 2],
        manifesto: `I will serve the class diligently and represent every student's voice as ${pos.name}.`,
        photo_path: null,
        status: 'ACTIVE',
        created_at: nowISO(),
        updated_at: nowISO()
      });
      candSeq++;
    }
  });

  // Ballots/votes are created as students vote in the live app; no pre-cast
  // votes are seeded so turnout starts at 0% after the admin imports voters.

  // Audit log sample
  db.audit_logs.push({
    id: nextId('audit_logs'),
    admin_user_id: 1,
    action: 'election_opened',
    entity_type: 'election',
    entity_id: electionId,
    metadata: {},
    ip_address: '127.0.0.1',
    created_at: nowISO(-30)
  });

  save();
  console.log(`Seeded: 0 students (admin imports via CSV), ${db.candidates.length} candidates, ${db.ballots.length} cast ballots.`);
  return db;
}

// Run when invoked directly
import { fileURLToPath } from 'node:url';
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(`file://${process.argv[1]}`);
if (isMain) {
  const force = process.argv.includes('--force');
  seed(force);
}
