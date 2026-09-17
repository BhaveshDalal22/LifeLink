import React from 'react';
import { Link } from 'react-router-dom';
import { Siren, LogIn, UserPlus, Clock } from 'lucide-react';
import { EMERGENCY_TYPES, SEVERITY_LEVELS } from '../../utils/constants';

export default function ReportEmergencyPublic() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emergency-500 text-white">
        <Siren size={28} />
      </span>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Report an Emergency</h1>
      <p className="mt-3 text-slate-600">
        To report an emergency, save contact details, and track hospital and ambulance response in real time,
        please log in or create a free patient account. It only takes a minute.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/login" className="btn-primary text-base px-6 py-3"><LogIn size={18} /> Login</Link>
        <Link to="/register" className="btn-emergency text-base px-6 py-3"><UserPlus size={18} /> Register as Patient</Link>
      </div>

      <div className="card mt-12 text-left">
        <h2 className="font-semibold text-slate-900">What you'll be asked</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Emergency type</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EMERGENCY_TYPES.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Severity</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SEVERITY_LEVELS.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Your location (via browser geolocation, or manual selection), required resources, and any additional
          information for hospital staff and the ambulance driver.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Clock size={14} /> This demo platform is for academic purposes. In a real emergency, call 108 or 112.
      </div>
    </div>
  );
}
