import { useLocation, Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/validation.js';

export function SuccessPage() {
  const location = useLocation();
  const { reference, votedAt } = location.state || {};

  return (
    <div className="card success-card">
      <div className="success-check">✓</div>
      <h2>Your vote has been recorded</h2>
      <p className="lead">Thank you for participating in the Level 200 class election.</p>
      {reference && (
        <div className="reference-box">
          <span>Ballot reference</span>
          <strong>{reference}</strong>
        </div>
      )}
      {votedAt && <p className="hint">Submitted at {formatDateTime(votedAt)}</p>}
      <Link to="/" className="btn btn-primary btn-block">
        Done
      </Link>
    </div>
  );
}
