import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingService } from '../../services/index.js';
import { Loader, Alert, Icon } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSelections, setSelection } from '../../utils/selections.js';
import { CandidateCard, ManifestoModal } from './shared.jsx';

export function Ballot() {
  const [ballot, setBallot] = useState(null);
  const [selections, setSel] = useState({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();
  const { clearStudentSession } = useAuth();

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

  if (loading) return <Loader label="Loading ballot…" />;
  if (!ballot) return <Alert type="error">Could not load ballot.</Alert>;

  const positions = ballot.positions;
  const current = positions[index];
  const chosen = selections[current.id];

  const select = (candidateId) => setSel(setSelection(current.id, candidateId));
  const doneCount = positions.filter((p) => selections[p.id]).length;

  const next = () => {
    setError(null);
    if (!chosen) return setError('Please select a candidate to continue.');
    if (index < positions.length - 1) setIndex(index + 1);
    else navigate('/app/review');
  };
  const prev = () => index > 0 && setIndex(index - 1);

  return (
    <div className="col gap-2">
      <div className="card">
        <h2 style={{ margin: 0 }}>{ballot.election_id ? 'Class Executives Election 2026' : 'Election'}</h2>
        <p className="muted text-sm" style={{ marginTop: 0 }}>
          You are voting for: Level 400 — Executive Positions
        </p>

        <div className="stepper mb-2">
          {positions.map((p, i) => (
            <span key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`step ${i === index ? 'active' : selections[p.id] ? 'done' : ''}`}>
                {selections[p.id] ? <Icon name="check" size={16} /> : i + 1}
              </span>
              {i < positions.length - 1 && <span className="step-line" />}
            </span>
          ))}
        </div>
        <div className="text-sm muted">Progress: {doneCount} of {positions.length} positions completed</div>
        <div className="progress-track mt-1">
          <div className="progress-fill" style={{ width: `${(doneCount / positions.length) * 100}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="between">
          <h3 style={{ margin: 0 }}>Position: {current.name}</h3>
          {current.is_required && <span className="badge badge-purple">Required</span>}
        </div>
        <p className="muted text-sm">Select ONE (1) candidate</p>
        {error && <Alert type="error">{error}</Alert>}
        <div className="grid grid-auto">
          {current.candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={{ ...c, position_name: current.name }}
              selected={chosen === c.id}
              onSelect={select}
              onManifesto={setModal}
            />
          ))}
        </div>
        <div className="row between mt-2">
          <button className="btn btn-ghost" onClick={prev} disabled={index === 0}>← Previous</button>
          <button className="btn btn-primary" onClick={next}>
            {index < positions.length - 1 ? 'Save & Continue →' : 'Review Selections →'}
          </button>
        </div>
      </div>

      <ManifestoModal candidate={modal} onClose={() => setModal(null)} />
    </div>
  );
}
