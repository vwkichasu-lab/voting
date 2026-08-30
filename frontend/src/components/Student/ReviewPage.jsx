import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const SEL_KEY = 'voting_selections';

export function ReviewPage() {
  const [ballot, setBallot] = useState(null);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { clearStudentSession } = useAuth();

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem(SEL_KEY) || '{}');
    setSelections(saved);
    votingService
      .getBallot()
      .then(({ data }) => setBallot(data))
      .catch((e) => setError(e.userMessage || 'Could not load ballot'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const votes = Object.entries(selections).map(([position_id, candidate_id]) => ({
      position_id: Number(position_id),
      candidate_id
    }));
    try {
      const { data } = await votingService.submitVote(votes);
      sessionStorage.removeItem(SEL_KEY);
      clearStudentSession();
      navigate('/success', { state: { reference: data.ballot_reference, votedAt: data.voted_at } });
    } catch (e) {
      if (e.response?.status === 401) {
        clearStudentSession();
        navigate('/login');
        return;
      }
      setError(e.userMessage || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading review..." />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!ballot) return null;

  const nameOf = (id) => {
    for (const p of ballot.positions) {
      const c = p.candidates.find((c) => c.id === id);
      if (c) return c.name;
    }
    return '—';
  };

  return (
    <div className="card">
      <h2>Review your vote</h2>
      <p className="lead">Confirm your selections before submitting. This cannot be undone.</p>
      <ul className="review-list">
        {ballot.positions.map((p) => (
          <li key={p.id} className="review-item">
            <span className="review-position">{p.name}</span>
            <span className="review-candidate">{selections[p.id] ? nameOf(selections[p.id]) : '— not selected —'}</span>
          </li>
        ))}
      </ul>
      {error && <Alert type="error">{error}</Alert>}
      <div className="row">
        <button className="btn btn-ghost" onClick={() => navigate('/ballot')} disabled={submitting}>
          Back
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={submitting}>
          {submitting ? <LoadingSpinner /> : 'Submit vote'}
        </button>
      </div>
    </div>
  );
}
