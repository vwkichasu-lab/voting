import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../common/ui.jsx';

export function History({ onVote }) {
  const { student } = useAuth();
  const voted = student?.has_voted;
  return (
    <div className="col gap-2">
      <h2>My Voting History</h2>
      <div className="card">
        <div className="between">
          <strong>Ballot Status</strong>
          {voted ? <Badge kind="green">✓ Voted</Badge> : <Badge kind="orange">Not Voted</Badge>}
        </div>
        <p className="mt-1 text-sm muted">
          {voted
            ? 'Your ballot has been successfully recorded. Ballot details are kept confidential.'
            : 'You have not submitted your ballot yet. Complete all positions to finish voting.'}
        </p>
        {!voted && (
          <button className="btn btn-primary" onClick={() => onVote && onVote()}>Go to Voting →</button>
        )}
      </div>
    </div>
  );
}
