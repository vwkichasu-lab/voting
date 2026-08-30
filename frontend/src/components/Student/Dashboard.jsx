import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingService } from '../../services/index.js';
import { Loader, Badge, Icon } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSelections } from '../../utils/selections.js';
import { positionIcon, Avatar } from './shared.jsx';

function useCountdown(targetIso) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, ended: diff === 0 };
}

export function Dashboard() {
  const [status, setStatus] = useState(null);
  const [ballot, setBallot] = useState(null);
  const [loading, setLoading] = useState(true);
  const { student } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([votingService.getStatus(), votingService.getBallot().catch(() => null)])
      .then(([st, bl]) => {
        setStatus(st.data);
        setBallot(bl?.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cd = useCountdown(status?.voting_end);

  if (loading) return <Loader label="Loading dashboard…" />;

  const selections = getSelections();
  const positions = ballot?.positions || [];
  const total = positions.length || 8;
  const votedCount = student?.has_voted ? total : positions.filter((p) => selections[p.id]).length;
  const pct = (votedCount / total) * 100;

  const isLive = status?.status === 'VOTING_OPEN' && !status?.is_paused;

  return (
    <div className="col gap-2">
      <div className="grid grid-2">
        <div className="card welcome-card">
          <div>
            <h2>Welcome back, {student?.name?.split(' ')[0] || 'Voter'} 👋</h2>
            <p>Exercise your right. Your vote counts!</p>
          </div>
          <div style={{ fontSize: '3rem' }}>🗳️</div>
        </div>

        <div className="card status-card">
          <div className="between">
            <strong>Election Status</strong>
            <Badge kind={isLive ? 'live' : 'gray'}>
              <span className="dot" /> {isLive ? 'LIVE' : status?.is_paused ? 'PAUSED' : status?.status}
            </Badge>
          </div>
          <p className="mt-1" style={{ fontWeight: 600 }}>{status?.name}</p>
          <div className="text-sm muted">Voting ends on: {new Date(status?.voting_end).toLocaleString()}</div>
          <div className="countdown-boxes">
            {[['Days', cd.d], ['Hours', cd.h], ['Min', cd.m], ['Sec', cd.s]].map(([l, v]) => (
              <div className="cd-box" key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="between">
            <strong>Your Voting Progress</strong>
          </div>
          <div className="flex gap-2 mt-2" style={{ alignItems: 'center' }}>
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#eef2f7" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#6366f1" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="label"><b>{votedCount}/{total}</b><span>Positions</span></div>
            </div>
            <div className="text-sm">
              <div><strong style={{ color: '#16a34a' }}>{votedCount} Voted</strong></div>
              <div className="muted">{total - votedCount} Yet to Vote</div>
            </div>
          </div>
          <p className="text-xs muted mt-1">Complete all required positions to finish voting.</p>
        </div>

        <div className="card notice" style={{ gridColumn: 'span 2' }}>
          <strong>⚠ Important Notice</strong>
          <ul className="mt-1">
            <li>You can vote only once for each position.</li>
            <li>Review your choice carefully before submission.</li>
            <li>Your vote is confidential and secure.</li>
            <li>Required positions must be completed.</li>
            <li>You cannot modify your ballot after final submission.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Available Positions</h3>
        <p className="muted text-sm">Vote for your preferred candidate in each position.</p>
        {student?.has_voted ? (
          <div className="notice" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            ✅ You have successfully cast your vote. Your ballot is recorded and cannot be changed.
          </div>
        ) : (
        <div className="grid grid-auto">
          {positions.map((p) => {
            const voted = student?.has_voted || selections[p.id];
            return (
              <div className="card position-card" key={p.id} style={{ boxShadow: 'none' }}>
                <div className="position-icon"><Icon name={positionIcon(p.name)} size={22} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="text-xs muted">{p.candidates.length} candidates</div>
                </div>
                {voted ? (
                  <div className="col gap-1" style={{ alignItems: 'flex-end' }}>
                    <Badge kind="green"><Icon name="check" size={12} /> Voted</Badge>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/ballot')}>View Vote</button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/ballot')}>Vote Now →</button>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
