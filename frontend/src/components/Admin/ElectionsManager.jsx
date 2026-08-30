import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDateTime } from '../../utils/validation.js';

const STATUSES = ['DRAFT', 'NOMINATIONS_OPEN', 'NOMINATIONS_CLOSED', 'READY', 'VOTING_OPEN', 'VOTING_CLOSED', 'RESULTS_PUBLISHED', 'ARCHIVED'];

export function ElectionsManager() {
  const [election, setElection] = useState(null);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ name: '', description: '', is_required: true });
  const { adminUser } = useAuth();

  const load = () => {
    adminService
      .getDashboard()
      .then(({ data }) => setElection(data.election))
      .catch((e) => setError(e.userMessage || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (fn) => {
    setError(null);
    setMsg(null);
    try {
      const { data } = await fn();
      setMsg(data.message || 'Updated');
      load();
    } catch (e) {
      setError(e.userMessage || 'Action failed');
    }
  };

  const addPosition = async (e) => {
    e.preventDefault();
    if (!position.name) return setError('Position name required');
    await act(() => adminService.addPosition(election.id, position));
    setPosition({ name: '', description: '', is_required: true });
  };

  if (loading) return <LoadingSpinner />;
  if (error && !election) return <Alert type="error">{error}</Alert>;

  return (
    <div className="admin-content">
      <h1>Election Control</h1>
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="card">
        <h2>{election.name}</h2>
        <p className="muted">
          Status: <strong>{election.is_paused ? 'PAUSED' : election.status}</strong>
        </p>
        <p className="muted">Start: {formatDateTime(election.voting_start)}</p>
        <p className="muted">End: {formatDateTime(election.voting_end)}</p>

        <div className="row wrap">
          <button className="btn btn-primary" onClick={() => act(() => adminService.updateStatus(election.id, 'VOTING_OPEN'))}>
            Open voting
          </button>
          <button className="btn btn-warn" onClick={() => act(() => adminService.pause(election.id, 'Manual pause'))}>
            Pause
          </button>
          <button className="btn btn-primary" onClick={() => act(() => adminService.resume(election.id))}>
            Resume
          </button>
          <button className="btn btn-danger" onClick={() => act(() => adminService.updateStatus(election.id, 'VOTING_CLOSED'))}>
            Close voting
          </button>
          <button className="btn btn-success" onClick={() => act(() => adminService.updateStatus(election.id, 'RESULTS_PUBLISHED'))}>
            Publish results
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Add position</h2>
        <form onSubmit={addPosition} className="form row">
          <input
            placeholder="Position name"
            value={position.name}
            onChange={(e) => setPosition({ ...position, name: e.target.value })}
          />
          <input
            placeholder="Description"
            value={position.description}
            onChange={(e) => setPosition({ ...position, description: e.target.value })}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={position.is_required}
              onChange={(e) => setPosition({ ...position, is_required: e.target.checked })}
            />
            Required
          </label>
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
