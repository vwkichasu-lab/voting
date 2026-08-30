import { useEffect, useState } from 'react';
import { votingService } from '../../services/index.js';
import { Loader, Badge } from '../common/ui.jsx';

function useCountdown(targetIso) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    ended: diff === 0
  };
}

export function ElectionStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    votingService.getStatus().then(({ data }) => setStatus(data)).finally(() => setLoading(false));
  }, []);

  const cd = useCountdown(status?.voting_end);

  if (loading) return <Loader />;
  const isLive = status?.status === 'VOTING_OPEN' && !status?.is_paused;
  return (
    <div className="col gap-2">
      <h2>Election Status</h2>
      <div className="card">
        <div className="between">
          <strong>Election Status</strong>
          <Badge kind={isLive ? 'live' : status.is_paused ? 'orange' : 'gray'}>
            <span className="dot" /> {isLive ? 'LIVE' : status.is_paused ? 'PAUSED' : status.status}
          </Badge>
        </div>
        <h3 style={{ marginTop: '0.75rem' }}>{status.name}</h3>
        <div className="text-sm muted">
          Start: {new Date(status.voting_start).toLocaleString()}<br />
          End: {new Date(status.voting_end).toLocaleString()}<br />
          Time Zone: GMT
        </div>
        <div className="countdown-boxes">
          {[['Days', cd.d], ['Hours', cd.h], ['Min', cd.m], ['Sec', cd.s]].map(([l, v]) => (
            <div className="cd-box" key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>
          ))}
        </div>
        <div className="mt-2 text-sm">
          Participation: <strong>{status.participation_percentage}%</strong> ({status.votes_submitted}/{status.total_eligible_voters})
        </div>
      </div>
    </div>
  );
}
