import { db, load, save, nextId, nextBallotSeq } from '../store.js';
import { nowISO } from '../helpers.js';
import { getActiveElection, buildBallot } from './electionService.js';
import { logAudit } from './authService.js';

export function getBallotForSession(session) {
  const election = db.elections.find((e) => e.id === session.election_id);
  if (!election) return { error: { code: 'NO_ELECTION', message: 'No election found', status: 404 } };
  if (election.status !== 'VOTING_OPEN' || election.paused_at) {
    return { error: { code: 'VOTING_CLOSED', message: 'Voting is not open', status: 503 } };
  }
  return { result: buildBallot(election.id) };
}

export function reviewBallot(session) {
  const election = db.elections.find((e) => e.id === session.election_id);
  if (!election) return { error: { code: 'NO_ELECTION', message: 'No election found', status: 404 } };
  const positions = db.positions
    .filter((p) => p.election_id === election.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => {
      const vote = db.votes.find((v) => v.ballot_id === session.preview_ballot_id && v.position_id === p.id);
      const candidate = vote ? db.candidates.find((c) => c.id === vote.candidate_id) : null;
      return {
        position_id: p.id,
        position_name: p.name,
        required: !!p.is_required,
        selected_candidate: candidate
          ? { id: candidate.id, name: candidate.name, intake: candidate.intake }
          : null
      };
    });
  const allRequiredFilled = positions
    .filter((p) => p.required)
    .every((p) => p.selected_candidate);
  return { result: { ballot: { positions, all_required_filled: allRequiredFilled } } };
}

export function submitVote(session, votes, ip) {
  load();
  const election = db.elections.find((e) => e.id === session.election_id);
  if (!election) return { error: { code: 'NO_ELECTION', message: 'No election found', status: 404 } };
  if (election.status !== 'VOTING_OPEN' || election.paused_at) {
    return { error: { code: 'VOTING_CLOSED', message: 'Voting is closed or paused', status: 503 } };
  }

  // Lock student record (in-memory transaction).
  const student = db.students.find((s) => s.id === session.student_id);
  if (!student) return { error: { code: 'STUDENT_NOT_FOUND', message: 'Student not found', status: 404 } };
  if (student.has_voted) {
    return { error: { code: 'ALREADY_VOTED', message: 'You have already voted', status: 409 } };
  }

  const requiredPositions = db.positions.filter(
    (p) => p.election_id === election.id && p.is_required
  );
  const submitted = votes || [];

  // Validate each required position has a vote.
  for (const rp of requiredPositions) {
    const v = submitted.find((x) => x.position_id === rp.id);
    if (!v) {
      return {
        error: { code: 'MISSING_POSITION', message: `Missing vote for ${rp.name}`, status: 400 }
      };
    }
  }

  // Validate each vote.
  for (const v of submitted) {
    const position = db.positions.find((p) => p.id === v.position_id);
    if (!position || position.election_id !== election.id) {
      return { error: { code: 'INVALID_POSITION', message: 'Invalid position', status: 400 } };
    }
    const candidate = db.candidates.find((c) => c.id === v.candidate_id);
    if (!candidate) {
      return { error: { code: 'INVALID_CANDIDATE', message: 'Invalid candidate', status: 400 } };
    }
    if (candidate.status !== 'ACTIVE') {
      return { error: { code: 'CANDIDATE_INACTIVE', message: 'Candidate is not active', status: 400 } };
    }
    if (candidate.position_id !== v.position_id || candidate.election_id !== election.id) {
      return {
        error: { code: 'CANDIDATE_MISMATCH', message: 'Candidate does not match position', status: 400 }
      };
    }
  }

  // Commit.
  const ballotId = nextId('ballots');
  const reference = 'ELX-' + nextBallotSeq().toString(36).toUpperCase().padStart(6, '0').slice(-6);
  const submittedAt = nowISO();
  db.ballots.push({
    id: ballotId,
    election_id: election.id,
    ballot_reference: reference,
    submitted_at: submittedAt,
    created_at: submittedAt
  });
  for (const v of submitted) {
    db.votes.push({
      id: nextId('votes'),
      ballot_id: ballotId,
      position_id: v.position_id,
      candidate_id: v.candidate_id,
      created_at: submittedAt
    });
  }
  student.has_voted = 1;
  student.voted_at = submittedAt;

  // Invalidate session.
  db.sessions = db.sessions.filter((s) => s.id !== session.id);
  save();

  logAudit(null, 'vote_submitted', 'ballot', ballotId, { reference }, ip);

  return {
    result: {
      ballot_reference: reference,
      message: 'Your vote has been recorded',
      voted_at: submittedAt
    }
  };
}
