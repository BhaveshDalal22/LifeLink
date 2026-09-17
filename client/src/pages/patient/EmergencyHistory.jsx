import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { emergencyStatusBadge, severityBadge } from '../../utils/statusColors';

export default function EmergencyHistory() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emergencyService.getAll().then((res) => setEmergencies(res.data.emergencies)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading history..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emergency History</h1>
        <p className="mt-1 text-sm text-slate-500">All emergencies you've reported on LifeLink.</p>
      </div>

      {emergencies.length === 0 ? (
        <EmptyState icon={History} title="No emergencies yet" message="Your reported emergencies will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emergencies.map((e) => (
                <tr key={e.emergency_id}>
                  <td className="px-4 py-3 font-medium text-slate-800">#{e.emergency_id}</td>
                  <td className="px-4 py-3">{e.emergency_type}</td>
                  <td className="px-4 py-3"><StatusBadge label={e.severity} colorClass={severityBadge(e.severity)} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge label={e.status} colorClass={emergencyStatusBadge(e.status)} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/patient/tracking/${e.emergency_id}`} className="text-brand-700 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
