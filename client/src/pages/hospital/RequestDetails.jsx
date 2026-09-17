import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, User, MapPin, FileText } from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { requestStatusBadge, severityBadge } from '../../utils/statusColors';

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    emergencyService.getHospitalRequests().then((res) => {
      const found = res.data.requests.find((r) => String(r.request_id) === String(id));
      setRequest(found || null);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const act = async (status) => {
    try {
      await emergencyService.updateHospitalRequestStatus(id, status);
      toast.success(`Request marked as ${status}.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading request details..." />;
  if (!request) return <p className="text-slate-500">Request not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/hospital/requests" className="flex items-center gap-1 text-sm font-medium text-brand-700">
        <ArrowLeft size={14} /> Back to requests
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Request #{request.request_id}</p>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <User size={18} /> {request.patient_name}
            </h1>
          </div>
          <StatusBadge label={request.status} colorClass={requestStatusBadge(request.status)} />
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Emergency Type</dt>
            <dd className="text-sm font-medium text-slate-800">{request.emergency_type}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Severity</dt>
            <dd><StatusBadge label={request.severity} colorClass={severityBadge(request.severity)} /></dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-400">Required Resources</dt>
            <dd className="text-sm font-medium text-slate-800">{request.required_resources || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={12} /> Patient Location</dt>
            <dd className="text-sm font-medium text-slate-800">{request.latitude}, {request.longitude}</dd>
          </div>
          {request.additional_info && (
            <div className="sm:col-span-2">
              <dt className="flex items-center gap-1 text-xs text-slate-400"><FileText size={12} /> Additional Information</dt>
              <dd className="text-sm text-slate-700">{request.additional_info}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-slate-400">Requested At</dt>
            <dd className="text-sm font-medium text-slate-800">{new Date(request.requested_at).toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {request.status === 'Pending' && (
            <>
              <button onClick={() => act('Accepted')} className="btn-primary">Accept</button>
              <button onClick={() => act('Rejected')} className="btn-secondary">Reject</button>
            </>
          )}
          {request.status === 'Accepted' && (
            <button onClick={() => act('Arrived')} className="btn-primary">Mark Arrived</button>
          )}
        </div>
      </div>
    </div>
  );
}
