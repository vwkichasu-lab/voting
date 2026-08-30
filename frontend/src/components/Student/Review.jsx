import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingService } from '../../services/index.js';
import { Loader, Alert, Modal, Icon, Badge } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSelections, clearSelections } from '../../utils/selections.js';
import { initials } from './shared.jsx';

export function Review() {
  const [ballot, setBallot] = useState(null);
  const [selections, setSel] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { clearStudentSession, markStudentVoted } = useAuth();

  useEffect(() => {
    votingService
      .getBallot()
      .then(({ data }) => {
        setBallot(data);
        setSel(getSelections());
      })
      .catch((e) => {
        if (e.response?.status === 401) {
          clearStudentSession();
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, clearStudentSession]);

  if (loading) return <Loader label="Loading review…" />;
  if (!ballot) return <Alert type="error">Could not load review.</Alert>;

  const nameOf = (id) => {
    for (const p of ballot.positions) {
      const c = p.candidates.find((c) => c.id === id);
      if (c) return c.name;
    }
    return null;
  };
  const allRequired = ballot.positions.filter((p) => p.is_required).every((p) => selections[p.id]);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const votes = Object.entries(selections).map(([position_id, candidate_id]) => ({
      position_id: Number(position_id),
      candidate_id
    }));
    try {
      const { data } = await votingService.submitVote(votes);
      clearSelections();
      markStudentVoted();
      navigate('/success', {
        state: { reference: data.ballot_reference, votedAt: data.voted_at, count: ballot.positions.length }
      });
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

  return (
    <div className="col gap-2">
      <div className="card">
        <h2 style={{ margin: 0 }}>Review Your Selections</h2>
        <p className="muted text-sm">Please review your choices before final submission.</p>
        {error && <Alert type="error">{error}</Alert>}

        {ballot.positions.map((p) => {
          const cid = selections[p.id];
          const voted = !!cid;
          const required = p.is_required;
          return (
            <div className="review-row" key={p.id}>
              <div className="cand-photo" style={{ width: 44, height: 44, fontSize: '0.9rem' }}>
                {voted ? initials(nameOf(cid)) : '—'}
              </div>
              <div className="meta">
                <div className="pos">{p.name}</div>
                <div className="cand">
                  {voted ? nameOf(cid) : <span style={{ color: '#ef4444' }}>Not selected{required ? ' (required)' : ''}</span>}
                </div>
              </div>
              {voted ? (
                <Badge kind="green"><Icon name="check" size={12} /> Voted</Badge>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/ballot')}>Edit</button>
              )}
            </div>
          );
        })}

        <div className="row between mt-2">
          <button className="btn btn-ghost" onClick={() => navigate('/app/ballot')}>← Back</button>
          <button className="btn btn-success btn-lg" disabled={!allRequired || submitting} onClick={() => setConfirm(true)}>
            Submit Vote
          </button>
        </div>
        {!allRequired && <p className="text-xs" style={{ color: '#ef4444' }}>Complete all required positions before submitting.</p>}
      </div>

      {confirm && (
      <Modal
        title="Submit Your Vote?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
            <button className="btn btn-success" onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Yes, Submit Vote'}
            </button>
          </>
        }
      >
        You will not be able to change your selections after submitting. Are you sure you want to continue?
      </Modal>
      )}
    </div>
  );
}
