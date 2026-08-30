import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Modal, Badge, Icon, Alert } from '../common/ui.jsx';

export function Elections() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', start_time: '08:00', end_date: '', end_time: '17:00', classes: '', status: 'DRAFT', rules: '' });
  const [error, setError] = useState(null);

  const load = () => adminService.listElections().then(({ data }) => setList(data.elections)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async () => {
    setError(null);
    if (!form.name) return setError('Election name required');
    const start_at = form.start_date ? new Date(`${form.start_date}T${form.start_time}`).toISOString() : null;
    const end_at = form.end_date ? new Date(`${form.end_date}T${form.end_time}`).toISOString() : null;
    try {
      await adminService.createElection({ ...form, start_at, end_at });
      setShowCreate(false);
      setForm({ name: '', description: '', start_date: '', start_time: '08:00', end_date: '', end_time: '17:00', classes: '', status: 'DRAFT', rules: '' });
      load();
    } catch (e) { setError(e.userMessage || 'Failed to create'); }
  };

  const act = async (fn) => { await fn(); load(); };
  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  if (loading) return <Loader />;

  return (
    <div className="col gap-2">
      <div className="between">
        <h2 style={{ margin: 0 }}>Elections</h2>
        <button className="btn btn-admin" onClick={() => setShowCreate(true)}><Icon name="plus" size={16} /> Create Election</button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Election Name</th><th>Status</th><th>Start Date</th><th>End Date</th><th>Created By</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.name}</td>
                <td><Badge kind={e.status === 'VOTING_OPEN' ? 'live' : 'gray'}>{e.status}</Badge></td>
                <td>{fmt(e.start_at)}</td>
                <td>{fmt(e.end_at)}</td>
                <td>{e.created_by}</td>
                <td>
                  <div className="row gap-1">
                    {e.status !== 'VOTING_OPEN' && (
                      <button className="btn btn-success btn-sm" onClick={() => act(() => adminService.updateStatus(e.id, 'VOTING_OPEN'))}>Open</button>
                    )}
                    {e.status === 'VOTING_OPEN' && (
                      <>
                        <button className="btn btn-warn btn-sm" onClick={() => act(() => adminService.pause(e.id, 'Pause'))}>Pause</button>
                        <button className="btn btn-danger btn-sm" onClick={() => act(() => adminService.updateStatus(e.id, 'VOTING_CLOSED'))}>End</button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => act(() => adminService.deleteElection(e.id).catch(() => {}))}><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
      <Modal
        title="Create Election"
        onClose={() => setShowCreate(false)}
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-admin" onClick={create}>Create</button>
          </>
        }
      >
        {error && <Alert type="error">{error}</Alert>}
        <div className="field"><label>Title</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid grid-2">
          <div className="field"><label>Start Date</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div className="field"><label>Start Time</label><input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
          <div className="field"><label>End Date</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          <div className="field"><label>End Time</label><input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
        </div>
        <div className="field"><label>Eligible Classes</label><input value={form.classes} onChange={(e) => setForm({ ...form, classes: e.target.value })} placeholder="e.g. Level 400" /></div>
        <div className="field"><label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['DRAFT', 'NOMINATIONS_OPEN', 'READY', 'VOTING_OPEN'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Rules / Instructions</label><textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /></div>
      </Modal>
      )}
    </div>
  );
}
