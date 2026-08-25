import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  PlusCircle,
  Trophy,
  Users,
  History,
  GitBranch,
  X,
} from 'lucide-react';
import { useAuth, useData } from '../context/AppContext';
import { getSalesperson } from '../data/helpers';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { salespeople } = useData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const sp =
    user?.role === 'salesperson' && user.salespersonId
      ? getSalesperson(user.salespersonId, salespeople)
      : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/admin/map', label: 'Map View', icon: Map },
    { to: '/admin/timeline', label: 'Timeline', icon: GitBranch },
    { to: '/admin/architects', label: 'Architects', icon: Building2 },
    { to: '/admin/visits', label: 'All Visits', icon: ClipboardList },
  ];

  const salesLinks = [
    { to: '/sales', end: true, label: 'My Architects', icon: Users },
    { to: '/sales/map', label: 'My Map', icon: Map },
    { to: '/sales/timeline', label: 'Timeline', icon: GitBranch },
    { to: '/sales/add', label: 'Add Architect', icon: PlusCircle },
    { to: '/sales/history', label: 'Visit History', icon: History },
  ];

  const links = user?.role === 'admin' ? adminLinks : salesLinks;

  return (
    <div className="app-shell">
      <div
        className={`overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="mark">Kamla Marble</div>
          <div className="sub">Field Sales CRM</div>
        </div>

        <nav>
          <div className="nav-section">
            {user?.role === 'admin' ? 'Admin' : 'Field Sales'}
          </div>
          {links.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">
              {sp?.avatarInitials ?? 'AD'}
            </div>
            <div className="meta">
              <div className="name">{sp?.name ?? 'Admin'}</div>
              <div className="role">
                {user?.role === 'admin' ? 'Administrator' : sp?.region}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={handleLogout} type="button">
            <LogOut size={16} />
            Switch role
          </button>
        </div>
      </aside>

      <main className="main">
        <button
          type="button"
          className="btn btn-secondary btn-sm mobile-menu-btn"
          style={{ marginBottom: '1rem' }}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
          Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
}
