import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { adminService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin, isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (e) {
      setError(e.userMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="card">
        <h2>Admin sign in</h2>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@level200.local" autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <Alert type="error">{error}</Alert>}
          <button className="btn btn-primary btn-block" disabled={loading} type="submit">
            {loading ? <LoadingSpinner /> : 'Sign in'}
          </button>
        </form>
        <p className="hint">Demo credentials: admin@level200.local / Admin@123456</p>
      </div>
    </div>
  );
}
