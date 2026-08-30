import { db } from '../store.js';
import { nowISO } from '../helpers.js';

export function getActiveElection() {
  return (
    db.elections.find((e) => e.status === 'VOTING_OPEN') ||
    db.elections.sort((a, b) => b.id - a.id)[0]
  );
}

export function electionStatus(election = getActiveElection()) {
  if (!election) return null;
  const eligible = db.students.filter((s) => s.eligible === 'YES').length;
  const votesSubmitted = db.students.filter((s) => s.has_voted).length;
  const participation = eligible ? (votesSubmitted / eligible) * 100 : 0;
  const remainingMs = election.end_at ? new Date(election.end_at).getTime() - Date.now() : 0;
  return {
    id: election.id,
    name: election.name,
    status: election.status,
    voting_start: election.start_at,
    voting_end: election.end_at,
    time_remaining_seconds: Math.max(0, Math.floor(remainingMs / 1000)),
    total_eligible_voters: eligible,
    votes_submitted: votesSubmitted,
    participation_percentage: Number(participation.toFixed(2)),
    is_paused: !!election.paused_at,
    pause_reason: election.pause_reason || null
  };
}

export function buildBallot(electionId) {
  const positions = db.positions
    .filter((p) => p.election_id === electionId)
    .sort((a, b) => a.display_order - b.display_order);
  return {
    election_id: electionId,
    positions: positions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      display_order: p.display_order,
      is_required: !!p.is_required,
      selected_candidate_id: null,
      candidates: db.candidates
        .filter((c) => c.position_id === p.id && c.status === 'ACTIVE')
        .map((c) => ({
          id: c.id,
          name: c.name,
          intake: c.intake,
          manifesto: c.manifesto,
          photo_url: c.photo_path || null
        }))
    }))
  };
}

export function computeResults(electionId) {
  const election = db.elections.find((e) => e.id === electionId);
  if (!election) return null;
  const eligible = db.students.filter((s) => s.eligible === 'YES').length;
  const totalVotes = db.ballots.filter((b) => b.election_id === electionId).length;
  const turnout = eligible ? (totalVotes / eligible) * 100 : 0;

  const positions = db.positions
    .filter((p) => p.election_id === electionId)
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => {
      const votes = db.votes.filter((v) => v.position_id === p.id);
      const tally = {};
      votes.forEach((v) => {
        tally[v.candidate_id] = (tally[v.candidate_id] || 0) + 1;
      });
      const candidates = db.candidates
        .filter((c) => c.position_id === p.id)
        .map((c) => {
          const count = tally[c.id] || 0;
          return {
            id: c.id,
            name: c.name,
            votes: count,
            percentage: votes.length ? Number(((count / votes.length) * 100).toFixed(2)) : 0
          };
        })
        .sort((a, b) => b.votes - a.votes);
      const winner = candidates[0] && candidates[0].votes > 0 ? candidates[0].id : null;
      return {
        position_id: p.id,
        position_name: p.name,
        candidates,
        winner_id: winner
      };
    });

  return {
    election_id: electionId,
    status: election.status,
    total_eligible: eligible,
    total_votes: totalVotes,
    turnout: Number(turnout.toFixed(2)),
    positions
  };
}
