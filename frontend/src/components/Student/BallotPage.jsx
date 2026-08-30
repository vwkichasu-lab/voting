import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingService } from '../../services/index.js';
import { PositionSection } from './Ballot.jsx';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const SEL_KEY = 'voting_selections';

export function BallotPage() {
  const [ballot, setBallot] = useState(null);
  const [selections, setSelections] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { clearStudentSession } = useAuth();

  useEffect(() => {
    votingService
      .getBallot()
      .then(({ data }) => {
        setBallot(data);
        const saved = JSON.parse(sessionStorage.getItem(SEL_KEY) || '{}');
        setSelections(saved);
      })
      .catch((e) => {
        if (e.response?.status === 401) {
          clearStudentSession();
          navigate('/login');
          return;
        }
        setError(e.userMessage || 'Could not load ballot');
      })
      .finally(() => setLoading(false));
  }, [navigate, clearStudentSession]);

  const select = (positionId, candidateId) => {
    setSelections((prev) => {
      const next = { ...prev, [positionId]: candidateId };
      sessionStorage.setItem(SEL_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (loading) return <LoadingSpinner label="Loading ballot..." />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!ballot) return null;

  const required = ballot.positions.filter((p) => p.is_required);
  const allRequired = required.every((p) => selections[p.id]);

  return (
    <div className="card">
      <h2>Your Ballot</h2>
      <p className="lead">Select one candidate for each required position.</p>
      <div className="positions">
        {ballot.positions.map((p) => (
          <PositionSection
            key={p.id}
            position={p}
            selectedCandidateId={selections[p.id]}
            onSelect={select}
          />
        ))}
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <button
        className="btn btn-primary btn-block"
        disabled={!allRequired}
        onClick={() => navigate('/review')}
      >
        Review selections
      </button>
      {!allRequired && (
        <p className="hint">Please select a candidate for every required position.</p>
      )}
    </div>
  );
}
