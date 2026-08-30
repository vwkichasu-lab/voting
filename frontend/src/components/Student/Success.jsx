import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearStudentSession } = useAuth();
  const { reference, votedAt, count } = location.state || {};

  const goDashboard = () => {
    // keep student session so dashboard shows voted state; re-login not required
    navigate('/app/dashboard');
  };
  const logout = () => {
    clearStudentSession();
    navigate('/login');
  };

  return (
    <div className="success-screen">
      <div className="card success-box">
        <div className="success-check">✓</div>
        <h2>Your Vote Has Been Successfully Recorded!</h2>
        <p className="muted">Thank you for participating in the Class Executives Election 2026.</p>

        <div className="card summary-card">
          <div className="review-row" style={{ borderBottom: 'none' }}>
            <div className="meta"><div className="pos">Positions Voted</div><div className="cand">{count || 8} of {count || 8}</div></div>
          </div>
          <div className="review-row" style={{ borderBottom: 'none' }}>
            <div className="meta"><div className="pos">Date & Time</div><div className="cand">{votedAt ? new Date(votedAt).toLocaleString() : '—'}</div></div>
          </div>
          <div className="review-row" style={{ borderBottom: 'none' }}>
            <div className="meta"><div className="pos">Reference ID</div><div className="cand" style={{ fontWeight: 700 }}>{reference || 'VE26-400-XXXXXX'}</div></div>
          </div>
        </div>

        <div className="row gap-1">
          <button className="btn btn-primary flex-1" onClick={goDashboard}>Go to Dashboard</button>
          <button className="btn btn-ghost flex-1" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
