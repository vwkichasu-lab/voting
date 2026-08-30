import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/elections', label: 'Elections' },
  { to: '/admin/candidates', label: 'Candidates' },
  { to: '/admin/voters', label: 'Voters' },
  { to: '/admin/results', label: 'Results' },
  { to: '/admin/audit', label: 'Audit Logs' }
];

export function AdminLayout() {
  const { adminUser, adminLogout } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="layout admin-layout">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-mark">LV</span>
          <span className="brand-text">Admin</span>
        </div>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="admin-nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-role">{adminUser?.role}</div>
          <button className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
