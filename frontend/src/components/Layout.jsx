import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      {icon}
      {label}
    </NavLink>
  );
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  stores: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  password: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Layout({ children, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  function renderNav() {
    if (user?.role === 'admin') {
      return (
        <>
          <SidebarLink to="/admin/dashboard" icon={icons.dashboard} label="Dashboard" />
          <SidebarLink to="/admin/users" icon={icons.users} label="Users" />
          <SidebarLink to="/admin/stores" icon={icons.stores} label="Stores" />
        </>
      );
    }
    if (user?.role === 'user') {
      return (
        <>
          <SidebarLink to="/user/stores" icon={icons.stores} label="Browse Stores" />
          <SidebarLink to="/user/password" icon={icons.password} label="Change Password" />
        </>
      );
    }
    if (user?.role === 'store_owner') {
      return (
        <>
          <SidebarLink to="/owner/dashboard" icon={icons.dashboard} label="My Store" />
          <SidebarLink to="/owner/password" icon={icons.password} label="Change Password" />
        </>
      );
    }
    return null;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <span className="sidebar-logo">
          Rate<span>Hub</span>
        </span>
        <nav className="sidebar-nav">{renderNav()}</nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link btn" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'none', cursor: 'pointer' }} onClick={handleLogout}>
            {icons.logout}
            Log Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{pageTitle}</span>
          <div className="topbar-user">
            <div className="user-avatar">{initials}</div>
            <span>{user?.name?.split(' ')[0]}</span>
          </div>
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
