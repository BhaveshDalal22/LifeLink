import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Siren, BedDouble, Activity, Wind, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hospitalService } from '../../services/hospitalService';
import { emergencyService } from '../../services/emergencyService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { requestStatusBadge } from '../../utils/statusColors';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.hospital_id) { setLoading(false); return; }
    Promise.all([
      hospitalService.getById(user.hospital_id),
      emergencyService.getHospitalRequests()
    ]).then(([hRes, rRes]) => {
      setHospital(hRes.data.hospital);
      setRequests(rRes.data.requests);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading hospital dashboard..." />;

  if (!hospital) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No hospital linked to your account"
        message="Please contact the LifeLink administrator to link your staff account to a hospital record."
      />
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {hospital.verified ? (
              <span className="flex items-center gap-1 text-green-600"><ShieldCheck size={14} /> Verified hospital</span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600"><ShieldAlert size={14} /> Pending verification</span>
            )}
            <span>· Status: {hospital.status}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/hospital/capacity" className="btn-primary"><ClipboardList size={16} /> Update Capacity</Link>
          <Link to="/hospital/requests" className="btn-secondary"><Siren size={16} /> Requests</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BedDouble} label={`Beds (${hospital.available_beds}/${hospital.total_beds})`} value={hospital.available_beds} tone="brand" />
        <StatCard icon={Activity} label={`ICU (${hospital.icu_available}/${hospital.icu_total})`} value={hospital.icu_available} tone="red" />
        <StatCard icon={BedDouble} label={`Emergency (${hospital.emergency_beds_available}/${hospital.emergency_beds_total})`} value={hospital.emergency_beds_available} tone="yellow" />
        <StatCard icon={Wind} label={`Ventilators (${hospital.ventilators_available}/${hospital.ventilators_total})`} value={hospital.ventilators_available} tone="teal" />
      </div>

      <p className="flex items-center gap-1 text-xs text-slate-400">
        <Clock size={12} /> Capacity last updated {hospital.last_updated ? new Date(hospital.last_updated).toLocaleString() : '—'}
      </p>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Incoming Emergency Requests</h2>
          <Link to="/hospital/requests" className="text-sm font-medium text-brand-700">View all</Link>
        </div>
        {pendingRequests.length === 0 ? (
          <EmptyState title="No pending requests" message="New admission requests from patients will appear here." />
        ) : (
          <div className="mt-3 space-y-2">
            {pendingRequests.slice(0, 5).map((r) => (
              <div key={r.request_id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.patient_name} — {r.emergency_type} ({r.severity})</p>
                  <p className="text-xs text-slate-400">{new Date(r.requested_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={r.status} colorClass={requestStatusBadge(r.status)} />
                  <Link to={`/hospital/requests/${r.request_id}`} className="text-sm font-medium text-brand-700">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
