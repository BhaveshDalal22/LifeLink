import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Navigation } from 'lucide-react';
import { ambulanceService } from '../../services/ambulanceService';
import { TRIP_STATUS_FLOW } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function TripStatus() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    ambulanceService.getRequests().then((res) => {
      const active = res.data.requests.find((r) => !['Completed', 'Cancelled'].includes(r.status));
      setTrip(active || null);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const currentIndex = trip ? TRIP_STATUS_FLOW.indexOf(trip.status) : -1;
  const nextStatus = currentIndex >= 0 && currentIndex < TRIP_STATUS_FLOW.length - 1 ? TRIP_STATUS_FLOW[currentIndex + 1] : null;

  const advance = async () => {
    if (!trip || !nextStatus) return;
    setUpdating(true);
    try {
      await ambulanceService.updateRequestStatus(trip.ambulance_request_id, nextStatus);
      toast.success(`Trip status updated to "${nextStatus}".`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trip status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading trip status..." />;
  if (!trip) return <EmptyState icon={Navigation} title="No active trip" message="Trip status updates will appear here once you accept an emergency request." />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Trip Status</h1>
        <p className="mt-1 text-sm text-slate-500">Emergency #{trip.emergency_id} — {trip.patient_name}</p>
      </div>

      <div className="card">
        <ol className="space-y-4">
          {TRIP_STATUS_FLOW.map((status, i) => {
            const done = i <= currentIndex;
            return (
              <li key={status} className="flex items-center gap-3">
                {done ? <CheckCircle2 size={20} className="text-green-500 shrink-0" /> : <Circle size={20} className="text-slate-300 shrink-0" />}
                <span className={`text-sm ${done ? 'font-medium text-slate-800' : 'text-slate-400'}`}>{status}</span>
              </li>
            );
          })}
        </ol>

        {nextStatus ? (
          <button onClick={advance} disabled={updating} className="btn-primary mt-6 w-full">
            {updating ? 'Updating...' : `Mark as "${nextStatus}"`}
          </button>
        ) : (
          <p className="mt-6 text-center text-sm font-medium text-green-600">Trip completed.</p>
        )}
      </div>
    </div>
  );
}
