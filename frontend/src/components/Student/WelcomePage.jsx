import { Link } from 'react-router-dom';
import { useElectionStatus } from '../../hooks/index.js';
import { formatPercent, formatTime } from '../../utils/validation.js';
import { Alert } from '../Common/index.jsx';

export function WelcomePage() {
  const { status, loading } = useElectionStatus();
  const open = status && status.status === 'VOTING_OPEN' && !status.is_paused;

  return (
    <div className="card welcome-card">
      <h1>Level 200 Combined Class Election</h1>
      <p className="lead">
        Cast your vote for the executive positions of the combined January and September
        Level 200 class. Your ballot is private and counted once.
      </p>

      {!loading && status && (
        <div className="status-banner">
          <span className={`badge ${open ? 'badge-open' : 'badge-closed'}`}>
            {open ? 'Voting Open' : status.is_paused ? 'Voting Paused' : status.status.replace(/_/g, ' ')}
          </span>
          <span className="status-line">
            {status.votes_submitted}/{status.total_eligible_voters} voted &middot;{' '}
            {formatPercent(status.participation_percentage)} turnout
          </span>
          {open && (
            <span className="status-line">Time remaining: {formatTime(status.time_remaining_seconds)}</span>
          )}
        </div>
      )}

      {!loading && status && !open && (
        <Alert type="warning">
          Voting is not currently open. Please check back during the voting window.
        </Alert>
      )}

      <Link to="/login" className="btn btn-primary btn-block">
        Start Voting
      </Link>
    </div>
  );
}
