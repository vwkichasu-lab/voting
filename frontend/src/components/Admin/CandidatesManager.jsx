import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';

export function CandidatesManager() {
  const [electionId, setElectionId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ position_id: '', name: '', intake: 'January', manifesto: '' });

  useEffect(() => {
    adminService
      .getDashboard()
      .then(({ data }) => {
        setElectionId(data.election.id);
        return adminService.getStructure(data.election.id);
      })
      .then(({ data }) => {
        setPositions(data.positions);
        if (data.positions[0]) setForm((f) => ({ ...f, position_id: data.positions[0].id }));
      })
      .catch((e) => setError(e.userMessage || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    if (!form.name || !form.position_id) return setError('Name and position are required');
    try {
      await adminService.addCandidate(electionId, form);
      setMsg('Candidate added');
      setForm({ ...form, name: '', manifesto: '' });
      const { data } = await adminService.getStructure(electionId);
      setPositions(data.positions);
    } catch (e) {
      setError(e.userMessage || 'Failed to add candidate');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !positions.length) return <Alert type="error">{error}</Alert>;

  return (
    <div className="admin-content">
      <h1>Candidates</h1>
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="card">
        <h2>Add candidate</h2>
        <form onSubmit={submit} className="form">
          <label className="field">
            <span>Position</span>
            <select value={form.position_id} onChange={(e) => setForm({ ...form, position_id: e.target.value })}>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Full name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kwame Mensah" />
          </label>
          <label className="field">
            <span>Intake</span>
            <select value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })}>
              <option>January</option>
              <option>September</option>
            </select>
          </label>
          <label className="field">
            <span>Manifesto</span>
            <textarea value={form.manifesto} onChange={(e) => setForm({ ...form, manifesto: e.target.value })} />
          </label>
          <button className="btn btn-primary" type="submit">
            Add candidate
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Current candidates</h2>
        {positions.map((p) => (
          <div key={p.id} className="candidate-group">
            <h3>{p.name}</h3>
            <ul className="candidate-list">
              {p.candidates.map((c) => (
                <li key={c.id}>
                  {c.name} <span className="muted">({c.intake}) · {c.status}</span>
                </li>
              ))}
              {!p.candidates.length && <li className="muted">No candidates yet</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
