import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Persistent Sidebar across all pages */}
      <aside className="sidebar d-flex flex-column shadow">
        <div className="brand-title d-flex align-items-center">
          <i className="bi bi-kanban-fill text-primary me-2 fs-5"></i>
          <span>MINI CRM</span>
        </div>

        <nav className="nav flex-column mt-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-people-fill"></i>
            <span>Leads</span>
          </NavLink>

          <NavLink
            to="/companies"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-building"></i>
            <span>Companies</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-check2-square"></i>
            <span>Tasks</span>
          </NavLink>
        </nav>

        <div className="mt-auto p-3 text-secondary text-center small border-top border-secondary">
          Mini CRM v1.0
        </div>
      </aside>

      {/* Main Content Area with Top Bar */}
      <div className="flex-grow-1 d-flex flex-column bg-light">
        {/* Top Bar matching wireframe: User Name | Logout */}
        <header className="top-navbar d-flex justify-content-between align-items-center shadow-sm">
          <h5 className="m-0 text-secondary fw-semibold">Workspace</h5>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-person-circle fs-5 text-primary"></i>
              <span className="fw-medium text-dark">{user?.name || 'User'}</span>
              <span className="badge bg-secondary text-uppercase" style={{ fontSize: '0.7rem' }}>
                {user?.role || 'Sales Rep'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content Area */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
