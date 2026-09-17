import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Siren } from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { requestStatusBadge, severityBadge } from '../../utils/statusColors';

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    emergencyService.getHospitalRequests().then((res) => setRequests(res.data.requests)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (id, status) => {
    try {
      await emergencyService.updateHospitalRequestStatus(id, status);
      toast.success(`Request marked as ${status}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading requests..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Incoming Emergency Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Review and respond to admission requests from patients.</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={Siren} title="No requests yet" message="Incoming emergency admission requests will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Resources</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.request_id}>
                  <td className="px-4 py-3 font-medium text-slate-800">#{r.request_id}</td>
                  <td className="px-4 py-3">{r.patient_name}</td>
                  <td className="px-4 py-3">{r.emergency_type}</td>
                  <td className="px-4 py-3"><StatusBadge label={r.severity} colorClass={severityBadge(r.severity)} /></td>
                  <td className="px-4 py-3 max-w-[180px] truncate text-slate-500">{r.required_resources}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.requested_at).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge label={r.status} colorClass={requestStatusBadge(r.status)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.status === 'Pending' && (
                        <>
                          <button onClick={() => act(r.request_id, 'Accepted')} className="text-xs font-semibold text-green-600">Accept</button>
                          <button onClick={() => act(r.request_id, 'Rejected')} className="text-xs font-semibold text-red-600">Reject</button>
                        </>
                      )}
                      {r.status === 'Accepted' && (
                        <button onClick={() => act(r.request_id, 'Arrived')} className="text-xs font-semibold text-teal-600">Mark Arrived</button>
                      )}
                      <Link to={`/hospital/requests/${r.request_id}`} className="text-xs font-semibold text-brand-700">Details</Link>
                    </div>
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
