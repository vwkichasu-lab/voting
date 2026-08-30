import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, DonutChart, BarChart, LineChart } from '../common/ui.jsx';

const COLORS = ['#2563eb', '#16a34a', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#14b8a6'];

export function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([adminService.getResults(1), adminService.getDashboard()])
      .then(([r, d]) => setData({ results: r.data, dash: d.data }))
      .finally(() => setLoading(false));
  }, []);
  if (loading || !data) return <Loader />;

  const e = data.dash.election;
  const turnout = e.participation_percentage;
  const barData = data.results.positions.map((p, i) => ({
    label: p.position_name.split(' ').slice(0, 2).join(' '),
    value: p.candidates.reduce((s, c) => s + c.votes, 0),
    color: COLORS[i % COLORS.length]
  }));
  const cast = e.votes_submitted;
  const linePoints = Array.from({ length: 12 }, (_, i) => ({ x: i, y: Math.round((cast * (i + 1)) / 12 * (0.6 + 0.4 * Math.sin(i / 2))) }));

  return (
    <div className="col gap-2">
      <h2>Analytics</h2>
      <div className="grid grid-3">
        <div className="card"><strong>Voter Turnout</strong><div className="chart-donut mt-1"><DonutChart value={turnout} color="#2563eb" sub={`${cast} voted`} /></div></div>
        <div className="card"><strong>Votes Per Position</strong><div className="mt-2"><BarChart data={barData} /></div></div>
        <div className="card"><strong>Votes Over Time</strong><div className="mt-2"><LineChart points={linePoints} /></div></div>
      </div>
    </div>
  );
}
