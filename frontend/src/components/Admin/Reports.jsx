import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Icon } from '../common/ui.jsx';

export function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getResults(1), adminService.getDashboard()])
      .then(([r, d]) => setData({ results: r.data, dash: d.data }))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loader />;

  const exportResults = async () => {
    const { data } = await adminService.getResults(1, 'csv');
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'election_report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const reports = [
    { name: 'Election Summary', desc: 'Overall status, turnout and totals', icon: 'flag' },
    { name: 'Voter Turnout Report', desc: 'Voted vs not-voted breakdown', icon: 'chart' },
    { name: 'Candidate Performance', desc: 'Votes and percentages per candidate', icon: 'users' },
    { name: 'Position Results', desc: 'Winner and tallies per position', icon: 'trophy' },
    { name: 'Participation Report', desc: 'Engagement across the electorate', icon: 'list' },
    { name: 'Election Activity', desc: 'Timeline of key events', icon: 'history' }
  ];

  return (
    <div className="col gap-2">
      <h2>Reports</h2>
      <div className="grid grid-3">
        {reports.map((r) => (
          <div className="card" key={r.name}>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Icon name={r.icon} size={20} /></div>
            <strong>{r.name}</strong>
            <p className="text-sm muted" style={{ margin: '0.3rem 0 0.8rem' }}>{r.desc}</p>
            <button className="btn btn-admin btn-sm" onClick={exportResults}><Icon name="download" size={15} /> Export CSV</button>
          </div>
        ))}
      </div>
      <div className="card">
        <strong>Quick Summary</strong>
        <div className="mt-1 text-sm">
          <div>Total eligible: {data.dash.election.total_eligible_voters}</div>
          <div>Votes cast: {data.dash.election.votes_submitted}</div>
          <div>Turnout: {data.dash.election.participation_percentage}%</div>
          <div>Positions: {data.results.positions.length}</div>
        </div>
      </div>
    </div>
  );
}
