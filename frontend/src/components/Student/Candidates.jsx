import { useEffect, useState } from 'react';
import { votingService } from '../../services/index.js';
import { Loader } from '../common/ui.jsx';
import { positionIcon, initials } from './shared.jsx';

export function Candidates() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    votingService.getCandidates().then(({ data }) => setPositions(data.positions)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;
  return (
    <div className="col gap-2">
      <h2>Candidates</h2>
      {positions.map((p) => (
        <div className="card" key={p.id}>
          <div className="flex gap-1" style={{ alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="position-icon"><span className="icon-placeholder" /></span>
            <strong>{p.name}</strong>
          </div>
          <div className="grid grid-auto">
            {p.candidates.map((c) => (
              <div className="candidate-card" key={c.id} style={{ cursor: 'default' }}>
                <div className="cand-top">
                  <div className="cand-photo">{initials(c.name)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                    <div className="text-xs muted">{c.intake} Intake</div>
                  </div>
                </div>
                <p className="text-sm muted" style={{ margin: 0 }}>{c.manifesto}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
