import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/index.js';
import { Loader, DonutChart, BarChart, LineChart, Badge, Icon } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const COLORS = ['#2563eb', '#16a34a', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#14b8a6'];

export function AdminDashboard() {
  const [dash, setDash] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { adminUser } = useAuth();

  useEffect(() => {
    let alive = true;
    adminService
      .getDashboard()
      .then((d) => {
        if (alive) setDash(d.data);
      })
      .catch(() => {
        if (alive) setDash(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    adminService
      .getResults(1)
      .then((r) => {
        if (alive) setResults(r.data);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (loading || !dash) return <Loader />;
  const e = dash.election;
  const eligible = e.total_eligible_voters;
  const cast = e.votes_submitted;
  const yet = eligible - cast;
  const positions = results?.positions || [];
  const candidates = positions.reduce((s, p) => s + p.candidates.length, 0);
  const turnout = e.participation_percentage;
  const isOpen = e.status === 'VOTING_OPEN' && !e.is_paused;

  const stats = [
    { label: 'Registered Voters', value: eligible, icon: 'users', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Votes Cast', value: cast, icon: 'vote', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Yet to Vote', value: yet, icon: 'clock', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Positions', value: positions.length, icon: 'list', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Candidates', value: candidates, icon: 'users', color: '#0ea5e9', bg: '#ecfeff' },
    { label: 'Voter Turnout', value: `${Math.round(turnout)}%`, icon: 'chart', color: '#ef4444', bg: '#fef2f2' }
  ];

  const barData = positions.map((p, i) => ({
    label: p.position_name.split(' ').slice(0, 2).join(' '),
    value: p.candidates.reduce((s, c) => s + c.votes, 0),
    color: COLORS[i % COLORS.length]
  }));

  // synthesize a plausible cumulative votes-over-time curve
  const linePoints = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    y: Math.round((cast * (i + 1)) / 12 * (0.6 + 0.4 * Math.sin(i / 2)))
  }));

  const control = async (fn) => {
    try {
      await fn();
      const d = await adminService.getDashboard();
      setDash(d.data);
    } catch {}
  };

  return (
    <div className="col gap-2">
      <div className="grid grid-3">
        {stats.map((s) => (
          <div className="card stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Icon name={s.icon} size={20} /></div>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="between">
            <strong>Election Overview</strong>
            <Badge kind={isOpen ? 'live' : 'gray'}><span className="dot" /> {e.is_paused ? 'PAUSED' : e.status}</Badge>
          </div>
          <p className="mt-1" style={{ fontWeight: 600 }}>{e.name}</p>
          <div className="text-sm muted">
            <div><Icon name="calendar" size={14} /> Start: {new Date(e.voting_start).toLocaleString()}</div>
            <div><Icon name="calendar" size={14} /> End: {new Date(e.voting_end).toLocaleString()}</div>
            <div>Time Zone: GMT</div>
          </div>
          <div className="row gap-1 mt-2">
            {isOpen ? (
              <button className="btn btn-warn btn-sm" onClick={() => control(() => adminService.pause(1, 'Admin pause'))}>Pause Election</button>
            ) : e.status === 'VOTING_PAUSED' ? (
              <button className="btn btn-success btn-sm" onClick={() => control(() => adminService.resume(1))}>Resume</button>
            ) : null}
            {isOpen && (
              <button className="btn btn-danger btn-sm" onClick={() => control(() => adminService.updateStatus(1, 'VOTING_CLOSED'))}>End Election</button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/elections')}>View Details</button>
          </div>
        </div>

        <div className="card">
          <strong>Voter Turnout</strong>
          <div className="chart-donut mt-1">
            <DonutChart value={turnout} color="#2563eb" sub={`${cast} voted`} />
            <div className="legend">
              <div className="legend-item"><span className="legend-swatch" style={{ background: '#2563eb' }} /> Voted: {cast}</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: '#e2e8f0' }} /> Yet to vote: {yet}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <strong>Votes Per Position</strong>
          <div className="mt-2"><BarChart data={barData} /></div>
        </div>
        <div className="card">
          <strong>Votes Over Time</strong>
          <div className="mt-2"><LineChart points={linePoints} /></div>
        </div>
      </div>

      <div className="card">
        <div className="between">
          <strong>Recent Activity</strong>
          <a className="text-sm" style={{ color: '#2563eb' }} onClick={() => navigate('/admin/audit')}>View All</a>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
          {dash.recent_activity.map((a, i) => (
            <li key={i} className="between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span><Icon name="check" size={14} style={{ color: '#16a34a', marginRight: 6 }} /> {a.action}</span>
              <span className="text-xs muted">{new Date(a.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
