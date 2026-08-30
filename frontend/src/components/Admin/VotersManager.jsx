import { useEffect, useState } from 'react';
import { adminService } from '../../services/index.js';
import { Alert, LoadingSpinner } from '../Common/index.jsx';

export function VotersManager() {
  const [electionId, setElectionId] = useState(null);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then(({ data }) => setElectionId(data.election.id))
      .catch((e) => setError(e.userMessage || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMsg(null);
    try {
      const { data } = await adminService.importVoters(electionId, file);
      setResult(data);
      setMsg(`Imported ${data.imported} voters`);
    } catch (err) {
      setError(err.userMessage || 'Import failed');
    }
  };

  const sample = 'student_id,name,intake,programme,contact\nPUIT/10000001,Jane Doe,January,BSc. Computer Science,+233240000001\nPUIT/10000002,John Smith,September,BSc. IT,+233240000002';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-content">
      <h1>Voters</h1>
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="card">
        <h2>Import voters (CSV)</h2>
        <p className="muted">
          Columns: <code>student_id, name, intake, programme, contact</code>
        </p>
        <input type="file" accept=".csv,text/csv" onChange={onFile} />
        <details className="sample-csv">
          <summary>Sample CSV</summary>
          <pre>{sample}</pre>
        </details>
        {result && (
          <p className="muted">
            Imported: {result.imported}, Skipped: {result.skipped}
            {result.errors.length > 0 && `, Errors: ${result.errors.length}`}
          </p>
        )}
      </div>
    </div>
  );
}
