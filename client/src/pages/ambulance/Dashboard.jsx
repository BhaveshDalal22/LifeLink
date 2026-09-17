import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ambulance as AmbulanceIcon, ToggleLeft, Siren, Navigation, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ambulanceService } from '../../services/ambulanceService';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { ambulanceStatusBadge } from '../../utils/statusColors';

export default function AmbulanceDashboard() {
  const { user } = useAuth();
  const [ambulance, setAmbulance] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.ambulance_id) { setLoading(false); return; }
    Promise.all([
      ambulanceService.getAll(),
      ambulanceService.getRequests()
    ]).then(([aRes, rRes]) => {
      const mine = aRes.data.ambulances.find((a) => a.ambulance_id === user.ambulance_id);
      setAmbulance(mine || null);
      const trip = rRes.data.requests.find((r) => !['Completed', 'Cancelled'].includes(r.status));
      setActiveTrip(trip || null);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!ambulance) return <EmptyState title="No ambulance linked to your account" message="Please contact the LifeLink administrator." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Ambulance {ambulance.ambulance_number}</p>
        </div>
        <StatusBadge label={ambulance.status} colorClass={ambulanceStatusBadge(ambulance.status)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={AmbulanceIcon} label="Ambulance Number" value={ambulance.ambulance_number} tone="red" />
        <StatCard icon={MapPin} label="Current Location" value={`${Number(ambulance.latitude).toFixed(2)}, ${Number(ambulance.longitude).toFixed(2)}`} tone="brand" />
        <StatCard icon={ToggleLeft} label="Status" value={ambulance.status} tone="teal" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ambulance/availability" className="btn-secondary"><ToggleLeft size={16} /> Manage Availability</Link>
        <Link to="/ambulance/assigned" className="btn-primary"><Siren size={16} /> Assigned Emergency</Link>
        <Link to="/ambulance/trip-status" className="btn-outline"><Navigation size={16} /> Trip Status</Link>
      </div>

      {activeTrip ? (
        <div className="card border-l-4 border-emergency-500">
          <p className="text-sm text-slate-500">Active trip for emergency #{activeTrip.emergency_id}</p>
          <p className="font-semibold text-slate-900">{activeTrip.patient_name} — {activeTrip.emergency_type} ({activeTrip.severity})</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="badge bg-blue-100 text-blue-700">{activeTrip.status}</span>
            <Link to="/ambulance/trip-status" className="text-sm font-medium text-brand-700">Update Trip Status</Link>
          </div>
        </div>
      ) : (
        <EmptyState icon={Siren} title="No active trip" message="You'll see assigned emergencies here as soon as a patient requests your ambulance." />
      )}
    </div>
  );
}
