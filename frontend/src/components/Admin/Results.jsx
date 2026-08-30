import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Badge, Alert } from '../common/ui.jsx';
import { initials } from '../Student/shared.jsx';

export function Results() {
  const [results, setResults] = useState(null);
  const [sel, setSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService
      .getResults(1)
      .then(({ data }) => { setResults(data); setSel(data.positions[0]?.position_id); })
      .catch((e) => setError(e?.message || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = async () => {
    const { data } = await adminService.getResults(1, 'csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;
  if (error || !results) return <div className="col center gap-2"><Alert type="error">{error || 'Failed to load results'}</Alert></div>;
  const pos = results.positions.find((p) => p.position_id === Number(sel)) || results.positions[0];
  const winner = pos?.candidates.find((c) => c.id === pos.winner_id);
  const max = Math.max(1, ...pos.candidates.map((c) => c.votes));

  return (
    <div className="col gap-2">
      <div className="between">
        <h2 style={{ margin: 0 }}>Results</h2>
        <div className="row gap-1">
          <select value={sel ?? ''} onChange={(e) => setSel(e.target.value)}>
            {results.positions.map((p) => <option key={p.position_id} value={p.position_id}>{p.position_name}</option>)}
          </select>
          <button className="btn btn-admin btn-sm" onClick={exportCsv}>Export Results</button>
        </div>
      </div>

      {winner && (
        <div className="card" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', border: 'none' }}>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <div className="cand-photo" style={{ width: 64, height: 64, fontSize: '1.4rem', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{initials(winner.name)}</div>
            <div>
              <div className="text-sm" style={{ opacity: 0.85 }}>Winner — {pos.position_name}</div>
              <h3 style={{ color: '#fff', margin: '0.2rem 0' }}>{winner.name}</h3>
              <div className="text-sm">{winner.votes} votes · {winner.percentage}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="between text-sm muted"><span>Total valid votes: {pos.candidates.reduce((s, c) => s + c.votes, 0)}</span><span>Turnout: {results.turnout}%</span></div>
        <div className="mt-2">
          {pos.candidates.map((c) => (
            <div className="bar-row" key={c.id}>
              <span className="bar-label">{c.name}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(c.votes / max) * 100}%`, background: c.id === pos.winner_id ? '#16a34a' : '#2563eb' }} />
              </div>
              <span className="bar-val">{c.votes} ({c.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
