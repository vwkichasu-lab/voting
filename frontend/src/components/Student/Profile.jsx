import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar } from './shared.jsx';

export function Profile() {
  const { student } = useAuth();
  const rows = [
    ['Student ID', student?.student_id || '—'],
    ['Full Name', student?.name || '—'],
    ['Programme', student?.programme || '—'],
    ['Intake', student?.intake || '—'],
    ['Voting Status', student?.has_voted ? 'Voted' : 'Not Voted']
  ];
  return (
    <div className="col gap-2">
      <h2>My Profile</h2>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="flex gap-2" style={{ alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar name={student?.name || 'S'} size="lg" />
          <div>
            <h3 style={{ margin: 0 }}>{student?.name || 'Student'}</h3>
            <div className="muted text-sm">{student?.student_id}</div>
          </div>
        </div>
        {rows.map(([k, v]) => (
          <div className="between" key={k} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
            <span className="muted text-sm">{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
