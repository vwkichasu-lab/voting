import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/index.js';
import { Alert, Icon, Loader } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const EXPIRY = 5 * 60; // seconds

export function Otp() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(EXPIRY);
  const refs = useRef([]);
  const navigate = useNavigate();
  const { student, setStudentSession } = useAuth();

  useEffect(() => {
    const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const setAt = (i, v) => {
    const val = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const code = digits.join('');
    if (code.length !== 6) return setError('Enter the full 6-digit code');
    if (!student?.student_id) return setError('Session lost. Start again.');
    setLoading(true);
    try {
      const { data } = await authService.verifyCode(student.student_id, code);
      setStudentSession(
        { session_id: data.session_id, expires_at: data.expires_at },
        data.student || student
      );
      navigate('/app/dashboard');
    } catch (e) {
      setError(e.userMessage || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    setLeft(EXPIRY);
    setDigits(['', '', '', '', '', '']);
    try {
      await authService.requestCode(student?.student_id);
    } catch (e) {
      setError(e.userMessage || 'Could not resend');
    }
  };

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ textAlign: 'center' }}>Verify Your Identity</h2>
        <p className="muted text-center" style={{ marginTop: 0 }}>
          Enter the 6-digit code sent to your registered email or phone number.
        </p>
        <form onSubmit={submit}>
          <div className="otp-row">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                className="otp-box"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <div className="countdown">
            {left > 0 ? `Code expires in ${mm}:${ss}` : 'Code expired. Resend to continue.'}
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading} type="submit" style={{ marginTop: '1rem' }}>
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>
        </form>
        <div className="between mt-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>← Back</button>
          <button className="btn btn-ghost btn-sm" onClick={resend} disabled={left > 0}>
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
