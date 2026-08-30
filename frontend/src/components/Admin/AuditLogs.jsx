import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader } from '../common/ui.jsx';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs({ limit: 100, offset: 0 }).then(({ data }) => { setLogs(data.logs); setTotal(data.total); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="col gap-2">
      <h2>Audit Logs</h2>
      <p className="muted text-sm">{total} total entries</p>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Date & Time</th><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP</th><th>Status</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
                <td>{l.admin || 'system'}</td>
                <td style={{ fontWeight: 600 }}>{l.action}</td>
                <td>{l.entity_type}</td>
                <td>{l.action.replace(/_/g, ' ')}</td>
                <td>{l.ip_address}</td>
                <td><span className="badge badge-green">OK</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
