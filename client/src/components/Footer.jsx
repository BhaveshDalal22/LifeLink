import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <HeartPulse size={18} />
              </span>
              <span className="text-lg">LifeLink</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Find the right emergency care, when every second matters.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/find-hospital" className="hover:text-white">Find Hospital</Link></li>
              <li><Link to="/report-emergency" className="hover:text-white">Report Emergency</Link></li>
              <li><Link to="/ambulance-info" className="hover:text-white">Ambulance Info</Link></li>
              <li><Link to="/about" className="hover:text-white">About LifeLink</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Account</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Contact (Demo)</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone size={14} /> 108 (Emergency, India)</li>
              <li className="flex items-center gap-2"><Mail size={14} /> support@lifelink-demo.example</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>
            LifeLink is a college-project demonstration platform. Hospital and ambulance data shown here is
            fictional and used for development purposes only. It is not connected to real hospitals and must
            not be used for actual emergencies. In a real emergency in India, call 108 or 112.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} LifeLink. Built for academic demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
