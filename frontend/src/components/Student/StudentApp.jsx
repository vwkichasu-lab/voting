import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar } from './shared.jsx';

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/app/ballot', label: 'Vote', icon: 'vote' },
  { to: '/app/candidates', label: 'Candidates', icon: 'users' },
  { to: '/app/status', label: 'Election Status', icon: 'clock' },
  { to: '/app/history', label: 'My Voting History', icon: 'history' },
  { to: '/app/profile', label: 'My Profile', icon: 'user' }
];

export function StudentApp() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { student, clearStudentSession, isAdmin } = useAuth();

  const logout = () => {
    clearStudentSession();
    navigate(isAdmin ? '/admin/dashboard' : '/login');
  };

  const name = student?.name || student?.student_id || 'Student';

  return (
    <div className="stu-shell">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`stu-sidebar ${open ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="x" size={20} /></button>
        <div className="brand">
          <div className="brand-logo" style={{ margin: 0, width: 40, height: 40, fontSize: '1rem' }}>CE</div>
          <div>
            <div style={{ fontWeight: 800, color: '#1e293b' }}>Class Election</div>
            <div className="text-xs muted">Voting System</div>
          </div>
        </div>
        <nav className="stu-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
              <Icon name={n.icon} size={18} /> {n.label}
            </NavLink>
          ))}
          <button className="stu-nav" style={{ border: 'none', background: 'none', textAlign: 'left' }} onClick={logout}>
            <span className="stu-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: 10, color: '#ef4444', fontWeight: 600, width: '100%' }}>
              <Icon name="logout" size={18} /> Logout
            </span>
          </button>
        </nav>
      </aside>

      <div className="stu-main">
        <div className="stu-topbar">
          <div className="flex gap-1" style={{ alignItems: 'center' }}>
            <button className="menu-btn" onClick={() => setOpen(true)}><Icon name="menu" /></button>
            <span className="title">Voter Dashboard</span>
          </div>
          <div className="profile-chip">
            <button className="btn btn-ghost btn-sm" aria-label="Notifications"><Icon name="bell" /></button>
            <Avatar name={name} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
              <div className="text-xs muted">{student?.programme || '—'}</div>
            </div>
            <Icon name="chevron" size={16} style={{ transform: 'rotate(90deg)' }} />
          </div>
        </div>
        <div className="stu-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
