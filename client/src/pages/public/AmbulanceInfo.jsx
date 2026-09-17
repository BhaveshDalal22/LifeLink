import React from 'react';
import { Link } from 'react-router-dom';
import { Ambulance, MapPin, Clock, Radio, ShieldCheck } from 'lucide-react';
import { TRIP_STATUS_FLOW } from '../../utils/constants';

export default function AmbulanceInfo() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emergency-500 text-white">
          <Ambulance size={28} />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Ambulance Coordination</h1>
        <p className="mt-3 text-slate-600">
          LifeLink helps you find and request the nearest available demo ambulance, then track its trip status
          from dispatch to hospital arrival.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card text-center">
          <MapPin className="mx-auto text-brand-600" size={22} />
          <h3 className="mt-2 font-semibold text-slate-900">Nearest Match</h3>
          <p className="mt-1 text-sm text-slate-500">Ambulances are ranked by distance using the Haversine formula.</p>
        </div>
        <div className="card text-center">
          <Radio className="mx-auto text-teal-600" size={22} />
          <h3 className="mt-2 font-semibold text-slate-900">Live Status</h3>
          <p className="mt-1 text-sm text-slate-500">Track availability and trip progress in real time on your dashboard.</p>
        </div>
        <div className="card text-center">
          <Clock className="mx-auto text-emergency-500" size={22} />
          <h3 className="mt-2 font-semibold text-slate-900">ETA Estimate</h3>
          <p className="mt-1 text-sm text-slate-500">An estimated arrival time is shown based on distance and average speed.</p>
        </div>
      </div>

      <div className="card mt-10">
        <h2 className="font-semibold text-slate-900">Trip Status Flow</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TRIP_STATUS_FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{s}</span>
              {i < TRIP_STATUS_FLOW.length - 1 && <span className="text-slate-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card mt-6 border-l-4 border-emergency-500">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-emergency-500" size={20} />
          <p className="text-sm text-slate-600">
            Ambulance details shown in LifeLink (vehicle numbers, driver names, locations) are fictional demo
            data used for development and demonstration only. This platform is not connected to a real
            ambulance dispatch service. In a real emergency in India, call 108 or 112.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/login" className="btn-primary px-6 py-3">Log in to request an ambulance</Link>
      </div>
    </div>
  );
}
