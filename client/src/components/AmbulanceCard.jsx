import React from 'react';
import { Ambulance as AmbulanceIcon, Phone, MapPin, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { ambulanceStatusBadge } from '../utils/statusColors';

export default function AmbulanceCard({ ambulance, onRequest, requesting }) {
  const { ambulance_id, ambulance_number, driver_name, driver_phone, status, distanceKm, etaMinutes } = ambulance;

  return (
    <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emergency-500/10 text-emergency-500">
          <AmbulanceIcon size={22} />
        </span>
        <div>
          <p className="font-semibold text-slate-900">{ambulance_number}</p>
          <p className="text-sm text-slate-500">Driver: {driver_name}</p>
          {driver_phone && (
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Phone size={12} /> {driver_phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:justify-end">
        <div className="text-sm text-slate-600">
          {typeof distanceKm === 'number' && (
            <p className="flex items-center gap-1"><MapPin size={14} /> {distanceKm} km away</p>
          )}
          {typeof etaMinutes === 'number' && (
            <p className="flex items-center gap-1 text-slate-400"><Clock size={12} /> ETA ~{etaMinutes} min</p>
          )}
        </div>
        <StatusBadge label={status} colorClass={ambulanceStatusBadge(status)} />
        {onRequest && (
          <button
            disabled={status !== 'Available' || requesting}
            onClick={() => onRequest(ambulance)}
            className="btn-emergency"
          >
            {requesting ? 'Requesting...' : 'Request'}
          </button>
        )}
      </div>
    </div>
  );
}
