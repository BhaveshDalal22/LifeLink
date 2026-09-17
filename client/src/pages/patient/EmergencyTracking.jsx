import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Building2, Ambulance as AmbulanceIcon, XCircle } from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { ambulanceService } from '../../services/ambulanceService';
import { EMERGENCY_STATUS_FLOW } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { emergencyStatusBadge, requestStatusBadge } from '../../utils/statusColors';

const POLL_INTERVAL = 8000;

export default function EmergencyTracking() {
  const { id } = useParams();
  const [emergency, setEmergency] = useState(null);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [ambulanceRequests, setAmbulanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      emergencyService.getById(id),
      emergencyService.getHospitalRequests({ emergencyId: id }),
      ambulanceService.getRequests({ emergencyId: id })
    ]).then(([eRes, hRes, aRes]) => {
      setEmergency(eRes.data.emergency);
      setHospitalRequests(hRes.data.requests);
      setAmbulanceRequests(aRes.data.requests);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const handleCancel = async () => {
    try {
      await emergencyService.updateStatus(id, 'Cancelled');
      toast.success('Emergency cancelled.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel emergency.');
    } finally {
      setCancelOpen(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading emergency status..." />;
  if (!emergency) return <p className="text-slate-500">Emergency not found.</p>;

  const currentIndex = EMERGENCY_STATUS_FLOW.indexOf(emergency.status);
  const isTerminal = ['Completed', 'Cancelled'].includes(emergency.status);
  const timelineStatuses = EMERGENCY_STATUS_FLOW.filter((s) => s !== 'Cancelled');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Emergency #{emergency.emergency_id}</p>
            <h1 className="text-xl font-bold text-slate-900">{emergency.emergency_type} — {emergency.severity}</h1>
            <p className="mt-1 text-xs text-slate-400">Reported {new Date(emergency.created_at).toLocaleString()}</p>
          </div>
          <StatusBadge label={emergency.status} colorClass={emergencyStatusBadge(emergency.status)} />
        </div>
        {!isTerminal && (
          <button onClick={() => setCancelOpen(true)} className="btn-secondary mt-4">
            <XCircle size={16} /> Cancel Emergency
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-900">Status Timeline</h2>
        <ol className="mt-4 space-y-4">
          {timelineStatuses.map((status, i) => {
            const done = emergency.status !== 'Cancelled' && i <= currentIndex;
            return (
              <li key={status} className="flex items-center gap-3">
                {done ? <CheckCircle2 size={20} className="text-green-500 shrink-0" /> : <Circle size={20} className="text-slate-300 shrink-0" />}
                <span className={`text-sm ${done ? 'font-medium text-slate-800' : 'text-slate-400'}`}>{status}</span>
              </li>
            );
          })}
          {emergency.status === 'Cancelled' && (
            <li className="flex items-center gap-3">
              <XCircle size={20} className="text-red-500 shrink-0" />
              <span className="text-sm font-medium text-red-600">Cancelled</span>
            </li>
          )}
        </ol>
      </div>

      {hospitalRequests.length > 0 && (
        <div className="card">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Building2 size={18} /> Hospital Requests</h2>
          <div className="mt-3 space-y-2">
            {hospitalRequests.map((r) => (
              <div key={r.request_id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.hospital_name}</p>
                  <p className="text-xs text-slate-400">{r.area} · {r.contact}</p>
                </div>
                <StatusBadge label={r.status} colorClass={requestStatusBadge(r.status)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {ambulanceRequests.length > 0 && (
        <div className="card">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900"><AmbulanceIcon size={18} /> Ambulance Requests</h2>
          <div className="mt-3 space-y-2">
            {ambulanceRequests.map((r) => (
              <div key={r.ambulance_request_id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{r.ambulance_number}</p>
                  <p className="text-xs text-slate-400">Driver: {r.driver_name} · {r.driver_phone}</p>
                </div>
                <span className="badge bg-blue-100 text-blue-700">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to="/patient/dashboard" className="text-sm font-medium text-brand-700">Back to Dashboard</Link>

      <ConfirmModal
        open={cancelOpen}
        title="Cancel this emergency?"
        message="This will mark the emergency as cancelled. This action cannot be undone."
        confirmLabel="Cancel Emergency"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
