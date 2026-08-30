import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Badge, Icon, Alert } from '../common/ui.jsx';

export function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_required: true });

  const load = () => adminService.getStructure(1).then(({ data }) => setPositions(data.positions)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name) return setError('Name required');
    try { await adminService.addPosition(1, form); setForm({ name: '', description: '', is_required: true }); load(); }
    catch (e) { setError(e.userMessage || 'Failed'); }
  };

  const toggle = (p) => adminService.updatePosition(p.id, { is_required: !p.is_required }).then(load).catch(() => {});
  const del = (id) => adminService.deletePosition(id).then(load).catch(() => {});

  if (loading) return <Loader />;

  return (
    <div className="col gap-2">
      <h2>Positions</h2>
      {error && <Alert type="error">{error}</Alert>}
      <form onSubmit={add} className="card row gap-2" style={{ alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>Position name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Class President" />
        </div>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <label className="checkbox"><input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} /> Required</label>
        <button className="btn btn-admin" type="submit">Add</button>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Position</th><th>Order</th><th>Required</th><th>Candidates</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {positions.map((p, i) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.display_order}</td>
                <td>{p.is_required ? <Badge kind="green">Yes</Badge> : <Badge kind="gray">No</Badge>}</td>
                <td>{p.candidates.length}</td>
                <td><Badge kind="blue">Active</Badge></td>
                <td>
                  <div className="row gap-1">
                    <button className="btn btn-outline btn-sm" onClick={() => toggle(p)}>{p.is_required ? 'Make Optional' : 'Make Required'}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => del(p.id)}><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
