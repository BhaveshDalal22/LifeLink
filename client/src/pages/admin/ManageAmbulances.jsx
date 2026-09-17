import React, { useEffect, useState } from 'react';
import { ambulanceService } from '../../services/ambulanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { ambulanceStatusBadge } from '../../utils/statusColors';

export default function ManageAmbulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambulanceService.getAll().then((res) => setAmbulances(res.data.ambulances)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading ambulances..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Ambulances</h1>
        <p className="mt-1 text-sm text-slate-500">{ambulances.length} ambulances registered on the platform.</p>
      </div>

      {ambulances.length === 0 ? (
        <EmptyState title="No ambulances yet" message="Ambulances are created automatically when a driver registers." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ambulance Number</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ambulances.map((a) => (
                <tr key={a.ambulance_id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.ambulance_number}</td>
                  <td className="px-4 py-3">{a.driver_name}</td>
                  <td className="px-4 py-3 text-slate-500">{a.driver_phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{Number(a.latitude).toFixed(3)}, {Number(a.longitude).toFixed(3)}</td>
                  <td className="px-4 py-3"><StatusBadge label={a.status} colorClass={ambulanceStatusBadge(a.status)} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(a.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
