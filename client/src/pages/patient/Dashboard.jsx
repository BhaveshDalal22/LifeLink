import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, MapPinned, Ambulance, History, Activity, BedDouble, Wind } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';
import { emergencyService } from '../../services/emergencyService';
import { hospitalService } from '../../services/hospitalService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { emergencyStatusBadge } from '../../utils/statusColors';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const [emergencies, setEmergencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      emergencyService.getAll(),
      hospitalService.getNearby({ lat: location.lat, lng: location.lng })
    ])
      .then(([eRes, hRes]) => {
        setEmergencies(eRes.data.emergencies);
        setHospitals(hRes.data.hospitals.slice(0, 3));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeEmergency = emergencies.find((e) => !['Completed', 'Cancelled'].includes(e.status));
  const icuAvailable = hospitals.reduce((sum, h) => sum + h.icu_available, 0);
  const emergencyBedsAvailable = hospitals.reduce((sum, h) => sum + h.emergency_beds_available, 0);
  const ventilatorsAvailable = hospitals.reduce((sum, h) => sum + h.ventilators_available, 0);

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Here's your emergency care overview.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/patient/report-emergency" className="btn-emergency"><Siren size={18} /> Report Emergency</Link>
        <Link to="/patient/find-hospitals" className="btn-primary"><MapPinned size={18} /> Find Hospitals</Link>
        <Link to="/patient/request-ambulance" className="btn-secondary"><Ambulance size={18} /> Request Ambulance</Link>
      </div>

      {activeEmergency && (
        <div className="card border-l-4 border-emergency-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Active Emergency #{activeEmergency.emergency_id}</p>
              <p className="font-semibold text-slate-900">{activeEmergency.emergency_type} — {activeEmergency.severity}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge label={activeEmergency.status} colorClass={emergencyStatusBadge(activeEmergency.status)} />
              <Link to={`/patient/tracking/${activeEmergency.emergency_id}`} className="btn-primary">Track</Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Activity} label="ICU beds nearby" value={icuAvailable} tone="red" />
        <StatCard icon={BedDouble} label="Emergency beds nearby" value={emergencyBedsAvailable} tone="brand" />
        <StatCard icon={Wind} label="Ventilators nearby" value={ventilatorsAvailable} tone="teal" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Nearby Hospitals</h2>
          <Link to="/patient/find-hospitals" className="text-sm font-medium text-brand-700">View all</Link>
        </div>
        {hospitals.length === 0 ? (
          <EmptyState title="No hospitals found nearby" message="Enable location access to see hospitals near you." />
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Beds</th>
                  <th className="px-4 py-3">ICU</th>
                  <th className="px-4 py-3">Ventilators</th>
                  <th className="px-4 py-3">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((h) => (
                  <tr key={h.hospital_id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{h.name}</td>
                    <td className="px-4 py-3">{h.available_beds}/{h.total_beds}</td>
                    <td className="px-4 py-3">{h.icu_available}/{h.icu_total}</td>
                    <td className="px-4 py-3">{h.ventilators_available}/{h.ventilators_total}</td>
                    <td className="px-4 py-3">{h.distanceKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Emergency History</h2>
          <Link to="/patient/emergency-history" className="flex items-center gap-1 text-sm font-medium text-brand-700">
            <History size={14} /> View all
          </Link>
        </div>
        {emergencies.length === 0 ? (
          <EmptyState title="No emergencies reported yet" message="Your reported emergencies will appear here." />
        ) : (
          <div className="mt-3 space-y-2">
            {emergencies.slice(0, 5).map((e) => (
              <div key={e.emergency_id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.emergency_type} — {e.severity}</p>
                  <p className="text-xs text-slate-400">{new Date(e.created_at).toLocaleString()}</p>
                </div>
                <StatusBadge label={e.status} colorClass={emergencyStatusBadge(e.status)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
