import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, MapPin, FileText, Navigation } from 'lucide-react';
import { ambulanceService } from '../../services/ambulanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { severityBadge } from '../../utils/statusColors';
import MapView, { Marker, Popup, ICONS } from '../../components/MapView';

export default function AssignedEmergency() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambulanceService.getRequests().then((res) => {
      const active = res.data.requests.find((r) => !['Completed', 'Cancelled'].includes(r.status));
      setTrip(active || null);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading assigned emergency..." />;
  if (!trip) return <EmptyState icon={Siren} title="No assigned emergency" message="You'll see the emergency details here once a patient requests your ambulance." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assigned Emergency</h1>
        <p className="mt-1 text-sm text-slate-500">Emergency #{trip.emergency_id}</p>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{trip.patient_name}</h2>
            <p className="text-sm text-slate-500">{trip.emergency_type}</p>
          </div>
          <StatusBadge label={trip.severity} colorClass={severityBadge(trip.severity)} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={14} /> Pickup: {trip.pickup_lat}, {trip.pickup_lng}
        </div>
        {trip.additional_info && (
          <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <FileText size={14} className="mt-0.5 shrink-0" /> {trip.additional_info}
          </div>
        )}

        <div className="mt-5">
          <MapView center={{ lat: Number(trip.pickup_lat), lng: Number(trip.pickup_lng) }} zoom={13} height="300px">
            <Marker position={[Number(trip.pickup_lat), Number(trip.pickup_lng)]} icon={ICONS.patient}>
              <Popup>Pickup location — {trip.patient_name}</Popup>
            </Marker>
          </MapView>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`https://www.openstreetmap.org/directions?to=${trip.pickup_lat}%2C${trip.pickup_lng}`}
            target="_blank" rel="noreferrer" className="btn-outline"
          >
            <Navigation size={16} /> Directions to Patient
          </a>
          <Link to="/ambulance/trip-status" className="btn-primary">Update Trip Status</Link>
        </div>
      </div>
    </div>
  );
}
