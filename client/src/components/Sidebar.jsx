import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HeartPulse, LayoutDashboard, Siren, MapPinned, Ambulance, History, User,
  ClipboardList, Building2, Users, PlusCircle, BarChart3, LogOut, Menu, X,
  Navigation, ToggleLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MENUS = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/report-emergency', label: 'Report Emergency', icon: Siren },
    { to: '/patient/find-hospitals', label: 'Find Hospitals', icon: MapPinned },
    { to: '/patient/request-ambulance', label: 'Request Ambulance', icon: Ambulance },
    { to: '/patient/emergency-history', label: 'Emergency History', icon: History },
    { to: '/patient/profile', label: 'Profile', icon: User }
  ],
  hospital_staff: [
    { to: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hospital/capacity', label: 'Update Capacity', icon: ClipboardList },
    { to: '/hospital/requests', label: 'Incoming Requests', icon: Siren },
    { to: '/hospital/profile', label: 'Hospital Profile', icon: Building2 }
  ],
  ambulance_driver: [
    { to: '/ambulance/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ambulance/availability', label: 'Availability', icon: ToggleLeft },
    { to: '/ambulance/assigned', label: 'Assigned Emergency', icon: Siren },
    { to: '/ambulance/trip-status', label: 'Trip Status', icon: Navigation },
    { to: '/ambulance/profile', label: 'Driver Profile', icon: User }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/hospitals', label: 'Manage Hospitals', icon: Building2 },
    { to: '/admin/hospitals/add', label: 'Add Hospital', icon: PlusCircle },
    { to: '/admin/ambulances', label: 'Manage Ambulances', icon: Ambulance },
    { to: '/admin/emergencies', label: 'Manage Emergencies', icon: Siren },
    { to: '/admin/reports', label: 'Reports & Statistics', icon: BarChart3 }
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = MENUS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 font-bold text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
          <HeartPulse size={20} />
        </span>
        <span className="text-lg">LifeLink</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith('dashboard')}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs capitalize text-slate-400">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 bg-slate-900 lg:block">{content}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-bold text-white">
          <HeartPulse size={20} className="text-brand-400" />
          LifeLink
        </div>
        <button className="text-white" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-slate-900">
            <div className="flex justify-end px-3 pt-3">
              <button className="text-white" onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>
            {content}
          </div>
          <div className="flex-1 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
