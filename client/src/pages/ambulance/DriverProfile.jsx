import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Ambulance as AmbulanceIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ambulanceService } from '../../services/ambulanceService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DriverProfile() {
  const { user } = useAuth();
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambulanceService.getAll().then((res) => {
      setAmbulance(res.data.ambulances.find((a) => a.ambulance_id === user?.ambulance_id) || null);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Driver Profile</h1>
      <div className="card mt-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <User size={28} />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">Ambulance Driver</p>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-slate-400" />
            <div><dt className="text-xs text-slate-400">Email</dt><dd className="text-sm font-medium text-slate-800">{user?.email}</dd></div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-400" />
            <div><dt className="text-xs text-slate-400">Phone</dt><dd className="text-sm font-medium text-slate-800">{user?.phone || '—'}</dd></div>
          </div>
          <div className="flex items-center gap-3">
            <AmbulanceIcon size={16} className="text-slate-400" />
            <div><dt className="text-xs text-slate-400">Ambulance Number</dt><dd className="text-sm font-medium text-slate-800">{ambulance?.ambulance_number || '—'}</dd></div>
          </div>
        </dl>
      </div>
    </div>
  );
}
