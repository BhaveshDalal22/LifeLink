import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Activity, Wind, Clock, Navigation } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { hospitalStatusBadge, availabilityColor } from '../utils/statusColors';

export default function HospitalCard({ hospital, onRequest, onDirections }) {
  const {
    hospital_id, name, address, area, status, distanceKm,
    available_beds, total_beds, icu_available, icu_total,
    ventilators_available, ventilators_total,
    emergency_beds_available, emergency_beds_total,
    specializations = [], last_updated, matchScore
  } = hospital;

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} /> {address}, {area}
          </p>
        </div>
        <StatusBadge label={status} colorClass={hospitalStatusBadge(status)} />
      </div>

      {specializations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specializations.map((s) => (
            <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${availabilityColor(available_beds, total_beds)}`}>
            <BedDouble size={14} /> {available_beds}/{total_beds}
          </p>
          <p className="text-xs text-slate-500">Beds</p>
        </div>
        <div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${availabilityColor(icu_available, icu_total)}`}>
            <Activity size={14} /> {icu_available}/{icu_total}
          </p>
          <p className="text-xs text-slate-500">ICU</p>
        </div>
        <div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${availabilityColor(emergency_beds_available, emergency_beds_total)}`}>
            <BedDouble size={14} /> {emergency_beds_available}/{emergency_beds_total}
          </p>
          <p className="text-xs text-slate-500">Emergency</p>
        </div>
        <div>
          <p className={`flex items-center gap-1 text-sm font-semibold ${availabilityColor(ventilators_available, ventilators_total)}`}>
            <Wind size={14} /> {ventilators_available}/{ventilators_total}
          </p>
          <p className="text-xs text-slate-500">Ventilators</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={12} /> Updated {last_updated ? new Date(last_updated).toLocaleTimeString() : '—'}
        </span>
        <div className="flex items-center gap-3">
          {typeof distanceKm === 'number' && <span className="font-medium text-slate-700">{distanceKm} km away</span>}
          {typeof matchScore === 'number' && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal-700">Match {Math.round(matchScore)}%</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to={`/patient/hospitals/${hospital_id}`} className="btn-secondary flex-1">View Details</Link>
        {onRequest && (
          <button onClick={() => onRequest(hospital)} className="btn-primary flex-1">Request Admission</button>
        )}
        {onDirections && (
          <button onClick={() => onDirections(hospital)} className="btn-outline">
            <Navigation size={16} /> Directions
          </button>
        )}
      </div>
    </div>
  );
}
