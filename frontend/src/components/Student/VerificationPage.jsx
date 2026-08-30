import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/index.js';
import { validateOtp } from '../../utils/validation.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function VerificationPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { student, setStudentSession } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validateOtp(code);
    if (err) return setError(err);
    if (!student?.student_id) return setError('Student session lost. Start again.');
    setLoading(true);
    try {
      const { data } = await authService.verifyCode(student.student_id, code.trim());
      setStudentSession(
        { session_id: data.session_id, expires_at: data.expires_at },
        student
      );
      navigate('/ballot');
    } catch (e) {
      setError(e.userMessage || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Enter verification code</h2>
      <p className="lead">
        A 6-digit code was sent to the registered contact for <strong>{student?.student_id}</strong>.
      </p>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Verification code</span>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            autoFocus
          />
        </label>
        {error && <Alert type="error">{error}</Alert>}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? <LoadingSpinner /> : 'Verify & continue'}
        </button>
      </form>
    </div>
  );
}
