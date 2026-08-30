import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Modal, Badge, Icon, Alert } from '../common/ui.jsx';
import { initials } from '../Student/shared.jsx';

export function Candidates() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ position_id: '', name: '', intake: 'January', manifesto: '' });
  const [error, setError] = useState(null);

  const load = () => adminService.getStructure(1).then(({ data }) => setPositions(data.positions)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const candidates = positions.flatMap((p) => p.candidates.map((c) => ({ ...c, position_name: p.name, position_id: p.id })));

  const add = async () => {
    setError(null);
    if (!form.name || !form.position_id) return setError('Name and position required');
    try {
      await adminService.addCandidate(1, form);
      setShowAdd(false);
      setForm({ position_id: '', name: '', intake: 'January', manifesto: '' });
      load();
    } catch (e) { setError(e.userMessage || 'Failed'); }
  };

  const setStatus = (id, status) => adminService.updateCandidateStatus(id, status).then(load).catch(() => {});
  const del = (id) => adminService.deleteCandidate(id).then(load).catch(() => {});

  if (loading) return <Loader />;

  return (
    <div className="col gap-2">
      <div className="between">
        <h2 style={{ margin: 0 }}>Candidates</h2>
        <button className="btn btn-admin" onClick={() => { setForm({ ...form, position_id: positions[0]?.id || '' }); setShowAdd(true); }}><Icon name="plus" size={16} /> Add Candidate</button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Level</th><th>Programme</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id}>
                <td><div className="table-photo">{initials(c.name)}</div></td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.position_name}</td>
                <td>{c.intake}</td>
                <td>{c.programme || '—'}</td>
                <td><Badge kind={c.status === 'ACTIVE' ? 'green' : c.status === 'PENDING' ? 'orange' : 'red'}>{c.status}</Badge></td>
                <td>
                  <div className="row gap-1">
                    {c.status !== 'ACTIVE' && <button className="btn btn-success btn-sm" onClick={() => setStatus(c.id, 'ACTIVE')}>Approve</button>}
                    {c.status !== 'REJECTED' && <button className="btn btn-warn btn-sm" onClick={() => setStatus(c.id, 'REJECTED')}>Reject</button>}
                    <button className="btn btn-ghost btn-sm" onClick={() => del(c.id)}><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
      <Modal
        title="Add Candidate"
        onClose={() => setShowAdd(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-admin" onClick={add}>Add</button>
          </>
        }
      >
        {error && <Alert type="error">{error}</Alert>}
        <div className="field"><label>Position</label>
          <select value={form.position_id} onChange={(e) => setForm({ ...form, position_id: e.target.value })}>
            <option value="">Select position</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label>Intake</label>
          <select value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })}>
            <option>January</option><option>September</option>
          </select>
        </div>
        <div className="field"><label>Manifesto</label><textarea value={form.manifesto} onChange={(e) => setForm({ ...form, manifesto: e.target.value })} /></div>
      </Modal>
      )}
    </div>
  );
}
