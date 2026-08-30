import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { formatPercent } from '../../utils/validation.js';

export function ResultsView() {
  const [electionId, setElectionId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then(({ data }) => {
        setElectionId(data.election.id);
        return adminService.getResults(data.election.id);
      })
      .then(({ data }) => setResults(data))
      .catch((e) => setError(e.userMessage || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = async () => {
    try {
      const { data } = await adminService.getResults(electionId, 'csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'results.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.userMessage || 'Download failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!results) return null;

  return (
    <div className="admin-content">
      <div className="row between">
        <h1>Results</h1>
        <button className="btn btn-ghost" onClick={downloadCsv}>
          Export CSV
        </button>
      </div>
      <p className="muted">
        Status: {results.status} · Turnout: {formatPercent(results.turnout)} ({results.total_votes}/
        {results.total_eligible})
      </p>

      {results.positions.map((p) => (
        <div key={p.position_id} className="card">
          <h2>{p.position_name}</h2>
          {p.candidates.map((c) => (
            <div key={c.id} className="result-row">
              <div className="result-head">
                <span className={c.id === p.winner_id ? 'winner' : ''}>
                  {c.name} {c.id === p.winner_id && '🏆'}
                </span>
                <span>
                  {c.votes} votes · {formatPercent(c.percentage)}
                </span>
              </div>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${c.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
