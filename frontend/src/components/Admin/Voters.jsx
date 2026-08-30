import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Badge, Icon, Alert } from '../common/ui.jsx';
import { initials } from '../Student/shared.jsx';

export function Voters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => adminService.listVoters(1).then(({ data }) => setVoters(data.voters)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null); setMsg(null);
    try {
      const { data } = await adminService.importVoters(1, file);
      setMsg(`Imported ${data.imported}, skipped ${data.skipped}`);
      load();
    } catch (err) { setError(err.userMessage || 'Import failed'); }
  };

  const exportCsv = () => {
    const header = 'student_id,name,programme,intake,has_voted\n';
    const rows = voters.map((v) => `${v.student_id},${v.name},${v.programme},${v.intake},${v.has_voted ? 'Yes' : 'No'}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'voters.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;
  const filtered = voters.filter((v) =>
    (v.name.toLowerCase().includes(q.toLowerCase()) || v.student_id.toLowerCase().includes(q.toLowerCase())) &&
    (statusFilter === 'all' || (statusFilter === 'voted' ? v.has_voted : !v.has_voted))
  );

  return (
    <div className="col gap-2">
      <div className="between">
        <h2 style={{ margin: 0 }}>Voters</h2>
        <div className="row gap-1">
          <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('voterFile').click()}><Icon name="download" size={15} /> Import</button>
          <button className="btn btn-admin btn-sm" onClick={exportCsv}><Icon name="download" size={15} /> Export</button>
          <input id="voterFile" type="file" accept=".csv" style={{ display: 'none' }} onChange={onImport} />
        </div>
      </div>
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="row gap-1">
        <input placeholder="Search name or ID…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="voted">Voted</option>
          <option value="not">Not Voted</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Student ID</th><th>Name</th><th>Programme</th><th>Level</th><th>Voting Status</th></tr></thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td>{v.student_id}</td>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td>{v.programme}</td>
                <td>{v.intake}</td>
                <td>{v.has_voted ? <Badge kind="green">Voted</Badge> : <Badge kind="orange">Not Voted</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
