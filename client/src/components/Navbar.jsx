import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_DASHBOARD_PATH } from '../utils/constants';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/find-hospital', label: 'Find Hospital' },
  { to: '/report-emergency', label: 'Report Emergency' },
  { to: '/ambulance-info', label: 'Ambulance' },
  { to: '/about', label: 'About' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <HeartPulse size={20} />
          </span>
          <span className="text-xl">LifeLink</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to={ROLE_DASHBOARD_PATH[user.role] || '/'} className="btn-secondary">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>

        <button className="lg:hidden text-slate-700" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Link to={ROLE_DASHBOARD_PATH[user.role] || '/'} className="btn-secondary" onClick={() => setOpen(false)}>Dashboard</Link>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="btn-primary">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
