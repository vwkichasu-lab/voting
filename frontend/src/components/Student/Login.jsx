import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/index.js';
import { validateStudentId } from '../../utils/validation.js';
import { Alert, Icon } from '../common/ui.jsx';
import { Icon as Ico } from '../common/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setStudentSession } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validateStudentId(studentId);
    if (err) return setError(err);
    if (!password) return setError('Password is required');
    setLoading(true);
    try {
      const { data } = await authService.login(studentId.trim().toUpperCase(), password);
      setStudentSession({ session_id: data.session_id }, data.student);
      navigate('/app');
    } catch (e) {
      setError(e.userMessage || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-logo">CE</div>
        <div className="brand-name">
          CLASS EXECUTIVES
          <small>VOTING SYSTEM</small>
        </div>
        <h2 style={{ textAlign: 'center', marginTop: '1.2rem' }}>Welcome Back!</h2>
        <p className="muted text-center" style={{ marginTop: 0 }}>Please sign in to continue</p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Student ID</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="PUIT/10000001"
              autoFocus
            />
          </div>
         <div className="field">
           <label>Password</label>
           <div className="pw-wrap">
             <input
               type={showPw ? 'text' : 'password'}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Enter your Student ID"
               autoComplete="new-password"
             />
             <button type="button" className="toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide' : 'Show'}>
               <Ico name={showPw ? 'eye' : 'lock'} size={18} />
             </button>
           </div>
           <p className="hint">Your Student ID is also your password.</p>
         </div>
         <div className="between" style={{ marginBottom: '1rem' }}>
           <label className="checkbox">
             <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
           </label>
         </div>
         {error && <Alert type="error">{error}</Alert>}
         <button className="btn btn-primary btn-block btn-lg" disabled={loading} type="submit">
           {loading ? 'Signing in…' : 'Login'}
         </button>
        </form>

        <div className="secure-row">
          <Ico name="shield" size={16} />
          <span>Secure • Transparent • Fair</span>
        </div>
        <p className="auth-footer">Need help? Contact the election committee.</p>
      </div>
    </div>
  );
}
