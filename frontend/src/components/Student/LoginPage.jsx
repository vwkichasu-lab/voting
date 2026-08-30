import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/index.js';
import { validateStudentId } from '../../utils/validation.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const navigate = useNavigate();
  const { setStudentSession } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const err = validateStudentId(studentId);
    if (err) return setError(err);
    setLoading(true);
    try {
      const { data } = await authService.requestCode(studentId.trim().toUpperCase());
      setStudentSession({ session_id: null }, { student_id: studentId.trim().toUpperCase() });
      if (data.dev_otp) setDevOtp(data.dev_otp);
      navigate('/verify');
    } catch (e) {
      setError(e.userMessage || 'Could not request a code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Verify your identity</h2>
      <p className="lead">Enter your student ID to receive a one-time verification code.</p>
      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Student ID</span>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="PUIT/10000001"
            autoFocus
          />
        </label>
        {error && <Alert type="error">{error}</Alert>}
        {devOtp && (
          <Alert type="info">
            Dev OTP (demo only): <strong>{devOtp}</strong>
          </Alert>
        )}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? <LoadingSpinner /> : 'Send code'}
        </button>
      </form>
    </div>
  );
}
