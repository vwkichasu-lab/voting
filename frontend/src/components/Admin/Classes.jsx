import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Loader, Badge } from '../common/ui.jsx';

export function Classes() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminService.listVoters(1).then(({ data }) => setVoters(data.voters)).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;
  const byIntake = {};
  voters.forEach((v) => { byIntake[v.intake] = (byIntake[v.intake] || 0) + 1; });
  const rows = Object.entries(byIntake).map(([k, v]) => ({ name: `${k} Intake`, students: v, voted: voters.filter((x) => x.intake === k && x.has_voted).length }));
  return (
    <div className="col gap-2">
      <h2>Classes</h2>
      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>Class</th><th>Students</th><th>Voted</th><th>Turnout</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>{r.students}</td>
                <td>{r.voted}</td>
                <td>{r.students ? Math.round((r.voted / r.students) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
