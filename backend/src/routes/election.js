import express from 'express';
import { fail, ok } from '../helpers.js';
import { electionStatus, getActiveElection } from '../services/electionService.js';
import { db } from '../store.js';
import { getBallotForSession, submitVote, reviewBallot } from '../services/votingService.js';
import { authenticateSession } from '../middleware.js';

const router = express.Router();

router.get('/status', (req, res) => {
  const status = electionStatus();
  if (!status) return fail(res, 'NO_ELECTION', 'No election configured', 404);
  return ok(res, status);
});

router.get('/candidates', (req, res) => {
  const election = getActiveElection();
  if (!election) return fail(res, 'NO_ELECTION', 'No election configured', 404);
  const positions = db.positions
    .filter((p) => p.election_id === election.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      is_required: !!p.is_required,
      candidates: db.candidates
        .filter((c) => c.position_id === p.id && c.status === 'ACTIVE')
        .map((c) => ({ id: c.id, name: c.name, intake: c.intake, manifesto: c.manifesto }))
    }));
  return ok(res, { positions });
});

router.get('/ballot', authenticateSession, (req, res) => {
  const out = getBallotForSession(req.session);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.get('/review', authenticateSession, (req, res) => {
  const out = reviewBallot(req.session);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

router.post('/vote', authenticateSession, (req, res) => {
  const { votes } = req.body || {};
  if (!Array.isArray(votes) || votes.length === 0) {
    return fail(res, 'NO_VOTES', 'No votes provided', 400);
  }
  const out = submitVote(req.session, votes, req.ip);
  if (out.error) return fail(res, out.error.code, out.error.message, out.error.status);
  return ok(res, out.result);
});

export default router;
