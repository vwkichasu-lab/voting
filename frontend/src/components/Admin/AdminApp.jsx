import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '../common/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/elections', label: 'Elections', icon: 'flag' },
  { to: '/admin/candidates', label: 'Candidates', icon: 'users' },
  { to: '/admin/voters', label: 'Voters', icon: 'users' },
  { to: '/admin/positions', label: 'Positions', icon: 'list' },
  { to: '/admin/classes', label: 'Classes', icon: 'users' },
  { to: '/admin/results', label: 'Results', icon: 'trophy' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/admin/reports', label: 'Reports', icon: 'document' },
  { to: '/admin/audit', label: 'Audit Logs', icon: 'shield' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' }
];

export function AdminApp() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { adminLogout, adminUser } = useAuth();

  const logout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell admin-theme">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`adm-sidebar ${open ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="x" size={20} /></button>
        <div className="brand">
          <div className="brand-logo" style={{ margin: 0 }}>CE</div>
          <div>
            <div style={{ fontWeight: 800 }}>Class Election</div>
            <div className="text-xs" style={{ color: '#94a3b8' }}>Admin Console</div>
          </div>
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setOpen(false)}>
              <Icon name={n.icon} size={18} /> {n.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0.8rem', borderRadius: 9, color: '#fca5a5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <Icon name="logout" size={18} /> Logout
          </button>
        </nav>
      </aside>

      <div className="adm-main">
        <div className="adm-topbar">
          <div className="flex gap-1" style={{ alignItems: 'center' }}>
            <button className="menu-btn" style={{ color: '#0f172a' }} onClick={() => setOpen(true)}><Icon name="menu" /></button>
            <span className="page-title">Admin Dashboard</span>
          </div>
          <div className="profile-chip">
            <button className="btn btn-ghost btn-sm" aria-label="Notifications"><Icon name="bell" /></button>
            <div className="avatar" style={{ background: '#2563eb' }}>A</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adminUser?.role || 'Admin'}</div>
              <div className="text-xs muted">{adminUser?.role || 'Administrator'}</div>
            </div>
          </div>
        </div>
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
