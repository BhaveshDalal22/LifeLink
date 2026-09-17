import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HospitalProfile() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.hospital_id) { setLoading(false); return; }
    hospitalService.getById(user.hospital_id).then((res) => setHospital(res.data.hospital)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading hospital profile..." />;
  if (!hospital) return <p className="text-slate-500">No hospital linked to your account.</p>;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">Hospital Profile</h1>
      <div className="card mt-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <Building2 size={28} />
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">{hospital.name}</p>
            {hospital.verified ? (
              <span className="flex items-center gap-1 text-sm text-green-600"><ShieldCheck size={14} /> Verified</span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-yellow-600"><ShieldAlert size={14} /> Pending verification</span>
            )}
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Address</dt>
              <dd className="text-sm font-medium text-slate-800">{hospital.address}, {hospital.area}, {hospital.city}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Contact</dt>
              <dd className="text-sm font-medium text-slate-800">{hospital.contact}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Specializations</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {(hospital.specializations || []).map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{s}</span>
              ))}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-slate-400">
          To update contact details or specializations, please contact the LifeLink administrator.
        </p>
      </div>
    </div>
  );
}
