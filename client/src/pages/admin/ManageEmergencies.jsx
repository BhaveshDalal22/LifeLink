import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { EMERGENCY_STATUS_FLOW } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { emergencyStatusBadge, severityBadge } from '../../utils/statusColors';

export default function ManageEmergencies() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService.getEmergencies({ status: statusFilter || undefined })
      .then((res) => setEmergencies(res.data.emergencies))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Emergencies</h1>
          <p className="mt-1 text-sm text-slate-500">All emergencies reported on the platform.</p>
        </div>
        <select className="input sm:w-56" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {EMERGENCY_STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading emergencies..." />
      ) : emergencies.length === 0 ? (
        <EmptyState title="No emergencies found" message="Try a different status filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emergencies.map((e) => (
                <tr key={e.emergency_id}>
                  <td className="px-4 py-3 font-medium text-slate-800">#{e.emergency_id}</td>
                  <td className="px-4 py-3">{e.patient_name}</td>
                  <td className="px-4 py-3 text-slate-500">{e.reporter_name}</td>
                  <td className="px-4 py-3">{e.emergency_type}</td>
                  <td className="px-4 py-3"><StatusBadge label={e.severity} colorClass={severityBadge(e.severity)} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge label={e.status} colorClass={emergencyStatusBadge(e.status)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
